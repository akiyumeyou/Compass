# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# 過去の自分とビデオ通話 - 開発ガイドライン

## システム概要

「過去の自分とビデオ通話」- 幼少期の写真をアップロードしてAIが過去の自分として対話するReact/TypeScriptアプリケーション。OpenAI GPT-4またはGoogle Gemini APIを活用し、子供の視点から大人になった自分との感動的な対話を実現します。

## 技術スタック

- **Frontend**: React 19.1.1 + TypeScript 5.8
- **Build Tool**: Vite 6.3.5
- **AI Engine**: 
  - OpenAI API (GPT-4) - 本番環境
  - Google Generative AI (Gemini 1.5 Flash) - 代替オプション
- **Styling**: Tailwind CSS (CDN)
- **Package Manager**: npm
- **Deployment**: Vercel

## 開発コマンド

### 基本コマンド
```bash
# 開発サーバー起動
npm run dev

# 本番ビルド
npm run build

# ビルドプレビュー
npm run preview
```

### 品質チェックコマンド（推奨）
```bash
# TypeScript型チェック
npx tsc --noEmit

# 依存関係の更新確認
npm outdated

# セキュリティ監査
npm audit
```

## 必須環境変数

`.env.local`ファイルに以下を設定:
- `VITE_OPENAI_API_KEY`: OpenAI APIキー（開発環境用）
- `GEMINI_API_KEY`: Google Gemini APIキー（代替オプション）

本番環境（Vercel）の環境変数:
- `OPENAI_API_KEY`: OpenAI APIキー（本番環境用）

## 開発作業フロー（必須）

### 実装時の必須手順

1. **実装前の準備**
   - 既存コンポーネントの構造を確認
   - TypeScript型定義を確認（`types.ts`）
   - 画面遷移フローを理解

2. **実装作業**
   - 既存のコードスタイルに従う
   - TypeScript型を厳密に定義
   - エラーハンドリングを適切に実装
   - AIレスポンスの処理を考慮

3. **動作確認（必須）**
   ```bash
   # ビルドチェック（必須）
   npm run build
   
   # 開発サーバーで動作確認
   npm run dev
   ```

4. **コミット前チェック**
   - APIキーが`.env.local`に記載されているか確認
   - APIキーがソースコードに含まれていないか確認
   - ビルドが成功することを確認

## プロジェクト構造

```
Compass/
├── api/                     # サーバーレス関数
│   └── chat.ts             # OpenAI API エンドポイント
├── components/              # Reactコンポーネント
│   ├── ChatScreen.tsx      # チャット画面（メイン機能）
│   ├── ConnectingScreen.tsx # 接続中画面
│   ├── PhoneFrame.tsx      # スマホフレームUI
│   ├── UploadScreen.tsx    # 写真アップロード画面
│   └── icons.tsx           # アイコンコンポーネント
├── App.tsx                 # メインアプリケーション
├── index.tsx               # エントリーポイント
├── types.ts                # TypeScript型定義
├── vite.config.ts          # Vite設定
├── vite-env.d.ts          # Vite環境変数型定義
├── package.json            # 依存関係管理
└── .env.local              # 環境変数（Git管理外）
```

## 画面遷移フロー

```
UPLOAD (写真アップロード)
    ↓ onPhotoUpload
CONNECTING (接続中アニメーション)
    ↓ onConnected (2秒後自動遷移)
CHAT (ビデオ通話)
    ↓ onEndCall
UPLOAD (最初に戻る)
```

## AI処理アーキテクチャ

### OpenAI API統合（メイン）
- **モデル**: `gpt-4`
- **開発環境**: 直接OpenAI APIを呼び出し（`dangerouslyAllowBrowser: true`）
- **本番環境**: Vercelサーバーレス関数(`/api/chat`)経由
- **チャットセッション**: メッセージ履歴を管理

### Gemini API統合（代替）
- **モデル**: `gemini-1.5-flash`
- **処理方式**: ストリーミングレスポンス
- **初期化**: `GoogleGenerativeAI`クラス使用
- **チャットセッション**: `startChat()`で永続的なセッション管理

