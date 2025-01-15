const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// 用户注册
router.post('/register', userController.register);

// 用户登录
router.post('/login', userController.login);

// 更新用户信息（支持 POST 和 PUT 方法）
router.post('/:userId', userController.updateUser);
router.put('/:userId', userController.updateUser);

module.exports = router; 