const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// Route to create an order and redirect to payment

// router.post('/orders', orderController.createOrder);
// router.post('/payment-success', orderController.paymentSuccess);
// router.post('/payment-failure', orderController.paymentFailure);
router.post('/create-order', orderController.createOrder);
router.post('/verify-payment', orderController.verifyPayment);
module.exports = router;
