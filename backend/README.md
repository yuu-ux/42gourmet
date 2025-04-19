# 42Gourmet バックエンド

Fastify と MySQL を使用したレストラン情報 API サーバー

## 機能

- レストラン一覧の取得（フィルタリング可能）
- レストラン詳細情報の取得（営業時間を含む）
- 新しいレストランの登録

## データベース構造

### stores テーブル
- id - VARCHAR(255) PRIMARY KEY
- name - VARCHAR(255) NOT NULL
- address - VARCHAR(500)
- price_level - INT
- latitude - DECIMAL(10, 8)
- longitude - DECIMAL(11, 8)
- genre - VARCHAR(255)
- reason - TEXT

### store_operation_hours テーブル
- id - INT AUTO_INCREMENT PRIMARY KEY
- store_id - VARCHAR(255) (stores テーブルの id を参照する外部キー)
- day_of_week - ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')
- open_time - VARCHAR(10)
- close_time - VARCHAR(10)

## 始め方

### 準備

```bash
# 依存パッケージのインストール
npm install

# 環境変数の設定
cp .env.example .env
# .env ファイルを編集してデータベース接続情報を設定してください
```

### データベースの設定

MySQL データベースを用意し、.env ファイルに接続情報を設定してください。
デフォルトでは、以下の接続情報が使用されます：
- ホスト: localhost
- ユーザー: root
- パスワード: password
- データベース: gourmet

### サーバーの起動

```bash
# 開発モード（自動再起動あり）
npm run dev

# 本番モード
npm start
```

### サンプルデータの追加

サンプルデータを追加するには以下のコマンドを実行します：

```bash
npm run seed
```

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
├── index.js                   - サーバー起動エントリーポイント
├── /db/
│   └── mysql.js               - データベース接続
├── /routes/
│   └── store.route.js          - ルーター定義
├── /services/
│   └── store.service.js        - ビジネスロジック
├── /repositories/
│   └── store.repository.js     - データベースクエリ
├── /schemas/
│   └── store.schema.js         - バリデーションスキーマ
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
