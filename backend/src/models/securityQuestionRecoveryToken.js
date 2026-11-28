const mongoose = require('mongoose');
const { Schema } = mongoose;

const securityQuestionRecoveryTokenSchema = new Schema(
    {
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        tokenHash: { type: String, required: true, unique: true, select: false },
        purpose: { type: String, enum: ['password_reset'], required: true },
        questionVersion: { type: String, required: true },
        expiresAt: { type: Date, required: true },
        consumedAt: { type: Date, default: null },
        issuedIpHash: { type: String, default: null, select: false },
    },
    { timestamps: true, collection: 'security_question_recovery_tokens' }
);

securityQuestionRecoveryTokenSchema.index({ expiresAt:  1 }, { expireAfterSeconds: 0 });
securityQuestionRecoveryTokenSchema.index({ user: 1, purpose: 1, consumedAt: 1 });

module.exports = mongoose.models.SecurityQuestionRecoveryToken || mongoose.model('SecurityQuestionRecoveryToken', securityQuestionRecoveryTokenSchema);