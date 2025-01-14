const express = require('express');
const router = express.Router();
const merchantController = require('../controllers/merchantController');

// 商家登录
router.post('/login', merchantController.login);

// 商家注册
router.post('/register', merchantController.register);

module.exports = router; 