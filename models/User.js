const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    phone: String,
    orders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }]
});

module.exports = mongoose.model('User', userSchema);
