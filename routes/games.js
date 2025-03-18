const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Game = require('../models/Game');  // Import Mongoose model

const router = express.Router();

// Set up storage for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({ storage });

// Get all games
router.get('/allgames', async (req, res) => {
    try {
        const games = await Game.find();
        res.json(games);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching games' });
    }
});

// Get a game by ID
router.get('/game/:id', async (req, res) => {
    try {
        const game = await Game.findById(req.params.id);
        if (!game) return res.status(404).json({ error: 'Game not found' });

        res.json(game);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching game' });
    }
});

// Create a new game
router.post('/addgame', upload.single('image'), async (req, res) => {
    const { name, popularity, description, type } = req.body;
    const image = req.file ? req.file.filename : null;

    try {
        const newGame = new Game({ name, image, popularity, description, type });
        const savedGame = await newGame.save();
        
        res.status(201).json({ message: 'Game added successfully', id: savedGame._id });
    } catch (error) {
        res.status(500).json({ error: 'Error adding game' });
    }
});

// Update a game by ID
router.put('/updategame/:id', upload.single('image'), async (req, res) => {
    const { name, popularity, description, type } = req.body;
    const image = req.file ? req.file.filename : null;
    

    try {
        const game = await Game.findById(req.params.id);
        if (!game) return res.status(404).json({ error: 'Game not found' });

        if (image && game.image) {
            // Delete the old image if a new one is uploaded
            const oldImagePath = path.join(__dirname, '../uploads', game.image);
            if (fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);
            }
        }

        game.name = name || game.name;
        game.popularity = popularity || game.popularity;
        game.description = description || game.description;
        game.type = type || game.type;
        if (image) game.image = image;

        await game.save();
        res.json({ message: 'Game updated successfully' });

    } catch (error) {
        res.status(500).json({ error: 'Error updating game' });
    }
});

// Delete a game by ID
router.delete('/deletegame/:id', async (req, res) => {
    try {
        const game = await Game.findById(req.params.id);
        if (!game) return res.status(404).json({ error: 'Game not found' });

        if (game.image) {
            const imagePath = path.join(__dirname, '../uploads', game.image);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        await game.deleteOne();
        res.json({ message: 'Game deleted successfully' });

    } catch (error) {
        res.status(500).json({ error: 'Error deleting game' });
    }
});

// Delete games by filter
router.delete('/deletegames', async (req, res) => {
    const { name, image, popularity, description } = req.body;
    
    try {
        let filter = {};
        if (name) filter.name = name;
        if (image) filter.image = image;
        if (popularity) filter.popularity = popularity;
        if (description) filter.description = description;

        if (Object.keys(filter).length === 0) return res.status(400).json({ error: 'No filters provided' });

        const deletedGames = await Game.deleteMany(filter);
        res.json({ message: 'Games deleted successfully', affectedRows: deletedGames.deletedCount });

    } catch (error) {
        res.status(500).json({ error: 'Error deleting games' });
    }
});

module.exports = router;
