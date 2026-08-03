const mongoose = require('mongoose');

const { Schema, model } = require('mongoose');

const seatHoldSchema = new Schema(
    {
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        showtime: { type: Schema.Types.ObjectId, ref: 'Showtime', required: true },
        seats: { type: [String], required: true },
        expiresAt: { type: Date, required: true },
        extensions: { type: Number, default: 0 },
        stripePaymentIntentId: { type: String },
        paypalOrderId: { type: String },
    },
    { timestamps: true }
);

seatHoldSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

seatHoldSchema.index({ showtime: 1 });

module.exports = mongoose.models.SeatHold || mongoose.model('SeatHold', seatHoldSchema);