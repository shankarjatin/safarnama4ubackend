const mongoose = require('mongoose');

const tourSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  category: { type: String },
  details: { type: String },
  duration: { type: Number },
  days: { type: String },
  price: { type: Number },
  image: { type: String },
  usp: { type: String },
  whyToChoose: { type: String },
  content: { type: String },
  additionalImages: [String],
  pdfPath: { type: String }, // Path to the uploaded PDF file
  available: { type: Boolean, required: true, default: true } // New field for availability, default is true
});

module.exports = mongoose.model('Tour', tourSchema);
