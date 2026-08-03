const mongoose = require('mongoose');
const { Schema, model } = require('mongoose');

const cinemaSchema = new Schema(
    {
        name: { type: String, required: true, trim: true },
        location: {
            address: { type: String, required: true },
            city: { type: String, required: true },
            state: { type: String },
            country: { type: String, required: true },
            coordinates: {
                lat: Number,
                lng: Number,
            },
        },
        type: {
            type: [String],
            enum: ['2D', '3D', 'IMAX', '4DX', 'ScreenX'],
            default: ['2D'],
        },
        features: { type: [String], default: [] },
        screens: [{ type: Schema.Types.ObjectId, ref: 'Screen' }],
    },
    { timestamps: true }
);

module.exports = mongoose.models.Cinema || mongoose.model('Cinema', cinemaSchema);