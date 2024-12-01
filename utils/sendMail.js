// sendEmail.js
const nodemailer = require('nodemailer');
const transporter = require('../config/mailConfig');  // Import the Nodemailer configuration
const fs = require('fs');
const path = require('path');

// Function to send the email with multiple PDF attachments
const sendEmail = async (to, subject, text, pdfPaths) => {
  try {
    // Prepare the attachments (PDFs)
    const attachments = pdfPaths.map(pdfPath => ({
      filename: `tour_receipt_${path.basename(pdfPath)}`,
      path: pdfPath,  // Path to the PDF file
      contentType: 'application/pdf',
    }));

    // Prepare the email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: to,  // Recipient's email address
      subject: subject,  // Subject of the email
      text: text,  // Email body text
      attachments: attachments,  // Attach the PDFs
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);

    console.log('Email sent:', info.response);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

module.exports = { sendEmail };
