const mongoose = require('mongoose');
const { Schema } = mongoose;

const redemptionSchema = new Schema(
    {
        order: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
        amount: { type: Number, required: true, min: 0.01 },
        redeemedAt: { type: Date, default: Date.now },
    },
    { _id: false }
);

const giftCardSchema = new Schema(
    {
        code: { type: String, required: true, unique: true, index: true },
        initialValue: { type: Number, required: true, min: 1 },
        balance: { type: Number, required: true, min: 0 },
        currency: { type: String, default: 'EUR' },

        backgroundTemplate: { type: String, required: true },

        purchasedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        senderName: { type: String, required: true, trim: true },
        senderEmail: { type: String, required: true, trim: true, lowercase: true },
        recipientName: { type: String, required: true, trim: true },
        recipientEmail: { type: String, required: true, trim: true, lowercase: true },
        message: { type: String, maxlength: 500 },

        paymentProvider: { type: String, enum: ['stripe', 'paypal', null], default: null },
        paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending', index: true },
        stripePaymentIntentId: { type: String },
        paypalOrderId: { type: String },

        redemptions: { type: [redemptionSchema], default: [] },

        status: { type: String, enum: ['active', 'depleted', 'disabled'], default: 'active' },
    },
    { timestamps: true }
);

giftCardSchema.pre('save', function syncStatus() {
    if (this.status !== 'disabled' && this.paymentStatus === 'paid') {
        this.status = this.balance <= 0 ? 'depleted' : 'active';
    }
});

module.exports = mongoose.models.GiftCard || mongoose.model('GiftCard', giftCardSchema);