const insertStores = require('./store');
const insertHours = require('./hours');
const pool = require('./db');

async function createTables() {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    await conn.query('CREATE DATABASE IF NOT EXISTS gourmet');
    await conn.query('USE gourmet');

    await conn.query(`
      CREATE TABLE IF NOT EXISTS stores (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        address TEXT,
        price VARCHAR(100),
        latitude DOUBLE,
        longitude DOUBLE,
        genre VARCHAR(100),
        reason TEXT,
        created_on DATETIME DEFAULT CURRENT_TIMESTAMP,
        modified_on DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS store_hours (
        id INT AUTO_INCREMENT PRIMARY KEY,
        store_id INT NOT NULL,
        day_of_week VARCHAR(10),
        open_time TIME,
        close_time TIME,
        is_closed BOOLEAN DEFAULT FALSE,
        created_on DATETIME DEFAULT CURRENT_TIMESTAMP,
        modified_on DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (store_id) REFERENCES stores(id)
      );
    `);

    await conn.commit();
    console.log('🧱 テーブル作成完了');
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

async function truncateTables() {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query('SET FOREIGN_KEY_CHECKS = 0');
    await conn.query('TRUNCATE TABLE store_hours');
    await conn.query('TRUNCATE TABLE stores');
    await conn.query('SET FOREIGN_KEY_CHECKS = 1');
    await conn.commit();
    console.log('🧹 テーブル初期化完了');
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

(async () => {
  try {
    await createTables();      // ← ① テーブル作成
    await truncateTables();    // ← ② 中身削除
    await insertStores();      // ← ③ データ挿入
    await insertHours();
  } catch (err) {
    console.error('❌ エラー発生:', err);
  } finally {
    await pool.end();
    console.log('🌱 初期データ挿入完了');
  }
})();
