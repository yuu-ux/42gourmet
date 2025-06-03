import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

let pool;

export const connectDB = async () => {
  const maxRetries = 5;
  const retryDelay = 3000;
  let retries = 0;
  let lastError;

  while (retries < maxRetries) {
    try {
      pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        port: process.env.DB_PORT || 23306,
        password: process.env.DB_PASSWORD || 'password',
        database: process.env.DB_NAME || 'gourmet',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
      });

      console.log('データベース接続プールが作成されました');

      await initDatabase();
      return;
    } catch (error) {
      lastError = error;
      retries++;
      console.error(`データベース接続に失敗しました (${retries}/${maxRetries}):`, error);

      if (retries < maxRetries) {
        console.log(`${retryDelay/1000}秒後に再試行します...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
  }

  console.error('最大再試行回数を超えました。データベース接続に失敗しました');
  throw lastError;
};

export const getConnection = async () => {
  if (!pool) await connectDB();
  return pool;
};

export const initDatabase = async () => {
  const connection = await getConnection();

  try {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS stores (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        address VARCHAR(500),
        price_level INT,
        latitude DECIMAL(10, 8),
        longitude DECIMAL(11, 8),
        genre VARCHAR(255),
        reason TEXT
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS store_operation_hours (
        id INT AUTO_INCREMENT PRIMARY KEY,
        store_id INT NOT NULL,
        day_of_week ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday') NOT NULL,
        open_time VARCHAR(10),
        close_time VARCHAR(10),
        CONSTRAINT fk_store_id FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE
      )
    `);

    console.log('テーブルが初期化されました');
  } catch (error) {
    console.error('テーブル初期化エラー:', error);
    throw error;
  }
};
