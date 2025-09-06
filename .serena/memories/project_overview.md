# プロジェクト概要

## プロジェクト名
過去の自分とビデオ通話

## 目的
幼少期の写真をアップロードして、AIが過去の自分として対話するReact/TypeScriptアプリケーション。OpenAIのGPT-4またはGoogle Gemini APIを活用し、子供の視点から大人になった自分との感動的な対話を実現します。

## 主な機能
1. **写真アップロード**: ユーザーが幼少期の写真をアップロード
2. **画像変換**: Gemini APIを使って画像を子供顔に変換
3. **AI対話**: OpenAI GPT-4またはGemini APIによる子供視点の対話
4. **ビデオ通話UI**: スマートフォンのビデオ通話を模倣したUI

## 画面遷移フロー
```
UPLOAD (写真アップロード)
    ↓ onPhotoUpload
CONNECTING (接続中アニメーション・画像変換)
    ↓ onConnected (2秒後自動遷移)
CHAT (ビデオ通話)
    ↓ onEndCall
UPLOAD (最初に戻る)
```

## デプロイ先
Vercel

## AI Studio連携
View in AI Studio: https://ai.studio/apps/drive/1c_txGnhL39iUP2BXG-96nTXQzrhE1Du7