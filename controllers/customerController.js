const Customer = require('../models/Customer');
const transporter = require('../config/mailConfig'); // Assuming the transporter is already set up

// Function to send email with customer details
const sendCustomerEmail = async (customerDetails) => {
  const mailOptions = {
    from: process.env.EMAIL_USER, // Your email address from environment
    to: 'thesafarnamatales@gmail.com', // The email address where you want to send customer details
    subject: 'New Customer Request', // Subject of the email
    html: `
      <h1>New Customer Request</h1>
      <p><strong>Name:</strong> ${customerDetails.name}</p>
      <p><strong>Email:</strong> ${customerDetails.email}</p>
      <p><strong>Phone:</strong> ${customerDetails.phone}</p>
      <p><strong>Request:</strong> ${customerDetails.request}</p>
    `, // HTML content with customer details
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + info.response);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

// Function to create a new customer
exports.createCustomer = async (req, res) => {
  const { name, email, phone, request } = req.body;
  console.log(req.body); // This should now log the body of the request properly

  // Validate that all fields are provided
  if (!name || !email || !phone || !request) {
    return res.status(400).json({ message: 'Please provide all required fields' });
  }

  try {
    // Create a new customer document
    const newCustomer = new Customer({
      name,
      email,
      phone,
      request,
    });

    // Save the customer to the database
    await newCustomer.save();  // Fix: Use 'newCustomer.save()' instead of 'Customer.save()'

    // Send an email with the customer details
    await sendCustomerEmail({
      name,
      email,
      phone,
      request,
    });

    // Respond with the newly created customer details
    res.status(201).json({
      message: 'Customer created successfully',
      customer: {
        name: newCustomer.name,
        email: newCustomer.email,
        phone: newCustomer.phone,
        request: newCustomer.request,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
