const express = require('express');
const router = express.Router();
const DishController = require('../controllers/dishController');

router.get('/grouped-by-dininghall', DishController.getDishesGroupByDiningHall);

module.exports = router; 