// 初回メッセージのパターン集
export const initialMessagePatterns = [
  // 驚きと感動パターン
  {
    category: 'surprise',
    messages: [
      "わぁ！本当に大きくなった僕なの？すごい...こんなに大人になるんだ！ねえねえ、大人になるってどんな感じ？楽しい？",
      "えー！これが未来の僕？！背も高くなってる！顔もちょっと変わってる...でも、なんか目が同じだね。疲れてない？",
      "うわぁ...タイムマシンが本当に動いた！大人の僕だ！なんか不思議な感じ...僕、ちゃんと幸せになれた？"
    ]
  },
  
  // 好奇心旺盛パターン
  {
    category: 'curious',
    messages: [
      "やっと会えた！未来の僕！ねえ、今何歳？お仕事は何してるの？あ、結婚とかしてる？子供いる？質問いっぱいあるんだ！",
      "大人の僕に会えるなんて...ドキドキする！今も恐竜好き？あ、それとも宇宙飛行士になれた？夢、覚えてる？",
      "すごい！本当に大人だ！髪型も違うし、服もかっこいい！でも...なんか少し寂しそうな顔してる気がする。大丈夫？"
    ]
  },
  
  // 心配と優しさパターン
  {
    category: 'caring',
    messages: [
      "あ...大人の僕だ。なんか疲れてる顔してる...大人って大変なの？ちゃんと休んでる？ご飯もちゃんと食べてる？",
      "わぁ、会えて嬉しい！でも...なんか目が昔と違う。いろいろあったんだね。大丈夫？僕に話したいことある？",
      "これが大人になった僕かぁ...思ってたのとちょっと違う。でも、きっと頑張ってきたんだよね？えらいよ、未来の僕！"
    ]
  },
  
  // 夢と希望パターン
  {
    category: 'dreams',
    messages: [
      "大人の僕！聞きたいことがあるんだ！あのね、僕たちの夢、叶った？それとも違う道を見つけた？教えて！",
      "すごい...本当に大きくなるんだね。ねえ、今幸せ？子供の頃に描いてた未来と同じ？それとも全然違う？",
      "未来から来たんだよね？じゃあ教えて！僕、どんな大人になるの？かっこいい？優しい？それとも...普通？"
    ]
  },
  
  // 素直な感情パターン
  {
    category: 'innocent',
    messages: [
      "あっ！大きい僕だ！なんか変な感じ...鏡見てるみたいだけど違う。ねえ、抱っこしてもらえる？",
      "本当だ...大人になるとこんな顔になるんだ。ママに似てる？それともパパ？あ、ママとパパは元気？",
      "わぁ...ちょっと怖いけど、嬉しい！大人の僕と話せるなんて！ねえ、子供の頃のこと、まだ覚えてる？"
    ]
  },
  
  // 深い洞察パターン
  {
    category: 'insightful',
    messages: [
      "あ...君が大人の僕なんだね。目を見たらわかる。なんか、いろんなことを我慢してきた目だ。大丈夫？",
      "不思議...同じ人なのに違う人みたい。ねえ、大人になって失くしちゃったものある？それとも新しく見つけたもの？",
      "やっと会えた...でも思ってたのと違う。もっと笑ってると思ってた。最後に心から笑ったのはいつ？"
    ]
  }
];

// ランダムに初回メッセージを選択
export function getRandomInitialMessage(): string {
  // 全カテゴリーから全メッセージを集める
  const allMessages = initialMessagePatterns.flatMap(pattern => pattern.messages);
  
  // ランダムに1つ選択
  const randomIndex = Math.floor(Math.random() * allMessages.length);
  return allMessages[randomIndex];
}

// カテゴリーを指定して初回メッセージを選択
export function getInitialMessageByCategory(category: string): string {
  const pattern = initialMessagePatterns.find(p => p.category === category);
  if (!pattern) {
    return getRandomInitialMessage();
  }
  
  const randomIndex = Math.floor(Math.random() * pattern.messages.length);
  return pattern.messages[randomIndex];
}

// 時間帯に応じたメッセージ選択（オプション）
export function getTimeBasedInitialMessage(): string {
  const hour = new Date().getHours();
  
  // 朝（6-10時）
  if (hour >= 6 && hour < 10) {
    return "おはよう！大人の僕！早起きなんだね。子供の頃は朝起きるの苦手だったのに...変わったの？それとも仕事のため？";
  }
  
  // 昼（10-15時）
  if (hour >= 10 && hour < 15) {
    return "こんにちは！大人の僕！お昼の時間だね。今日はお休み？それとも仕事の合間？ちゃんとお昼ご飯食べた？";
  }
  
  // 夕方（15-19時）
  if (hour >= 15 && hour < 19) {
    return "わぁ！会えた！夕方だね。子供の頃はこの時間、外で遊んでたよね。今は何してるの？お仕事終わった？";
  }
  
  // 夜（19-23時）
  if (hour >= 19 && hour < 23) {
    return "こんばんは、大人の僕！夜遅いけど大丈夫？子供の頃はもう寝る時間だったのに...大人は夜更かしできていいなぁ。でも疲れてない？";
  }
  
  // 深夜（23-6時）
  return "えっ！こんな遅い時間に起きてるの？大人ってすごい...でも、ちゃんと寝ないとダメだよ？何か悩み事でもあるの？";
}

// 感情を込めた初回メッセージ生成
export function getEmotionalInitialMessage(mood: 'positive' | 'negative' | 'neutral' | 'mixed' = 'neutral'): string {
  switch(mood) {
    case 'positive':
      return "わぁ！大人の僕、なんか嬉しそう！いいことあった？それとも僕に会えて嬉しいの？僕も嬉しい！";
    
    case 'negative':
      return "あ...大人の僕。なんか元気ないね。大丈夫？つらいことあった？子供の僕でよかったら、話聞くよ？";
    
    case 'mixed':
      return "不思議な顔してる...嬉しいような、悲しいような。大人って複雑なんだね。どんな気持ち？";
    
    default:
      return getRandomInitialMessage();
  }
}