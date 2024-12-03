const Customer = require('../models/Customer');

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
