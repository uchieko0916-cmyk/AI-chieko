# チアパス

子ども向けチアダンス教室のLINEミニアプリ「チアパス」MVP。

保護者向け（体験レッスン予約・レッスン一覧・出欠・振替・マイページ・お知らせ）と、
教室スタッフ向けの管理画面（クラス/レッスン/会員/子ども登録、予約・出欠・振替確認、お知らせ投稿）を実装しています。

## 技術構成

- フレームワーク: Next.js 16（App Router）+ TypeScript + Tailwind CSS v4
- DB: PostgreSQL（Prisma 7 / ドライバーアダプター: `@prisma/adapter-pg`）
- 認証: メールアドレス＋パスワードの簡易セッション認証（Cookie署名はHMAC-SHA256）
  - `src/lib/auth.ts` の `AuthProvider` インターフェースを実装する形で、
    将来 LINE Login を追加できる構造にしています。

本番はNext.js（Vercel）+ Neon(PostgreSQL) を想定していますが、
ローカル開発ではこの環境にインストール済みのPostgreSQLをそのまま使っています。

## セットアップ（ローカル）

```bash
npm install

# .env に DATABASE_URL / SESSION_SECRET を設定（.env.example 参照）
# ローカルPostgresを使う場合、あらかじめ以下でDB/ユーザーを作成しておく想定です
#   createuser cheerpass --pwprompt
#   createdb cheerpass -O cheerpass

npx prisma migrate dev   # マイグレーション適用
npx tsx prisma/seed.ts   # テスト用初期データを投入

npm run dev               # http://localhost:3000
```

## テスト用アカウント（seed投入後）

| 役割 | メールアドレス | パスワード |
|---|---|---|
| 管理者 | admin@cheer-pass.example | admin1234 |
| 保護者（山田家・キッズ、振替1回あり） | yamada@example.com | password123 |
| 保護者（田中家・ジュニア） | tanaka@example.com | password123 |
| 保護者（鈴木家・体験予約のみ） | suzuki@example.com | password123 |

## 本番（Neon + Vercel）への切り替え

1. Neonでプロジェクトを作成し、接続文字列を取得
2. Vercelにこのリポジトリの `cheer-pass` ディレクトリをRoot Directoryとして接続
3. Vercelの環境変数に `DATABASE_URL`（Neonの接続文字列）と `SESSION_SECRET`（ランダムな文字列）を設定
4. デプロイ後、初回のみ `npx prisma migrate deploy` を本番DBに対して実行

コードの変更は不要です（Prismaのスキーマ・アダプターはローカルPostgresとNeonで共通）。

## ディレクトリ構成

```
src/
  app/
    login/, trial/                保護者: 未ログイン導線
    (app)/                        保護者: ログイン後（ホーム/レッスン/出欠/振替/マイページ/お知らせ）
    admin/login/, admin/(protected)/  管理画面
  components/                     共通UI・アイコン・フォーム
  lib/
    auth.ts, session.ts           認証（AuthProvider抽象化）
    db.ts                         Prisma Client
    lesson.ts, child.ts, format.ts ドメインロジック
    actions/parent.ts             保護者向け Server Actions
    actions/admin.ts              管理者向け Server Actions
prisma/
  schema.prisma                   データモデル
  seed.ts                         初期データ
```

## 既知の制約（MVP時点）

- 1保護者につき最初の子ども1人のみをホーム/出欠/振替の対象として扱っています（複数人対応は将来拡張）
- 「イベント参加履歴」はマイページに表示枠のみ用意していますが、対応するデータモデルは未実装です
- LINEログイン・LIFF起動・各種LINE通知は未実装です（Step 7以降で対応）
