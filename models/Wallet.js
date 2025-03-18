const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    balance: { type: Number, default: 0 },
    cryptoname: { type: String, required: true }
});

module.exports = mongoose.model('Wallet', walletSchema);
