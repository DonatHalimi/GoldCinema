require('dotenv').config({
    path: require('path').resolve(__dirname, '../../.env'),
});

const { connectDB } = require('../config/db');

const Movie = require('../models/movie');
const Cinema = require('../models/cinema');
const Screen = require('../models/screen');
const Seat = require('../models/seat');
const Showtime = require('../models/showtime');

const SHOWTIMES_CONFIG = {
    times: ['12:00', '15:00', '18:00', '21:00'],
    startDate: new Date('2026-10-05'),
    daysToGenerate: 730,
    maxShowtimesPerMovie: 240,
    wipeExistingFutureShowtimes: true,
};

async function seedShowtimes() {
    try {
        await connectDB();

        console.log('\n🚀 Starting showtimes-only seed...\n');

        const cinema = await Cinema.findOne();
        if (!cinema) throw new Error('No cinema found — run the main seed first.');

        const screen = await Screen.findOne({ cinema: cinema._id });
        if (!screen) throw new Error('No screen found — run the main seed first.');

        const seats = await Seat.find({ screen: screen._id }).sort({ row: 1, column: 1 });
        if (!seats.length) throw new Error('No seats found for screen — run the main seed first.');

        const movies = await Movie.find({ active: true });
        if (!movies.length) throw new Error('No active movies found — run the main seed first.');

        const startDate = SHOWTIMES_CONFIG.startDate;
        const cutoffDate = new Date(startDate);
        cutoffDate.setDate(cutoffDate.getDate() + SHOWTIMES_CONFIG.daysToGenerate);

        if (SHOWTIMES_CONFIG.wipeExistingFutureShowtimes) {
            console.log(`🧹 Removing showtimes from ${startDate.toDateString()} onward...`);
            const result = await Showtime.deleteMany({ startTime: { $gte: startDate } });
            console.log(`  ✅ Removed ${result.deletedCount} existing showtimes\n`);
        }

        console.log('🎬 Creating showtimes...');
        const { times, daysToGenerate, maxShowtimesPerMovie } = SHOWTIMES_CONFIG;

        const showtimes = [];

        movies.forEach((movie) => {
            let count = 0;

            for (let day = 0; day < daysToGenerate && count < maxShowtimesPerMovie; day++) {
                const date = new Date(startDate);
                date.setDate(date.getDate() + day);

                for (const time of times) {
                    if (count >= maxShowtimesPerMovie) break;

                    const [hours, minutes] = time.split(':');
                    const startTime = new Date(date);
                    startTime.setHours(Number(hours), Number(minutes), 0, 0);

                    const endTime = new Date(startTime);
                    endTime.setMinutes(endTime.getMinutes() + movie.duration);

                    showtimes.push({
                        movie: movie._id,
                        cinema: cinema._id,
                        screen: screen._id,
                        startTime,
                        endTime,
                        seats: seats.map((seat) => ({
                            seatId: `${seat.row}${seat.number}`,
                            status: 'available',
                        })),
                    });

                    count++;
                }
            }
        });

        console.log(`  📦 Prepared ${showtimes.length} showtimes across ${movies.length} movies`);

        const chunkSize = 500;
        let inserted = 0;
        for (let i = 0; i < showtimes.length; i += chunkSize) {
            const chunk = showtimes.slice(i, i + chunkSize);
            await Showtime.insertMany(chunk);
            inserted += chunk.length;
            console.log(`  ✅ Inserted ${inserted}/${showtimes.length}`);
        }

        console.log(`\n✨ Done — ${inserted} showtimes created.`);
        console.log(`   Range: ${startDate.toDateString()} → ${cutoffDate.toDateString()}`);
        console.log(`   ~${daysToGenerate / 365} years of coverage.\n`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Showtime seed failed:', error);
        process.exit(1);
    }
}

seedShowtimes();