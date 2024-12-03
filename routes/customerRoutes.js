// routes/customerRoutes.js
const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');

// Route to get customer details by ID
router.post('/customer', customerController.createCustomer);

module.exports = router;
