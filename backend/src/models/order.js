const mongoose = require('mongoose');
const { Schema } = mongoose;

const orderSnackSchema = new Schema(
    {
        snack: { type: Schema.Types.ObjectId, ref: 'Snack', required: true },
        quantity: { type: Number, required: true, min: 1 },
        unitPrice: { type: Number, required: true },
    },
    { _id: false }
);

const orderSchema = new Schema(
    {
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        movie: { type: Schema.Types.ObjectId, ref: 'Movie', required: true },
        showtime: { type: Schema.Types.ObjectId, ref: 'Showtime', required: true },
        seats: { type: [String], required: true },
        snacks: { type: [orderSnackSchema], default: [] },

        ticketAmount: { type: Number, required: true },
        snackAmount: { type: Number, default: 0 },
        totalAmount: { type: Number, required: true },
        currency: { type: String, default: 'USD' },

        paymentProvider: { type: String, enum: ['stripe', 'paypal', null], default: null },
        paymentStatus: {
            type: String,
            enum: ['pending', 'paid', 'failed', 'refunded'],
            default: 'pending',
            index: true,
        },
        holdId: { type: mongoose.Schema.Types.ObjectId, ref: 'SeatHold' },
        holdExpiresAt: { type: Date },

        stripePaymentIntentId: { type: String },
        paypalOrderId: { type: String },

        qrTicket: {
            dataUrl: { type: String, default: null },
            issuedAt: { type: Date, default: null },
        },

        paidAt: { type: Date },
    },
    { timestamps: true }
);

module.exports = mongoose.models.Order || mongoose.model('Order', orderSchema);