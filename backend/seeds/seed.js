// import { connectDB, getConnection } from '../db/mysql.js';
import { readFile } from 'node:fs/promises';
import { parse } from 'csv-parse/sync';
import { set } from 'date-fns';

const HOURS_IN_HALF_DAY = 12;

const getStores = async (csvFileName) => {
    try {
        const fileContent = await readFile(csvFileName, 'utf8');
        const records = parse(fileContent, {
            columns: true,
            skip_empty_lines: true
        });

        // archive 以外のカラムを取り出す
        // ↓分割代入
        // https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Operators/Destructuring
        // map((records, index))
        const cleanedStores = records.map(({ archive, ...rest}) => rest);
        // インデックスをふる
        // () でくくることでオブジェクトがそのまま帰る
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions
        const stores = cleanedStores.map((record, index) => ({
            id: index + 1,
            genre: 'japan',
            ...record
        }));

        return stores;
    } catch (err) {
        console.error(err);
    }
}

const normalizeTime = (time) => {
    if (!time) return ;
    let [hour, minutesAndMeridian] = time.split(':');
    if (!minutesAndMeridian) return ;
    hour = Number(hour);
    let [minutes, meridian] = minutesAndMeridian.split(/\s+/);
    if (!meridian) meridian = 'PM';
    if (meridian == 'PM') hour += HOURS_IN_HALF_DAY;
    const base = new Date();
    const res = set(base, { hours: hour, minutes: minutes, seconds: 0, milliseconds: 0 });
    return res.toLocaleTimeString('en-GB');
}

const parseHours = (line) => {
    const [dayOfWeek, times] = line.split(': ');
    const timeRanges = times.split(',').map(t => t.trim());

    const result = [];

    for (const range of timeRanges) {
        const [open, close] = range.split('–');

        result.push({
            day_of_week: dayOfWeek,
            open_time: normalizeTime(open),
            close_time: normalizeTime(close),
        })
    }
    return result;
}

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
                    storeOperationHours.push(
                        {
                            id: id++,
                            store_id: store.id,
                            ...timeRange,
                        }
                    )
                }
            }
        }
        return storeOperationHours;
    } catch (err) {
        console.error(err);
    }
}
const stores = await getStores('stores.csv');
const storeOperationHours = await getStoreOperationHours('store_hours.json', stores);

    // const seedDatabase = async () => {
        //     try {
            //         await connectDB();
            //         const connection = await getConnection();
            //
                //         console.log('データベースのシードを開始します...');
            //
                //         // テーブルをクリア
            //         await connection.query('TRUNCATE TABLE store_operation_hours');
            //         await connection.query('DELETE FROM stores');
            //         console.log('既存のデータを削除しました');
            //
                //         // レストランデータを挿入
            //         for (const store of sampleStores) {
                //             await connection.query(
                    //                 `INSERT INTO stores (id, name, address, price_level, latitude, longitude, genre, reason)
                    //          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                    //                 [
                        //                     store.id,
                        //                     store.name,
                        //                     store.address,
                        //                     store.price_level,
                        //                     store.latitude,
                        //                     store.longitude,
                        //                     store.genre,
                        //                     store.reason,
                        //                 ]
                    //             );
                //         }
            //         console.log(`${sampleStores.length}件のレストランデータを挿入しました`);
            //
                //         // 営業時間データを挿入
            //         for (const hour of sampleOperationHours) {
                //             await connection.query(
                    //                 `INSERT INTO store_operation_hours (store_id, day_of_week, open_time, close_time)
                    //          VALUES (?, ?, ?, ?)`,
                    //                 [
                        //                     hour.store_id,
                        //                     hour.day_of_week,
                        //                     hour.open_time,
                        //                     hour.close_time,
                        //                 ]
                    //             );
                //         }
            //         console.log(
                //             `${sampleOperationHours.length}件の営業時間データを挿入しました`
                //         );
            //
                //         console.log('データベースのシードが完了しました');
            //         process.exit(0);
            //     } catch (error) {
                //         console.error('シード処理中にエラーが発生しました:', error);
                //         process.exit(1);
                //     }
        // };
//
    // seedDatabase();
