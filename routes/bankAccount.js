const express = require('express');
const BankAccount = require('../models/BankAccount');  // Import the Mongoose model
const router = express.Router();

// Create a new bank account
router.post('/addnew', async (req, res) => {
    const { userId, accountname, accountnumber, ifsccode, branch, status } = req.body;

    try {
        const newBankAccount = new BankAccount({
            userId, accountname, accountnumber, ifsccode, branch, status: status || 0
        });

        const savedBankAccount = await newBankAccount.save();
        res.status(201).json({ message: 'Bank account created successfully', id: savedBankAccount._id });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error creating bank account' });
    }
});

// Retrieve all bank accounts
router.get('/getall', async (req, res) => {
    try {
        const bankAccounts = await BankAccount.find();
        res.json(bankAccounts);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching bank accounts' });
    }
});

// Retrieve bank accounts by user ID
router.get('/getone/user/:id', async (req, res) => {
    const userId = req.params.id;

    try {
        const bankAccounts = await BankAccount.find({ userId });
        if (bankAccounts.length === 0) return res.status(404).json({ error: 'Bank account not found' });

        res.json(bankAccounts);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching bank account' });
    }
});

// Retrieve a single bank account by ID
router.get('/getonebyid/:id', async (req, res) => {
    const bankAccountId = req.params.id;

    try {
        const bankAccount = await BankAccount.findById(bankAccountId);
        if (!bankAccount) return res.status(404).json({ error: 'Bank account not found' });

        res.json(bankAccount);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching bank account' });
    }
});

// Update a bank account by ID
router.put('/update/:id', async (req, res) => {
    const bankAccountId = req.params.id;
    const { accountname, accountnumber, ifsccode, branch, status } = req.body;

    try {
        const updatedBankAccount = await BankAccount.findByIdAndUpdate(
            bankAccountId,
            { accountname, accountnumber, ifsccode, branch, status },
            { new: true }
        );

        if (!updatedBankAccount) return res.status(404).json({ error: 'Bank account not found' });

        res.json({ message: 'Bank account updated successfully', updatedBankAccount });
    } catch (error) {
        res.status(500).json({ error: 'Error updating bank account' });
    }
});

// Delete a bank account by ID
router.delete('/delete/:id', async (req, res) => {
    const bankAccountId = req.params.id;

    try {
        const deletedBankAccount = await BankAccount.findByIdAndDelete(bankAccountId);
        if (!deletedBankAccount) return res.status(404).json({ error: 'Bank account not found' });

        res.json({ message: 'Bank account deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting bank account' });
    }
});

module.exports = router;
