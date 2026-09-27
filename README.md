# ストックだな

家族で共有する在庫を、スマホのバーコードスキャンで登録・増減できるWebアプリ。

ログイン不要・URLを知っていれば誰でも閲覧・追加・編集・削除できる（読書管理・レシピアプリと同じ構成）。

## 技術スタック

- Next.js (App Router) + TypeScript + Tailwind CSS
- Supabase (PostgreSQL) — `@supabase/supabase-js` でクライアントから直接アクセス
- Vercel でホスティング
- バーコード読み取り: `html5-qrcode`（ブラウザのカメラ、クライアントサイド）
- 商品名の自動取得: Open Food Facts API → ヒットしなければ Yahoo!ショッピング商品検索API → どちらもヒットしなければ手入力

## 画面

- `/` : 在庫一覧（カテゴリごとにグルーピング、検索、フィルタ、数量クイック＋／−）
- `/scan` : バーコードスキャン（登録済みならその場で数量調整、未登録なら新規登録フォームへ）
- `/items/new` : 手動追加
- `/items/[id]` : 編集・削除

## セットアップ

### 1. Supabaseプロジェクトを作成

1. [supabase.com](https://supabase.com) で新規プロジェクトを作成
2. SQL Editorで [supabase/schema.sql](./supabase/schema.sql) を実行

### 2. Yahoo!ショッピング商品検索APIのアプリケーションIDを取得（任意）

Open Food Factsでヒットしない商品（食品以外など）の商品名自動取得に使う。なくても手入力で運用可能。

1. [Yahoo!デベロッパーネットワーク](https://developer.yahoo.co.jp/) でアプリケーションを登録
2. 発行された「Client ID（アプリケーションID）」を控える

### 3. 環境変数を設定

`.env.local.example` を `.env.local` にコピーして値を埋める。

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
YAHOO_APP_ID=
```

### 4. 依存関係をインストールして起動

```bash
npm install
npm run dev
```

[http://localhost:3000](http://localhost:3000) を開く。

## デプロイ

1. GitHubに新規リポジトリを作成し、このプロジェクトをpush
2. Vercelにそのリポジトリをインポート
3. Vercelの環境変数に `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `YAHOO_APP_ID` を設定してデプロイ

Vercelチーム配下にプロジェクトを作る場合、デフォルトで「Vercel Authentication（Deployment Protection）」が有効になり、ログインなしでURLを共有できない。Project Settings → Deployment Protection で無効化する。

## 通販での購入分の一括登録

アプリ内に専用画面は用意していない。注文確認メールなどのテキストをClaude Codeに貼り付けて、その場でSupabaseに直接登録してもらう運用とする。
