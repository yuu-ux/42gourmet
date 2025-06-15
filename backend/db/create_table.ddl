-- 店舗情報を格納するテーブル
CREATE TABLE IF NOT EXISTS stores (
    id           INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY                                   COMMENT 'ID',
    name         VARCHAR(255) NOT NULL                                                              COMMENT '店舗名',
    address      VARCHAR(500) NOT NULL                                                              COMMENT '店舗の住所',
    price_level  TINYINT NOT NULL                                                                       COMMENT '価格帯',
    -- 1: "~500",
    -- 2: "501~999",
    -- 3: "1000~1500",
    -- 4: "1501~",
    latitude     DECIMAL(11, 8) NOT NULL                                                            COMMENT '店舗の緯度',
    longitude    DECIMAL(11, 8) NOT NULL                                                            COMMENT '店舗の経度',
    genre        TINYINT NOT NULL                                                                   COMMENT '店舗のジャンル',
    -- 1: 和食
    -- 2: 中華
    -- 3: 洋食
    -- 4: アジアン
    -- 5: カフェ
    -- 6: 居酒屋
    reason       JSON                                                                               COMMENT 'おすすめの理由',
    -- データベースに入れる時は [1, 2, 3, 4] のような形式になる
    -- [1: "コスパが良い", 2: "提供が早い", 3: "味が最高", 4: "栄養満点"]
    created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP                                        COMMENT '作成日時',
    modified_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP           COMMENT '更新日時'
);

-- おすすめ理由のマスターテーブル
CREATE TABLE IF NOT EXISTS master_reason (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY                                             COMMENT 'ID',
    name VARCHAR(255) NOT NULL                                                                      COMMENT '名前'
);

-- 営業時間情報を格納するテーブル
CREATE TABLE IF NOT EXISTS store_operation_hours (
    id           INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY                                   COMMENT 'ID',
    store_id     INT UNSIGNED NOT NULL                                                              COMMENT '店舗ID',
    day_of_week  VARCHAR(255) NOT NULL                                                              COMMENT '曜日',
    open_time    TIME NOT NULL                                                                      COMMENT '開店時間',
    close_time   TIME NOT NULL                                                                      COMMENT '閉店時間',
    created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP                                        COMMENT '作成日時',
    modified_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP           COMMENT '更新日時',
    FOREIGN KEY (store_id) REFERENCES stores(id)
);
