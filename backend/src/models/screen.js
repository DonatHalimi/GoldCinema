const mongoose = require('mongoose');
const { Schema } = mongoose;

const screenSchema = new Schema(
    {
        cinema: { type: Schema.Types.ObjectId, ref: 'Cinema', required: true, index: true },
        name: { type: String, required: true },
        rows: { type: Number, required: true },
        columns: { type: Number, required: true },
        seats: [{ type: Schema.Types.ObjectId, ref: 'Seat' }],
    },
    { timestamps: true }
);

module.exports = mongoose.models.Screen || mongoose.model('Screen', screenSchema);