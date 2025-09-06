export interface EmotionalState {
  mood: 'positive' | 'negative' | 'neutral' | 'mixed';
  dominantEmotion?: string;
  topics: string[];
  concerns: string[];
  interests: string[];
  confidence: number;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

// 感情キーワード辞書
const emotionKeywords = {
  positive: {
    words: ['嬉しい', '楽しい', '幸せ', '素敵', '良い', 'いい', '最高', '素晴らしい', '成功', '達成', '愛', '好き'],
    weight: 1.5
  },
  negative: {
    words: ['悲しい', '辛い', 'つらい', '苦しい', '不安', '心配', '怖い', '疲れ', '大変', '困った', '失敗', '後悔'],
    weight: 1.8
  },
  neutral: {
    words: ['普通', 'まあまあ', 'そこそこ', '特に', 'いつも', '毎日'],
    weight: 1.0
  }
};

// トピック検出用キーワード
const topicKeywords = {
  work: ['仕事', '会社', '職場', '上司', '部下', '同僚', 'プロジェクト', '会議', '残業', 'キャリア'],
  relationships: ['家族', '友達', '恋人', '彼氏', '彼女', '夫', '妻', '子供', '親', '人間関係'],
  health: ['健康', '体調', '病気', '運動', '食事', '睡眠', 'ストレス', '疲労'],
  dreams: ['夢', '目標', '将来', '希望', '願い', 'やりたい', 'なりたい'],
  past: ['昔', '子供の頃', '若い頃', '思い出', '懐かしい', '覚えて'],
  money: ['お金', '給料', '貯金', '買い物', '生活', '経済']
};

// 懸念事項の検出パターン
const concernPatterns = [
  /(.+)が心配/,
  /(.+)に悩んで/,
  /(.+)で困って/,
  /(.+)がうまくいかない/,
  /(.+)ができない/,
  /(.+)が不安/
];

export function analyzeUserInput(messages: Message[]): EmotionalState {
  // 最近のメッセージ（最大5つ）を分析対象とする
  const recentMessages = messages
    .filter(m => m.role === 'user')
    .slice(-5)
    .map(m => m.content);
  
  if (recentMessages.length === 0) {
    return {
      mood: 'neutral',
      topics: [],
      concerns: [],
      interests: [],
      confidence: 0
    };
  }

  const combinedText = recentMessages.join(' ');
  
  // 感情分析
  let positiveScore = 0;
  let negativeScore = 0;
  let neutralScore = 0;
  
  for (const word of emotionKeywords.positive.words) {
    const count = (combinedText.match(new RegExp(word, 'g')) || []).length;
    positiveScore += count * emotionKeywords.positive.weight;
  }
  
  for (const word of emotionKeywords.negative.words) {
    const count = (combinedText.match(new RegExp(word, 'g')) || []).length;
    negativeScore += count * emotionKeywords.negative.weight;
  }
  
  for (const word of emotionKeywords.neutral.words) {
    const count = (combinedText.match(new RegExp(word, 'g')) || []).length;
    neutralScore += count * emotionKeywords.neutral.weight;
  }
  
  // ムードの判定
  let mood: EmotionalState['mood'] = 'neutral';
  let dominantEmotion: string | undefined;
  
  if (positiveScore > negativeScore * 1.5) {
    mood = 'positive';
    dominantEmotion = '喜び';
  } else if (negativeScore > positiveScore * 1.5) {
    mood = 'negative';
    dominantEmotion = '不安';
  } else if (positiveScore > 0 && negativeScore > 0) {
    mood = 'mixed';
    dominantEmotion = '複雑';
  }
  
  // トピック検出
  const detectedTopics: string[] = [];
  for (const [topic, keywords] of Object.entries(topicKeywords)) {
    for (const keyword of keywords) {
      if (combinedText.includes(keyword)) {
        if (!detectedTopics.includes(topic)) {
          detectedTopics.push(topic);
        }
        break;
      }
    }
  }
  
  // 懸念事項の抽出
  const concerns: string[] = [];
  for (const pattern of concernPatterns) {
    const matches = combinedText.match(pattern);
    if (matches && matches[1]) {
      concerns.push(matches[1]);
    }
  }
  
  // 興味・関心の抽出（ポジティブな文脈で言及されたトピック）
  const interests = detectedTopics.filter(topic => {
    const topicContext = recentMessages.find(msg => 
      topicKeywords[topic as keyof typeof topicKeywords].some(kw => msg.includes(kw))
    );
    return topicContext && emotionKeywords.positive.words.some(word => topicContext.includes(word));
  });
  
  // 信頼度の計算（分析に使用したデータ量に基づく）
  const confidence = Math.min(recentMessages.length / 5, 1) * 
                    Math.min((positiveScore + negativeScore + neutralScore) / 10, 1);
  
  return {
    mood,
    dominantEmotion,
    topics: detectedTopics,
    concerns,
    interests,
    confidence
  };
}

// ユーザーの性格特性を推測（コールドリーディング用）
export function inferPersonalityTraits(state: EmotionalState): string[] {
  const traits: string[] = [];
  
  // ムードベースの推測
  if (state.mood === 'mixed') {
    traits.push('感受性が豊か');
    traits.push('物事を深く考える');
  }
  
  if (state.mood === 'negative' && state.confidence > 0.5) {
    traits.push('責任感が強い');
    traits.push('完璧主義的な面がある');
  }
  
  // トピックベースの推測
  if (state.topics.includes('work')) {
    traits.push('真面目で努力家');
    traits.push('向上心がある');
  }
  
  if (state.topics.includes('relationships')) {
    traits.push('人を大切にする');
    traits.push('優しい心を持っている');
  }
  
  if (state.topics.includes('dreams')) {
    traits.push('理想を持っている');
    traits.push('前向きな姿勢');
  }
  
  // 懸念事項ベースの推測
  if (state.concerns.length > 0) {
    traits.push('慎重で思慮深い');
    traits.push('他人のことを考えすぎる傾向');
  }
  
  return traits;
}