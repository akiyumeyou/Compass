#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// ヘルパー関数
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function readJsonFile(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error.message);
    return null;
  }
}

function getTimestamp() {
  const now = new Date();
  return now.toISOString().replace(/[:.]/g, '-').split('T')[0] + '-' + 
         now.toTimeString().split(' ')[0].replace(/:/g, '');
}

function analyzeComponents() {
  const componentsDir = path.join(projectRoot, 'components');
  const components = [];
  
  if (fs.existsSync(componentsDir)) {
    const files = fs.readdirSync(componentsDir);
    files.forEach(file => {
      if (file.endsWith('.tsx')) {
        const content = fs.readFileSync(path.join(componentsDir, file), 'utf8');
        const name = file.replace('.tsx', '');
        
        // 簡易的なPropsの抽出
        const propsMatch = content.match(/interface\s+(\w+Props)\s*{([^}]*)}/);
        let props = 'なし';
        if (propsMatch) {
          props = propsMatch[2].trim().split('\n')
            .map(line => line.trim())
            .filter(line => line && !line.startsWith('//'))
            .join(', ');
        }
        
        components.push({ name, file, props });
      }
    });
  }
  
  return components;
}

function analyzeAPIs() {
  const apiDir = path.join(projectRoot, 'api');
  const apis = [];
  
  if (fs.existsSync(apiDir)) {
    const files = fs.readdirSync(apiDir);
    files.forEach(file => {
      if (file.endsWith('.ts')) {
        const content = fs.readFileSync(path.join(apiDir, file), 'utf8');
        const name = file.replace('.ts', '');
        
        // エンドポイントとメソッドを判定
        const method = content.includes('POST') ? 'POST' : 'GET';
        const endpoint = `/api/${name}`;
        
        apis.push({ name, endpoint, method });
      }
    });
  }
  
  return apis;
}

