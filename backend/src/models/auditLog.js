const mongoose = require('mongoose');
const { Schema } = mongoose;

const auditLogSchema = new Schema(
    {
        category: {
            type: String,
            enum: ['api_request', 'auth', 'payment', 'admin_mutation', 'client_error', 'client_event'],
            required: true,
            index: true,
        },
        action: { type: String, default: null },
        method: { type: String, default: null },
        path: { type: String, default: null },
        statusCode: { type: Number, default: null },
        durationMs: { type: Number, default: null },
        requestId: { type: String, index: true },

        actor: {
            userId: { type: Schema.Types.ObjectId, ref: 'User', default: null, index: true },
            email: { type: String, default: null },
            role: { type: String, default: null },
            ip: { type: String, default: null },
            userAgent: { type: String, default: null },
        },

        resource: {
            type: { type: String, default: null },
            id: { type: String, default: null },
        },

        changes: {
            before: { type: Schema.Types.Mixed, default: undefined },
            after: { type: Schema.Types.Mixed, default: undefined },
        },

        metadata: { type: Schema.Types.Mixed, default: undefined },

        severity: {
            type: String,
            enum: ['info', 'warning', 'error', 'critical'],
            default: 'info',
        },

        expiresAt: { type: Date, required: true },
    },
    { timestamps: true }
);

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ category: 1, severity: 1, createdAt: -1 });
auditLogSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
auditLogSchema.index({ category: 1, statusCode: 1 });

module.exports = mongoose.models.AuditLog || mongoose.model('AuditLog', auditLogSchema);