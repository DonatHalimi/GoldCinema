const mongoose = require('mongoose');
const { Schema } = mongoose;

const loginAttemptSchema = new Schema(
    {
        email: { type: String, required: true, lowercase: true, trim: true, index: true },
        user: { type: Schema.Types.ObjectId, ref: 'User', default: null },
        ip: { type: String },
        userAgent: { type: String },
        success: { type: Boolean, required: true },
        reason: { type: String },
    },
    { timestamps: true }
);

loginAttemptSchema.index({ email: 1, createdAt: -1 });

module.exports = mongoose.models.LoginAttempt || mongoose.model('LoginAttempt', loginAttemptSchema);