const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// 用户登录
router.post('/login', userController.login);

// 用户注册
router.post('/register', userController.register);

module.exports = router; 