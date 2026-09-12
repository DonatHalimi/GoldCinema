require('dotenv').config({
  path: require('path').resolve(__dirname, '../../.env'),
});

const { connectDB } = require('../config/db');

const Movie = require('../models/movie');
const Cinema = require('../models/cinema');
const Screen = require('../models/screen');
const Seat = require('../models/seat');
const Showtime = require('../models/showtime');
const Role = require('../models/role');
const User = require('../models/user');
const Snack = require('../models/snack');
const bcrypt = require('bcryptjs');

function createSlug(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function generateSeats(rows, columns) {
  const seats = [];

  for (let row = 0; row < rows; row++) {
    const rowLetter = String.fromCharCode(65 + row);

    for (let column = 1; column <= columns; column++) {
      let seatType = 'standard';
      let priceMultiplier = 1;

      if (row < 2) {
        seatType = 'recliner';
        priceMultiplier = 1.5;
      } else if (row >= 2 && row < 4 && column % 2 === 0) {
        seatType = 'love-seat';
        priceMultiplier = 1.3;
      } else if (row === 6 && [3, 4, 7, 8].includes(column)) {
        seatType = 'wheelchair';
        priceMultiplier = 1;
      } else if (row === 7 && [2, 3, 8, 9].includes(column)) {
        seatType = 'wheelchair';
        priceMultiplier = 1;
      }

      seats.push({
        number: String(column),
        row: rowLetter,
        column,
        type: seatType,
        status: 'active',
        priceMultiplier,
      });
    }
  }

  return seats;
}

function logSeatTypes(seats) {
  const counts = seats.reduce((acc, seat) => {
    acc[seat.type] = (acc[seat.type] || 0) + 1;
    return acc;
  }, {});

  console.log('📊 Seat Types Summary:');
  console.log(`  • Standard: ${counts['standard'] || 0} seats`);
  console.log(`  • Recliner: ${counts['recliner'] || 0} seats`);
  console.log(`  • Love Seats: ${counts['love-seat'] || 0} seats`);
  console.log(`  • Wheelchair: ${counts['wheelchair'] || 0} seats`);
  console.log(`  ─────────────────`);
  console.log(`  • Total: ${seats.length} seats`);
}

// ==============================
// MOVIE DATA
// ==============================
const MOVIES = [
  {
    title: 'The Shawshank Redemption',
    genres: ['Drama'],
    duration: 142,
    description:
      'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.',
    posterUrl: 'https://image.tmdb.org/t/p/original/9cqNxx0GxF0bflZmeSMuL5tnGzr.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=6hB3S9bIaco',
    rating: 'R',
    releaseDate: new Date('1994-10-14'),
    price: 12.5,
    active: true,
  },
  {
    title: 'The Godfather',
    genres: ['Crime', 'Drama'],
    duration: 175,
    description:
      'The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.',
    posterUrl: 'https://image.tmdb.org/t/p/original/3bhkrj58Vtu7enYsRolD1fZdja1.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=sY1S34973zA',
    rating: 'R',
    releaseDate: new Date('1972-03-24'),
    price: 13,
    active: true,
  },
  {
    title: 'The Dark Knight',
    genres: ['Action', 'Crime', 'Drama'],
    duration: 152,
    description:
      'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
    posterUrl: 'https://image.tmdb.org/t/p/original/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=EXeTwQWrcwY',
    rating: 'PG-13',
    releaseDate: new Date('2008-07-18'),
    price: 14,
    active: true,
  },
  {
    title: 'The Godfather Part II',
    genres: ['Crime', 'Drama'],
    duration: 202,
    description:
      'The early life and career of Vito Corleone in 1920s New York City is portrayed, while his son, Michael, expands and tightens his grip on the family crime syndicate.',
    posterUrl: 'https://image.tmdb.org/t/p/original/sSuQTCZwqKrNBNIsksO9IAUoWP9.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=9O1Iy9od7-A',
    rating: 'R',
    releaseDate: new Date('1974-12-20'),
    price: 13,
    active: true,
  },
  {
    title: 'The Lord of the Rings: The Return of the King',
    genres: ['Adventure', 'Drama', 'Fantasy'],
    duration: 201,
    description:
      'Gandalf and Aragorn lead the World of Men against Sauron\'s army to draw his gaze from Frodo and Sam as they approach Mount Doom with the One Ring.',
    posterUrl: 'https://image.tmdb.org/t/p/original/rCzpDGLbOoPwLjy3OAm5NUPOTrC.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=r5X-hFf6Bwo',
    rating: 'PG-13',
    releaseDate: new Date('2003-12-17'),
    price: 14.5,
    active: true,
  },
  {
    title: '12 Angry Men',
    genres: ['Crime', 'Drama'],
    duration: 96,
    description:
      'A jury holdout attempts to prevent a miscarriage of justice by forcing his colleagues to reconsider the evidence.',
    posterUrl: 'https://image.tmdb.org/t/p/original/ow3wq89wM8qd5X7hWKxiRfsFf9C.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=A7CBKT0PWFA',
    rating: 'PG',
    releaseDate: new Date('1957-04-13'),
    price: 10,
    active: true,
  },
  {
    title: 'Schindler\'s List',
    genres: ['Biography', 'Drama', 'History'],
    duration: 195,
    description:
      'In German-occupied Poland during World War II, industrialist Oskar Schindler gradually becomes concerned for his Jewish workforce after witnessing their persecution by the Nazis.',
    posterUrl: 'https://image.tmdb.org/t/p/original/xx4JCtIkUj31PJbPFRLhuBc1PRl.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=gG22XNhtnoY',
    rating: 'R',
    releaseDate: new Date('1993-12-15'),
    price: 12,
    active: true,
  },
  {
    title: 'The Lord of the Rings: The Fellowship of the Ring',
    genres: ['Adventure', 'Drama', 'Fantasy'],
    duration: 178,
    description:
      'A meek Hobbit from the Shire and eight companions set out on a journey to destroy the powerful One Ring and save Middle-earth from the Dark Lord Sauron.',
    posterUrl: 'https://image.tmdb.org/t/p/original/6oom5QYQ2yQTMJIbnvbkBL9cHo6.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=V75dMMIW2B4',
    rating: 'PG-13',
    releaseDate: new Date('2001-12-19'),
    price: 14,
    active: true,
  },
  {
    title: 'Pulp Fiction',
    genres: ['Crime', 'Drama'],
    duration: 154,
    description:
      'The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.',
    posterUrl: 'https://image.tmdb.org/t/p/original/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=s7EdQ4FqbhY',
    rating: 'R',
    releaseDate: new Date('1994-10-14'),
    price: 12.5,
    active: true,
  },
  {
    title: 'The Good, the Bad and the Ugly',
    genres: ['Western'],
    duration: 161,
    description:
      'A bounty hunting scam joins two men in an uneasy alliance against a third in a race to find a fortune in gold buried in a remote cemetery.',
    posterUrl: 'https://image.tmdb.org/t/p/original/dMshyKGA67Q55G1kdxH92fBda1.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=WCN5JJY_wiA',
    rating: 'R',
    releaseDate: new Date('1966-12-23'),
    price: 11,
    active: true,
  },
];

// ==============================
// SHOWTIME CONFIGURATION
// ==============================
const SHOWTIMES_CONFIG = {
  times: ['12:00', '15:00', '18:00', '21:00'],
  startDate: new Date('2026-10-01'),
  daysToGenerate: 30,
  maxShowtimesPerMovie: 10,
};

// ==============================
// SEED FUNCTION
// ==============================
async function seed() {
  try {
    await connectDB();

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
      console.log('⚠️  Database already seeded. Skipping seed.');
      process.exit(0);
    }

    console.log('\n🚀 Starting database seed...\n');

    // ==============================
    // 1. CREATE MOVIES
    // ==============================
    console.log('📽️  Creating movies...');
    const movies = await Movie.insertMany(
      MOVIES.map((movie) => ({
        ...movie,
        slug: createSlug(movie.title),
      }))
    );
    console.log(`  ✅ ${movies.length} movies created\n`);

    // ==============================
    // 2. CREATE ROLES
    // ==============================
    console.log('👤 Creating roles...');
    const roles = await Role.insertMany([
      { name: 'admin', description: 'Administrator role' },
      { name: 'customer', description: 'Cinema customer role' },
    ]);
    const adminRole = roles.find((role) => role.name === 'admin');
    const customerRole = roles.find((role) => role.name === 'customer');
    console.log(`  ✅ ${roles.length} roles created\n`);

    // ==============================
    // 3. CREATE USERS
    // ==============================
    console.log('👥 Creating users...');
    const passwordHash = await bcrypt.hash('Donathalimi1', 10);
    await User.insertMany([
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
    console.log(`  ✅ 2 users created\n`);

    // ==============================
    // 4. CREATE CINEMA
    // ==============================
    console.log('🏢 Creating cinema...');
    const cinema = await Cinema.create({
      name: 'GoldCinema Pristina',
      location: {
        city: 'Pristina',
        country: 'Kosovo',
        address: 'Main Street 1',
      },
      screens: [],
    });
    console.log(`  ✅ Cinema "${cinema.name}" created\n`);

    // ==============================
    // 5. CREATE SCREEN AND SEATS
    // ==============================
    console.log('💺 Creating screen and seats...');
    const seatsData = generateSeats(8, 10);
    const createdSeats = await Seat.insertMany(seatsData);
    const seatIds = createdSeats.map((s) => s._id);

    const screen = await Screen.create({
      cinema: cinema._id,
      name: 'Screen 1',
      rows: 8,
      columns: 10,
      seats: seatIds,
    });

    await Seat.updateMany(
      { _id: { $in: seatIds } },
      { $set: { screen: screen._id } }
    );

    logSeatTypes(seatsData);
    console.log(`  ✅ Screen "${screen.name}" created\n`);

    // ==============================
    // 6. CREATE SHOWTIMES
    // ==============================
    console.log('🎬 Creating showtimes...');
    const showtimes = [];
    const { times, startDate, daysToGenerate, maxShowtimesPerMovie } =
      SHOWTIMES_CONFIG;

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
            seats: createdSeats.map((seat) => ({
              seatId: `${seat.row}${seat.number}`,
              status: 'available',
            })),
          });

          count++;
        }
      }
    });

    await Showtime.insertMany(showtimes);
    console.log(`  ✅ ${showtimes.length} showtimes created\n`);

    // ==============================
    // 7. SEED COMPLETE
    // ==============================
    console.log('✨ Database seeded successfully! ✨\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

seed();