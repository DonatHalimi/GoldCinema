const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const permissionSchema = new Schema(
    {
        key: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
            index: true,
            validate: {
                validator: (value) => /^[a-z][a-z0-9_-]*:[a-z][a-z0-9_-]*$/.test(value),
                message: 'Permission key must use resource:action format.',
            },
        },
        resource: { type: String, required: true, trim: true, lowercase: true },
        action: { type: String, required: true, trim: true, lowercase: true },
        description: { type: String, required: true, trim: true, maxlength: 500 },
        category: { type: String, required: true, trim: true, default: 'General' },
        isSystem: { type: Boolean, default: true, index: true },
        isDeleted: { type: Boolean, default: false, index: true },
    },
    { timestamps: true }
);

permissionSchema.pre('validate', function normalizePermission() {
    this.resource = String(this.resource || '').trim().toLowerCase();
    this.action = String(this.action || '').trim().toLowerCase();
    this.key = `${this.resource}:${this.action}`;
});

module.exports = mongoose.models.Permission || model('Permission', permissionSchema);
