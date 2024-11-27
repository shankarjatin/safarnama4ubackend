const Tour = require('../models/tourModel');
const fs = require('fs');
const path = require('path');

// Create a new tour and upload the PDF
exports.createTour = async (req, res) => {
  try {
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

    if (!req.file) {
      return res.status(400).json({ error: 'PDF file is required' });
    }

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
      additionalImages: JSON.parse(additionalImages),
      pdfPath: req.file.path,
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
