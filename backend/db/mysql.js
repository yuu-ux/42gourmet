import { readFile } from 'node:fs/promises';
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
                host: process.env.DB_HOST,
                user: process.env.DB_USER,
                port: process.env.DB_PORT,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_NAME,
                waitForConnections: true,
                connectionLimit: 10,
                queueLimit: 0,
                multipleStatements: true,
            });

            console.log('データベース接続プールが作成されました');

            return;
        } catch (error) {
            lastError = error;
            retries++;
            console.error(
                `データベース接続に失敗しました (${retries}/${maxRetries}):`,
                error
            );

            if (retries < maxRetries) {
                console.log(`${retryDelay / 1000}秒後に再試行します...`);
                await new Promise((resolve) => setTimeout(resolve, retryDelay));
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
    const pool = await getConnection();

    try {
        // TODO ファイルパス定数にする
        const ddl = await readFile('/app/db/create_table.ddl', 'utf-8');
        await pool.query(ddl);
        console.log('テーブルが初期化されました');
    } catch (error) {
        console.error('テーブル初期化エラー:', error);
        throw error;
    }
};
