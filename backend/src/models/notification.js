const { Schema, model } = require('mongoose');
const mongoose = require('mongoose');

const notificationSchema = new Schema(
    {
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true, },
        title: { type: String, required: true, trim: true, },
        message: { type: String, required: true, trim: true, },
        type: { type: String, enum: ['login', 'purchase', 'security', 'system', 'promo'], default: 'system', },
        read: { type: Boolean, default: false, index: true, },
        archived: { type: Boolean, default: false, index: true, },
        archivedAt: { type: Date, default: null, },
        link: { type: String, default: null, },
        metadata: { type: Schema.Types.Mixed, default: {}, },
    },
    { timestamps: true }
);

notificationSchema.index({ user: 1, createdAt: -1, _id: -1 });
notificationSchema.index({ user: 1, archived: 1, read: 1 });

notificationSchema.index(
    { archivedAt: 1 },
    {
        expireAfterSeconds: 30 * 24 * 60 * 60,
        partialFilterExpression: {
            archivedAt: { $type: 'date' },
        },
    }
);

module.exports = mongoose.models.Notification || model('Notification', notificationSchema);