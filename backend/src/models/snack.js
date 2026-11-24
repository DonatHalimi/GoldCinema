const { Schema, model } = require('mongoose');

const snackSchema = new Schema(
    {
        catalogId: { type: String, trim: true, lowercase: true, unique: true, sparse: true, immutable: true },
        name: { type: String, required: true, trim: true },
        description: { type: String, trim: true, default: '' },
        type: { type: String, enum: ['concession', 'snack', 'drink', 'gummies'], default: 'snack' },
        category: { type: String, enum: ['popcorn', 'drink', 'candy', 'gummies', 'combo', 'other'], default: 'other' },
        price: { type: Number, required: true, min: 0 },
        originalPrice: { type: Number, min: 0, default: null },
        isCombo: { type: Boolean, default: false },
        image: { type: String },
        available: { type: Boolean, default: true },
        isDeleted: { type: Boolean, default: false },
    },
    { timestamps: true }
);

module.exports = model('Snack', snackSchema);