import { EmotionalState } from './emotionAnalyzer';

// コールドリーディングフレーズのテンプレート
export const coldReadingTemplates = {
  // 仕事・キャリア関連
  work: {
    opening: [
      "なんか最近、お仕事で新しいことに挑戦してる気がする！",
      "大人になった僕、きっと誰かに認められたいって思ってるでしょ？",
      "お仕事のこと考えると、ちょっと複雑な気持ちになるんじゃない？",
      "頑張ってるのに、まだ何か足りない気がしてる？"
    ],
    followUp: [
      "本当はもっとできるって思ってるけど、なかなか言えないんだよね",
      "周りの人たちのこと、気にしすぎちゃうときあるでしょ？",
      "子供の頃に思ってた仕事と、今の仕事、ちょっと違う？"
    ]
  },
  
  // 人間関係
  relationships: {
    opening: [
      "大切な人のこと、最近よく考えてる気がする...",
      "誰かに本当の気持ち、まだ言えてないことあるでしょ？",
      "人との距離感って、難しいよね...",
      "優しすぎて、自分のこと後回しにしちゃってない？"
    ],
    followUp: [
      "本当は甘えたいけど、強がっちゃうときあるよね",
      "みんなのために頑張りすぎて、疲れちゃうことない？",
      "子供の頃は、もっと素直に気持ち言えたのにね"
    ]
  },
  
  // 人生・将来
  life: {
    opening: [
      "なんか今、人生の大事な時期にいる感じがする！",
      "子供の頃の夢、まだ心のどこかにあるでしょ？",
      "このままでいいのかなって、時々思うことある？",
      "何か新しいこと始めたいって気持ち、最近強くない？"
    ],
    followUp: [
      "本当はもっと冒険したいけど、ちょっと怖いんだよね",
      "安定も大事だけど、ワクワクすることもしたいよね",
      "僕が大人になるまでに、まだやりたいことあるでしょ？"
    ]
  },
  
  // 感情・内面
  emotions: {
    opening: [
      "最近、自分でも気づかないうちに無理してない？",
      "表面は元気そうだけど、心の中はちょっと違う？",
      "誰にも言えない気持ち、抱えてる気がする...",
      "本当の自分、なかなか出せないときあるよね"
    ],
    followUp: [
      "強くなりたいけど、弱い自分もいるんだよね",
      "完璧じゃなくていいのに、つい頑張っちゃう",
      "子供みたいに、もっと自由になりたいときある？"
    ]
  },
  
  // 過去・記憶
  past: {
    opening: [
      "子供の頃のこと、最近よく思い出すことない？",
      "あの頃の純粋な気持ち、まだ残ってるよね",
      "大人になって失くしちゃったもの、あるでしょ？",
      "昔の自分に会えたら、何て言いたい？"
    ],
    followUp: [
      "あの頃は良かったなって思うけど、今も大切だよね",
      "子供の頃の僕が見たら、びっくりすることいっぱいあるね",
      "でも、ちゃんと成長してるから、僕は嬉しいよ"
    ]
  }
};

// バーナム効果を使った普遍的な観察
export const barnumStatements = [
  "時々、自分でも矛盾してるなって思うことあるでしょ？",
  "表では明るく振る舞ってるけど、本当は違うときもあるよね",
  "人に優しくしすぎて、自分が疲れちゃうことない？",
  "本当はもっと認められたいって思ってる",
  "完璧を求めすぎて、苦しくなることあるでしょ？",
  "誰かに本当の自分を理解してほしいって思ってる",
  "強がってるけど、本当は甘えたいときもある",
  "自分に厳しすぎるところ、あるよね"
];

