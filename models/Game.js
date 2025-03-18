const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
    name: { type: String, required: true },
    image: { type: String },
    popularity: { type: Number, required: true },
    description: { type: String, required: true },
    type: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Game', gameSchema);
