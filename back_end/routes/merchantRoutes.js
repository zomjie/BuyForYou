const express = require('express');
const router = express.Router();
const merchantController = require('../controllers/merchantController');

// 商家登录
router.post('/login', merchantController.login);

// 商家注册
router.post('/register', merchantController.register);

// 获取待审核商家列表
router.get('/pending', merchantController.getPendingMerchants);

// 审核商家
router.post('/audit/:merchantNo', merchantController.auditMerchant);

// 更新商家信息（支持 POST 和 PUT 方法）
router.post('/:merchantNo', merchantController.updateMerchant);
router.put('/:merchantNo', merchantController.updateMerchant);

module.exports = router; 