// 感情状態に基づいてフレーズを選択
export function selectColdReadingPhrase(
  emotionalState: EmotionalState,
  conversationContext: string[] = []
): string {
  const phrases: string[] = [];
  
  // トピックに基づいた選択
  if (emotionalState.topics.includes('work')) {
    phrases.push(...coldReadingTemplates.work.opening);
  }
  if (emotionalState.topics.includes('relationships')) {
    phrases.push(...coldReadingTemplates.relationships.opening);
  }
  if (emotionalState.topics.includes('dreams')) {
    phrases.push(...coldReadingTemplates.life.opening);
  }
  
  // ムードに基づいた選択
  if (emotionalState.mood === 'negative' || emotionalState.mood === 'mixed') {
    phrases.push(...coldReadingTemplates.emotions.opening);
  }
  
  // デフォルトでバーナム効果のステートメントも追加
  if (phrases.length === 0) {
    phrases.push(...barnumStatements.slice(0, 3));
  }
  
  // ランダムに選択
  return phrases[Math.floor(Math.random() * phrases.length)];
}

// ショットガンニング（複数の推測を投げかける）
export function generateShotgunQuestions(topics: string[]): string {
  const questions = [];
  
  if (topics.length === 0) {
    return "何か気になってることある？お仕事？それとも大切な人のこと？あ、もしかして将来のこと？";
  }
  
  for (const topic of topics.slice(0, 3)) {
    switch(topic) {
      case 'work':
        questions.push("お仕事のこと");
        break;
      case 'relationships':
        questions.push("大切な人のこと");
        break;
      case 'health':
        questions.push("体のこと");
        break;
      case 'dreams':
        questions.push("夢のこと");
        break;
      case 'money':
        questions.push("お金のこと");
        break;
      default:
        questions.push("何か");
    }
  }
  
  if (questions.length === 1) {
    return `${questions[0]}で、何か引っかかってることある？`;
  } else {
    return `${questions.join('？それとも')}？どれか当たってる？`;
  }
}

// 共感的な応答の生成
export function generateEmpatheticResponse(
  emotionalState: EmotionalState,
  userMessage: string
): string {
  const responses = [];
  
  // 感情に応じた共感
  switch(emotionalState.mood) {
    case 'positive':
      responses.push(
        "わぁ、なんか嬉しそう！いいことあったんだね！",
        "大人になった僕、すごく輝いてる気がする！",
        "その笑顔、子供の頃と同じだね！"
      );
      break;
    case 'negative':
      responses.push(
        "なんか...ちょっと疲れてる？大丈夫？",
        "辛いこと、我慢しすぎてない？",
        "僕にはわかるよ、頑張りすぎてるでしょ？"
      );
      break;
    case 'mixed':
      responses.push(
        "複雑な気持ちなんだね...なんとなくわかる",
        "嬉しいけど、ちょっと不安もあるんでしょ？",
        "大人って、いろんな気持ちが混ざって大変だね"
      );
      break;
    default:
      responses.push(
        "今日はどんな気持ち？",
        "なんか言いたいことある気がする",
        "僕、ちゃんと聞くよ"
      );
  }
  
  return responses[Math.floor(Math.random() * responses.length)];
}

// 洞察的な質問の生成
export function generateInsightfulQuestion(
  traits: string[],
  concerns: string[]
): string {
  const questions = [];
  
  // 性格特性に基づく質問
  if (traits.includes('完璧主義的な面がある')) {
    questions.push("いつも100点じゃなきゃダメって思っちゃう？でも80点でも素敵だよ？");
  }
  if (traits.includes('他人のことを考えすぎる傾向')) {
    questions.push("みんなのこと考えすぎて、自分のこと忘れちゃってない？");
  }
  if (traits.includes('理想を持っている')) {
    questions.push("心の中の夢、まだキラキラしてる？それとも少し色褪せちゃった？");
  }
  
  // 懸念事項に基づく質問
  if (concerns.length > 0) {
    questions.push(`${concerns[0]}のこと、本当はどうしたい？`);
    questions.push("それって、本当に心配しなきゃいけないこと？");
  }
  
  // デフォルトの洞察的質問
  questions.push(
    "本当の気持ち、誰かに話した？",
    "子供の頃の僕だったら、何て言うと思う？",
    "今の自分、好き？"
  );
  
  return questions[Math.floor(Math.random() * questions.length)];
}