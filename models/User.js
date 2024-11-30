const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    orders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],
    cartItems: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Tour' },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true }
    }]
});

module.exports = mongoose.model('User', userSchema);
