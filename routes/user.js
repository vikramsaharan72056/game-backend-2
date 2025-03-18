const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('../models/User'); // Import Mongoose User model
const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({ storage });

// User registration
router.post('/register', async (req, res) => {
    const { name:username, email, password, phoneNumber: phone, dob, referalCode } = req.body;

    

    try {
        const newUser = new User({
            username,
            email,
            password,
            phone,
            dob,
            referalCode,
            wallet: [
                { cryptoname: 'BTC', balance: 0 },
                { cryptoname: 'ETH', balance: 0 },
                { cryptoname: 'LTC', balance: 0 },
                { cryptoname: 'USDT', balance: 0 }
            ]
        });

        const savedUser = await newUser.save();
        res.status(201).json({ message: 'User registered and wallet initialized successfully', userId: savedUser._id });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error registering user' });
    }
});

// User login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ error: 'User not found' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                phone: user.phone,
                dob: user.dob,
                referalCode: user.referalCode,
                wallet: user.wallet
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error logging in user' });
    }
});

// Get all users
router.get('/allusers', async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching users' });
    }
});

// Get one user by ID
router.get('/user/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching user' });
    }
});

// Update user details by ID
router.put('/user/:id', async (req, res) => {
    const { username, email, phone, dob } = req.body;

    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { username, email, phone, dob },
            { new: true }
        );

        if (!user) return res.status(404).json({ error: 'User not found' });

        res.json({ message: 'User details updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error updating user details' });
    }
});

// Update user password by ID
router.put('/user/:id/password', async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordValid) return res.status(401).json({ error: 'Current password is incorrect' });

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        res.json({ message: 'Password updated successfully' });

    } catch (error) {
        res.status(500).json({ error: 'Error updating password' });
    }
});

// Update wallet balance
router.put('/wallet/balance', async (req, res) => {
    const { userId, cryptoname, balance } = req.body;

    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: 'User not found' });

        const walletEntry = user.wallet.find(w => w.cryptoname === cryptoname);
        if (!walletEntry) return res.status(404).json({ error: 'Cryptocurrency not found in wallet' });

        walletEntry.balance += balance;
        await user.save();

        res.json({ message: 'Wallet balance updated successfully' });

    } catch (error) {
        res.status(500).json({ error: 'Error updating wallet balance' });
    }
});

// Delete user by ID
router.delete('/user/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting user' });
    }
});

module.exports = router;
