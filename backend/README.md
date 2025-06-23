# 42Gourmet バックエンド

Fastify と MySQL を使用したレストラン情報 API サーバー

## 機能

- レストラン一覧の取得（フィルタリング可能）
- レストラン詳細情報の取得（営業時間を含む）
- 新しいレストランの登録

## 始め方

### 準備

- コンテナの立ち上げ
  ```bash
  docker compose up -d
  ```

- 環境変数の設定
  ```bash
  cp backend/.env.example .env
  ```

  マイグレーション
  ```bash
  docker compose exec backend node /app/seeds/seed.js
  docker compose exec backend npx prisma db pull
  docker compose exec backend npx prisma generate
  ```

  テスト
  ```bash
  npx vitest run
  ```

### データベースの設定

MySQL データベースを用意し、.env ファイルに接続情報を設定してください。
デフォルトでは、以下の接続情報が使用されます：

- ホスト: db
- ユーザー: root
- パスワード: password
- データベース: gourmet
- DATABASE_URL=mysql://USER:PASSWORD@HOST:PORT/DATABASE

## API エンドポイント

API ドキュメントは起動後に以下の URL で確認できます：
`http://localhost:3030/documentation`

### 主なエンドポイント

- `GET /api/stores` - レストラン一覧の取得
  - クエリパラメータ: `genre`, `price_level`, `latitude`, `longitude`
- `GET /api/stores/:id` - 特定のレストラン情報の取得（営業時間を含む）
- `POST /api/stores` - 新しいレストランの登録

## ディレクトリ構造

```
backend/
├── app.js                     - Fastify アプリケーション設定
├── /db/
│   └── mysql.js               - データベース接続
├── /routes/
│   └── store.route.js         - ルーター定義
├── /services/
│   └── store.service.js       - ビジネスロジック
├── /repositories/
│   └── store.repository.js    - データベースクエリ
├── /schemas/
│   └── store.schema.js        - バリデーションスキーマ
└── /seeds/
    └── seed.js                - サンプルデータ挿入スクリプト
```

## トラブルシューティング

### データベース接続エラー

- 環境変数が正しく設定されているか確認してください
- MySQL サーバーが起動しているか確認してください

### API エラー

- サーバーログを確認してエラーの詳細を確認してください
- データベースにサンプルデータが挿入されているか確認してください：
  ```bash
  npm run seed
  ```

### ポートが既に使用されている場合

- 異なるポートを .env ファイルで指定するか、既存のプロセスを終了してください

