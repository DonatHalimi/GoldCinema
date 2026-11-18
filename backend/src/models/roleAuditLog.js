const mongoose = require('mongoose');
const { Schema } = mongoose;

const roleAuditLogSchema = new Schema({
    actor: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    target: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    action: { type: String, enum: ['roles_assigned', 'roles_revoked'], required: true },
    before: [{ type: String }],
    after: [{ type: String }],
    ip: { type: String, default: null },
    userAgent: { type: String, default: null },
}, { timestamps: true });

roleAuditLogSchema.index({ createdAt: -1 });

module.exports = mongoose.models.RoleAuditLog || mongoose.model('RoleAuditLog', roleAuditLogSchema);