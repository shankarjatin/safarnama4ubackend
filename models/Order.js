// models/Order.js
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    cartItems: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        quantity: Number,
        price: Number
    }],
    totalAmount: Number,
    paymentStatus: { type: String, default: 'Pending' }, // New field to track payment status
    pdfSent: { type: Boolean, default: false }
});

module.exports = mongoose.model('Order', orderSchema);
