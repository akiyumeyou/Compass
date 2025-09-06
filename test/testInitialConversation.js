/**
 * 初回会話のテストスクリプト
 * OpenAI APIを使用して、様々なパターンの初回メッセージをテストします
 */

import OpenAI from 'openai';
import { getRandomInitialMessage, getInitialMessageByCategory, getTimeBasedInitialMessage } from '../utils/initialMessages.js';
import { analyzeUserInput, inferPersonalityTraits } from '../utils/emotionAnalyzer.js';
import { selectColdReadingPhrase, generateEmpatheticResponse, generateInsightfulQuestion } from '../utils/coldReadingPhrases.js';

// テスト設定
const TEST_CONFIG = {
  apiKey: process.env.VITE_OPENAI_API_KEY || '',
  model: 'gpt-4',
  maxTokens: 150,
  temperature: 0.7,
  testIterations: 5  // 各カテゴリーのテスト回数
};

// システムプロンプト
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

/**
 * テスト結果を記録
 */
class TestResult {
  constructor() {
    this.results = [];
    this.startTime = Date.now();
  }

  addTest(category, initialMessage, aiResponse, userResponse, analysis) {
    this.results.push({
      category,
      initialMessage,
      aiResponse,
      userResponse,
      analysis,
      timestamp: new Date().toISOString()
    });
  }

  generateReport() {
    const duration = (Date.now() - this.startTime) / 1000;
    const report = {
      totalTests: this.results.length,
      duration: `${duration}秒`,
      testDate: new Date().toISOString(),
      categoryBreakdown: this.getCategoryBreakdown(),
      emotionalAnalysis: this.getEmotionalAnalysis(),
      results: this.results
    };
    return report;
  }

  getCategoryBreakdown() {
    const breakdown = {};
    this.results.forEach(result => {
      if (!breakdown[result.category]) {
        breakdown[result.category] = 0;
      }
      breakdown[result.category]++;
    });
    return breakdown;
  }

  getEmotionalAnalysis() {
    const moods = this.results.map(r => r.analysis?.mood).filter(Boolean);
    const moodCounts = {};
    moods.forEach(mood => {
      moodCounts[mood] = (moodCounts[mood] || 0) + 1;
    });
    return moodCounts;
  }
}

/**
 * 単一の会話テストを実行
 */
