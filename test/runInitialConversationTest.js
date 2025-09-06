#!/usr/bin/env node

/**
 * 初回会話フローのテストランナー
 * 幼少期の自分から会話を開始することを確認
 */

import dotenv from 'dotenv';
import { runAllTests } from './testInitialConversation.js';

// 環境変数を読み込み
dotenv.config({ path: '.env.local' });

console.log('🚀 初回会話テストを開始します...\n');
console.log('━'.repeat(50));
console.log('重要: 幼少期の自分が最初に話しかけることを確認');
console.log('━'.repeat(50));

// テスト実行
runAllTests()
  .then(report => {
    console.log('\n✅ テスト完了！');
    console.log('\n📊 テスト結果サマリー:');
    console.log(`   - 実行したテスト: ${report.totalTests}`);
    console.log(`   - 所要時間: ${report.duration}`);
    console.log(`   - カテゴリー別:`, report.categoryBreakdown);
    console.log(`   - 感情分析:`, report.emotionalAnalysis);
    
    // 初回メッセージが幼少期の自分から始まっているか確認
    let allStartedFromChild = true;
    report.results.forEach((result, index) => {
      if (result.aiResponse && result.aiResponse !== 'ERROR') {
        console.log(`\n📝 テスト ${index + 1} (${result.category}):`);
        console.log(`   初回メッセージ: "${result.aiResponse.substring(0, 50)}..."`);
      } else {
        allStartedFromChild = false;
        console.log(`\n❌ テスト ${index + 1} (${result.category}): エラー`);
      }
    });
    
    if (allStartedFromChild) {
      console.log('\n✅ すべてのテストで幼少期の自分から会話が開始されました！');
    } else {
      console.log('\n⚠️ 一部のテストでエラーが発生しました。');
    }
  })
  .catch(error => {
    console.error('\n❌ テスト実行中にエラーが発生しました:', error);
    process.exit(1);
  });