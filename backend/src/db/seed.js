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
const Staff = require('../models/staff');
const Shift = require('../models/shift');
const ScreenConfiguration = require('../models/screenConfiguration');
const Equipment = require('../models/equipment');
const MaintenanceLog = require('../models/maintenanceLog');
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

const SHOWTIMES_CONFIG = {
  times: ['12:00', '15:00', '18:00', '21:00'],
  startDate: new Date('2026-10-01'),
  daysToGenerate: 30,
  maxShowtimesPerMovie: 10,
};

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
      staffCount,
      shiftsCount,
      screenConfigCount,
      equipmentCount,
      maintenanceLogCount,
    ] = await Promise.all([
      Movie.countDocuments(),
      Cinema.countDocuments(),
      Screen.countDocuments(),
      Showtime.countDocuments(),
      Role.countDocuments(),
      User.countDocuments(),
      Snack.countDocuments(),
      Staff.countDocuments(),
      Shift.countDocuments(),
      ScreenConfiguration.countDocuments(),
      Equipment.countDocuments(),
      MaintenanceLog.countDocuments(),
    ]);

    if (
      moviesCount ||
      cinemaCount ||
      screenCount ||
      showtimeCount ||
      rolesCount ||
      usersCount ||
      snacksCount ||
      staffCount ||
      shiftsCount ||
      screenConfigCount ||
      equipmentCount ||
      maintenanceLogCount
    ) {
      console.log('⚠️  Database already seeded. Skipping seed.');
      process.exit(0);
    }

    console.log('\n🚀 Starting database seed...\n');

    console.log('📽️  Creating movies...');
    const movies = await Movie.insertMany(
      MOVIES.map((movie) => ({
        ...movie,
        slug: createSlug(movie.title),
      }))
    );
    console.log(`  ✅ ${movies.length} movies created\n`);

    console.log('👤 Creating roles...');
    const roles = await Role.insertMany([
      { name: 'admin', description: 'Administrator role' },
      { name: 'customer', description: 'Cinema customer role' },
    ]);
    const adminRole = roles.find((role) => role.name === 'admin');
    const customerRole = roles.find((role) => role.name === 'customer');
    console.log(`  ✅ ${roles.length} roles created\n`);

    console.log('👥 Creating users...');
    const passwordHash = await bcrypt.hash('Donathalimi1', 10);
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
      {
        name: 'Sarah Manager',
        email: 'manager@goldcinema.com',
        passwordHash,
        role: adminRole._id,
        emailVerified: true,
      },
      {
        name: 'Mike Usher',
        email: 'usher@goldcinema.com',
        passwordHash,
        role: customerRole._id,
        emailVerified: true,
      },
      {
        name: 'Lisa Cashier',
        email: 'cashier@goldcinema.com',
        passwordHash,
        role: customerRole._id,
        emailVerified: true,
      },
      {
        name: 'Tom Projectionist',
        email: 'projectionist@goldcinema.com',
        passwordHash,
        role: customerRole._id,
        emailVerified: true,
      },
    ]);
    console.log(`  ✅ ${users.length} users created\n`);

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

    console.log('⚙️  Creating screen configuration...');
    const screenConfig = await ScreenConfiguration.create({
      screen: screen._id,
      screenType: 'standard',
      soundSystem: 'Dolby Atmos',
      projectorType: '4K Laser',
      screenWidth: 12.5,
      screenHeight: 5.5,
      has3D: true,
      hasHFR: true,
      notes: 'Primary screen — supports 3D and high frame rate content.',
    });
    console.log(`  ✅ Screen configuration created (${screenConfig.screenType})\n`);

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

    console.log('🧑‍💼 Creating staff...');
    const adminUser = users[0];
    const managerUser = users[2];
    const usherUser = users[3];
    const cashierUser = users[4];
    const projectionistUser = users[5];

    const staffMembers = await Staff.insertMany([
      {
        user: adminUser._id,
        employeeId: 'EMP-0001',
        position: 'manager',
        cinema: cinema._id,
        hireDate: new Date('2023-01-15'),
        hourlyRate: 25,
        isActive: true,
        notes: 'Founder and general manager.',
      },
      {
        user: managerUser._id,
        employeeId: 'EMP-0002',
        position: 'manager',
        cinema: cinema._id,
        hireDate: new Date('2023-06-01'),
        hourlyRate: 22,
        isActive: true,
      },
      {
        user: usherUser._id,
        employeeId: 'EMP-0003',
        position: 'usher',
        cinema: cinema._id,
        hireDate: new Date('2024-02-10'),
        hourlyRate: 12,
        isActive: true,
      },
      {
        user: cashierUser._id,
        employeeId: 'EMP-0004',
        position: 'cashier',
        cinema: cinema._id,
        hireDate: new Date('2024-03-20'),
        hourlyRate: 13,
        isActive: true,
      },
      {
        user: projectionistUser._id,
        employeeId: 'EMP-0005',
        position: 'projectionist',
        cinema: cinema._id,
        hireDate: new Date('2023-09-05'),
        hourlyRate: 18,
        isActive: true,
      },
    ]);
    console.log(`  ✅ ${staffMembers.length} staff members created\n`);

    console.log('🗓️  Creating shifts...');
    const today = new Date();
    const shiftsToCreate = [];

    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const day = new Date(today);
      day.setDate(day.getDate() + dayOffset);
      day.setHours(0, 0, 0, 0);

      const morningStart = new Date(day);
      morningStart.setHours(10, 0, 0, 0);
      const morningEnd = new Date(day);
      morningEnd.setHours(16, 0, 0, 0);

      const eveningStart = new Date(day);
      eveningStart.setHours(16, 0, 0, 0);
      const eveningEnd = new Date(day);
      eveningEnd.setHours(23, 0, 0, 0);

      const usher = staffMembers.find((s) => s.position === 'usher');
      const cashier = staffMembers.find((s) => s.position === 'cashier');
      const projectionist = staffMembers.find((s) => s.position === 'projectionist');
      const manager = staffMembers.find((s) => s.position === 'manager');

      shiftsToCreate.push(
        {
          staff: usher._id,
          cinema: cinema._id,
          startTime: morningStart,
          endTime: morningEnd,
          role: 'usher',
          status: 'scheduled',
        },
        {
          staff: cashier._id,
          cinema: cinema._id,
          startTime: morningStart,
          endTime: morningEnd,
          role: 'cashier',
          status: 'scheduled',
        },
        {
          staff: projectionist._id,
          cinema: cinema._id,
          startTime: eveningStart,
          endTime: eveningEnd,
          role: 'projectionist',
          status: 'scheduled',
        },
        {
          staff: manager._id,
          cinema: cinema._id,
          startTime: eveningStart,
          endTime: eveningEnd,
          role: 'manager',
          status: 'scheduled',
        }
      );
    }

    await Shift.insertMany(shiftsToCreate);
    console.log(`  ✅ ${shiftsToCreate.length} shifts created\n`);

    console.log('🛠️  Creating equipment...');
    const equipmentItems = await Equipment.insertMany([
      {
        cinema: cinema._id,
        name: 'Barco DP4K-32B Projector',
        type: 'projector',
        serialNumber: 'BRC-4K-0001',
        purchaseDate: new Date('2023-01-10'),
        warrantyExpiry: new Date('2026-01-10'),
        status: 'operational',
        notes: 'Primary 4K laser projector for Screen 1.',
      },
      {
        cinema: cinema._id,
        name: 'Dolby Atmos Processor',
        type: 'sound',
        serialNumber: 'DOL-ATM-0001',
        purchaseDate: new Date('2023-01-10'),
        warrantyExpiry: new Date('2028-01-10'),
        status: 'operational',
        notes: 'Drives the 64-channel sound system.',
      },
      {
        cinema: cinema._id,
        name: 'HVAC Unit — Hall A',
        type: 'hvac',
        serialNumber: 'HVAC-A-001',
        purchaseDate: new Date('2023-01-10'),
        warrantyExpiry: new Date('2028-01-10'),
        status: 'operational',
      },
      {
        cinema: cinema._id,
        name: 'POS Terminal 1',
        type: 'pos',
        serialNumber: 'POS-0001',
        purchaseDate: new Date('2023-02-15'),
        warrantyExpiry: new Date('2026-02-15'),
        status: 'operational',
        notes: 'Front-desk ticketing terminal.',
      },
      {
        cinema: cinema._id,
        name: 'POS Terminal 2',
        type: 'pos',
        serialNumber: 'POS-0002',
        purchaseDate: new Date('2023-02-15'),
        warrantyExpiry: new Date('2026-02-15'),
        status: 'maintenance',
        notes: 'Card reader intermittently failing — scheduled for inspection.',
      },
      {
        cinema: cinema._id,
        name: 'Emergency Lighting System',
        type: 'lighting',
        serialNumber: 'LGT-EMG-001',
        purchaseDate: new Date('2023-01-10'),
        warrantyExpiry: new Date('2033-01-10'),
        status: 'operational',
      },
    ]);
    console.log(`  ✅ ${equipmentItems.length} equipment items created\n`);

    console.log('📋 Creating maintenance logs...');
    const projector = equipmentItems.find((e) => e.type === 'projector');
    const pos2 = equipmentItems.find((e) => e.serialNumber === 'POS-0002');
    const hvac = equipmentItems.find((e) => e.type === 'hvac');

    const maintenanceLogs = await MaintenanceLog.insertMany([
      {
        equipment: projector._id,
        maintenanceType: 'routine',
        description: 'Cleaned lens and checked cooling fans. Air filter replaced.',
        cost: 45,
        performedBy: 'Barco Certified Technician',
        performedAt: new Date('2024-11-15'),
        nextDueAt: new Date('2025-05-15'),
        notes: 'No issues detected.',
      },
      {
        equipment: projector._id,
        maintenanceType: 'inspection',
        description: 'Laser brightness calibration and color accuracy check.',
        cost: 120,
        performedBy: 'Barco Certified Technician',
        performedAt: new Date('2025-05-20'),
        nextDueAt: new Date('2025-11-20'),
      },
      {
        equipment: pos2._id,
        maintenanceType: 'repair',
        description: 'Card reader module replaced due to intermittent failures.',
        cost: 85,
        performedBy: 'Internal IT',
        performedAt: new Date('2025-09-10'),
        nextDueAt: new Date('2026-03-10'),
        notes: 'Replacement module ordered from vendor.',
      },
      {
        equipment: hvac._id,
        maintenanceType: 'routine',
        description: 'Filter replacement and refrigerant top-up.',
        cost: 200,
        performedBy: 'CoolAir Services',
        performedAt: new Date('2025-08-01'),
        nextDueAt: new Date('2026-02-01'),
      },
    ]);
    console.log(`  ✅ ${maintenanceLogs.length} maintenance logs created\n`);

    console.log('✨ Database seeded successfully! ✨\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

seed();