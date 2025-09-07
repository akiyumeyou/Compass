#!/usr/bin/env node

/**
 * 本番環境のテストスクリプト
 * Vercelにデプロイされた本番環境の動作確認を行います
 */

import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 本番環境のURL
const PRODUCTION_URL = 'https://compass-tawny.vercel.app';

// カラー出力用のヘルパー
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * 本番環境のヘルスチェック
 */
async function testHealthCheck() {
  log('\n📡 Testing Production Health Check...', 'cyan');
  
  try {
    const response = await fetch(PRODUCTION_URL);
    const status = response.status;
    const contentType = response.headers.get('content-type');
    
    if (status === 200) {
      log(`✅ Site is accessible (Status: ${status})`, 'green');
      log(`   Content-Type: ${contentType}`, 'green');
      
      // HTMLの基本的な構造をチェック
      const html = await response.text();
      const hasRoot = html.includes('id="root"');
      const hasTailwind = html.includes('tailwindcss');
      
      if (hasRoot && hasTailwind) {
        log('✅ HTML structure is correct', 'green');
      } else {
        log('⚠️ HTML structure may have issues', 'yellow');
        if (!hasRoot) log('   - Missing root element', 'yellow');
        if (!hasTailwind) log('   - Missing Tailwind CSS', 'yellow');
      }
    } else {
      log(`❌ Site returned status ${status}`, 'red');
    }
  } catch (error) {
    log(`❌ Failed to access site: ${error.message}`, 'red');
  }
}

/**
 * 静的アセットのチェック
 */
async function testStaticAssets() {
  log('\n🎨 Testing Static Assets...', 'cyan');
  
  const assets = [
    '/index.html',
    // ビルド後のJSファイルはハッシュ付きなので正確なパスは不明
  ];
  
  for (const asset of assets) {
    try {
      const response = await fetch(`${PRODUCTION_URL}${asset}`);
      if (response.status === 200) {
        log(`✅ ${asset} is accessible`, 'green');
      } else {
        log(`⚠️ ${asset} returned status ${response.status}`, 'yellow');
      }
    } catch (error) {
      log(`❌ Failed to fetch ${asset}: ${error.message}`, 'red');
    }
  }
}

/**
 * Chat APIエンドポイントのテスト
 */
async function testChatAPI() {
  log('\n💬 Testing Chat API Endpoint...', 'cyan');
  
  try {
    const response = await fetch(`${PRODUCTION_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'テスト',
        history: [],
        systemPrompt: 'You are a helpful assistant.'
      })
    });
    
    const status = response.status;
    
    if (status === 200) {
      const data = await response.json();
      log(`✅ Chat API is working (Status: ${status})`, 'green');
      log(`   Response: "${data.response?.substring(0, 50)}..."`, 'green');
    } else if (status === 500) {
      const errorData = await response.json();
      if (errorData.error?.includes('OPENAI_API_KEY')) {
        log('⚠️ Chat API: OPENAI_API_KEY not configured on Vercel', 'yellow');
        log('   Please set OPENAI_API_KEY in Vercel environment variables', 'yellow');
      } else {
        log(`❌ Chat API error: ${errorData.error}`, 'red');
      }
    } else {
      log(`❌ Chat API returned status ${status}`, 'red');
    }
  } catch (error) {
    log(`❌ Failed to test Chat API: ${error.message}`, 'red');
  }
}

/**
 * Convert APIエンドポイントのテスト
 */
async function testConvertAPI() {
  log('\n🎨 Testing Convert API Endpoint...', 'cyan');
  
  try {
    // テスト用のダミー画像データ（1x1ピクセルの透明PNG）
    const dummyImageData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    
    const response = await fetch(`${PRODUCTION_URL}/api/convert`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageDataUrl: dummyImageData
      })
    });
    
    const status = response.status;
    
    if (status === 200) {
      const data = await response.json();
      log(`✅ Convert API is working (Status: ${status})`, 'green');
      if (data.transformedDataUrl) {
        log('   Image transformation successful', 'green');
      }
    } else if (status === 500) {
      const errorData = await response.json();
      if (errorData.error?.includes('GEMINI_API_KEY')) {
        log('⚠️ Convert API: GEMINI_API_KEY not configured on Vercel', 'yellow');
        log('   Please set GEMINI_API_KEY in Vercel environment variables', 'yellow');
      } else {
        log(`❌ Convert API error: ${errorData.error}`, 'red');
      }
    } else {
      log(`❌ Convert API returned status ${status}`, 'red');
    }
  } catch (error) {
    log(`❌ Failed to test Convert API: ${error.message}`, 'red');
  }
}

/**
 * APIキー設定状況の確認
 */
async function checkEnvironmentVariables() {
  log('\n🔑 Environment Variables Status...', 'cyan');
  log('   Please check the following in Vercel Dashboard:', 'yellow');
  log('   1. Go to https://vercel.com', 'yellow');
  log('   2. Select your project (Compass)', 'yellow');
  log('   3. Go to Settings → Environment Variables', 'yellow');
  log('   4. Ensure these are set:', 'yellow');
  log('      - OPENAI_API_KEY (for chat functionality)', 'yellow');
  log('      - GEMINI_API_KEY (for image conversion)', 'yellow');
}

/**
 * ローカルで本番環境をシミュレート
 */
async function simulateProduction() {
  log('\n🎭 Simulating Production Locally...', 'cyan');
  log('   Run: npm run build && npm run preview', 'yellow');
  log('   This will build and serve the production build locally', 'yellow');
  log('   Access at: http://localhost:4173', 'yellow');
}

/**
 * メインテスト実行
 */
async function runTests() {
  log('🚀 Starting Production Environment Tests', 'magenta');
  log('=' .repeat(50), 'magenta');
  log(`Testing: ${PRODUCTION_URL}`, 'blue');
  
  // 各テストを実行
  await testHealthCheck();
  await testStaticAssets();
  await testChatAPI();
  await testConvertAPI();
  await checkEnvironmentVariables();
  
  log('\n' + '='.repeat(50), 'magenta');
  log('📊 Test Summary', 'magenta');
  log('='.repeat(50), 'magenta');
  
  log('\n💡 Additional Testing Options:', 'cyan');
  await simulateProduction();
  
  log('\n📱 Manual Testing:', 'cyan');
  log(`   1. Open ${PRODUCTION_URL} in browser`, 'yellow');
  log('   2. Upload a photo', 'yellow');
  log('   3. Check if chat functionality works', 'yellow');
  log('   4. Check browser console for errors', 'yellow');
  
  log('\n🔍 Vercel Logs:', 'cyan');
  log('   Check real-time logs at:', 'yellow');
  log('   https://vercel.com/[your-username]/compass/functions', 'yellow');
}

// テスト実行
runTests().catch(console.error);