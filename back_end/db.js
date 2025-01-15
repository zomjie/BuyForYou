const mysql = require('mysql2/promise');

// 创建数据库连接池
const pool = mysql.createPool({
    host: '38.55.235.56',
    user: 'root',
    password: 'Zomjie@123456',
    database: 'buyforyou',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// 测试数据库连接
pool.getConnection()
    .then(connection => {
        console.log('数据库连接成功');
        connection.release();
    })
    .catch(err => {
        console.error('数据库连接失败:', err);
    });

module.exports = pool; 