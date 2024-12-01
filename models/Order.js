// models/Order.js

const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    cartItems: [
        {
            product: { type: mongoose.Schema.Types.ObjectId, ref: 'Tour', required: true },
            quantity: { type: Number, required: true },
            price: { type: Number, required: true }
        }
    ],
    totalAmount: { type: Number, required: true },
    paymentStatus: { type: String, enum: ['Pending', 'Successful', 'Failed'], default: 'Pending' },
    purchasedOn: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);
