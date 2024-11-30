const crypto = require('crypto');
const User = require('../models/User');
const Order = require('../models/Order');
const Tour = require('../models/tourModel');
const axios = require('axios');

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

        // Prepare cart items with product details
        const populatedCartItems = await Promise.all(cartItems.map(async (item) => {
            const product = await Tour.findById(item._id);
            if (!product) {
                throw new Error('Product not found');
            }

            return {
                product: product._id,
                quantity: item.quantity,
                price: product.price
            };
        }));

        // Create a new order with product details
        const newOrder = new Order({
            user: user._id,
            cartItems: populatedCartItems,
            totalAmount: totalPrice,
            paymentStatus: 'Pending'  // Initial status before payment
        });

        await newOrder.save();

        // Link the order to the user
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
        const hash = crypto.createHash('sha512').update(hashString).digest('hex');
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
    const receivedParams = req.body;

    if (!receivedParams.hash) {
        return res.status(400).send('Hash parameter is missing');
    }

    const hashString = `${receivedParams.key}|${receivedParams.txnid}|${receivedParams.amount}|${receivedParams.productinfo}|${receivedParams.firstname}|${receivedParams.email}|||||||||||${process.env.PAYU_MERCHANT_SALT}`;
    const generatedHash = crypto.createHash('sha512').update(hashString).digest('hex');

    // if (generatedHash !== receivedParams.hash) {
    //     return res.status(400).send('Hash mismatch');
    // }

    try {
        // Find the order using the txnid
        const order = await Order.findById(receivedParams.txnid).populate('cartItems.product');
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Update payment status to successful
        order.paymentStatus = 'Successful';

        // Update the user with the purchased products and clear the cart
        const user = await User.findById(order.user);
        if (user) {
            // Only update the user's orders and cart if not already done
            if (!user.orders.includes(order._id)) {
                user.orders.push(order);  // Add the order to the user's orders
            }

            // Remove the purchased items from the cart (empty cart)
            order.cartItems.forEach(item => {
                user.cartItems = user.cartItems.filter(cartItem => cartItem.product.toString() !== item.product.toString());
            });

            // Clear the cart after purchase
            user.cartItems = [];
            await user.save();
        }

        
        // Save the updated order
        await order.save();

        // Respond with success
        console.log('Payment successful:', order);
        // res.json({
        //     message: "Payment successful, order has been saved.",
        //     orderDetails: {
        //         productName: order.cartItems.map(item => item.product.name),
        //         totalAmount: order.totalAmount,
        //         user: {
        //             name: user.name,
        //             email: user.email,
        //             phone: user.phone,
        //         }
        //     }
        // });

        if ( order.paymentStatus = 'Successful'  ) {
            const successMessage = `Payment Successful! Order ID:  Total: ₹${order.totalAmount}`;
            return res.redirect(`http://localhost:5173/?status=success&message=${encodeURIComponent(successMessage)}`);
          } else {
            return res.redirect('http://localhost:5173/?status=failed&message=Payment failed. Please try again.');
          }

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

        // Update payment status to failed
        order.paymentStatus = 'Failed';
        await order.save();

        res.json({ message: 'Payment failed. Try again later.' });
    } catch (error) {
        console.error('Payment failure handling failed:', error);
        res.status(500).json({ message: 'Failed to handle payment failure' });
    }
};
