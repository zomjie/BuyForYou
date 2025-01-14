const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// 获取订单列表
router.get('/', orderController.getOrders);

// 创建单个订单
router.post('/', orderController.createOrder);

// 批量创建订单
router.post('/batch', orderController.createBatchOrder);

module.exports = router; 