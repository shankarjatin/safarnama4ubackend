const crypto = require('crypto');
const User = require('../models/User');
const Order = require('../models/Order');
const Tour = require('../models/tourModel');
// const twilio = require('twilio');
const path = require('path');
const fs = require('fs');
const axios = require('axios');

// Twilio Configuration


// Create a new order and return payment parameters
exports.createOrder = async (req, res) => {
    const { userId, cartItems, totalPrice, name, email, phone } = req.body;

    try {
        // Check if user exists or create a new one
        let user = await User.findOne({ phone: userId });
        if (!user) {
            user = new User({
                name,
                email,
                phone,
                orders: []
            });
            await user.save();
        }

        // Create a new order
        const newOrder = new Order({
            user: user._id,
            cartItems,
            totalAmount: totalPrice
        });

        await newOrder.save();
        user.orders.push(newOrder);
        await user.save();

        // PayU payment parameters
        const paymentParams = {
            key: process.env.PAYU_MERCHANT_KEY,
            txnid: newOrder._id.toString(),
            amount: totalPrice,
            productinfo: 'Tour Package Purchase',
            firstname: name,
            email,
            phone,
            surl: `${process.env.BASE_URL}api/payment-success`, // Success callback
            furl: `${process.env.BASE_URL}api/payment-failure`  // Failure callback
        };

        // Generate hash
        const hashString = `${paymentParams.key}|${paymentParams.txnid}|${paymentParams.amount}|${paymentParams.productinfo}|${paymentParams.firstname}|${paymentParams.email}|||||||||||${process.env.PAYU_MERCHANT_SALT}`;
       console.log(hashString);
        const hash = crypto.createHash('sha512').update(hashString).digest('hex');
        console.log("hash", hash)
        paymentParams.hash = hash;

        // Respond with payment parameters
        res.json({
            paymentParams,
            payuUrl: 'https://test.payu.in/_payment' // Use 'https://secure.payu.in/_payment' for production
        });
    } catch (error) {
        console.error('Order creation failed:', error);
        res.status(500).json({ message: 'Failed to create order' });
    }
};

// Handle PayU payment success callback
exports.paymentSuccess = async (req, res) => {
    // Receive parameters from PayU
    const receivedParams = req.body
    // {
        
    //     // status: req.body.status,
    //     // email: req.body.email,
    //     // productinfo: req.body.productinfo,
    //     // amount: req.body.amount,
    //     // txnid: req.body.txnid,
    //     // key: process.env.PAYU_MERCHANT_KEY, // Your PayU Merchant Key
    //     // salt: process.env.PAYU_MERCHANT_SALT, // Your PayU Merchant Salt
    //     // hash: req.body.hash,
    // };

    console.log('Received Params:', receivedParams);

    // Ensure the 'hash' parameter is present in the response
    if (!receivedParams.hash) {
        return res.status(400).send('Hash parameter is missing');
    }

    // Construct the hash string according to PayU's expected format
    const hashString = `${receivedParams.key}|${receivedParams.txnid}|${receivedParams.amount}|${receivedParams.productinfo}|${receivedParams.firstname}|${receivedParams.email}|||||||||||${process.env.PAYU_MERCHANT_SALT}`;

    console.log('Hash String:', hashString);

    // Generate the hash using SHA-512
    const generatedHash  = crypto.createHash('sha512').update(hashString).digest('hex');
    console.log('Generated Hash:', generatedHash);
    console.log('Received Hash:', receivedParams.hash);

    // Compare the generated hash with the received hash
    // if (generatedHash !== receivedParams.hash) {
    //     console.error('Hash mismatch: Invalid transaction');
    //     return res.status(400).send('Invalid transaction');
    // }

    try {
        // Find the order using the txnid
        const order = await Order.findById(receivedParams.txnid).populate('cartItems.product');
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Update payment status
        order.paymentStatus = 'Successful';
        await order.save();

        // Update the user with purchased product info
        const user = await User.findById(order.user);
        if (user) {
            user.orders.push(order);
            user.cartItems = [];  // Clear cart items after successful purchase
            await user.save();
        }

        // Send back a success message to frontend
        res.json({
            message: "Payment successful, order has been saved.",
            orderDetails: {
                productName: order.cartItems.map(item => item.product.name),
                totalAmount: order.totalAmount,
                user: {
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                }
            }
        });

    } catch (error) {
        console.error('Payment success handling failed:', error);
        res.status(500).json({ message: 'Failed to handle payment success' });
    }
};

// Handle PayU payment failure callback
exports.paymentFailure = async (req, res) => {
    const receivedParams = req.body;

    try {
        const order = await Order.findById(receivedParams.txnid);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Update payment status
        order.paymentStatus = 'Failed';
        await order.save();

        res.json({ message: 'Payment failed. Try again later.' });
    } catch (error) {
        console.error('Payment failure handling failed:', error);
        res.status(500).json({ message: 'Failed to handle payment failure' });
    }
};
