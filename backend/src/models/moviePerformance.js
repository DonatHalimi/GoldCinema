const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const moviePerformanceSchema = new Schema(
    {
        movie: { type: Schema.Types.ObjectId, ref: 'Movie', required: true, index: true, },
        date: { type: Date, required: true, index: true, },
        showtimeCount: { type: Number, default: 0, },
        ticketsSold: { type: Number, default: 0, },
        revenue: { type: Number, default: 0, },
        averageOccupancy: { type: Number, default: 0, },
        rating: { type: Number, default: 0, },
    },
    { timestamps: true }
);

moviePerformanceSchema.index({ movie: 1, date: 1 }, { unique: true });
moviePerformanceSchema.index({ date: -1 });

module.exports = mongoose.models.MoviePerformance || model('MoviePerformance', moviePerformanceSchema);