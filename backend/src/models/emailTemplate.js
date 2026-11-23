const mongoose = require('mongoose');
const { Schema } = mongoose;

const variableSchema = new Schema({
    key: { type: String, required: true, match: /^[a-z][A-Za-z0-9_]*$/ },
    description: { type: String, required: true, trim: true, maxlength: 300 },
    required: { type: Boolean, default: false },
    sampleValue: { type: String, default: '' },
    type: { type: String, enum: ['text', 'url', 'html', 'number', 'boolean'], default: 'text' },
}, { _id: false });

const emailTemplateSchema = new Schema({
    slug: {
        type: String,
        required: true,
        unique: true,
        immutable: true,
        lowercase: true,
        trim: true,
        match: /^[a-z][a-z0-9_-]{1,63}$/,
        index: true,
    },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, default: '', trim: true, maxlength: 500 },
    subject: { type: String, required: true, trim: true, maxlength: 250 },
    htmlBody: { type: String, required: true, maxlength: 100000 },
    textBody: { type: String, default: '', maxlength: 50000 },
    variables: { type: [variableSchema], default: [] },
    isActive: { type: Boolean, default: true, index: true },
    isSystem: { type: Boolean, default: false, index: true },
    isDeleted: { type: Boolean, default: false, index: true },
    revision: { type: Number, default: 1, min: 1 },
}, { timestamps: true });

module.exports = mongoose.models.EmailTemplate || mongoose.model('EmailTemplate', emailTemplateSchema);
