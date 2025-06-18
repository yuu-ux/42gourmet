import {
    findStores,
    findStoreById,
    createStore,
    deleteStore,
    updateStore,
} from '../repositories/store.repository.js';
import { set, format, addDays } from 'date-fns';
import app from '../app.js';

// TODO
// 24時間営業を考慮
const filterOpenStores = async (stores, request) => {
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

    const DayOfWeek = format(request.now, 'EEEE');

    const res = [];
    // 営業時間判定
    for (const store of stores) {
        const hoursToday = store.store_operation_hours?.[DayOfWeek];
        let is_open;

        if (!hoursToday || hoursToday.length === 0) {
            is_open = false;
        } else {
            const now = request.now;
            is_open = hoursToday.some(({ open_time, close_time }) => {
                const _open_time = set(now, {
                    hours: open_time.getHours(),
                    minutes: open_time.getMinutes(),
                    seconds: 0,
                    milliseconds: 0,
                });
                let _close_time = set(now, {
                    hours: close_time.getHours(),
                    minutes: close_time.getMinutes(),
                    seconds: 0,
                    milliseconds: 0,
                });
                // 深夜営業を考慮
                // 例：16:00〜05:00
                if (_open_time >= _close_time) {
                    if (now < _close_time) _open_time = addDays(_open_time, -1);
                    _close_time = addDays(_close_time, 1);
                }
                return now >= _open_time && now <= _close_time;
            });
        }
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
