const mongoose = require('mongoose');

let connectionPromise = null;

function connectDB() {
  if (connectionPromise) return connectionPromise;

  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error(
      'MONGO_URI is not set. Add it to your .env file, e.g. mongodb://127.0.0.1:27017/goldcinema'
    );
  }

  mongoose.set('strictQuery', true);

  connectionPromise = mongoose
    .connect(uri, {
      serverSelectionTimeoutMS: 10000,
    })
    .then(() => {
      console.log(`[mongo] Connected to ${maskUri(uri)}`);
      return mongoose.connection;
    })
    .catch((err) => {
      connectionPromise = null;
      console.error('[mongo] Connection error:', err.message);
      throw err;
    });

  mongoose.connection.on('error', (err) => {
    console.error('[mongo] Runtime connection error:', err.message);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('[mongo] Disconnected from MongoDB.');
  });

  return connectionPromise;
}

function maskUri(uri) {
  return uri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@');
}

async function disconnectDB() {
  await mongoose.disconnect();
  connectionPromise = null;
}

module.exports = { connectDB, disconnectDB, mongoose };