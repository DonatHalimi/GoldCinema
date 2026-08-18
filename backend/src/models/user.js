const { Schema, model } = require('mongoose');
const mongoose = require('mongoose');

const refreshTokenSchema = new Schema(
    {
        token: { type: String, required: true },
        expiresAt: { type: Date, required: true },
        createdAt: { type: Date, default: Date.now },
        rememberMe: { type: Boolean, default: false },
        ipAddress: { type: String, default: null },
        userAgent: { type: String, default: null },
        deviceLabel: { type: String, default: null },
        loginMethod: { type: String, enum: ['password', 'google', 'facebook', 'passkey', 'mfa', 'register', null], default: null, },
        lastActiveAt: { type: Date, default: Date.now },
        revokedAt: { type: Date, default: null, },
    },
    { _id: true }
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
            methods: { type: [{ type: String, enum: ['email', 'totp', 'sms'], }], default: [], },
            totpSecret: { type: String, select: false },
            pendingMethod: { type: String, enum: ['email', 'totp', null], default: null },
            pendingTotpSecret: { type: String, select: false },
            emailOtpHash: { type: String, select: false },
            emailOtpExpiresAt: { type: Date, select: false },

            backupCodes: [{
                codeHash: { type: String, select: false },
                usedAt: { type: Date, default: null },
            }],
            backupCodesRegenerationCount: { type: Number, default: 0, },
            backupCodesRegeneratedAt: { type: Date, default: null, },
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
        passkeys: [{
            credentialId: { type: String, required: true, unique: true, sparse: true },
            publicKey: { type: Buffer, required: true, },
            counter: { type: Number, default: 0, },
            deviceType: { type: String, },
            backedUp: { type: Boolean, default: false, },
            transports: { type: [String], default: [], },
            name: { type: String, default: 'Passkey', },
            createdAt: { type: Date, default: Date.now, },
            lastUsedId: { type: Date, default: null, },
        }],
        passkeyRegistrationChallenge: { type: String, default: null, },
        passkeyAuthenticationChallenge: { type: String, default: null, },
        loginAlerts: { type: Boolean, default: true },
        securityEvents: [{
            type: { type: String, required: true },
            title: { type: String, required: true },
            description: { type: String },
            createdAt: { type: Date, default: Date.now },
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
        twoFactor: {
            enabled: this.twoFactor?.enabled || false,
            methods: this.twoFactor?.methods || [],
        },
        loginAlerts: this.loginAlerts ?? true,
        createdAt: this.createdAt,
    };
};

module.exports = mongoose.models.User || model('User', userSchema);