import { getConnection, initDatabase } from '../db/mysql.js';
import { readFile } from 'node:fs/promises';
import { parse } from 'csv-parse/sync';
import { set } from 'date-fns';

const HOURS_IN_HALF_DAY = 12;

const getStores = async (csvFileName) => {
    try {
        const fileContent = await readFile(csvFileName, 'utf8');
        const records = parse(fileContent, {
            columns: true,
            skip_empty_lines: true,
        });

        // archive 以外のカラムを取り出す
        // ↓分割代入
        // https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Operators/Destructuring
        // map((records, index))
        const cleanedStores = records.map(({ archive, ...rest }) => rest);
        // インデックスをふる
        // () でくくることでオブジェクトがそのまま帰る
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions
        const stores = cleanedStores.map((record, index) => ({
            id: index + 1,
            name: record.name,
            address: record.address,
            price_level: record.price_level,
            latitude: parseFloat(record.latitude),
            longitude: parseFloat(record.longitude),
            genre: 'japan',
            reason: JSON.stringify({}),
        }));

        return stores;
    } catch (err) {
        console.error(err);
    }
};

// TODO
// Closed
// 24 時間営業みたいなやつ対応
const normalizeTime = (time) => {
    if (!time) return;
    let [hour, minutesAndMeridian] = time.split(':');
    if (!minutesAndMeridian) return;
    hour = Number(hour);
    let [minutes, meridian] = minutesAndMeridian.split(/\s+/);
    if (!meridian) meridian = 'PM';
    if (meridian == 'PM') hour += HOURS_IN_HALF_DAY;
    const base = new Date();
    const res = set(base, {
        hours: hour,
        minutes: minutes,
        seconds: 0,
        milliseconds: 0,
    });
    return res.toLocaleTimeString('en-GB');
};

const parseHours = (line) => {
    const [dayOfWeek, times] = line.split(': ');
    const timeRanges = times.split(',').map((t) => t.trim());

    const result = [];

    for (const range of timeRanges) {
        const [open, close] = range.split('–');
        if (!close) continue;

        result.push({
            day_of_week: dayOfWeek,
            open_time: normalizeTime(open),
            close_time: normalizeTime(close),
        });
    }
    return result;
};

const getStoreOperationHours = async (fileName, stores) => {
    try {
        const storeHoursData = await readFile(fileName, 'utf8');
        const storeHoursJson = JSON.parse(storeHoursData);

        const storeOperationHours = [];
        let id = 1;

        for (const store of stores) {
            const weeklyHours = storeHoursJson[store.name];
            if (!weeklyHours) continue;
            for (const hour of weeklyHours) {
                const dailyTimeRanges = parseHours(hour);
                for (const timeRange of dailyTimeRanges) {
                    storeOperationHours.push({
                        id: id++,
                        store_id: store.id,
                        ...timeRange,
                    });
                }
            }
        }
        return storeOperationHours;
    } catch (err) {
        console.error(err);
    }
};

const seedDatabase = async (stores, storeOperationHours) => {
    try {
        const pool = await getConnection();
        await initDatabase();
        await pool.query('TRUNCATE TABLE store_operation_hours');
        await pool.query('DELETE FROM stores');
        for (const store of stores) {
            await pool.query(
                `INSERT INTO stores (id, name, address, price_level, latitude, longitude, genre, reason)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    store.id,
                    store.name,
                    store.address,
                    store.price_level,
                    store.latitude,
                    store.longitude,
                    store.genre,
                    store.reason,
                ]
            );
        }

        for (const storeOperationHour of storeOperationHours) {
            await pool.query(
                `INSERT INTO store_operation_hours (id, store_id, day_of_week, open_time, close_time)
                 VALUES (?, ?, ?, ?, ?)`,
                [
                    storeOperationHour.id,
                    storeOperationHour.store_id,
                    storeOperationHour.day_of_week,
                    storeOperationHour.open_time,
                    storeOperationHour.close_time,
                ]
            );
        }
        console.log('マイグレーションに成功しました');
        await pool.end();
        return;
    } catch (err) {
        console.log(err);
    }
};

const stores = await getStores('stores.csv');
const storeOperationHours = await getStoreOperationHours(
    'store_hours.json',
    stores
);
seedDatabase(stores, storeOperationHours);
