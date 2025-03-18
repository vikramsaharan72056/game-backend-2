const mongoose = require('mongoose');

const withdrawlSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    balance: { type: Number, required: true },
    cryptoname: { type: String, required: true },
    status: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Withdrawl', withdrawlSchema);
