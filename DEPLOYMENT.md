# デプロイメント手順 / Deployment Guide

## 🚀 デプロイ方法の選択肢

### 1. Netlify （推奨 / Recommended）

**手順:**
1. [GitHub](https://github.com) にリポジトリを作成・プッシュ
2. [Netlify](https://netlify.com) にサインアップ/ログイン
3. "New site from Git" → GitHubリポジトリを選択
4. ビルド設定:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. "Deploy site" をクリック

**利点:**
- 無料プランで十分
- 自動デプロイ
- カスタムドメイン対応
- CDN配信
- HTTPSサポート

### 2. Vercel

**手順:**
1. [GitHub](https://github.com) にリポジトリを作成・プッシュ
2. [Vercel](https://vercel.com) にサインアップ/ログイン
3. "New Project" → GitHubリポジトリをインポート
4. 設定は自動検出される
5. "Deploy" をクリック

**利点:**
- Next.jsと同じ会社が運営
- 高速なグローバルCDN
- 自動プレビューデプロイ
- 無料プランあり

### 3. GitHub Pages

**手順:**
1. GitHubリポジトリを作成
2. ローカルでgh-pagesをインストール:
   ```bash
   npm install gh-pages --save-dev
   ```
3. コードをプッシュ:
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```
4. GitHub Actions が自動でデプロイ
5. Settings → Pages で URL確認

**利点:**
- GitHub統合
- 完全無料
- 自動デプロイ

### 4. ローカルビルド + 手動アップロード

**手順:**
1. ローカルでビルド:
   ```bash
   npm run build
   ```
2. `dist/` フォルダの中身を任意のホスティングサービスにアップロード

## 🔧 デプロイ前の確認事項

```bash
# 依存関係のインストール
npm install

# TypeScriptチェック
npm run typecheck

# ビルドテスト
npm run build

# プレビュー
npm run preview
```

## 🌐 カスタムドメイン設定

### Netlify
1. DNS設定でCNAMEレコードを追加
2. Netlify管理画面でドメイン設定

### Vercel
1. "Domains" タブで独自ドメインを追加
2. DNS設定を更新

### GitHub Pages
1. リポジトリ設定でカスタムドメインを設定
2. CNAME ファイルをpublicディレクトリに配置

## 📱 本番環境の最適化

### 1. パフォーマンス最適化
- Viteの自動コード分割
- Tree shaking有効
- 画像最適化（今後の拡張で）

### 2. SEO対策
```html
<!-- index.html に追加推奨 -->
<meta name="description" content="5年後の自分をシミュレーションする自己実現アプリ">
<meta name="keywords" content="自己実現,シミュレーション,未来予測,自己分析">
<meta property="og:title" content="自己実現シミュレーション">
<meta property="og:description" content="過去・現在・未来をつなげて5年後の自分を予測">
```

### 3. 分析ツール
```html
<!-- Google Analytics (オプション) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_TRACKING_ID"></script>
```

## 🔒 セキュリティ設定

### HTTPSの確保
- Netlify: 自動でLet's Encrypt証明書
- Vercel: 自動でSSL証明書
- GitHub Pages: 自動でHTTPS

### セキュリティヘッダー
```toml
# netlify.toml に追加可能
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "strict-origin-when-cross-origin"
```

## 🐛 トラブルシューティング

### よくある問題

1. **ルーティングエラー (404)**
   - SPA用のリダイレクト設定が必要
   - `netlify.toml` や `vercel.json` で設定済み

2. **ビルドエラー**
   ```bash
   npm run typecheck  # TypeScriptエラーをチェック
   npm run build      # ビルドテスト
   ```

3. **環境変数**
   - 現在は不要だが、将来的にAPI連携時は各プラットフォームで設定

### デバッグ用コマンド
```bash
# 本番ビルドをローカルでテスト
npm run build && npm run preview

# 詳細なビルドログ
npm run build -- --mode production --debug
```

## 📊 デプロイ後の確認

1. **機能テスト**
   - 全ての入力フォームが動作するか
   - シミュレーション結果が表示されるか
   - エクスポート機能が動作するか

2. **パフォーマンス**
   - Lighthouse スコア確認
   - 読み込み速度テスト

3. **レスポンシブ**
   - モバイル表示確認
   - タブレット表示確認

## 🔄 継続的デプロイ

すべてのプラットフォームでGitHub連携により、`main`ブランチにプッシュすると自動でデプロイされます。

```bash
# 更新をデプロイ
git add .
git commit -m "Update: 新機能追加"
git push origin main
```

## 📈 今後の拡張予定

- API連携（OpenAI GPT など）
- データベース連携（Firebase など）
- ユーザー認証
- 結果の保存・共有機能
- 多言語対応