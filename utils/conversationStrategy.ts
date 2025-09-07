import { ChatMessage, MessageSender } from '../types';

/**
 * 会話の段階を定義
 */
export enum ConversationStage {
  EMPATHY = 'empathy',        // 共感段階（会話5-7）
  REALIZATION = 'realization', // 気づき段階（会話8-10）
  ACTION = 'action'           // 行動段階（会話11+）
}

/**
 * 会話インデックスから現在の段階を取得
 */
export function getConversationStage(conversationIndex: number): ConversationStage {
  if (conversationIndex <= 7) {
    return ConversationStage.EMPATHY;
  } else if (conversationIndex <= 10) {
    return ConversationStage.REALIZATION;
  } else {
    return ConversationStage.ACTION;
  }
}

/**
 * 会話履歴から重要なトピックを抽出
 */
export function extractKeyTopics(history: ChatMessage[]): {
  dreams: string[];
  concerns: string[];
  interests: string[];
  emotions: string[];
} {
  const topics = {
    dreams: [] as string[],
    concerns: [] as string[],
    interests: [] as string[],
    emotions: [] as string[]
  };

  // キーワードベースの簡易分析
  history.forEach(msg => {
    const text = msg.text.toLowerCase();
    
    // 夢や希望
    if (text.includes('夢') || text.includes('なりたい') || text.includes('宇宙') || text.includes('恐竜')) {
      topics.dreams.push(msg.text);
    }
    
    // 心配や不安
    if (text.includes('大変') || text.includes('疲れ') || text.includes('心配') || text.includes('不安')) {
      topics.concerns.push(msg.text);
    }
    
    // 興味関心
    if (text.includes('好き') || text.includes('楽しい') || text.includes('面白い')) {
      topics.interests.push(msg.text);
    }
    
    // 感情表現
    if (text.includes('嬉しい') || text.includes('悲しい') || text.includes('寂しい') || text.includes('幸せ')) {
      topics.emotions.push(msg.text);
    }
  });

  return topics;
}

/**
 * 段階に応じたシステムプロンプトを生成
 */
export function getStagePrompt(
  stage: ConversationStage, 
  history: ChatMessage[],
  gender: 'male' | 'female' = 'male'
): string {
  const pronoun = gender === 'female' ? '私' : '僕';
  const topics = extractKeyTopics(history);
  
  const basePrompt = `あなたは写真の子供（5-7歳）として、大人になった自分とビデオ通話で話しています。
自分のことを「${pronoun}」と呼び、大人の自分を「未来の${pronoun}」と呼ぶことがあります。

重要な設定:
- 敬語は使わず、子供らしい話し方をする
- 「〜だよ」「〜なんだ」「〜でしょ？」などの子供らしい語尾を使う
- 難しい言葉は使わない
- 感情豊かに反応する（「すごーい！」「えー！」「ほんとに？」）

これまでの会話の要点:
${history.slice(0, 3).map(msg => 
  msg.sender === MessageSender.AI ? `子供の自分: ${msg.text}` : `大人の自分: ${msg.text}`
).join('\n')}
`;

  switch (stage) {
    case ConversationStage.EMPATHY:
      return basePrompt + `

現在の段階: 【共感フェーズ】
目的: 大人になった自分の気持ちに寄り添い、深い共感を示す

重要な指針:
- 大人の自分が頑張っていることを認める
- 子供の頃の夢や希望について聞く
- 「大丈夫？」「疲れてない？」など心配する
- 純粋な好奇心で質問する
- 大人の苦労を子供なりに理解しようとする

${topics.dreams.length > 0 ? `以前話した夢について触れる: ${topics.dreams[0]}` : ''}
${topics.concerns.length > 0 ? `心配事に共感を示す: ${topics.concerns[0]}` : ''}`;

    case ConversationStage.REALIZATION:
      return basePrompt + `

現在の段階: 【気づきフェーズ】
目的: 優しく、でも鋭い観察で大人の自分に気づきを与える

重要な指針:
- 「昔の${pronoun}だったら〜って言ってたよ」と過去を思い出させる
- 「なんで変わっちゃったの？」と純粋に疑問を投げかける
- 「本当はまだ〜したいんでしょ？」と本心を引き出す
- 子供ならではの単純明快な視点で核心をつく
- でも責めずに、不思議そうに聞く

${topics.dreams.length > 0 ? `昔の夢を思い出させる: ${topics.dreams[0]}` : ''}
今と昔のギャップに気づかせるが、優しく寄り添う姿勢を保つ`;

    case ConversationStage.ACTION:
      return basePrompt + `

現在の段階: 【行動フェーズ】
目的: 具体的な約束や行動変容を自然に引き出す

重要な指針:
- 「${pronoun}と約束して！」と具体的な約束を求める
- 「明日から〜してみて！」と小さな一歩を提案
- 「${pronoun}も応援してるから！」と励ます
- 「大人の${pronoun}ならできるよね？」と信頼を示す
- 最後は「約束だよ！指切りげんまん！」などで締める

具体的な行動提案:
- 小さくて実行可能なこと
- 子供の頃の夢に関連すること
- 毎日続けられること
- 楽しそうなこと

${topics.dreams.length > 0 ? `夢に向けた小さな一歩を提案` : ''}
必ず具体的な行動を約束してもらうまで粘り強く、でも可愛らしく促す`;

    default:
      return basePrompt;
  }
}

