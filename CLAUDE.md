# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要
「過去の自分とビデオ通話」- 幼少期の写真をアップロードしてAIが過去の自分として対話するReact/TypeScriptアプリケーション

## 開発コマンド

```bash
# 開発サーバー起動
npm run dev

# ビルド
npm run build

# プレビュー
npm run preview
```

## 必須環境変数
`.env.local`ファイルに以下を設定:
- `VITE_OPENAI_API_KEY`: OpenAI APIキー

## アーキテクチャ

### 画面遷移フロー
```
UPLOAD (写真アップロード) → CONNECTING (接続中) → CHAT (ビデオ通話)
```

### 主要コンポーネント構造
- **App.tsx**: 画面遷移の状態管理、写真データの保持
- **ChatScreen.tsx**: OpenAI GPT-4とのチャット機能実装
  - OpenAI API (`gpt-4`モデル)を使用
  - 子供の視点で会話するシステムプロンプト設定
  - 開発環境では直接API呼び出し、本番環境では/api/chat経由

### API統合
- 開発環境: 直接OpenAI APIを呼び出し
- 本番環境: Vercelサーバーレス関数(/api/chat)経由

### スタイリング
Tailwind CSSクラスを直接使用（設定ファイルなし、CDN経由）