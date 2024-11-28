const express = require('express');
const tourController = require('../controllers/tourController');
const upload = require('../middleware/multerConfig'); // Import Multer configuration

const router = express.Router();

// Route to create a tour with PDF upload
router.post(
  '/tours',
  upload.fields([
    { name: 'pdf', maxCount: 1 }, // Handle PDF upload
  ]),
  tourController.createTour
);

// Route to retrieve the PDF by tour ID
router.get('/tours/:id/pdf', tourController.getTourPDF);
router.get('/tours', tourController.getAllTours);
router.get('/tours/:id', tourController.getTour);
module.exports = router;
