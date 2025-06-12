-- 店舗情報を格納するテーブル
CREATE TABLE IF NOT EXISTS stores (
    id           INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY                                   COMMENT 'ID',
    name         VARCHAR(255) NOT NULL                                                              COMMENT '店舗名',
    address      VARCHAR(500) NOT NULL                                                              COMMENT '店舗の住所',
    price_level  INT NOT NULL                                                                       COMMENT '価格帯',
    -- 1: "~500",
    -- 2: "501~999",
    -- 3: "1000~1500",
    -- 4: "1501~",
    latitude     DECIMAL(10, 8) NOT NULL                                                            COMMENT '店舗の緯度',
    longitude    DECIMAL(11, 8) NOT NULL                                                            COMMENT '店舗の経度',
    genre        VARCHAR(255) NOT NULL                                                              COMMENT '店舗のジャンル',
    reason       JSON                                                                               COMMENT 'おすすめの理由'
    -- ["コスパが良い", "提供が早い", "味が最高", "栄養満点"]
    created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP                                        COMMENT '作成日時',
    modified_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP           COMMENT '更新日時'
);

-- 営業時間情報を格納するテーブル
CREATE TABLE IF NOT EXISTS store_operation_hours (
    id           INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY                                   COMMENT 'ID',
    store_id     INT UNSIGNED NOT NULL                                                              COMMENT '店舗ID',
    day_of_week  ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday') COMMENT '曜日',
    open_time    TIME NOT NULL                                                                      COMMENT '開店時間',
    close_time   TIME NOT NULL                                                                      COMMENT '閉店時間',
    FOREIGN KEY (store_id) REFERENCES stores(id)
    created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP                                        COMMENT '作成日時',
    modified_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP           COMMENT '更新日時'
);