### システムプロンプト設計
子供の視点を維持するための詳細なプロンプト：
- 好奇心旺盛で無邪気な性格設定
- 簡単な言葉と短い文章
- 感情豊かな表現
- キャラクター崩れの防止

### エラーハンドリング
- API初期化失敗時の代替メッセージ
- ストリーミング中断時の対処
- ネットワークエラーの考慮

## 環境変数設定

### 開発環境（`.env.local`）
```env
# OpenAI API（メイン）
VITE_OPENAI_API_KEY=your_openai_api_key_here

# Gemini API（代替）
GEMINI_API_KEY=your_gemini_api_key_here
```

### Vite環境変数の処理
- `vite.config.ts`で環境変数を定義
- `loadEnv`を使用して`.env.local`から読み込み
- クライアントサイドでアクセス可能に設定

## コンポーネント間のデータフロー

### 状態管理
- `App.tsx`が全体の状態を管理
- `appState`: 現在の画面状態（enum `Screen`使用）
- `childhoodPhoto`: アップロードされた写真データ（Base64）

### Props設計
```typescript
// UploadScreen
onPhotoUpload: (photoDataUrl: string) => void

// ConnectingScreen
onConnected: () => void
photo: string | null

// ChatScreen
photo: string
onEndCall: () => void
```

## スタイリング戦略

### Tailwind CSS使用方法
- CDN経由で読み込み（`index.html`）
- 設定ファイルなし、デフォルトクラス使用
- レスポンシブデザイン考慮
- ダークテーマベース（`bg-gray-900`）

### UIデザイン原則
- スマートフォンのビデオ通話UIを模倣
- 最大幅375px（iPhone風デザイン）
- 角丸とシャドウで立体感演出
- チャットバブルの左右配置

## パフォーマンス最適化

- React.memoによる不要な再レンダリング防止
- useCallbackによるコールバック関数の最適化
- ストリーミングレスポンスによるUX向上（Gemini使用時）
- 画像の遅延読み込み考慮

## セキュリティ考慮事項

- APIキーの環境変数管理
- `.gitignore`での環境変数ファイル除外
- XSS対策（React標準エスケープ）
- ユーザーアップロード画像の検証
- CORS設定（本番環境）

## トラブルシューティング

### よくある問題と解決策

1. **OpenAI APIエラー**
   - APIキーの有効性確認
   - `.env.local`ファイルの`VITE_OPENAI_API_KEY`確認
   - 本番環境では`OPENAI_API_KEY`の設定確認
   - 開発サーバーの再起動

2. **Gemini APIエラー**
   - APIキーの有効性確認
   - `.env.local`ファイルの`GEMINI_API_KEY`確認
   - 開発サーバーの再起動

3. **ビルドエラー**
   - `npm install`で依存関係再インストール
   - `node_modules`削除して再インストール
   - TypeScript型エラーの確認

4. **画面遷移の不具合**
   - `appState`の状態確認
   - コールバック関数の正しい実装
   - 写真データの存在確認

5. **スタイリングの崩れ**
   - Tailwind CDNの読み込み確認
   - ブラウザキャッシュのクリア
   - 開発者ツールでクラス適用確認

## 今後の拡張可能性

- 音声合成による音声通話機能
- 複数の写真から年齢別の対話
- 会話履歴の保存機能
- 感情分析による応答調整
- 多言語対応
- WebRTC実装による実際のビデオ通話機能

## 開発時の注意事項

- 既存のコンポーネント構造を維持
- TypeScript型定義を厳密に行う
- エラーメッセージは日本語で統一
- コミット前に必ずビルドチェック
- APIキーを絶対にコミットしない
- 本番環境と開発環境の切り分けを意識

## AIアシスタントへのフィードバック

### コード修正時の注意点

- **既存コードの確認**: 修正依頼の際は、常に既存のコード全体を詳細に確認し、変更が最小限になるように努めること。
- **余分なロジックの追加回避**: ユーザーが意図しない、または要求していない余分なロジックや機能を追加しないこと。
- **変更の明確化**: 変更を加える際は、その変更がなぜ必要なのか、どのような影響があるのかを明確に説明すること。