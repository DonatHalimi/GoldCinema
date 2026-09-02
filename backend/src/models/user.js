const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const refreshTokenSchema = new Schema(
    {
        token: { type: String, required: true },
        expiresAt: { type: Date, required: true },
        createdAt: { type: Date, default: Date.now },
        rememberMe: { type: Boolean, default: false },
        ipAddress: { type: String, default: null },
        userAgent: { type: String, default: null },
        deviceLabel: { type: String, default: null },
        loginMethod: {
            type: String,
            enum: ['password', 'google', 'facebook', 'passkey', 'mfa', 'register', null],
            default: null,
        },
        lastActiveAt: { type: Date, default: Date.now },
        revokedAt: { type: Date, default: null },
    },
    { _id: true }
);

const backupCodeSchema = new Schema(
    {
        codeHash: { type: String, select: false },
        usedAt: { type: Date, default: null },
    },
    { _id: false }
);

const trustedDeviceSchema = new Schema(
    {
        tokenHash: { type: String, required: true },
        label: { type: String, default: null },
        createdAt: { type: Date, default: Date.now },
        lastUsedAt: { type: Date, default: Date.now },
        expiresAt: { type: Date, required: true },
    },
    { _id: true }
);

const passkeySchema = new Schema(
    {
        credentialId: { type: String, required: true, unique: true, sparse: true },
        publicKey: { type: Buffer, required: true },
        counter: { type: Number, default: 0 },
        deviceType: { type: String, default: null },
        backedUp: { type: Boolean, default: false },
        transports: { type: [String], default: [] },
        name: { type: String, default: 'Passkey' },
        createdAt: { type: Date, default: Date.now },
        lastUsedAt: { type: Date, default: null },
    },
    { _id: true }
);

const securityEventSchema = new Schema(
    {
        type: { type: String, required: true },
        title: { type: String, required: true },
        description: { type: String, default: null },
        createdAt: { type: Date, default: Date.now },
    },
    { _id: true }
);

const twoFactorSchema = new Schema(
    {
        enabled: { type: Boolean, default: false },
        methods: {
            type: [
                {
                    type: String,
                    enum: ['email', 'totp', 'sms'],
                },
            ],
            default: [],
        },

        totpSecret: { type: String, select: false },
        pendingTotpSecret: { type: String, select: false },

        pendingMethod: {
            type: String,
            enum: ['email', 'totp', 'sms', null],
            default: null,
        },

        pendingPhoneNumber: { type: String, select: false },
        smsOtpHash: { type: String, select: false },
        smsOtpExpiresAt: { type: Date, select: false },

        emailOtpHash: { type: String, select: false },
        emailOtpExpiresAt: { type: Date, select: false },

        lastResendAt: { type: Date, select: false, default: null },
        resendCount: { type: Number, select: false, default: 0 },
        resendWindowStart: { type: Date, select: false, default: null },

        backupCodes: { type: [backupCodeSchema], default: [] },
        backupCodesRegenerationCount: { type: Number, default: 0 },
        backupCodesRegeneratedAt: { type: Date, default: null },
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

        isActive: { type: Boolean, default: true },
        deletedAt: { type: Date, default: null },
        tokensInvalidatedAt: { type: Date, default: null },

        refreshTokens: { type: [refreshTokenSchema], default: [] },
        trustedDevices: { type: [trustedDeviceSchema], default: [] },

        orderHistory: [{ type: Schema.Types.ObjectId, ref: 'Order' }],
        totalSpent: { type: Number, default: 0 },

        failedLoginAttempts: { type: Number, default: 0 },
        lockUntil: { type: Date, default: null },
        lockStage: { type: Number, default: 0 },
        mfaFailedAttempts: { type: Number, default: 0 },
        mfaLockUntil: { type: Date, default: null },

        twoFactor: { type: twoFactorSchema, default: () => ({}) },
        phoneNumber: { type: String, default: null },
        phoneVerified: { type: Boolean, default: false },

        passkeys: { type: [passkeySchema], default: [] },
        passkeyRegistrationChallenge: { type: String, default: null },
        passkeyAuthenticationChallenge: { type: String, default: null },

        loginAlerts: { type: Boolean, default: true },
        securityEvents: { type: [securityEventSchema], default: [] },

        stripeCustomerId: { type: String, default: null },
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