import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

let pool;

export const connectDB = async () => {
  try {
    pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'dev',
      port: process.env.DB_PORT || 13306,
      password: process.env.DB_PASSWORD || 'dev',
      database: process.env.DB_NAME || 'gourmet',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    console.log('データベース接続プールが作成されました');

    await initDatabase();
  } catch (error) {
    console.error('データベース接続エラー:', error);
    throw error;
  }
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
        CONSTRAINT fk_store_id FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
        UNIQUE KEY unique_store_day (store_id, day_of_week)
      )
    `);

    console.log('テーブルが初期化されました');
  } catch (error) {
    console.error('テーブル初期化エラー:', error);
    throw error;
  }
};
