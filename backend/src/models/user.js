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
            enum: [
                'password',
                'google',
                'facebook',
                'github',
                'passkey',
                'mfa',
                'register',
                'security_questions',
                null,
            ],
            default: null,
        },
        lastActiveAt: { type: Date, default: Date.now },
        revokedAt: { type: Date, default: null },
        activeRole: { type: Schema.Types.ObjectId, ref: 'Role', default: null },
        roleSelectionComplete: { type: Boolean, default: false },
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

const oauthIdentitySchema = new Schema(
    {
        provider: {
            type: String,
            enum: ['google', 'facebook', 'github'],
            required: true,
        },
        providerUserId: {
            type: String,
            required: true,
        },
        login: {
            type: String,
            default: null,
        },
        email: {
            type: String,
            default: null,
        },
        name: {
            type: String,
            default: null,
        },
        avatar: {
            type: String,
            default: null,
        },
        linkedAt: {
            type: Date,
            default: Date.now,
        },
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

        passwordHash: { type: String, default: null },

        authProviders: {
            type: [
                {
                    type: String,
                    enum: ['password', 'google', 'facebook', 'github'],
                },
            ],
            default: [],
        },

        oauthIdentities: {
            type: [oauthIdentitySchema],
            default: [],
        },

        role: { type: Schema.Types.ObjectId, ref: 'Role' },
        roles: { type: [{ type: Schema.Types.ObjectId, ref: 'Role' }], default: [] },
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

        socialAccountOtpHash: {
            type: String,
            default: null,
            select: false,
        },
        socialAccountOtpExpiresAt: {
            type: Date,
            default: null,
            select: false,
        },
        socialAccountOtpProvider: {
            type: String,
            enum: ['google', 'facebook', 'github', null],
            default: null,
            select: false,
        },
        socialAccountOtpMethod: {
            type: String,
            enum: ['email', 'sms', null],
            default: null,
            select: false,
        },
        socialAccountOtpSentAt: {
            type: Date,
            default: null,
        },

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

userSchema.index(
    {
        'oauthIdentities.provider': 1,
        'oauthIdentities.providerUserId': 1,
    },
    {
        unique: true,
        partialFilterExpression: {
            'oauthIdentities.providerUserId': { $exists: true },
        },
    }
);

async function deleteUserSecurityQuestionArtifacts(userIds) {
    const ids = (Array.isArray(userIds) ? userIds : [userIds]).filter(Boolean);
    if (!ids.length) return;
    const UserSecurityQuestions = mongoose.models.UserSecurityQuestions || require('./userSecurityQuestions');
    const SecurityQuestionRecoveryToken = mongoose.models.SecurityQuestionRecoveryToken || require('./securityQuestionRecoveryToken');
    await Promise.all([
        UserSecurityQuestions.deleteMany({ user: { $in: ids } }),
        SecurityQuestionRecoveryToken.deleteMany({ user: { $in: ids } }),
    ]);
}

// Keep dependent recovery records aligned with user deletion and account deactivation.
userSchema.pre('save', async function cleanupRecoveryDataOnDeactivation() {
    if (this.isModified('deletedAt') && this.deletedAt) {
        await deleteUserSecurityQuestionArtifacts(this._id);
    }
});

userSchema.pre('deleteOne', { document: true, query: false }, async function cleanupRecoveryDataOnDelete() {
    await deleteUserSecurityQuestionArtifacts(this._id);
});

userSchema.pre('deleteOne', { document: false, query: true }, async function cleanupRecoveryDataOnQueryDelete() {
    const existing = await this.model.findOne(this.getQuery()).select('_id').lean();
    if (existing?._id) await deleteUserSecurityQuestionArtifacts(existing._id);
});

userSchema.pre('findOneAndDelete', async function cleanupRecoveryDataOnFindDelete() {
    const existing = await this.model.findOne(this.getQuery()).select('_id').lean();
    if (existing?._id) await deleteUserSecurityQuestionArtifacts(existing._id);
});

userSchema.pre('deleteMany', async function cleanupRecoveryDataOnBulkDelete() {
    const ids = await this.model.distinct('_id', this.getQuery());
    if (ids.length) await deleteUserSecurityQuestionArtifacts(ids);
});

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