async function testSingleConversation(openai, category, testResult) {
  console.log(`\n📝 Testing category: ${category}`);
  console.log('━'.repeat(50));
  
  try {
    // 初回メッセージを取得
    const initialMessage = category === 'random' 
      ? getRandomInitialMessage()
      : category === 'time-based'
      ? getTimeBasedInitialMessage()
      : getInitialMessageByCategory(category);
    
    console.log(`🧒 Initial message:\n   "${initialMessage}"`);
    
    // GPT-4でパーソナライズ
    const personalizeResponse = await openai.chat.completions.create({
      model: TEST_CONFIG.model,
      messages: [
        { 
          role: 'system', 
          content: systemInstruction + '\n\n次のメッセージを参考に、同じ感情とトーンを保ちながら、少しだけ自分の言葉で言い換えてください: ' + initialMessage 
        }
      ],
      max_tokens: TEST_CONFIG.maxTokens,
      temperature: TEST_CONFIG.temperature
    });
    
    const aiInitialMessage = personalizeResponse.choices[0]?.message?.content || initialMessage;
    console.log(`🤖 AI personalized:\n   "${aiInitialMessage}"`);
    
    // ユーザーの返答をシミュレート（様々なパターン）
    const userResponses = [
      "わぁ、本当に子供の頃の自分だ...懐かしいな。大人になるのは大変だけど、楽しいこともあるよ。",
      "びっくりした！本当に昔の自分と話してるみたい。仕事は忙しいけど、頑張ってるよ。",
      "...うん、大人になった。でも正直、子供の頃の方が楽しかったかもしれない。",
      "えっと...そうだね、大人って複雑なんだ。君にはまだ分からないかもしれないけど。",
      "すごい！タイムマシンみたい！大人になるって思ってたより違うんだよね..."
    ];
    
    const userResponse = userResponses[Math.floor(Math.random() * userResponses.length)];
    console.log(`👤 User response:\n   "${userResponse}"`);
    
    // 感情分析
    const emotionalState = analyzeUserInput([
      { role: 'user', content: userResponse }
    ]);
    const traits = inferPersonalityTraits(emotionalState);
    const coldReadingPhrase = selectColdReadingPhrase(emotionalState);
    
    console.log(`\n📊 Analysis:`);
    console.log(`   Mood: ${emotionalState.mood}`);
    console.log(`   Topics: ${emotionalState.topics.join(', ') || 'none'}`);
    console.log(`   Traits: ${traits.slice(0, 2).join(', ') || 'none'}`);
    console.log(`   Cold reading: "${coldReadingPhrase}"`);
    
    // AIの返答を生成
    const contextualHint = `
ユーザーの感情状態: ${emotionalState.mood}
話題: ${emotionalState.topics.join(', ') || '一般的な会話'}
推測される性格: ${traits.slice(0, 2).join(', ')}

次の要素を自然に会話に織り込んでください（子供らしい言葉で）:
- ${coldReadingPhrase}`;
    
    const aiReplyResponse = await openai.chat.completions.create({
      model: TEST_CONFIG.model,
      messages: [
        { role: 'system', content: systemInstruction + '\n\n' + contextualHint },
        { role: 'assistant', content: aiInitialMessage },
        { role: 'user', content: userResponse }
      ],
      max_tokens: TEST_CONFIG.maxTokens,
      temperature: TEST_CONFIG.temperature
    });
    
    const aiReply = aiReplyResponse.choices[0]?.message?.content;
    console.log(`🤖 AI reply:\n   "${aiReply}"`);
    
    // テスト結果を記録
    testResult.addTest(
      category,
      initialMessage,
      aiInitialMessage,
      userResponse,
      {
        mood: emotionalState.mood,
        topics: emotionalState.topics,
        traits: traits.slice(0, 2),
        coldReading: coldReadingPhrase,
        aiReply
      }
    );
    
    console.log(`\n✅ Test completed for category: ${category}`);
    
  } catch (error) {
    console.error(`❌ Error in test for category ${category}:`, error.message);
    testResult.addTest(category, 'ERROR', 'ERROR', 'ERROR', { error: error.message });
  }
}

/**
 * 全カテゴリーのテストを実行
 */
async function runAllTests() {
  console.log('🚀 Starting Initial Conversation Tests');
  console.log('=' .repeat(50));
  
  if (!TEST_CONFIG.apiKey) {
    console.error('❌ Error: VITE_OPENAI_API_KEY is not set');
    return;
  }
  
  const openai = new OpenAI({ 
    apiKey: TEST_CONFIG.apiKey,
    dangerouslyAllowBrowser: true
  });
  
  const testResult = new TestResult();
  const categories = [
    'surprise',
    'curious', 
    'caring',
    'dreams',
    'innocent',
    'insightful',
    'random',
    'time-based'
  ];
  
  // 各カテゴリーをテスト
  for (const category of categories) {
    await testSingleConversation(openai, category, testResult);
    // APIレート制限対策で少し待機
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // テストレポートを生成
  const report = testResult.generateReport();
  
  console.log('\n' + '='.repeat(50));
  console.log('📈 TEST REPORT');
  console.log('='.repeat(50));
  console.log(`Total tests: ${report.totalTests}`);
  console.log(`Duration: ${report.duration}`);
  console.log(`\nCategory breakdown:`);
  Object.entries(report.categoryBreakdown).forEach(([cat, count]) => {
    console.log(`  ${cat}: ${count} tests`);
  });
  console.log(`\nEmotional analysis:`);
  Object.entries(report.emotionalAnalysis).forEach(([mood, count]) => {
    console.log(`  ${mood}: ${count} occurrences`);
  });
  
  // 結果をファイルに保存
  const fs = await import('fs').then(m => m.default);
  const reportPath = `test/test-report-${Date.now()}.json`;
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📁 Full report saved to: ${reportPath}`);
  
  return report;
}

// テスト実行（Node.js環境の場合）
if (typeof window === 'undefined') {
  runAllTests().catch(console.error);
}

export { runAllTests, testSingleConversation, TestResult };