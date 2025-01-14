const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// 用户登录
router.post('/login', userController.login);

// 用户注册
router.post('/register', userController.register);

// 管理员注册
router.post('/register-admin', userController.registerAdmin);

module.exports = router; 