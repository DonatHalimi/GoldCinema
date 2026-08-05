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
    },
    { timestamps: true }
);

userSchema.methods.toPublicJSON = function toPublicJSON() {
    return {
        id: this._id,
        name: this.name,
        email: this.email,
        role: this.role,
        emailVerified: this.emailVerified,
        createdAt: this.createdAt,
    };
};

module.exports = model('User', userSchema);