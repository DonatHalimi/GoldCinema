const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const customerAnalyticsSchema = new Schema(
    {
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true, },
        totalSpent: { type: Number, default: 0, },
        visitCount: { type: Number, default: 0, },
        favouriteGenre: { type: String, default: null, },
        lastVisitDate: { type: Date, default: null, },
        lifetimeValue: { type: Number, default: 0, },
        churnRisk: { type: String, enum: ['low', 'medium', 'high', 'unknown'], default: 'unknown', index: true, },
        lastComputedAt: { type: Date, default: Date.now, },
    },
    { timestamps: true }
);

module.exports = mongoose.models.CustomerAnalytics || model('CustomerAnalytics', customerAnalyticsSchema);