const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// Route to create an order and redirect to payment

router.post('/orders', orderController.createOrder);
router.post('/payment-success', orderController.paymentSuccess);
router.post('/payment-failure', orderController.paymentFailure);
module.exports = router;
