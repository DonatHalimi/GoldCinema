require('dotenv').config();
const app = require('./src/app');
const { connectDB } = require('./src/config/db');
const { seedDefaultEmailTemplates } = require('./src/services/emailTemplateService');
const { seedConcessions } = require('./src/services/concessions');

const PORT = process.env.PORT || 4000;

async function start() {
  try {
    await connectDB();
    await seedDefaultEmailTemplates();
    await seedConcessions();
  } catch (err) {
    console.error('Failed to initialize the database. Is MongoDB running and is MONGO_URI set correctly?', err.message);
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`GoldCinema API listening on http://localhost:${PORT}`);
  });
}

start();