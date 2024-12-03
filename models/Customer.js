// models/customer.js
const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  request: { type: String, required: true }, // What request they want
});

module.exports = mongoose.model('Customer', customerSchema);
