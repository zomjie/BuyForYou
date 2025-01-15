require('dotenv').config();

const mysql = require('mysql2');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  multipleStatements: true,
  charset: 'utf8mb4'
});

// 测试连接
const promisePool = pool.promise();
promisePool.execute('SELECT 1')
  .then(() => console.log('Database connection successful'))
  .catch(err => {
    console.error('Database connection failed:', err);
    process.exit(1);  // 如果数据库连接失败，终止程序
  });

module.exports = promisePool; 