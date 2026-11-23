const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const rolePermissionSchema = new Schema(
    {
        role: { type: Schema.Types.ObjectId, ref: 'Role', required: true, index: true },
        permission: { type: Schema.Types.ObjectId, ref: 'Permission', required: true, index: true },
    },
    { timestamps: true }
);

rolePermissionSchema.index({ role: 1, permission: 1 }, { unique: true });

module.exports = mongoose.models.RolePermission || model('RolePermission', rolePermissionSchema);
