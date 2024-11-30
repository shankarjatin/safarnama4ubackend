const axios = require('axios');
const fs = require('fs');
const path = require('path');

const sendWhatsAppMessage = async (phoneNumber, pdfPath) => {
  try {
    // First, upload the PDF to WhatsApp Business API Media endpoint
    const mediaUrl = await uploadMediaToWhatsApp(pdfPath);

    // Send the PDF as a message
    const messageData = {
      messaging_product: 'whatsapp',
      to: phoneNumber,
      type: 'document',
      document: {
        link: mediaUrl, // The link to the uploaded media
        filename: 'tour_receipt.pdf',  // Filename you want to send
      },
    };

    const response = await axios.post(
      'https://graph.facebook.com/v15.0/your_phone_number_id/messages',
      messageData,
      {
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_API_TOKEN}`,
        },
      }
    );
    console.log('WhatsApp Message Sent:', response.data);
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
  }
};

// Helper function to upload the media (PDF) to WhatsApp
const uploadMediaToWhatsApp = async (pdfPath) => {
  try {
    const fileData = fs.createReadStream(pdfPath);
    
    const formData = new FormData();
    formData.append('file', fileData);

    const uploadResponse = await axios.post(
      'https://graph.facebook.com/v15.0/your_phone_number_id/media',
      formData,
      {
        headers: {
          'Authorization': `Bearer ${process.env.WHATSAPP_API_TOKEN}`,
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return uploadResponse.data.media_url;
  } catch (error) {
    console.error('Error uploading media:', error);
    throw error;
  }
};
