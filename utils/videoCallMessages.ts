// ビデオ通話開始時の初回電話メッセージ
export const videoCallReasons = [
  "えへへ、ビデオ電話できるって知って、かけちゃった！",
  "顔見ながら話したくて、ビデオ通話にしてみた！",
  "もっとちゃんと顔見たくて、電話しちゃった！",
  "テレビ電話ってやつ？やってみたくて！",
  "声だけじゃなくて、顔も見たくなっちゃった！",
  "わあ！本当にビデオで繋がった！すごーい！",
  "ねえねえ、画面に映ってる？見える？",
  "初めてのビデオ通話！ドキドキする！",
  "こうやって顔見ながら話せるんだ！未来ってすごい！",
  "電話のボタン押したら、顔が見えた！びっくり！"
];

// 会話のトピック
export const conversationTopics = [
  "おもちゃ",
  "アニメ", 
  "ゲーム",
  "お菓子",
  "好きだった場所",
  "遊び",
  "絵本",
  "映画",
  "テレビ番組",
  "友達",
  "学校",
  "夢"
];

// ランダムに電話理由を取得
export function getRandomVideoCallReason(): string {
  const randomIndex = Math.floor(Math.random() * videoCallReasons.length);
  return videoCallReasons[randomIndex];
}

// ランダムにトピックを取得
export function getRandomTopic(): string {
  const randomIndex = Math.floor(Math.random() * conversationTopics.length);
  return conversationTopics[randomIndex];
}

// 性別に応じた新規メッセージを生成
export function generateVideoCallStartMessage(gender: 'male' | 'female' = 'male'): string {
  const pronoun = gender === 'female' ? '私' : '僕';
  const reason = getRandomVideoCallReason();
  const topic = getRandomTopic();
  
  // 初めてのビデオ通話パターン
  const patterns = [
    `${reason} ちゃんと見える？わあ、大人の${pronoun}の顔、はっきり見える！`,
    `${reason} すごい！本当に顔見ながら話せるんだね！なんか不思議な感じ！`,
    `${reason} 画面越しだけど、会えて嬉しい！今日はどんな一日だった？`,
    `${reason} これがビデオ通話かぁ！大人の${pronoun}の顔、ちゃんと見えるよ！`,
    `${reason} 顔見て話せるの楽しい！ねえ、${topic}の話、もっと聞かせて！`
  ];
  
  const randomPattern = Math.floor(Math.random() * patterns.length);
  return patterns[randomPattern];
}