import { getConnection } from '../db/mysql.js';
import { prisma } from '../db/mysql.js';

export const findStores = async (filters = {}) => {
    const stores = await prisma.stores.findMany({
        select: {
            id: true,
            name: true,
            address: true,
            price_level: true,
            latitude: true,
            longitude: true,
            genre: true,
            reason: true,
            store_operation_hours: {
                select: {
                    day_of_week: true,
                    open_time: true,
                    close_time: true,
                },
            },
        },
    });
    return stores;
};

export const findStoreById = async (id) => {
    const pool = await getConnection();

    const [storeRows] = await pool.query('SELECT * FROM stores WHERE id = ?', [
        id,
    ]);

    if (storeRows.length === 0) {
        return null;
    }

    const [hoursRows] = await pool.query(
        'SELECT day_of_week, open_time, close_time FROM store_operation_hours WHERE store_id = ?',
        [id]
    );

    const store = storeRows[0];
    store.operation_hours = hoursRows;

    return store;
};

export const createStore = async (storeData) => {
    const pool = await getConnection();

    const {
        name,
        address,
        price_level,
        latitude,
        longitude,
        genre,
        reason,
        operation_hours,
    } = storeData;

    const [result] = await pool.query(
        'INSERT INTO stores (name, address, price_level, latitude, longitude, genre, reason) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [name, address, price_level, latitude, longitude, genre, reason]
    );

    const insertedId = result.insertId;

    if (operation_hours && operation_hours.length > 0) {
        const hoursValues = operation_hours.map((hour) => [
            insertedId,
            hour.day_of_week,
            hour.open_time,
            hour.close_time,
        ]);
        await pool.query(
            'INSERT INTO store_operation_hours (store_id, day_of_week, open_time, close_time) VALUES ?',
            [hoursValues]
        );
    }

    return findStoreById(insertedId);
};

export const deleteStore = async (id) => {
    const pool = await getConnection();

    // 指定されたIDのストアが存在するか確認
    const [storeRows] = await pool.query('SELECT id FROM stores WHERE id = ?', [
        id,
    ]);

    if (storeRows.length === 0) {
        return null;
    }

    // 外部キー制約によりstore_operation_hoursテーブルのレコードも自動的に削除される
    await pool.query('DELETE FROM stores WHERE id = ?', [id]);

    return { id };
};

export const updateStore = async (id, storeData) => {
    const pool = await getConnection();

    // 指定されたIDのストアが存在するか確認
    const [storeRows] = await pool.query('SELECT id FROM stores WHERE id = ?', [
        id,
    ]);

    if (storeRows.length === 0) {
        return null;
    }

    const {
        name,
        address,
        price_level,
        latitude,
        longitude,
        genre,
        reason,
        operation_hours,
    } = storeData;

    await pool.query(
        'UPDATE stores SET name = ?, address = ?, price_level = ?, latitude = ?, longitude = ?, genre = ?, reason = ? WHERE id = ?',
        [name, address, price_level, latitude, longitude, genre, reason, id]
    );

    if (operation_hours && operation_hours.length > 0) {
        await pool.query(
            'DELETE FROM store_operation_hours WHERE store_id = ?',
            [id]
        );

        const hoursValues = operation_hours.map((hour) => [
            id,
            hour.day_of_week,
            hour.open_time,
            hour.close_time,
        ]);
        await pool.query(
            'INSERT INTO store_operation_hours (store_id, day_of_week, open_time, close_time) VALUES ?',
            [hoursValues]
        );
    }

    return findStoreById(id);
};
