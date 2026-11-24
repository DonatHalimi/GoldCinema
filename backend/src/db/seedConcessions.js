require('dotenv').config({
    path: require('path').resolve(__dirname, '../../.env'),
});

const { connectDB, disconnectDB } = require('../config/db');
const { seedConcessions } = require('../services/concessions');

async function seed() {
    let connected = false;
    try {
        await connectDB();
        connected = true;
        const count = await seedConcessions();
        console.log(`Concession catalog seeded (${count} defaults checked; existing products preserved).`);
    } catch (error) {
        console.error('Concession catalog seed failed:', error);
        process.exitCode = 1;
    } finally {
        if (connected) await disconnectDB();
    }
}

seed();