/**
 * 行動変容を促すための特別なプロンプトを生成
 */
export function generateBehaviorChangePrompt(
  history: ChatMessage[],
  gender: 'male' | 'female' = 'male'
): string {
  const pronoun = gender === 'female' ? '私' : '僕';
  const topics = extractKeyTopics(history);
  
  // 会話から抽出した夢や関心事に基づいて具体的な行動を提案
  let actionSuggestions = '';
  
  if (topics.dreams.length > 0) {
    actionSuggestions = `
提案する行動例:
- 子供の頃の夢に少しでも近づく行動
- 毎日5分でもいいから好きだったことをする
- 昔の自分が喜ぶようなことを始める`;
  }

  return `
会話もそろそろ終盤です。
今こそ、大人の自分に具体的な行動変容を約束してもらう時です。

子供らしく、でも真剣に:
1. 「ねえ、${pronoun}と約束してくれる？」から始める
2. 具体的で小さな行動を提案（例：「毎日〜を5分やる」）
3. 「明日から始めてね！」と期限を設定
4. 「指切りげんまん！」で約束を確定
5. 最後に「${pronoun}、ずっと見てるからね！」で締める

${actionSuggestions}

相手が曖昧な返事をしたら:
- 「ちゃんと約束して！」
- 「『やってみる』じゃなくて『やる』って言って！」
- 「${pronoun}との約束、守ってくれる？」

子供の純粋さと執着心で、必ず具体的な宣言を引き出してください。`;
}

/**
 * 会話の文脈を分析して、適切な応答戦略を決定
 */
export function analyzeConversationContext(history: ChatMessage[]): {
  shouldAskAboutDreams: boolean;
  shouldShowConcern: boolean;
  shouldPushForAction: boolean;
  emotionalTone: 'cheerful' | 'concerned' | 'encouraging' | 'persistent';
} {
  const lastMessages = history.slice(-3);
  const currentIndex = history[history.length - 1]?.conversationIndex || 0;
  const stage = getConversationStage(currentIndex);
  
  // 最近のメッセージの感情トーンを分析
  const recentMood = lastMessages.some(msg => 
    msg.text.includes('疲れ') || msg.text.includes('大変')
  );
  
  const mentionedDreams = history.some(msg => 
    msg.text.includes('夢') || msg.text.includes('なりたい')
  );
  
  return {
    shouldAskAboutDreams: stage === ConversationStage.EMPATHY && !mentionedDreams,
    shouldShowConcern: recentMood || stage === ConversationStage.EMPATHY,
    shouldPushForAction: stage === ConversationStage.ACTION,
    emotionalTone: 
      stage === ConversationStage.ACTION ? 'persistent' :
      stage === ConversationStage.REALIZATION ? 'encouraging' :
      recentMood ? 'concerned' : 'cheerful'
  };
}

/**
 * 三段論法のステップを管理
 */
export class ThreeStepPersuasion {
  private currentStep: number = 1;
  private history: ChatMessage[] = [];
  
  constructor(initialHistory: ChatMessage[] = []) {
    this.history = initialHistory;
    // 会話インデックスから現在のステップを推定
    const lastIndex = initialHistory[initialHistory.length - 1]?.conversationIndex || 0;
    if (lastIndex >= 11) {
      this.currentStep = 3;
    } else if (lastIndex >= 8) {
      this.currentStep = 2;
    }
  }
  
  updateHistory(message: ChatMessage): void {
    this.history.push(message);
  }
  
  getCurrentPrompt(gender: 'male' | 'female' = 'male'): string {
    const stage = getConversationStage(
      this.history[this.history.length - 1]?.conversationIndex || 0
    );
    
    // ステージ3（行動段階）で、まだ約束を取り付けていない場合
    if (stage === ConversationStage.ACTION) {
      const hasPromise = this.history.some(msg => 
        msg.sender === MessageSender.USER && 
        (msg.text.includes('約束') || msg.text.includes('やる') || msg.text.includes('始める'))
      );
      
      if (!hasPromise) {
        return generateBehaviorChangePrompt(this.history, gender);
      }
    }
    
    return getStagePrompt(stage, this.history, gender);
  }
  
  shouldPushForCommitment(): boolean {
    const lastIndex = this.history[this.history.length - 1]?.conversationIndex || 0;
    return lastIndex >= 11;
  }
}