const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// 获取订单列表
router.get('/', orderController.getOrders);

// 获取用户订单列表
router.get('/user/:userId', orderController.getUserOrders);

// 获取用户配送的订单列表
router.get('/delivery/:delivererId', orderController.getDeliveryOrders);

// 获取未完成订单列表
router.get('/pending', orderController.getPendingOrders);

// 创建单个订单
router.post('/', orderController.createOrder);

// 批量创建订单
router.post('/batch', orderController.createBatchOrder);

// 支付订单
router.post('/pay', orderController.payOrder);

// 更新配送者
router.post('/update-deliverer', orderController.updateDeliverer);

// 更新订单配送状态为已送达
router.post('/complete-delivery', orderController.updateDeliveryStatus);

// 添加投诉
router.post('/complaint', orderController.addComplaint);

// 获取用户投诉记录
router.get('/complaints/:userId', orderController.getUserComplaints);

module.exports = router; 