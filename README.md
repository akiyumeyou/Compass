<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1c_txGnhL39iUP2BXG-96nTXQzrhE1Du7

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Create `.env.local` and set API keys:
   - `VITE_OPENAI_API_KEY=...` (開発時にフロントからOpenAIを呼ぶ場合に使用)
   - `VITE_GEMINI_API_KEY=...` (開発時にフロントからGeminiを呼ぶ場合に使用)
   - 本番では `OPENAI_API_KEY` と `GEMINI_API_KEY` をデプロイ先の環境変数に設定してください
3. Run the app:
   `npm run dev`

## 画像の子ども化（Gemini）

アップロードした画像は接続画面でGemini APIに送られ、子ども顔に変換されます。

- 開発時（`import.meta.env.DEV`）
  - `VITE_GEMINI_API_KEY` が設定されていれば、フロントからGeminiを直接呼び出します
  - 未設定の場合はバックエンドの `/api/convert` を利用します
- 本番
  - 常に `/api/convert` を利用します（`GEMINI_API_KEY` 環境変数が必要）

Geminiのモデル: `gemini-2.5-flash-image-preview`
