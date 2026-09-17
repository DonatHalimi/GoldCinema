const mongoose = require('mongoose');
const { Schema } = mongoose;

const translationKeySchema = new Schema(
    {
        namespace: { type: String, required: true, trim: true, index: true },
        key: { type: String, required: true, trim: true },
        values: {
            en: { type: String, required: true, trim: true },
            sq: { type: String, trim: true, default: null },
            'sr-Latn': { type: String, trim: true, default: null },
        },
        context: { type: String, trim: true, default: null },
    },
    { timestamps: true }
);

translationKeySchema.index({ namespace: 1, key: 1 }, { unique: true });

module.exports = mongoose.models.TranslationKey || mongoose.model('TranslationKey', translationKeySchema);