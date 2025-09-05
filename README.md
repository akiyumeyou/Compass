🚀 手順（コマンド）
① 初回セットアップ
# リポジトリを test というディレクトリにクローンする場合。（最後のtestがなければCompassというフォルダになる）

デスクトップにフォルダを置きたい場合は先に　cd ~/Desktop
git clone https://github.com/akiyumeyou/Compass.git test

デスクトップにtestというフォルダができているのでVscordで開く
新規ターミナルを開き　/Desktop/test　にいることを確認

ーーーーーバックアップは佐藤の方で定期的にやりますーーーー
② 作業前に main を最新化 & バックアップタグ
# main に移動
git checkout main

# 最新の main を取得
git pull origin main

# 作業開始前のバックアップをタグに残す
git tag -a pre-$(date +%Y%m%d) -m "snapshot before work"
git push origin --tags

ーーーーー
③ コード修正 → コミット → プッシュ（VSコードの機能を使用してOK）
# ファイル編集したら
git add -A
git commit -m "fix: 修正内容を簡潔に"

# main に直接プッシュ
git push origin main
ーーーーー

④ GitHub 上で PR 作成 & マージ

GitHub のリポジトリ画面で 「Compare & pull request」 を押す

base: main、compare: main（自分の push 分）を選択

「Create pull request」→ 「Merge pull request」→ 「Confirm merge」

⑤ マージ後に再度バックアップ
# main を更新
git pull origin main

# マージ後のバックアップをタグに残す
git tag -a post-$(date +%Y%m%d) -m "snapshot after merge"
git push origin --tags

📊 手順フロー図（修正版）
 ┌──────────────┐
 │ Clone (test) │
 └──────┬───────┘
        │
        ▼
 ┌──────────────┐
 │ git checkout │
 │ git pull     │
 └──────┬───────┘
        │
        ▼
 ┌──────────────┐
 │ pre-tag保存  │
 │ (snapshot)   │
 └──────┬───────┘
        │
        ▼
 ┌──────────────┐
 │ 変更→commit │
 │ git push     │
 └──────┬───────┘
        │
        ▼
 ┌──────────────┐
 │ GitHubでPR   │
 │ → Merge      │
 └──────┬───────┘
        │
        ▼
 ┌──────────────┐
 │ git pull     │
 │ post-tag保存 │
 └──────────────┘