function getScreenFlow() {
  const appFile = path.join(projectRoot, 'App.tsx');
  if (fs.existsSync(appFile)) {
    const content = fs.readFileSync(appFile, 'utf8');
    
    // Screen enumの抽出
    const screenMatch = content.match(/enum\s+Screen\s*{([^}]*)}/);
    if (screenMatch) {
      return screenMatch[1].trim().split(',')
        .map(s => s.trim().replace(/['"]/g, ''))
        .filter(s => s);
    }
  }
  
  // デフォルトのフロー
  return ['UPLOAD', 'CONNECTING', 'CHAT'];
}

function generateSystemSpec() {
  console.log('📝 システム仕様書を生成中...');
  
  // package.jsonの読み込み
  const packageJson = readJsonFile(path.join(projectRoot, 'package.json'));
  
  // 各種情報の収集
  const components = analyzeComponents();
  const apis = analyzeAPIs();
  const screens = getScreenFlow();
  const timestamp = getTimestamp();
  
  // 仕様書の生成
  let spec = `# システム仕様書

生成日時: ${new Date().toLocaleString('ja-JP')}

## 1. システム概要

**プロジェクト名**: ${packageJson?.name || '過去の自分とビデオ通話'}

**説明**: 幼少期の写真をアップロードして、AIが過去の自分として対話するReact/TypeScriptアプリケーション。OpenAI GPT-4とGoogle Gemini APIを活用し、子供の視点から大人になった自分との感動的な対話を実現します。

## 2. 技術スタック

### フロントエンド
- **React**: ${packageJson?.dependencies?.react || 'N/A'}
- **TypeScript**: ${packageJson?.devDependencies?.typescript || 'N/A'}
- **Vite**: ${packageJson?.devDependencies?.vite || 'N/A'}
- **スタイリング**: Tailwind CSS (CDN)

### AI/ML
- **OpenAI**: ${packageJson?.dependencies?.openai || 'N/A'}
- **Google Generative AI**: ${packageJson?.dependencies?.['@google/generative-ai'] || 'N/A'}

### デプロイメント
- **Vercel**: ${packageJson?.dependencies?.['@vercel/node'] || 'N/A'}

## 3. 画面仕様

### 画面遷移フロー
\`\`\`
${screens.map((screen, index) => {
  if (index === screens.length - 1) {
    return `[${index + 1}. ${screen}画面]\n    ↓ (終了)\n[1. ${screens[0]}画面に戻る]`;
  }
  return `[${index + 1}. ${screen}画面]\n    ↓`;
}).join('\n')}
\`\`\`

### 各画面の詳細

#### 1. UPLOAD画面 (UploadScreen.tsx)
- **機能**: 写真のアップロード
- **主要UI要素**: 
  - アップロードボタン
  - ドラッグ&ドロップエリア
  - エラーメッセージ表示
- **遷移先**: CONNECTING画面

#### 2. CONNECTING画面 (ConnectingScreen.tsx)
- **機能**: 接続中のアニメーション表示と画像変換処理
- **処理内容**:
  - Gemini APIを使用した画像変換（大人→子供）
  - 変換後、自動的にCHAT画面へ遷移
- **遷移先**: CHAT画面

#### 3. CHAT画面 (ChatScreen.tsx)
- **機能**: AIとのビデオ通話風チャット
- **主要UI要素**:
  - 変換された子供の写真表示
  - チャットメッセージエリア
  - テキスト入力欄
  - 送信ボタン
  - 通話終了ボタン
- **AI処理**: OpenAI GPT-4による子供視点の対話生成

## 4. API仕様

### エンドポイント一覧
${apis.length > 0 ? apis.map(api => `
#### ${api.endpoint}
- **メソッド**: ${api.method}
- **ファイル**: api/${api.name}.ts
- **機能**: ${api.name === 'chat' ? 'OpenAI APIとの通信' : api.name === 'convert' ? 'Gemini APIによる画像変換' : '詳細は実装を参照'}
`).join('\n') : '（APIエンドポイントなし）'}

## 5. コンポーネント構造

### コンポーネント一覧
${components.map(comp => `
#### ${comp.name}
- **ファイル**: components/${comp.file}
- **Props**: ${comp.props || 'なし'}
`).join('\n')}

## 6. 環境変数

### 開発環境 (.env.local)
- \`VITE_OPENAI_API_KEY\`: OpenAI APIキー（開発用）
- \`VITE_GEMINI_API_KEY\`: Gemini APIキー（開発用）

### 本番環境 (Vercel)
- \`OPENAI_API_KEY\`: OpenAI APIキー（本番用）
- \`GEMINI_API_KEY\`: Gemini APIキー（本番用）

## 7. 主要な依存関係

### 本番依存関係
${Object.entries(packageJson?.dependencies || {}).map(([name, version]) => 
  `- **${name}**: ${version}`
).join('\n')}

### 開発依存関係
${Object.entries(packageJson?.devDependencies || {}).map(([name, version]) => 
  `- **${name}**: ${version}`
).join('\n')}

## 8. ビルド・デプロイ

### 開発コマンド
\`\`\`bash
# 開発サーバー起動
npm run dev

# 本番ビルド
npm run build

# プレビュー
npm run preview
\`\`\`

### デプロイメント
- **プラットフォーム**: Vercel
- **自動デプロイ**: GitHubのmainブランチへのpush時

## 9. セキュリティ考慮事項

- APIキーは環境変数で管理
- 画像データはローカル処理（サーバー非保存）
- XSS対策: Reactのデフォルトエスケープ機能を使用
- CORS設定: APIエンドポイントで適切に設定

## 10. 更新履歴

- ${new Date().toLocaleDateString('ja-JP')}: システム仕様書自動生成機能を追加

---

*このドキュメントは自動生成されました。*
`;

  // ディレクトリの作成
  const specsDir = path.join(projectRoot, 'docs', 'system-specs');
  const archiveDir = path.join(specsDir, 'archive');
  ensureDirectoryExists(specsDir);
  ensureDirectoryExists(archiveDir);
  
  // 最新版の保存
  const latestPath = path.join(specsDir, 'latest.md');
  fs.writeFileSync(latestPath, spec);
  console.log(`✅ 最新版を保存: docs/system-specs/latest.md`);
  
  // アーカイブの保存
  const archivePath = path.join(archiveDir, `${timestamp}.md`);
  fs.writeFileSync(archivePath, spec);
  console.log(`✅ アーカイブを保存: docs/system-specs/archive/${timestamp}.md`);
  
  console.log('✨ システム仕様書の生成が完了しました！');
}

// メイン実行
if (import.meta.url === `file://${__filename}`) {
  generateSystemSpec();
}

export default generateSystemSpec;