const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/database');
const tourRoutes = require('./routes/tourRoutes');

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
app.use(express.json());
app.use('/uploads', express.static('uploads')); // Serve static files for PDF retrieval
app.use('/api', tourRoutes); // Mount routes

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
