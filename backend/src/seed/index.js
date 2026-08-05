require('dotenv').config({
    path: '../../.env'
});
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const { connectDB, disconnectDB } = require('../config/db');
const Role = require('../models/role');
const User = require('../models/user');
const Movie = require('../models/movie');
const Cinema = require('../models/cinema');
const Screen = require('../models/screen');
const Showtime = require('../models/showtime');
const Snack = require('../models/snack');

function slugify(title) {
    return title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function buildSeats(rows = 8, columns = 10) {
    const seats = [];
    for (let r = 0; r < rows; r++) {
        const rowLetter = String.fromCharCode(65 + r);
        for (let c = 1; c <= columns; c++) {
            seats.push({ row: rowLetter, number: String(c), column: c, type: 'standard' });
        }
    }
    return seats;
}

async function seed() {
    await connectDB();

    const existingMovieCount = await Movie.countDocuments();
    if (existingMovieCount > 0) {
        console.log('Database already seeded (movies exist). Skipping.');
        await disconnectDB();
        return;
    }

    console.log('Seeding roles...');
    const [adminRole, customerRole] = await Promise.all([
        Role.findOneAndUpdate(
            { name: 'admin' },
            { $setOnInsert: { name: 'admin', description: 'Full administrative access.' } },
            { upsert: true, new: true }
        ),
        Role.findOneAndUpdate(
            { name: 'customer' },
            { $setOnInsert: { name: 'customer', description: 'Default role for registered users.' } },
            { upsert: true, new: true }
        ),
    ]);

    console.log('Seeding admin user (admin@goldcinema.example / Admin123!)...');
    const adminPasswordHash = await bcrypt.hash('Admin123!', 10);
    await User.findOneAndUpdate(
        { email: 'admin@goldcinema.example' },
        {
            $setOnInsert: {
                name: 'GoldCinema Admin',
                email: 'admin@goldcinema.example',
                passwordHash: adminPasswordHash,
                role: adminRole._id,
                emailVerified: true,
            },
        },
        { upsert: true, new: true }
    );

    console.log('Seeding cinema + screen...');
    const cinema = await Cinema.create({
        name: 'GoldCinema Downtown',
        location: {
            address: '123 Marquee Ave',
            city: 'Springfield',
            country: 'USA',
        },
        type: ['2D', '3D', 'IMAX'],
        features: ['Dolby Atmos', 'Recliner Seats'],
    });

    const screen = await Screen.create({
        cinema: cinema._id,
        name: 'Hall 1',
        rows: 8,
        columns: 10,
        seats: buildSeats(8, 10),
    });

    cinema.screens.push(screen._id);
    await cinema.save();

    console.log('Seeding movies...');
    const movieData = [
        {
            title: 'Golden Horizon',
            genres: ['Sci-Fi', 'Adventure'],
            rating: 'PG-13',
            duration: 128,
            description:
                'A crew of deep-space salvagers discovers a derelict ship carrying a secret that could rewrite the future of humanity.',
            posterUrl: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=600&q=80',
            price: 12.5,
        },
        {
            title: 'Midnight in Marrakesh',
            genres: ['Romance', 'Drama'],
            rating: 'PG',
            duration: 110,
            description:
                'Two strangers cross paths in the winding souks of Marrakesh during one unforgettable night.',
            posterUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&q=80',
            price: 11.0,
        },
        {
            title: 'The Last Reel',
            genres: ['Thriller'],
            rating: 'R',
            duration: 102,
            description:
                'A retired film projectionist uncovers a decades-old conspiracy hidden inside a lost reel of film.',
            posterUrl: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=600&q=80',
            price: 13.0,
        },
        {
            title: 'Comet Kids',
            genres: ['Animation', 'Family'],
            rating: 'G',
            duration: 95,
            description:
                'A ragtag group of kids builds a backyard rocket and accidentally befriends a comet on its way home.',
            posterUrl: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=600&q=80',
            price: 10.0,
        },
    ];

    const movies = await Movie.insertMany(
        movieData.map((m) => ({ ...m, slug: slugify(m.title), active: true }))
    );

    console.log('Seeding showtimes...');
    const showtimeDocs = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    movies.forEach((movie) => {
        for (let d = 0; d < 3; d++) {
            ['13:30', '16:45', '19:30', '21:50'].forEach((time) => {
                const [h, m] = time.split(':').map(Number);
                const startTime = new Date(today);
                startTime.setDate(today.getDate() + d);
                startTime.setHours(h, m, 0, 0);
                const endTime = new Date(startTime.getTime() + movie.duration * 60 * 1000);

                showtimeDocs.push({
                    movie: movie._id,
                    cinema: cinema._id,
                    screen: screen._id,
                    startTime,
                    endTime,
                    seats: screen.seats.map((seat) => ({
                        seatId: `${seat.row}${seat.number}`,
                        status: 'available',
                    })),
                });
            });
        }
    });

    await Showtime.insertMany(showtimeDocs);

    console.log('Seeding snacks...');
    await Snack.insertMany([
        { name: 'Large Popcorn', category: 'popcorn', price: 8.5 },
        { name: 'Small Popcorn', category: 'popcorn', price: 5.5 },
        { name: 'Fountain Soda', category: 'drink', price: 4.5 },
        { name: 'Candy Box', category: 'candy', price: 4.0 },
        { name: 'Popcorn + Soda Combo', category: 'combo', price: 11.0 },
    ]);

    console.log(
        `Seeded: 1 cinema, 1 screen (${screen.seats.length} seats), ${movies.length} movies, ` +
        `${showtimeDocs.length} showtimes, 5 snacks, admin + customer roles, 1 admin user.`
    );

    await disconnectDB();
}

seed().catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
});