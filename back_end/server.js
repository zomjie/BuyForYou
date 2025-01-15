const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const merchantRoutes = require('./routes/merchantRoutes');
const dishRoutes = require('./routes/dishRoutes');
const orderRoutes = require('./routes/orderRoutes');
const blacklistRoutes = require('./routes/blacklistRoutes');
const db = require('./config/database');

const app = express();

// CORS 配置
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 中间件
app.use(express.json());

// 路由
app.use('/api/user', userRoutes);
app.use('/api/merchant', merchantRoutes);
app.use('/api/dishes', dishRoutes);
app.use('/api/order', orderRoutes);
app.use('/api/blacklist', blacklistRoutes);

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: err.message || '服务器内部错误'
  });
});

// 添加未捕获异常处理
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (error) => {
    console.error('Unhandled Rejection:', error);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 