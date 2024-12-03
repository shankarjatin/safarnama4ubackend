const express = require('express');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const connectDB = require('./config/database');
const tourRoutes = require('./routes/tourRoutes');
const order = require('./routes/orderRoutes');
const cutomer = require('./routes/customerRoutes');
const cors = require('cors');
const path = require('path');


dotenv.config();


// Connect to MongoDB
connectDB();

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.json());



app.use('/uploads', express.static('uploads')); 
app.use('/static', express.static(path.join(__dirname, 'uploads')));// Serve static files for PDF retrieval
app.use('/api', tourRoutes);
app.use('/api', cutomer)
app.use('/api', order) // Mount routes

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
