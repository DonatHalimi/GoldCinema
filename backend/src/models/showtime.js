const mongoose = require('mongoose');

const showtimeSeatSchema = new mongoose.Schema(
    {
        seatId: { type: String, required: true, },
        status: { type: String, enum: ['available', 'booked'], default: 'available', },
    },
    { _id: false }
);

const showtimeSchema = new mongoose.Schema(
    {
        movie: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true, index: true, },
        cinema: { type: mongoose.Schema.Types.ObjectId, ref: 'Cinema', required: true, },
        screen: { type: mongoose.Schema.Types.ObjectId, ref: 'Screen', required: true, },
        startTime: { type: Date, required: true, index: true, },
        endTime: { type: Date, required: true, },
        seats: { type: [showtimeSeatSchema], default: [], },
    },
    { timestamps: true }
);

showtimeSchema.index({ movie: 1, startTime: 1 });

module.exports = mongoose.models.Showtime || mongoose.model('Showtime', showtimeSchema);