import { connectDB, getConnection } from '../db/mysql.js';

const sampleStores = [
  {
    id: '1',
    name: '六本木焼肉 Kintan',
    address: '東京都港区六本木６丁目１−８ 六本木グリーンビル 2F',
    price_level: 3,
    latitude: 35.6604,
    longitude: 139.7300,
    genre: 'japanese',
    reason: '高品質な焼肉を提供する人気店'
  },
  {
    id: '2',
    name: '俺の創作らぁめん 極 神田神保町店',
    address: '東京都千代田区神田神保町１丁目４−６',
    price_level: 2,
    latitude: 35.6961,
    longitude: 139.7570,
    genre: 'japanese',
    reason: '創作ラーメンが楽しめるお店'
  },
  {
    id: '3',
    name: '麺匠大宮はなび',
    address: '東京都千代田区神田小川町３丁目６−１０',
    price_level: 2,
    latitude: 35.6965,
    longitude: 139.7612,
    genre: 'japanese',
    reason: 'うどん食べ放題が魅力'
  },
  {
    id: '4',
    name: 'らーめん谷瀬家',
    address: '東京都港区新橋３丁目１１−１',
    price_level: 2,
    latitude: 35.6663,
    longitude: 139.7578,
    genre: 'japanese',
    reason: '家系ラーメンの名店'
  },
  {
    id: '5',
    name: 'もうやんカレー 西新宿リビング店',
    address: '東京都新宿区西新宿６丁目５−１',
    price_level: 3,
    latitude: 35.6938,
    longitude: 139.6921,
    genre: 'indian',
    reason: 'スパイスカレーのビュッフェが人気'
  }
];

const sampleOperationHours = [
  // 六本木焼肉 Kintan (id: 1)
  { store_id: '1', day_of_week: 'Monday', open_time: '11:30', close_time: '23:00' },
  { store_id: '1', day_of_week: 'Tuesday', open_time: '11:30', close_time: '23:00' },
  { store_id: '1', day_of_week: 'Wednesday', open_time: '11:30', close_time: '23:00' },
  { store_id: '1', day_of_week: 'Thursday', open_time: '11:30', close_time: '23:00' },
  { store_id: '1', day_of_week: 'Friday', open_time: '11:30', close_time: '23:00' },
  { store_id: '1', day_of_week: 'Saturday', open_time: '11:30', close_time: '23:00' },
  { store_id: '1', day_of_week: 'Sunday', open_time: '11:30', close_time: '23:00' },

  // 俺の創作らぁめん 極 神田神保町店 (id: 2)
  { store_id: '2', day_of_week: 'Monday', open_time: '11:00', close_time: '22:00' },
  { store_id: '2', day_of_week: 'Tuesday', open_time: '11:00', close_time: '22:00' },
  { store_id: '2', day_of_week: 'Wednesday', open_time: '11:00', close_time: '22:00' },
  { store_id: '2', day_of_week: 'Thursday', open_time: '11:00', close_time: '22:00' },
  { store_id: '2', day_of_week: 'Friday', open_time: '11:00', close_time: '22:00' },
  { store_id: '2', day_of_week: 'Saturday', open_time: '11:00', close_time: '22:00' },
  { store_id: '2', day_of_week: 'Sunday', open_time: '11:00', close_time: '22:00' },

  // 麺匠大宮はなび (id: 3)
  { store_id: '3', day_of_week: 'Monday', open_time: '11:00', close_time: '21:00' },
  { store_id: '3', day_of_week: 'Tuesday', open_time: '11:00', close_time: '21:00' },
  { store_id: '3', day_of_week: 'Wednesday', open_time: '11:00', close_time: '21:00' },
  { store_id: '3', day_of_week: 'Thursday', open_time: '11:00', close_time: '21:00' },
  { store_id: '3', day_of_week: 'Friday', open_time: '11:00', close_time: '21:00' },
  { store_id: '3', day_of_week: 'Saturday', open_time: '11:00', close_time: '21:00' },
  { store_id: '3', day_of_week: 'Sunday', open_time: '11:00', close_time: '21:00' },

  // らーめん谷瀬家 (id: 4)
  { store_id: '4', day_of_week: 'Monday', open_time: '11:00', close_time: '23:00' },
  { store_id: '4', day_of_week: 'Tuesday', open_time: '11:00', close_time: '23:00' },
  { store_id: '4', day_of_week: 'Wednesday', open_time: '11:00', close_time: '23:00' },
  { store_id: '4', day_of_week: 'Thursday', open_time: '11:00', close_time: '23:00' },
  { store_id: '4', day_of_week: 'Friday', open_time: '11:00', close_time: '23:00' },
  { store_id: '4', day_of_week: 'Saturday', open_time: '11:00', close_time: '23:00' },
  { store_id: '4', day_of_week: 'Sunday', open_time: '11:00', close_time: '23:00' },

  // もうやんカレー 西新宿リビング店 (id: 5)
  { store_id: '5', day_of_week: 'Monday', open_time: '11:30', close_time: '15:00' },
  { store_id: '5', day_of_week: 'Tuesday', open_time: '11:30', close_time: '15:00' },
  { store_id: '5', day_of_week: 'Wednesday', open_time: '11:30', close_time: '15:00' },
  { store_id: '5', day_of_week: 'Thursday', open_time: '11:30', close_time: '15:00' },
  { store_id: '5', day_of_week: 'Friday', open_time: '11:30', close_time: '15:00' }
];

const seedDatabase = async () => {
  try {
    await connectDB();
    const connection = await getConnection();

    console.log('データベースのシードを開始します...');

    // テーブルをクリア
    await connection.query('TRUNCATE TABLE store_operation_hours');
    await connection.query('DELETE FROM stores');
    console.log('既存のデータを削除しました');

    // レストランデータを挿入
    for (const store of sampleStores) {
      await connection.query(
        `INSERT INTO stores (id, name, address, price_level, latitude, longitude, genre, reason)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [store.id, store.name, store.address, store.price_level, store.latitude, store.longitude, store.genre, store.reason]
      );
    }
    console.log(`${sampleStores.length}件のレストランデータを挿入しました`);

    // 営業時間データを挿入
    for (const hour of sampleOperationHours) {
      await connection.query(
        `INSERT INTO store_operation_hours (store_id, day_of_week, open_time, close_time)
         VALUES (?, ?, ?, ?)`,
        [hour.store_id, hour.day_of_week, hour.open_time, hour.close_time]
      );
    }
    console.log(`${sampleOperationHours.length}件の営業時間データを挿入しました`);

    console.log('データベースのシードが完了しました');
    process.exit(0);
  } catch (error) {
    console.error('シード処理中にエラーが発生しました:', error);
    process.exit(1);
  }
};

seedDatabase();
