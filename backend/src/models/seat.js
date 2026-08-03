const mongoose = require('mongoose');
const { Schema } = mongoose;

const seatSchema = new Schema(
    {
        number: { type: String, required: true },
        row: { type: String, required: true },
        column: { type: Number, required: true },
        type: {
            type: String,
            enum: ['standard', 'recliner', 'wheelchair', 'love-seat'],
            default: 'standard',
        },
        status: { type: String, enum: ['active', 'maintenance'], default: 'active' },
        screen: { type: Schema.Types.ObjectId, ref: 'Screen' },
    },
    { timestamps: true }
);

seatSchema.virtual('id').get(function seatId() {
    return `${this.row}${this.number}`;
});

module.exports = mongoose.models.Seat || mongoose.model('Seat', seatSchema);