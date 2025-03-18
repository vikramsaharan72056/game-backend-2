const express = require('express');
const mongoose = require('mongoose');
const Withdrawl = require('../models/Withdrawl'); // Import Withdrawl model
const User = require('../models/User'); // Import User model
const router = express.Router();

// Create a new withdrawal entry and deduct balance from the wallet
router.post('/withdrawl', async (req, res) => {
    const { userId, balance, cryptoname, status } = req.body;

    if (!userId || !cryptoname || !balance || balance <= 0) {
        return res.status(400).json({ error: 'Invalid input. userId, cryptoname, and a positive balance are required.' });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Find the user and their wallet
        const user = await User.findById(userId).session(session);
        if (!user) {
            await session.abortTransaction();
            return res.status(404).json({ error: 'User not found' });
        }

        // Check if the user has sufficient balance
        const walletEntry = user.wallet.find(w => w.cryptoname === cryptoname);
        if (!walletEntry || walletEntry.balance < balance) {
            await session.abortTransaction();
            return res.status(400).json({ error: 'Insufficient balance or wallet entry not found' });
        }

        // Deduct balance
        walletEntry.balance -= balance;
        await user.save({ session });

        // Create withdrawal entry
        const newWithdrawl = new Withdrawl({ userId, balance, cryptoname, status: status || 0 });
        await newWithdrawl.save({ session });

        // Commit transaction
        await session.commitTransaction();
        res.status(201).json({ message: 'Withdrawal entry created successfully and balance deducted' });

    } catch (error) {
        await session.abortTransaction();
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        session.endSession();
    }
});

// Get all withdrawal entries
router.get('/withdrawl', async (req, res) => {
    try {
        const withdrawls = await Withdrawl.find().populate('userId', 'username email');
        res.json(withdrawls);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching withdrawal entries' });
    }
});

// Get a single withdrawal entry by ID
router.get('/withdrawl/:id', async (req, res) => {
    try {
        const withdrawl = await Withdrawl.findById(req.params.id).populate('userId', 'username email');
        if (!withdrawl) return res.status(404).json({ error: 'Withdrawal entry not found' });

        res.json(withdrawl);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching withdrawal entry' });
    }
});

// Update a withdrawal entry by ID
router.put('/withdrawl/:id', async (req, res) => {
    const { balance, cryptoname, status } = req.body;

    if (!balance || !cryptoname || status === undefined) {
        return res.status(400).json({ error: 'Balance, cryptoname, and status are required fields.' });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const withdrawl = await Withdrawl.findById(req.params.id).session(session);
        if (!withdrawl) {
            await session.abortTransaction();
            return res.status(404).json({ error: 'Withdrawal entry not found' });
        }

        const user = await User.findById(withdrawl.userId).session(session);
        if (!user) {
            await session.abortTransaction();
            return res.status(404).json({ error: 'User not found' });
        }

        const walletEntry = user.wallet.find(w => w.cryptoname === cryptoname);
        if (!walletEntry) {
            await session.abortTransaction();
            return res.status(404).json({ error: 'Cryptocurrency not found in wallet' });
        }

        if (withdrawl.status !== 2 && status === 2) {
            // Refund balance if status is updated to "Rejected"
            walletEntry.balance += balance;
            await user.save({ session });
        }

        withdrawl.balance = balance;
        withdrawl.cryptoname = cryptoname;
        withdrawl.status = status;
        await withdrawl.save({ session });

        await session.commitTransaction();
        res.json({ message: 'Withdrawal entry updated successfully' });

    } catch (error) {
        await session.abortTransaction();
        res.status(500).json({ error: 'Error updating withdrawal entry' });
    } finally {
        session.endSession();
    }
});

// Delete a withdrawal entry by ID
router.delete('/withdrawl/:id', async (req, res) => {
    try {
        const withdrawl = await Withdrawl.findByIdAndDelete(req.params.id);
        if (!withdrawl) return res.status(404).json({ error: 'Withdrawal entry not found' });

        res.json({ message: 'Withdrawal entry deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting withdrawal entry' });
    }
});

module.exports = router;
