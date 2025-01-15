const express = require('express');
const router = express.Router();
const blacklistController = require('../controllers/blacklistController');

// 添加用户到黑名单
router.post('/add', blacklistController.addToBlacklist);

// 获取所有有效的黑名单记录
router.get('/active', blacklistController.getActiveBlacklist);

// 解除黑名单
router.post('/:blacklistId/remove', blacklistController.removeFromBlacklist);

module.exports = router; 