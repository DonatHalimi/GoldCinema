const { Schema, model } = require('mongoose');

const snackSchema = new Schema(
    {
        name: { type: String, required: true, trim: true },
        category: { type: String, enum: ['popcorn', 'drink', 'candy', 'combo', 'other'], default: 'other' },
        price: { type: Number, required: true, min: 0 },
        image: { type: String },
        available: { type: Boolean, default: true },
    },
    { timestamps: true }
);

module.exports = model('Snack', snackSchema);