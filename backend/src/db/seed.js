require('dotenv').config({
  path: require('path').resolve(__dirname, '../../.env'),
});

const { connectDB } = require('../config/db');

const Movie = require('../models/Movie');
const Cinema = require('../models/Cinema');
const Screen = require('../models/Screen');
const Showtime = require('../models/Showtime');
const Role = require('../models/Role');
const User = require('../models/User');
const Snack = require('../models/Snack');
const bcrypt = require('bcryptjs');

function createSlug(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}


async function seed() {
  try {
    await connectDB();


    // Check if database already has data
    const [
      moviesCount,
      cinemaCount,
      screenCount,
      showtimeCount,
      rolesCount,
      usersCount,
      snacksCount,
    ] = await Promise.all([
      Movie.countDocuments(),
      Cinema.countDocuments(),
      Screen.countDocuments(),
      Showtime.countDocuments(),
      Role.countDocuments(),
      User.countDocuments(),
      Snack.countDocuments(),
    ]);


    if (
      moviesCount ||
      cinemaCount ||
      screenCount ||
      showtimeCount ||
      rolesCount ||
      usersCount ||
      snacksCount
    ) {
      console.log('Database already seeded. Skipping seed.');
      process.exit(0);
    }

    // ======================
    // MOVIES
    // ======================

    // ======================
    // MOVIES
    // ======================

    const movies = await Movie.insertMany([
      {
        title: 'Golden Horizon',
        slug: createSlug('Golden Horizon'),
        genres: [
          'Sci-Fi',
          'Adventure'
        ],
        duration: 128,
        description:
          'A crew of deep-space salvagers discovers a derelict ship carrying a secret that could rewrite the future of humanity.',
        posterUrl:
          'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=600&q=80',
        trailerUrl:
          'https://www.youtube.com/watch?v=example1',
        rating: 'PG-13',
        releaseDate: new Date('2026-01-10'),
        price: 12.5,
        active: true,
      },

      {
        title: 'Midnight in Marrakesh',
        slug: createSlug('Midnight in Marrakesh'),
        genres: [
          'Romance',
          'Drama'
        ],
        duration: 110,
        description:
          'Two strangers cross paths in the winding souks of Marrakesh during one unforgettable night.',
        posterUrl:
          'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&q=80',
        trailerUrl:
          'https://www.youtube.com/watch?v=example2',
        rating: 'PG',
        releaseDate: new Date('2026-02-14'),
        price: 11,
        active: true,
      },

      {
        title: 'The Last Reel',
        slug: createSlug('The Last Reel'),
        genres: [
          'Thriller',
          'Mystery'
        ],
        duration: 102,
        description:
          'A retired film projectionist uncovers a decades-old conspiracy hidden inside a lost reel of film.',
        posterUrl:
          'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=600&q=80',
        trailerUrl:
          'https://www.youtube.com/watch?v=example3',
        rating: 'R',
        releaseDate: new Date('2026-03-20'),
        price: 13,
        active: true,
      },

      {
        title: 'Comet Kids',
        slug: createSlug('Comet Kids'),
        genres: [
          'Animation',
          'Family',
          'Adventure'
        ],
        duration: 95,
        description:
          'A group of kids builds a backyard rocket and accidentally befriends a comet on its journey through space.',
        posterUrl:
          'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=600&q=80',
        trailerUrl:
          'https://www.youtube.com/watch?v=example4',
        rating: 'G',
        releaseDate: new Date('2026-04-05'),
        price: 10,
        active: true,
      },
    ]);


    console.log(`${movies.length} movies created`);

    // ======================
    // ROLES
    // ======================

    const roles = await Role.insertMany([
      {
        name: 'admin',
        description: 'Administrator role',
      },
      {
        name: 'customer',
        description: 'Cinema customer role',
      },
    ]);

    const adminRole = roles.find(
      (role) => role.name === 'admin'
    );

    const customerRole = roles.find(
      (role) => role.name === 'customer'
    );


    console.log(`${roles.length} roles created`);

    // ======================
    // USERS
    // ======================

    const passwordHash = await bcrypt.hash(
      'Donathalimi1',
      10
    );


    const users = await User.insertMany([
      {
        name: 'Donat Halimi',
        email: 'donat.halimi03@gmail.com',
        passwordHash,
        role: adminRole._id,
        emailVerified: true,
      },

      {
        name: 'John Customer',
        email: 'customer@goldcinema.com',
        passwordHash,
        role: customerRole._id,
        emailVerified: true,
      },
    ]);


    console.log(`${users.length} users created`);

    // ======================
    // CINEMA
    // ======================

    const cinema = await Cinema.create({
      name: 'GoldCinema Pristina',

      location: {
        city: 'Pristina',
        country: 'Kosovo',
        address: 'Main Street 1',
      },

      screens: [],
    });


    console.log('Cinema created');

    // ======================
    // SCREEN + SEATS
    // ======================

    const seats = [];

    for (let row = 0; row < 8; row++) {
      const rowLetter = String.fromCharCode(65 + row);

      for (let column = 1; column <= 10; column++) {
        seats.push({
          number: String(column),
          row: rowLetter,
          column,
          type: 'standard',
          status: 'active',
        });
      }
    }


    const screen = await Screen.create({
      cinema: cinema._id,
      name: 'Screen 1',
      rows: 8,
      columns: 10,
      seats,
    });


    console.log(
      `Screen created: ${screen.name} (${screen.rows}x${screen.columns})`
    );

    console.log(
      `${screen.seats.length} seats created`
    );

    // ======================
    // SHOWTIMES
    // ======================

    const showtimes = [];

    const times = [
      '12:00',
      '15:00',
      '18:00',
      '21:00'
    ];


    movies.forEach((movie) => {

      let count = 0;


      for (let day = 0; day < 3 && count < 10; day++) {


        const date = new Date();

        date.setDate(
          date.getDate() + day
        );


        for (const time of times) {


          if (count >= 10) break;


          const [hours, minutes] = time.split(':');


          const startTime = new Date(date);

          startTime.setHours(
            Number(hours),
            Number(minutes),
            0,
            0
          );


          const endTime = new Date(startTime);

          endTime.setMinutes(
            endTime.getMinutes() + movie.duration
          );


          const seats = screen.seats.map((seat) => ({
            seatId: `${seat.row}${seat.number}`,
            status: 'available'
          }));


          showtimes.push({

            movie: movie._id,

            cinema: cinema._id,

            screen: screen._id,

            startTime,

            endTime,

            seats

          });


          count++;

        }

      }

    });


    await Showtime.insertMany(showtimes);


    console.log(
      `${showtimes.length} showtimes created`
    );

    console.log('✅ Database seeded successfully');

    process.exit(0);



  } catch (error) {

    console.error(error);

    process.exit(1);

  }
}



seed();