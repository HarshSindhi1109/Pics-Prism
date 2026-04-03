// db/connection.js
const mongoose = require('mongoose');

const connectDB = async (url) => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1); // Stop the server if DB connection fails
  }
};

module.exports = connectDB;
