const mongoose = require('mongoose');

const bankAccountSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    accountname: { type: String, required: true },
    accountnumber: { type: String, required: true, unique: true },
    ifsccode: { type: String, required: true },
    branch: { type: String, required: true },
    status: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('BankAccount', bankAccountSchema);
