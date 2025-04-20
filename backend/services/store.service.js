import { findAllStores, findStoreById, createStore, deleteStore, updateStore } from '../repositories/store.repository.js';

export const getStores = async (queryParams = {}) => {
  const filters = {
    genre: queryParams.genre,
    price_level: queryParams.price_level,
    latitude: queryParams.latitude,
    longitude: queryParams.longitude
  };

  return await findAllStores(filters);
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
    operation_hours: formatOperationHours(storeData.operation_hours)
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
    operation_hours: formatOperationHours(storeData.operation_hours)
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

  return hours.map(hour => ({
    day_of_week: hour.day_of_week,
    open_time: hour.open_time,
    close_time: hour.close_time
  }));
};
