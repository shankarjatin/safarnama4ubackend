const Tour = require('../models/tourModel');
const fs = require('fs');
const path = require('path');

exports.createTour = async (req, res) => {
    try {
        console.log('Request Body:', req.body);
      console.log('Request Files:', req.files);
      const {
        id,
        name,
        category,
        details,
        duration,
        days,
        price,
        image,
        usp,
        whyToChoose,
        content,
        additionalImages,
      } = req.body;
      console.log('Request Body:', req.body);
      console.log('Request Files:', req.files);
      
      if (!req.files || !req.files.pdf || req.files.pdf.length === 0) {
        return res.status(400).json({ error: 'PDF file is required' });
      }
  
      const pdfPath = req.files.pdf[0].path;
  
      const tour = new Tour({
        id,
        name,
        category,
        details,
        duration,
        days,
        price,
        image,
        usp,
        whyToChoose,
        content,
        additionalImages: JSON.parse(additionalImages || '[]'),
        pdfPath, 
      });
  
      await tour.save();
      res.status(201).json({ success: 'Tour created successfully', data: tour });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to create tour' });
    }
  };
  

// Retrieve a tour's PDF by ID
exports.getTourPDF = async (req, res) => {
  try {
    const { id } = req.params;
    const tour = await Tour.findOne({ id });

    if (!tour) {
      return res.status(404).json({ error: 'Tour not found' });
    }

    const pdfPath = path.resolve(tour.pdfPath);

    if (!fs.existsSync(pdfPath)) {
      return res.status(404).json({ error: 'PDF file not found' });
    }

    res.set('Content-Type', 'application/pdf');
    res.sendFile(pdfPath);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve PDF' });
  }
};

exports.getAllTours = async (req, res) => {
    try {
        // Optionally accept query parameters for filtering
        const query = req.query;
        const filter = {};

        // Example of adding filtering capability
        if (query.category) {
            filter.category = query.category;
        }
        if (query.price) {
            filter.price = { $lte: query.price }; // Assuming you want tours under a certain price
        }
console.log('Filter:', filter);
        const tours = await Tour.find(filter); // Fetch tours from the database with filters if any
console.log('Tours:', tours);
        // Check if the result array is empty and respond accordingly
        if (tours.length === 0) {
            return res.status(404).json({ message: 'No tours found matching the criteria' });
        }

        // Send the found tours as an array
        res.status(200).json(tours);
    } catch (error) {
        console.error('Failed to fetch tours:', error);
        res.status(500).json({ error: 'Server error', message: error.message });
    }
};


exports.getTour = async (req, res) => {
    try {
        const id = parseInt(req.params.id); // Convert the id parameter to integer
        const tour = await Tour.findOne({ id: id }); // Use findOne to fetch by numerical ID
        if (!tour) {
            return res.status(404).json({ message: 'Tour not found' });
        }
        res.json(tour);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching tour', error: error.message });
    }
};
