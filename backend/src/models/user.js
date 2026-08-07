const { Schema, model } = require('mongoose');

const refreshTokenSchema = new Schema(
    {
        token: { type: String, required: true },
        expiresAt: { type: Date, required: true },
        createdAt: { type: Date, default: Date.now },
    },
    { _id: false }
);

const userSchema = new Schema(
    {
        name: { type: String, required: true, trim: true },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
        },
        passwordHash: { type: String, required: true },
        role: { type: Schema.Types.ObjectId, ref: 'Role' },
        avatar: { type: String, default: null },

        emailVerified: { type: Boolean, default: false },
        verificationToken: { type: String, default: null },
        verificationTokenExpiresAt: { type: Date, default: null },
        passwordResetToken: { type: String, default: null },
        passwordResetExpiresAt: { type: Date, default: null },

        failedLoginAttempts: { type: Number, default: 0 },
        lockUntil: { type: Date, default: null },
        lockStage: { type: Number, default: 0 },

        isActive: { type: Boolean, default: true },
        deletedAt: { type: Date, default: null },
        refreshTokens: { type: [refreshTokenSchema], default: [] },

        orderHistory: [{ type: Schema.Types.ObjectId, ref: 'Order' }],
        totalSpent: { type: Number, default: 0 },

        twoFactor: {
            enabled: { type: Boolean, default: false },
            method: { type: String, enum: ['email', 'totp', 'sms', null], default: null },
            totpSecret: { type: String, select: false },
            pendingMethod: { type: String, enum: ['email', 'totp', null], default: null },
            pendingTotpSecret: { type: String, select: false },
            emailOtpHash: { type: String, select: false },
            emailOtpExpiresAt: { type: Date, select: false },
            backupCodes: [{
                codeHash: { type: String, select: false },
                usedAt: { type: Date, default: null },
            }],
        },
        mfaFailedAttempts: { type: Number, default: 0 },
        mfaLockUntil: { type: Date, default: null },
        trustedDevices: [{
            tokenHash: { type: String, required: true },
            label: { type: String },
            createdAt: { type: Date, default: Date.now },
            lastUsedAt: { type: Date, default: Date.now },
            expiresAt: { type: Date, required: true },
        }],
    },
    { timestamps: true }
);

userSchema.methods.toPublicJSON = function toPublicJSON() {
    return {
        id: this._id,
        name: this.name,
        email: this.email,
        role: this.role,
        avatar: this.avatar,
        emailVerified: this.emailVerified,
        createdAt: this.createdAt,
    };
};

module.exports = model('User', userSchema);