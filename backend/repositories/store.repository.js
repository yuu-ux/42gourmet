import { getConnection } from '../db/mysql.js';

export const findAllStores = async (filters = {}) => {
  const pool = await getConnection();

  let query = `
    SELECT
      s.*,
      GROUP_CONCAT(
        JSON_OBJECT(
          'day_of_week', oh.day_of_week,
          'open_time', oh.open_time,
          'close_time', oh.close_time
        )
      ) as operation_hours
    FROM stores s
    LEFT JOIN store_operation_hours oh ON s.id = oh.store_id
  `;

  const conditions = [];
  const params = [];

  if (filters.genre) {
    conditions.push('s.genre = ?');
    params.push(filters.genre);
  }

  if (filters.price_level) {
    conditions.push('s.price_level = ?');
    params.push(filters.price_level);
  }

  if (filters.latitude && filters.longitude) {
    conditions.push('(6371 * acos(cos(radians(?)) * cos(radians(s.latitude)) * cos(radians(s.longitude) - radians(?)) + sin(radians(?)) * sin(radians(s.latitude)))) <= 1');
    params.push(filters.latitude, filters.longitude, filters.latitude);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  query += ' GROUP BY s.id';

  const [rows] = await pool.query(query, params);

  return rows.map(row => ({
    ...row,
    operation_hours: row.operation_hours ? JSON.parse(`[${row.operation_hours}]`) : []
  }));
};

export const findStoreById = async (id) => {
  const pool = await getConnection();

  const [storeRows] = await pool.query(
    'SELECT * FROM stores WHERE id = ?',
    [id]
  );

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

  const { name, address, price_level, latitude, longitude, genre, reason, operation_hours } = storeData;

  const [result] = await pool.query(
    'INSERT INTO stores (name, address, price_level, latitude, longitude, genre, reason) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [name, address, price_level, latitude, longitude, genre, reason]
  );

  const insertedId = result.insertId;

  if (operation_hours && operation_hours.length > 0) {
    const hoursValues = operation_hours.map(hour => [insertedId, hour.day_of_week, hour.open_time, hour.close_time]);
    await pool.query(
      'INSERT INTO store_operation_hours (store_id, day_of_week, open_time, close_time) VALUES ?',
      [hoursValues]
    );
  }

  return findStoreById(insertedId);
};
