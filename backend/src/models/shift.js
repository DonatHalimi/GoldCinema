const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const shiftSchema = new Schema(
    {
        staff: { type: Schema.Types.ObjectId, ref: 'Staff', required: true, index: true },
        cinema: { type: Schema.Types.ObjectId, ref: 'Cinema', required: true, index: true },
        startTime: { type: Date, required: true },
        endTime: { type: Date, required: true },
        role: { type: String, default: null },
        status: { type: String, enum: ['scheduled', 'confirmed', 'completed', 'no_show', 'cancelled'], default: 'scheduled', index: true },
        notes: { type: String, default: null },
    },
    { timestamps: true }
);

shiftSchema.index({ staff: 1, startTime: 1 });
shiftSchema.index({ cinema: 1, startTime: 1 });
shiftSchema.index({ cinema: 1, status: 1 });

module.exports = mongoose.models.Shift || model('Shift', shiftSchema);