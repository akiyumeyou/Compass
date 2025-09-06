# 技術スタックとプロジェクト構造

## 技術スタック
- **Frontend**: React 19.1.1 + TypeScript 5.8.2
- **Build Tool**: Vite 6.2.0
- **AI Engine**: 
  - OpenAI API (GPT-4) - 本番環境
  - Google Generative AI (Gemini 2.5 Flash Image Preview) - 画像変換用
- **Styling**: Tailwind CSS (CDN経由)
- **Package Manager**: npm
- **Deployment**: Vercel

## プロジェクト構造
```
Compass/
├── api/                     # サーバーレス関数
│   ├── chat.ts             # OpenAI API エンドポイント
│   └── convert.ts          # Gemini画像変換エンドポイント
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
├── tsconfig.json           # TypeScript設定
├── package.json            # 依存関係管理
├── CLAUDE.md               # 開発ガイドライン
└── .env.local              # 環境変数（Git管理外）
```

## 主要な依存関係
- @google/generative-ai: ^0.21.0
- @vercel/node: ^5.3.21
- openai: ^5.19.1
- react: ^19.1.1
- react-dom: ^19.1.1