const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');  // Import Admin model
const User = require('../models/User');    // Import User model
const Wallet = require('../models/Wallet');// Import Wallet model
const router = express.Router();

// Admin login
router.post('/admin-login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const admin = await Admin.findOne({ username });
        if (!admin) return res.status(404).json({ error: 'Admin not found' });

        // Check password
        const isMatch = password === admin.password;  // This assumes passwords are stored in plain text, which is insecure
        if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

        // Generate JWT token
        const token = jwt.sign({ id: admin._id, isAdmin: true }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });

    } catch (error) {
        res.status(500).json({ error: 'Error logging in admin' });
    }
});

// Create a new user
router.post('/user', async (req, res) => {
    const { username, email, password, phone, dob } = req.body;
    const referralCode = "admin";

    try {
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            phone,
            dob,
            code: referralCode
        });

        const savedUser = await newUser.save();

        // List of cryptocurrencies
        const cryptocurrencies = ['BTC', 'ETH', 'LTC', 'USDT', 'SOL', 'DOGE', 'BCH', 'XRP', 'TRX', 'EOS', 'INR', 'CP'];

        // Create wallets for the user
        const walletEntries = cryptocurrencies.map(crypto => ({
            userId: savedUser._id,
            balance: 0,
            cryptoname: crypto
        }));

        await Wallet.insertMany(walletEntries);

        res.status(201).json({ message: 'User registered and wallet initialized successfully' });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Error registering user' });
    }
});

module.exports = router;
