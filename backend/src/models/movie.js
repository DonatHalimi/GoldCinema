const mongoose = require('mongoose');
const { Schema } = mongoose;
const Cinema = require('../models/cinema');
const Screen = require('../models/screen');

const movieSchema = new Schema(
    {
        title: { type: String, required: true, trim: true, index: true },
        slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
        genres: { type: [String], default: [] },
        duration: { type: Number, required: true },
        description: { type: String, required: true },
        posterUrl: { type: String, required: true },
        trailerUrl: { type: String },
        rating: { type: String, enum: ['G', 'PG', 'PG-13', 'R', 'NC-17'], required: true },
        releaseDate: { type: Date },
        price: { type: Number, required: true, min: 0 },
        active: { type: Boolean, default: true },
    },
    { timestamps: true }
);

module.exports = mongoose.models.Movie || mongoose.model('Movie', movieSchema);