const express = require('express');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const connectDB = require('./config/database');
const tourRoutes = require('./routes/tourRoutes');
const order = require('./routes/orderRoutes');
const cutomer = require('./routes/customerRoutes');
const cors = require('cors');
const path = require('path');
// const cron = require('cron');


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
app.get('/', (req, res) => {
  res.send('Server is running and active!');
  console.log('Server is running and active!');
});

// Schedule a cron job to run every 5 minutes to keep the server alive
// cron.schedule('**/2 * * * * *', async () => {
//   try {
//     console.log('Pinging server to keep it awake...');
//     // Change this to your actual server's public URL
//     await axios.get('https://safarnama4ubackend.onrender.com');
//     console.log('Server pinged successfully');
//   } catch (error) {
//     console.error('Error pinging the server:', error.message);
//   }
// });
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
