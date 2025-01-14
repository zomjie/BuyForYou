const express = require('express');
const router = express.Router();
const MerchantController = require('../controllers/merchantController');

router.post('/register', MerchantController.register);
router.post('/login', MerchantController.login);

module.exports = router; 