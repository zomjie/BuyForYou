const express = require('express');
const router = express.Router();
const DiningHallController = require('../controllers/diningHallController');

router.get('/', DiningHallController.getAllDiningHalls);

module.exports = router; 