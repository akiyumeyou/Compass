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
- `GEMINI_API_KEY`: Google Gemini APIキー

## アーキテクチャ

### 画面遷移フロー
```
UPLOAD (写真アップロード) → CONNECTING (接続中) → CHAT (ビデオ通話)
```

### 主要コンポーネント構造
- **App.tsx**: 画面遷移の状態管理、写真データの保持
- **ChatScreen.tsx**: Gemini AIとのチャット機能実装
  - Google Gemini API (`gemini-2.5-flash`モデル)を使用
  - ストリーミングレスポンス対応
  - 子供の視点で会話するシステムプロンプト設定

### API統合
- Vite設定で`process.env.API_KEY`と`process.env.GEMINI_API_KEY`の両方を定義
- ChatScreenでGoogle Genaiライブラリ使用してチャット実装

### スタイリング
Tailwind CSSクラスを直接使用（設定ファイルなし、CDN経由）