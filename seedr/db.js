const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'db',
  user: 'root',
  password: 'password',
  database: 'gourmet',
  port: 13306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;

