// tests/setup.js
// Test setup file
const mongoose = require('mongoose');
require('dotenv').config();

// Set up test environment
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/social-platform-test';

// Connect to MongoDB before tests
beforeAll(async () => {
  // In a real setup, you might want to connect to a test database
  // For now, we'll just set up any necessary test prep
});

// Clear database after each test
afterEach(async () => {
  // Clear any test data if needed
  if (mongoose.connection.readyState === 1) {
    // Clear all collections
    for (const collectionName in mongoose.connection.collections) {
      const collection = mongoose.connection.collections[collectionName];
      await collection.deleteMany({});
    }
  }
});

// Close database connection after all tests
afterAll(async () => {
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.close();
  }
});