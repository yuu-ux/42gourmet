import {
    findStores,
    findStoreById,
    createStore,
    deleteStore,
    updateStore,
} from '../repositories/store.repository.js';
import { set, format, addDays, subDays, isBefore } from 'date-fns';
import app from '../app.js';

const convertStoreOperationHours = (stores) => {
    // 営業時間を整形する
    // 曜日: [
    //     {
    //         open_time: ,
    //         close_time: ,
    //     },
    //     {
    //         open_time: ,
    //         close_time,
    //     }
    // ]
    for (const store of stores) {
        const grouped = {};
        for (const storeHours of store.store_operation_hours) {
            const key = storeHours.day_of_week;
            if (!grouped[key]) grouped[key] = [];

            grouped[key].push({
                open_time: storeHours.open_time,
                close_time: storeHours.close_time,
            });
        }
        store.store_operation_hours = grouped;
    }
}

const isNowInOpenRange = (now, open_time, close_time, openShiftDays = 0, closeShiftDays = 0) => {
    let _open = set(addDays(now, openShiftDays), {
        hours: open_time.getHours(),
        minutes: open_time.getMinutes(),
        seconds: 0,
        milliseconds: 0,
    });

    let _close = set(addDays(now, closeShiftDays), {
        hours: close_time.getHours(),
        minutes: close_time.getMinutes(),
        seconds: 0,
        milliseconds: 0,
    });

    // 24 時間営業の判定
    if (_close.getTime() === _open.getTime()) return true;

    // 深夜営業を考慮
    if (isBefore(_close, _open)) _close = addDays(_close, 1);

    return now >= _open && now <= _close;
};

export const filterOpenStores = async (stores, request) => {
    convertStoreOperationHours(stores);

    const now = request.now;
    const DayOfWeekToday = format(now, 'EEEE');
    const DayOfWeekYesterDay = format(subDays(now, 1), 'EEEE');
    const res = [];

    // 営業時間判定
    for (const store of stores) {
        const hoursYesterday = store.store_operation_hours?.[DayOfWeekYesterDay] || [];
        const hoursToday = store.store_operation_hours?.[DayOfWeekToday] || [];
        let is_open = false;

        // a ||= b は a がfalseの場合のみbを評価し代入する
        // 今日の営業時間内であればtrueになる
        // 違う場合前日の深夜営業をチェックする
        is_open ||= hoursToday.some(({ open_time, close_time }) =>
            isNowInOpenRange(now, open_time, close_time)
        );

        is_open ||= hoursYesterday.some(({ open_time, close_time }) =>
            isNowInOpenRange(now, open_time, close_time, -1, 0)
        );

        const { store_operation_hours, ...rest } = store;
        if (is_open) res.push(rest);
    }
    return res;
};

export const searchStores = async (request, queryParams = {}) => {
    const filters = {
        genre: queryParams.genre,
        price_level: queryParams.price_level,
        reason: queryParams.reason,
        is_open: queryParams.is_open,
    };
    let stores = await findStores(filters);

    if (filters?.is_open) {
        stores = await filterOpenStores(stores, request);
    }

    return stores.map(({ store_operation_hours, ...rest }) => rest);
};

export const getStoreById = async (id) => {
    if (!id) {
        throw new Error('IDは必須です');
    }

    const store = await findStoreById(id);

    if (!store) {
        const error = new Error('レストランが見つかりません');
        error.statusCode = 404;
        throw error;
    }

    return store;
};

export const addStore = async (storeData) => {
    validateStoreData(storeData);

    return await createStore({
        name: storeData.name,
        address: storeData.address || null,
        price_level: storeData.price_level || null,
        latitude: storeData.latitude || null,
        longitude: storeData.longitude || null,
        genre: storeData.genre || null,
        reason: storeData.reason || null,
        operation_hours: formatOperationHours(storeData.operation_hours),
    });
};

export const removeStore = async (id) => {
    if (!id) {
        throw new Error('IDは必須です');
    }

    const result = await deleteStore(id);

    if (!result) {
        const error = new Error('レストランが見つかりません');
        error.statusCode = 404;
        throw error;
    }

    return result;
};

export const updateStoreById = async (id, storeData) => {
    if (!id) {
        throw new Error('IDは必須です');
    }

    validateStoreData(storeData);

    const result = await updateStore(id, {
        name: storeData.name,
        address: storeData.address || null,
        price_level: storeData.price_level || null,
        latitude: storeData.latitude || null,
        longitude: storeData.longitude || null,
        genre: storeData.genre || null,
        reason: storeData.reason || null,
        operation_hours: formatOperationHours(storeData.operation_hours),
    });

    if (!result) {
        const error = new Error('レストランが見つかりません');
        error.statusCode = 404;
        throw error;
    }

    return result;
};

const validateStoreData = (data) => {
    if (!data.name) {
        const error = new Error('店舗名は必須です');
        error.statusCode = 400;
        throw error;
    }

    if (data.price_level && ![1, 2, 3, 4].includes(data.price_level)) {
        const error = new Error('価格帯は1から4の間で指定してください');
        error.statusCode = 400;
        throw error;
    }
};

const formatOperationHours = (hours) => {
    if (!hours || !Array.isArray(hours)) return [];

    return hours.map((hour) => ({
        day_of_week: hour.day_of_week,
        open_time: hour.open_time,
        close_time: hour.close_time,
    }));
};
