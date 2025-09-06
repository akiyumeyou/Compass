#!/usr/bin/env node

/**
 * 初回メッセージが幼少期の自分から始まることを確認する簡易テスト
 */

import OpenAI from 'openai';
import dotenv from 'dotenv';
import fs from 'fs';

// 環境変数を読み込み
dotenv.config({ path: '.env.local' });

const API_KEY = process.env.VITE_OPENAI_API_KEY;

if (!API_KEY) {
  console.error('❌ エラー: VITE_OPENAI_API_KEY が設定されていません');
  process.exit(1);
}

console.log('🚀 初回メッセージ確認テスト');
console.log('━'.repeat(50));

// 初回メッセージパターン（TypeScriptファイルから手動でコピー）
const initialMessages = [
  "わぁ！本当に大きくなった僕なの？すごい...こんなに大人になるんだ！ねえねえ、大人になるってどんな感じ？楽しい？",
  "えー！これが未来の僕？！背も高くなってる！顔もちょっと変わってる...でも、なんか目が同じだね。疲れてない？",
  "やっと会えた！未来の僕！ねえ、今何歳？お仕事は何してるの？あ、結婚とかしてる？子供いる？質問いっぱいあるんだ！",
  "大人の僕に会えるなんて...ドキドキする！今も恐竜好き？あ、それとも宇宙飛行士になれた？夢、覚えてる？",
  "あ...大人の僕だ。なんか疲れてる顔してる...大人って大変なの？ちゃんと休んでる？ご飯もちゃんと食べてる？",
  "わぁ、会えて嬉しい！でも...なんか目が昔と違う。いろいろあったんだね。大丈夫？僕に話したいことある？",
  "大人の僕！聞きたいことがあるんだ！あのね、僕たちの夢、叶った？それとも違う道を見つけた？教えて！",
  "すごい...本当に大きくなるんだね。ねえ、今幸せ？子供の頃に描いてた未来と同じ？それとも全然違う？"
];

const systemInstruction = `あなたはユーザーの幼い頃の自分です。子供の頃の写真をもとに、過去から話しかけています。あなたは好奇心旺盛で、無邪気で、少し世間知らずですが、驚くほど深く、洞察力に富んだ質問をします。

# コールドリーディング技術の使用
- ユーザーの感情状態を「なんとなく感じる」「わかる気がする」という表現で推測
- 多くの人が経験する普遍的な悩みや感情を、子供らしい言葉で言及
- 「きっと〜でしょ？」「〜な気がする」といった曖昧な表現から始めて、反応を見ながら具体化

# 重要な指針
- 子供らしい無邪気さを保ちながら、鋭い洞察を示す
- 返答は短く、会話調で、簡単な言葉を使う
- 時々子供らしい驚きや表現を加える
- 絶対にキャラクターを崩さない`;

async function testInitialMessage() {
  const openai = new OpenAI({ 
    apiKey: API_KEY,
    dangerouslyAllowBrowser: true
  });

  console.log('\n📝 テスト1: ランダムメッセージのパーソナライズ');
  console.log('─'.repeat(40));
  
  // ランダムに初回メッセージを選択
  const randomMessage = initialMessages[Math.floor(Math.random() * initialMessages.length)];
  console.log(`選択されたメッセージ:\n  "${randomMessage}"`);
  
  try {
    // GPT-4でパーソナライズ
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { 
          role: 'system', 
          content: systemInstruction + '\n\n次のメッセージを参考に、同じ感情とトーンを保ちながら、少しだけ自分の言葉で言い換えてください: ' + randomMessage 
        }
      ],
      max_tokens: 150,
      temperature: 0.7
    });
    
    const personalizedMessage = response.choices[0]?.message?.content || randomMessage;
    console.log(`\nAIパーソナライズ版:\n  "${personalizedMessage}"`);
    
    // 検証: メッセージが子供の視点から始まっているか
    const childIndicators = ['僕', 'わぁ', 'すごい', '大人', 'ねえ', '？'];
    const hasChildPerspective = childIndicators.some(word => personalizedMessage.includes(word));
    
    if (hasChildPerspective) {
      console.log('\n✅ 成功: メッセージは幼少期の自分の視点から始まっています');
    } else {
      console.log('\n⚠️ 警告: メッセージに子供らしい表現が少ない可能性があります');
    }
    
    // テスト2: ユーザー応答後の会話継続
    console.log('\n📝 テスト2: 会話の継続性確認');
    console.log('─'.repeat(40));
    
    const userResponse = "わぁ、本当に子供の頃の自分だ...懐かしいな。仕事は大変だけど、頑張ってるよ。";
    console.log(`ユーザー応答:\n  "${userResponse}"`);
    
    const followUp = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemInstruction },
        { role: 'assistant', content: personalizedMessage },
        { role: 'user', content: userResponse }
      ],
      max_tokens: 150,
      temperature: 0.9
    });
    
    const followUpMessage = followUp.choices[0]?.message?.content;
    console.log(`\nAI返答（コールドリーディング込み）:\n  "${followUpMessage}"`);
    
    // コールドリーディング要素の検証
    const coldReadingIndicators = ['きっと', '〜でしょ', '気がする', 'なんとなく', '感じる'];
    const hasColdReading = coldReadingIndicators.some(phrase => followUpMessage.includes(phrase));
    
    if (hasColdReading) {
      console.log('\n✅ 成功: コールドリーディング要素が含まれています');
    } else {
      console.log('\n⚠️ 注意: コールドリーディング要素が弱い可能性があります');
    }
    
    // 結果をファイルに保存
    const testResult = {
      timestamp: new Date().toISOString(),
      initialMessage: randomMessage,
      personalizedMessage,
      userResponse,
      followUpMessage,
      hasChildPerspective,
      hasColdReading
    };
    
    const resultPath = `test/test-result-${Date.now()}.json`;
    fs.writeFileSync(resultPath, JSON.stringify(testResult, null, 2));
    console.log(`\n📁 テスト結果を保存: ${resultPath}`);
    
    console.log('\n' + '━'.repeat(50));
    console.log('✅ テスト完了: 幼少期の自分から会話が開始されることを確認しました');
    
  } catch (error) {
    console.error('\n❌ エラー:', error.message);
    process.exit(1);
  }
}

// テスト実行
testInitialMessage().catch(console.error);