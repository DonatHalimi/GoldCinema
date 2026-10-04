const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const equipmentSchema = new Schema(
    {
        cinema: { type: Schema.Types.ObjectId, ref: 'Cinema', required: true, index: true, },
        name: { type: String, required: true, trim: true, },
        type: { type: String, enum: ['projector', 'sound', 'hvac', 'pos', 'lighting', 'other'], default: 'other', },
        serialNumber: { type: String, default: null, trim: true, },
        purchaseDate: { type: Date, default: null, },
        warrantyExpiry: { type: Date, default: null, },
        status: { type: String, enum: ['operational', 'maintenance', 'broken', 'retired'], default: 'operational', index: true, },
        notes: { type: String, default: null, },
    },
    { timestamps: true }
);

equipmentSchema.index({ cinema: 1, status: 1 });
equipmentSchema.index({ serialNumber: 1 }, { sparse: true });

module.exports = mongoose.models.Equipment || model('Equipment', equipmentSchema);