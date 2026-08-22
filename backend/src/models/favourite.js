const mongoose = require('mongoose');
const { Schema } = mongoose;

const favouriteSchema = new Schema(
    {
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        itemType: { type: String, enum: ['Movie', 'Cinema'], required: true },
        item: { type: Schema.Types.ObjectId, required: true, refPath: 'itemType' },
    },
    { timestamps: true }
);

favouriteSchema.index({ user: 1, itemType: 1, item: 1 }, { unique: true });

module.exports = mongoose.models.Favourite || mongoose.model('Favourite', favouriteSchema);