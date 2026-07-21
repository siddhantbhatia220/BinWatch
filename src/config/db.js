const mongoose = require('mongoose');

const connectDB = async () => {
    // Check if we already have an active connection (useful for serverless / Vercel cold restarts)
    if (mongoose.connection.readyState >= 1) {
        return;
    }

    const uri = process.env.MONGO_URI;
    if (!uri) {
        throw new Error('MongoDB connection error: MONGO_URI is not defined in environment variables.');
    }

    try {
        await mongoose.connect(uri);
        console.log('MongoDB Connected successfully.');
    } catch (err) {
        console.error('MongoDB connection error:', err);
        throw err;
    }
};

module.exports = connectDB;
