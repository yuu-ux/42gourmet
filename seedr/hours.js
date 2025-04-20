const pool = require('./db');
const today = new Date().toISOString().slice(0, 10);

const hours = [
  { id: 1, store_id: 1, day_of_week: '月', open_time: '09:00', close_time: '18:00', is_closed: false, created_on: today, modified_on: today },
  { id: 2, store_id: 1, day_of_week: '火', open_time: '09:00', close_time: '18:00', is_closed: false, created_on: today, modified_on: today },
  { id: 3, store_id: 1, day_of_week: '水', open_time: null, close_time: null, is_closed: true, created_on: today, modified_on: today },
  { id: 4, store_id: 1, day_of_week: '木', open_time: '09:00', close_time: '18:00', is_closed: false, created_on: today, modified_on: today },
  { id: 5, store_id: 1, day_of_week: '金', open_time: '09:00', close_time: '18:00', is_closed: false, created_on: today, modified_on: today },
  { id: 6, store_id: 1, day_of_week: '土', open_time: '10:00', close_time: '17:00', is_closed: false, created_on: today, modified_on: today },
  { id: 7, store_id: 1, day_of_week: '日', open_time: null, close_time: null, is_closed: true, created_on: today, modified_on: today },

  { id: 8, store_id: 2, day_of_week: '月', open_time: null, close_time: null, is_closed: true, created_on: today, modified_on: today },
  { id: 9, store_id: 2, day_of_week: '火', open_time: '17:00', close_time: '23:00', is_closed: false, created_on: today, modified_on: today },
  { id: 10, store_id: 2, day_of_week: '水', open_time: '17:00', close_time: '23:00', is_closed: false, created_on: today, modified_on: today },
  { id: 11, store_id: 2, day_of_week: '木', open_time: '17:00', close_time: '23:00', is_closed: false, created_on: today, modified_on: today },
  { id: 12, store_id: 2, day_of_week: '金', open_time: '17:00', close_time: '23:00', is_closed: false, created_on: today, modified_on: today },
  { id: 13, store_id: 2, day_of_week: '土', open_time: '17:00', close_time: '23:00', is_closed: false, created_on: today, modified_on: today },
  { id: 14, store_id: 2, day_of_week: '日', open_time: null, close_time: null, is_closed: true, created_on: today, modified_on: today }
];

async function insertHours() {
  const conn = await pool.getConnection();
  try {
    for (const hour of hours) {
      await conn.query(
        `INSERT INTO store_hours (id, store_id, day_of_week, open_time, close_time, is_closed, created_on, modified_on)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          hour.id,
          hour.store_id,
          hour.day_of_week,
          hour.open_time,
          hour.close_time,
          hour.is_closed,
          hour.created_on,
          hour.modified_on
        ]
      );
    }
    console.log('✅ 営業時間データ挿入完了');
  } finally {
    conn.release();
  }
}

module.exports = insertHours;
