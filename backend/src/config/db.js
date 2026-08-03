const mongoose = require('mongoose');

async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log(
            `MongoDB connected: ${mongoose.connection.host}`
        );

    } catch (error) {
        console.error(
            "MongoDB connection error:",
            error.message
        );

        throw error;
    }
}


async function disconnectDB() {
    await mongoose.connection.close();
    console.log("MongoDB disconnected");
}


module.exports = { connectDB, disconnectDB };