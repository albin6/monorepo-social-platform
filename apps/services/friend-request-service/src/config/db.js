const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Use the environment variable for MongoDB connection, fallback to local instance
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/social-platform-friend-request';
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('MongoDB connected successfully for Friend Request Service');
  } catch (error) {
    console.error('MongoDB connection error in Friend Request Service:', error);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB;