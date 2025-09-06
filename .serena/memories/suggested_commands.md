# 開発コマンド一覧

## 基本コマンド
```bash
# 開発サーバー起動
npm run dev

# 本番ビルド
npm run build

# ビルドプレビュー
npm run preview

# 依存関係のインストール
npm install
```

## 品質チェックコマンド（推奨）
```bash
# TypeScript型チェック
npx tsc --noEmit

# 依存関係の更新確認
npm outdated

# セキュリティ監査
npm audit

# セキュリティ問題の自動修正
npm audit fix
```

## Git関連コマンド
```bash
# 変更状況確認
git status

# 変更内容確認
git diff

# ステージング
git add .

# コミット
git commit -m "メッセージ"

# プッシュ
git push origin main
```

## 環境変数設定
```bash
# .env.localファイルを作成/編集
echo "VITE_OPENAI_API_KEY=your_key_here" >> .env.local
echo "VITE_GEMINI_API_KEY=your_key_here" >> .env.local
```

## システムユーティリティ（macOS）
```bash
# ファイル一覧
ls -la

# ディレクトリ移動
cd ディレクトリ名

# ファイル検索
find . -name "*.tsx"

# ファイル内容検索
grep -r "検索文字列" .

# プロセス確認
ps aux | grep node

# ポート使用確認
lsof -i :5173
```