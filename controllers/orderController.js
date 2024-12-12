const crypto = require('crypto');
const User = require('../models/User');
const Order = require('../models/Order');
const Tour = require('../models/tourModel');
const axios = require('axios');

const razorpay = require('../config/razorpayConfig');
const { sendWhatsAppMessage } = require('../utils/sendWhatsapp');
const { sendEmail } = require('../utils/sendMail');

// // Create a new order and return payment parameters
// exports.createOrder = async (req, res) => {
//     const { userId, cartItems, totalPrice, name, email, phone } = req.body;

//     try {
//         // Check if user exists or create a new one
//         let user = await User.findOne({ email: email });
//         if (!user) {
//             user = new User({
//                 name,
//                 email,
//                 phone,
//                 orders: []
//             });
//             await user.save();
//         }

//         // Prepare cart items with product details
//         const populatedCartItems = await Promise.all(cartItems.map(async (item) => {
//             const product = await Tour.findById(item._id);
//             if (!product) {
//                 throw new Error('Product not found');
//             }

//             return {
//                 product: product._id,
//                 quantity: item.quantity,
//                 price: product.price
//             };
//         }));

//         // Create a new order with product details
//         const newOrder = new Order({
//             user: user._id,
//             cartItems: populatedCartItems,
//             totalAmount: totalPrice,
//             paymentStatus: 'Pending'  // Initial status before payment
//         });

//         await newOrder.save();

//         // Link the order to the user
//         user.orders.push(newOrder);
//         await user.save();

//         // PayU payment parameters
//         const paymentParams = {
//             key: process.env.PAYU_MERCHANT_KEY,
//             txnid: newOrder._id.toString(),
//             amount: totalPrice,
//             productinfo: 'Tour Package Purchase',
//             firstname: name,
//             email,
//             phone,
//             surl: `${process.env.BASE_URL}api/payment-success`, // Success callback
//             furl: `${process.env.BASE_URL}api/payment-failure`  // Failure callback
//         };

//         // Generate hash
//         const hashString = `${paymentParams.key}|${paymentParams.txnid}|${paymentParams.amount}|${paymentParams.productinfo}|${paymentParams.firstname}|${paymentParams.email}|||||||||||${process.env.PAYU_MERCHANT_SALT}`;
//         const hash = crypto.createHash('sha512').update(hashString).digest('hex');
//         paymentParams.hash = hash;

//         // Respond with payment parameters
//         res.json({
//             paymentParams,
//             payuUrl: 'https://secure.payu.in/_payment' // Use 'https://test.payu.in/_payment' for production
            
//         });
//     } catch (error) {
//         console.error('Order creation failed:', error);
//         res.status(500).json({ message: 'Failed to create order' });
//     }
// };

// // Handle PayU payment success callback


// exports.paymentSuccess = async (req, res) => {
//   const receivedParams = req.body;
//   console.log(receivedParams);

//   if (!receivedParams.hash) {
//     return res.status(400).send('Hash parameter is missing');
//   }

//   const hashString = `${receivedParams.key}|${receivedParams.txnid}|${receivedParams.amount}|${receivedParams.productinfo}|${receivedParams.firstname}|${receivedParams.email}|||||||||||${process.env.PAYU_MERCHANT_SALT}`;
//   const generatedHash = crypto.createHash('sha512').update(hashString).digest('hex');

//   try {
//     const order = await Order.findById(receivedParams.txnid).populate('cartItems.product');
//     if (!order) {
//       return res.status(404).json({ message: 'Order not found' });
//     }

//     order.paymentStatus = 'Successful';
//     await order.save();

//     const user = await User.findById(order.user);

//     if (user) {
//       if (!user.orders.includes(order._id)) {
//         user.orders.push(order);
//       }

//       order.cartItems.forEach(item => {
//         user.cartItems = user.cartItems.filter(cartItem => cartItem.product.toString() !== item.product.toString());
//       });

//       user.cartItems = [];
//       await user.save();
//     }

//     const tourPromises = order.cartItems.map(async (item) => {
//       const tour = await Tour.findById(item.product);
//       if (tour && tour.pdfPath) {
//         return tour.pdfPath;  // Collect all PDFs for the products in the order
//       }
//       throw new Error('Tour PDF not found');
//     });

