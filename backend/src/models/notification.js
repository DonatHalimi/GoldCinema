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
        link: { type: String, default: null, },
        metadata: { type: Schema.Types.Mixed, default: {}, },
    },
    { timestamps: true }
);

notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ user: 1, archived: 1, read: 1 });

module.exports = mongoose.models.Notification || model('Notification', notificationSchema);
