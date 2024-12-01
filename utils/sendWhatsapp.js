// sendWhatsApp.js
const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();  // Load environment variables

// Twilio API base URL and credentials from .env
const API_BASE_URL = 'https://api.twilio.com/2010-04-01/Accounts';
const ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const WHATSAPP_NUMBER = process.env.TWILIO_WHATSAPP_NUMBER;  // This is the Twilio WhatsApp number

// Function to send WhatsApp message with a PDF attachment
const sendWhatsAppMessage = async (to, pdfPaths) => {
  try {
    // Step 1: Upload each PDF and get the media URLs
    const mediaUrls = [];
    for (let i = 0; i < pdfPaths.length; i++) {
      const mediaUrl = await uploadPDFToTwilio(pdfPaths[i]);
      mediaUrls.push(mediaUrl);
    }

    // Step 2: Prepare the message data
    const messageData = {
      messaging_product: 'whatsapp',
      to: `whatsapp:${to}`,  // Recipient's phone number (format: whatsapp:+1234567890)
      type: 'document',
      document: mediaUrls.map(url => ({
        link: url,  // Media URL for each PDF
        filename: `tour_receipt_${path.basename(pdfPaths[mediaUrls.indexOf(url)])}`, // Name of the file
      })),
      from: WHATSAPP_NUMBER,  // The WhatsApp-enabled Twilio number used as the sender
    };

    // Step 3: Send the WhatsApp message via Twilio's API
    const response = await axios.post(
      `${API_BASE_URL}/${ACCOUNT_SID}/Messages.json`,
      new URLSearchParams(messageData),  // Send data as URL-encoded form
      {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${ACCOUNT_SID}:${AUTH_TOKEN}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    console.log('WhatsApp message sent:', response.data);
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
  }
};

// Function to simulate uploading the PDF (use your own cloud storage or Twilio's media API)
const uploadPDFToTwilio = async (pdfPath) => {
  try {
    // Simulate uploading the PDF to a publicly accessible location (replace with actual logic)
    const mediaUrl = `https://your-server.com/path/to/${path.basename(pdfPath)}`;
    return mediaUrl;
  } catch (error) {
    console.error('Error uploading PDF:', error);
    throw error;
  }
};

module.exports = { sendWhatsAppMessage };
