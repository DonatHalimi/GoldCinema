const Showtime = require('../models/showtime');
const Movie = require('../models/movie');
const Screen = require('../models/screen');
const { getAvailability } = require('../utils/seatAvailability');

async function getShowtimeById(req, res, next) {
    try {
        const showtime = await Showtime.findById(req.params.id);

        if (!showtime) {
            return res.status(404).json({ error: 'Showtime not found.' });
        }

        const [movie, screen, statusMap] = await Promise.all([
            Movie.findById(showtime.movie),
            Screen.findById(showtime.screen).populate('seats'),
            getAvailability(showtime),
        ]);

        const seats = (screen?.seats || []).map((seat) => {
            const seatId = `${seat.row}${seat.number}`;
            return {
                id: seatId,
                row: seat.row,
                number: seat.number,
                column: seat.column,
                type: seat.type,
                status: statusMap.get(seatId) || 'available',
            };
        });

        res.json({
            showtime: {
                id: showtime._id,
                movieId: showtime.movie,
                cinemaId: showtime.cinema,
                screenId: showtime.screen,
                startTime: showtime.startTime,
                endTime: showtime.endTime,
                date: showtime.startTime.toISOString().slice(0, 10),
                time: showtime.startTime.toISOString().slice(11, 16),
                hall: screen?.name,
                seats,
            },
            movie,
        });
    } catch (err) {
        next(err);
    }
}

module.exports = {
    getShowtimeById,
};