const mongoose = require('mongoose');
const { Schema } = mongoose;

const securityQuestionRecoveryAttemptSchema = new Schema(
    {
        scope: { type: String, enum: ['account', 'ip'], required: true },
        keyHash: { type: String, required: true },
        failedAttempts: { type: Number, default: 0 },
        windowStartedAt: { type: Date, required: true },
        lockedUntil: { type: Date, default: null },
        expiresAt: { type: Date, required: true },
    },
    { timestamps: true, collection: 'security_question_recovery_attempts' }
);

securityQuestionRecoveryAttemptSchema.index({ scope: 1, keyHash: 1 }, { unique: true });
securityQuestionRecoveryAttemptSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
securityQuestionRecoveryAttemptSchema.index({ lockedUntil: 1 });

module.exports = mongoose.models.SecurityQuestionRecoveryAttempt || mongoose.model('SecurityQuestionRecoveryAttempt', securityQuestionRecoveryAttemptSchema);