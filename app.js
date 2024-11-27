// app.js

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');

require('dotenv').config();

// const emailRoutes = require('./routes/emailRoutes');
// const paymentRoutes = require('./routes/paymentRoutes');
// const userRoutes = require('./routes/userRoutes');
// const privateRoute = require('./routes/privateRoute');
// const adminRoute = require('./routes/adminRoutes');



// Middleware
const app = express();
app.use(express.json());



const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.log(err));

// // Routes
// app.use('/api', emailRoutes);
// app.use('/api', paymentRoutes);
// app.use("/api", userRoutes);
// app.use('/api', privateRoute);
// app.use('/api', adminRoute);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
