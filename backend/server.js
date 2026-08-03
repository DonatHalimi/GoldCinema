require('dotenv').config();
const app = require('./src/app');
const { connectDB } = require('./src/config/db');

const PORT = process.env.PORT || 4000;

async function start() {
  try {
    await connectDB();
  } catch (err) {
    console.error('Failed to connect to MongoDB. Is it running, and is MONGO_URI set correctly?');
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`GoldCinema API listening on http://localhost:${PORT}`);
  });
}

start();