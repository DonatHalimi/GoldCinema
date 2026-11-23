const { Schema, model } = require('mongoose');

const roleSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            minlength: 2,
            maxlength: 64,
            set: (value) => String(value || '').trim().toLowerCase().replace(/\s+/g, '_'),
        },
        description: { type: String, trim: true },
        isSystem: { type: Boolean, default: false, index: true },
        isProtected: { type: Boolean, default: false, index: true },
        unrestricted: { type: Boolean, default: false, index: true },
    },
    { timestamps: true }
);

module.exports = model('Role', roleSchema);