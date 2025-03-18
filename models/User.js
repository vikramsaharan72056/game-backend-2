const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    dob: { type: Date, required: true },
    referalCode: { type: String, default: "admin" },
    kyc: {
        aadhar: { type: String },
        pan: { type: String },
        kycstatus: { type: Number, default: 0 }
    },
    wallet: [{
        cryptoname: { type: String, required: true },
        balance: { type: Number, default: 0 }
    }]
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

module.exports = mongoose.model('User', userSchema);
