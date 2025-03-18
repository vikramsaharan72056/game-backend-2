const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Slider = require('../models/Slider'); // Import Mongoose model

const router = express.Router();

// Multer setup for handling image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({ storage });

// Create a new slider
router.post('/slider', upload.single('image'), async (req, res) => {
    const { title } = req.body;
    const image = req.file ? req.file.filename : null;

    if (!title || !image) {
        return res.status(400).json({ error: 'Title and image are required' });
    }

    try {
        const newSlider = new Slider({ title, image });
        const savedSlider = await newSlider.save();

        res.status(201).json({ message: 'Slider created successfully', sliderId: savedSlider._id });
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

// Get all sliders
router.get('/sliders', async (req, res) => {
    try {
        const sliders = await Slider.find();
        res.json(sliders);
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

// Update a slider
router.put('/slider/:id', upload.single('image'), async (req, res) => {
    const { id } = req.params;
    const { title } = req.body;
    const image = req.file ? req.file.filename : null;

    try {
        const slider = await Slider.findById(id);
        if (!slider) {
            return res.status(404).json({ error: 'Slider not found' });
        }

        if (image && slider.image) {
            // Delete the old image if a new one is uploaded
            const oldImagePath = path.join(__dirname, '../uploads', slider.image);
            if (fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);
            }
        }

        slider.title = title || slider.title;
        if (image) slider.image = image;

        await slider.save();

        res.json({ message: 'Slider updated successfully' });
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

// Delete a slider
router.delete('/slider/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const slider = await Slider.findById(id);
        if (!slider) {
            return res.status(404).json({ error: 'Slider not found' });
        }

        if (slider.image) {
            const imagePath = path.join(__dirname, '../uploads', slider.image);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        await slider.deleteOne();
        res.json({ message: 'Slider deleted successfully' });
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

module.exports = router;