//     const pdfPaths = await Promise.all(tourPromises);

//     const successMessage = `Your itinerary pdf! Order ID: ${order._id} Total: ₹${order.totalAmount}`;

//     // Send all PDFs via WhatsApp (as attachments in one message)
//     // await sendWhatsAppMessage(user.phone, pdfPaths);

//     // Send email with PDF attachments
//     const emailSubject = `Your Order Receipt: ${order._id}`;
//     const emailText = `
//     <html>
//       <head>
//         <style>
//           body {
//             font-family: Arial, sans-serif;
//             color: #333;
//             line-height: 1.6;
//             background-color: #f4f4f4;
//             padding: 20px;
//           }
//           .email-container {
//             background-color: #ffffff;
//             border-radius: 8px;
//             padding: 20px;
//             box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
//             max-width: 600px;
//             margin: 0 auto;
//           }
//           h1 {
//             font-size: 24px;
//             color: #333;
//           }
//           p {
//             font-size: 16px;
//             color: #555;
//           }
//           .order-info {
//             background-color: #f9f9f9;
//             padding: 10px;
//             border-radius: 4px;
//             margin-top: 20px;
//           }
//           .order-info strong {
//             color: #333;
//           }
//           .footer {
//             font-size: 14px;
//             color: #888;
//             text-align: center;
//             margin-top: 20px;
//           }
//         </style>
//       </head>
//       <body>
//         <div class="email-container">
//           <h1>Payment Successful</h1>
//           <p>Hello ${user.name},</p>
//           <p>Your payment was successful. Please find the details of your order below:</p>
          
//           <div class="order-info">
//             <p><strong>Total:</strong> ₹${order.totalAmount}</p>
//             <p><strong>Order ID:</strong> ${order._id}</p>
//           </div>
          
//           <p>Thank you for your purchase!</p>
          
//           <div class="footer">
//             <p>If you have any questions, feel free to contact our support team.</p>
//           </div>
//         </div>
//       </body>
//     </html>
//   `;
//    console.log(user.email);
//     await sendEmail(user.email, emailSubject, emailText, pdfPaths);

//     const successRedirectUrl = `${process.env.FRONTEND_URL}?status=success&message=${encodeURIComponent(successMessage)}`;
//     return res.redirect(successRedirectUrl);

//   } catch (error) {
//     console.error('Payment success handling failed:', error);
//     res.status(500).json({ message: 'Failed to handle payment success' });
//   }
// };

// // Handle PayU payment failure callback
// exports.paymentFailure = async (req, res) => {
//     const receivedParams = req.body;

//     try {
//         const order = await Order.findById(receivedParams.txnid);
//         if (!order) {
//             return res.status(404).json({ message: 'Order not found' });
//         }

//         // Update payment status to failed
//         order.paymentStatus = 'Failed';
//         await order.save();

//         // res.json({ message: 'Payment failed. Try again later.' });
//         const failerMessage = `Your itinerary pdf! Order ID: ${order._id} Total: ₹${order.totalAmount}`;
//         const successRedirectUrl = `${process.env.FRONTEND_URL}?status=failed&message=${encodeURIComponent(failerMessage)}`;
//         return res.redirect(successRedirectUrl);
//     } catch (error) {
//         console.error('Payment failure handling failed:', error);
//         res.status(500).json({ message: 'Failed to handle payment failure' });
//     }
// };
exports.createOrder = async (req, res) => {
  try {
    // const instance = new razorpay({
    //   key_id: process.env.RAZORPAY_KEY_ID,
    //   key_secret: process.env.RAZORPAY_KEY_SECRET
    // });

    const options = {
      amount: req.body.amount, // amount in paise
      currency: req.body.currency,
      receipt: req.body.receipt,
      notes: req.body.notes
    };
// console.log(razorpay);
    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log(error);
  }
};



// Replace with your email utility

