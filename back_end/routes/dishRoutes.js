const express = require('express');
const router = express.Router();
const dishController = require('../controllers/dishController');

// 获取按食堂分组的菜品
router.get('/grouped-by-dininghall', dishController.getDishesByDiningHall);

// 获取特定商家的菜品
router.get('/merchant/:merchantNo', dishController.getDishesByMerchant);

module.exports = router; 