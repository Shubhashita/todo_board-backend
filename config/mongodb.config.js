const mongoose = require("mongoose");

const mongoDBConfig = async () => {
  try {
    // Get MongoDB URI from environment variable or use fallback
    const mongoURI = process.env.MONGO_URL;
    if (!mongoURI) {
      throw new Error("MONGO_URL is NOT defined in environment variables!");
    }
    const maskedURI = mongoURI.replace(/:([^@]+)@/, ":****@");
    console.log(`Connecting to MongoDB: ${maskedURI}`);

    // Connection options for better reliability
    const options = {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    };

    const conn = await mongoose.connect(mongoURI, options);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database: ${conn.connection.name}`);
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    process.exit(1);
  }
};

module.exports = mongoDBConfig;