exports.verifyPayment = async (req, res) => {
  const { orderId, paymentId, notes } = req.body;
  const { name, email, phone, cartItems } = notes;

  try {
    // Fetch payment details from Razorpay
    const paymentResponse = await axios.get(`https://api.razorpay.com/v1/payments/${paymentId}`, {
      auth: {
        username: process.env.RAZORPAY_KEY_ID,
        password: process.env.RAZORPAY_KEY_SECRET,
      },
    });

    const paymentDetails = paymentResponse.data;

    // Check payment status
    if (paymentDetails.status !== 'captured') {
      return res.status(400).json({
        message: 'Payment verification failed',
        paymentStatus: paymentDetails.status,
      });
    }

    // Check if user exists or create a new one
    let user = await User.findOne({ email: email });
    if (!user) {
      user = new User({
        name,
        email,
        phone,
        orders: [],
      });
      await user.save();
    }

    // Prepare cart items with product details
    const populatedCartItems = await Promise.all(
      cartItems.map(async (item) => {
        const product = await Tour.findById(item._id);
        if (!product) {
          throw new Error('Product not found');
        }

        return {
          product: product._id,
          quantity: item.quantity,
          price: product.price,
        };
      })
    );

    // Calculate total amount
    const totalAmount = populatedCartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    // Create a new order
    const newOrder = new Order({
      user: user._id,
      cartItems: populatedCartItems,
      totalAmount: totalAmount,
      paymentStatus: 'Successful',
      paymentId: paymentId, // Store Razorpay payment ID
    });

    await newOrder.save();

    // Link the order to the user
    user.orders.push(newOrder._id);

    // Clear user's cart
    user.cartItems = [];
    await user.save();

    // Fetch PDF paths for tours in the order
    const tourPromises = populatedCartItems.map(async (item) => {
      const tour = await Tour.findById(item.product);
      if (tour && tour.pdfPath) {
        return tour.pdfPath;
      }
      throw new Error('Tour PDF not found');
    });

    const pdfPaths = await Promise.all(tourPromises);

    // Prepare email
    const emailSubject = `Your Order Receipt: ${newOrder._id}`;
    const emailText = `
    <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            color: #333;
            line-height: 1.6;
            background-color: #f4f4f4;
            padding: 20px;
          }
          .email-container {
            background-color: #ffffff;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            max-width: 600px;
            margin: 0 auto;
          }
          h1 {
            font-size: 24px;
            color: #333;
          }
          p {
            font-size: 16px;
            color: #555;
          }
          .order-info {
            background-color: #f9f9f9;
            padding: 10px;
            border-radius: 4px;
            margin-top: 20px;
          }
          .order-info strong {
            color: #333;
          }
          .footer {
            font-size: 14px;
            color: #888;
            text-align: center;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <h1>Payment Successful</h1>
          <p>Hello ${user.name},</p>
          <p>Your payment was successful. Please find the details of your order below:</p>
          
          <div class="order-info">
            <p><strong>Total:</strong> ₹${totalAmount}</p>
            <p><strong>Order ID:</strong> ${newOrder._id}</p>
            <p><strong>Payment ID:</strong> ${paymentId}</p>
          </div>
          
          <p>Thank you for your purchase!</p>
          
          <div class="footer">
            <p>If you have any questions, feel free to contact our support team.</p>
          </div>
        </div>
      </body>
    </html>
  `;

    // Send email with PDF attachments
    await sendEmail(user.email, emailSubject, emailText, pdfPaths);

    // Prepare success redirect
    const successMessage = `PDF of itinerary sent to your email`;
    const successRedirectUrl = `${process.env.FRONTEND_URL}?status=success&message=${encodeURIComponent(
      successMessage
    )}`;

    res.json({
      message: 'Payment successful',
      redirectUrl: successRedirectUrl,
    });
  } catch (error) {
    console.error('Payment success handling failed:', error);

    // Prepare error redirect
    const errorMessage = 'Payment processing failed. Please contact support.';
    const errorRedirectUrl = `${process.env.FRONTEND_URL}?status=failed&message=${encodeURIComponent(
      errorMessage
    )}`;

    res.status(500).json({
      message: 'Failed to handle payment success',
      redirectUrl: errorRedirectUrl,
    });
  }
};


// Failure handler (similar to previous implementation)
exports.paymentFailure = async (req, res) => {
  try {
    const errorMessage = 'Payment failed. Please try again.';
    const failureRedirectUrl = `${process.env.FRONTEND_URL}?status=failed&message=${encodeURIComponent(errorMessage)}`;
    
    res.redirect(failureRedirectUrl);
  } catch (error) {
    console.error('Payment failure handling failed:', error);
    res.status(500).json({ message: 'Failed to handle payment failure' });
  }
};