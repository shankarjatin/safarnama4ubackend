const express = require('express');
const multer = require('multer');
const tourController = require('../controllers/tourController');

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads'); // Directory for storing PDFs
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

const router = express.Router();

// Route to create a new tour with a PDF
router.post('/tours', upload.single('pdf'), tourController.createTour);

// Route to retrieve the PDF by tour ID
router.get('/tours/:id/pdf', tourController.getTourPDF);

module.exports = router;
