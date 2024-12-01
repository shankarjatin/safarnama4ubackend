// mailConfig.js
const nodemailer = require('nodemailer');
require('dotenv').config(); // Load environment variables from .env

// Create a transporter using SMTP transport
const transporter = nodemailer.createTransport({
  service: 'gmail',  // You can use Gmail or any other email service
  auth: {
    user: process.env.EMAIL_USER,  // Your email address (e.g., your Gmail address)
    pass: process.env.EMAIL_PASS,  // Your email password or an app-specific password (for Gmail)
  },
});

// Export the transporter to use in other files
module.exports = transporter;
