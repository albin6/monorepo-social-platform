// src/server.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');
require('dotenv').config();

// Import database and Redis connection
const connectDB = require('./config/db');
const { connectRedis } = require('./config/redis');

// Import routes
const userProfileRoutes = require('./routes/userProfile');

const app = express();
const PORT = process.env.PORT || 3002;

// Connect to database and Redis
connectDB();
connectRedis();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/v1', userProfileRoutes); // Use versioned API routes

app.get('/', (req, res) => {
  res.json({ message: 'User Profile Service is running!' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`User Profile Service is running on port ${PORT}`);
});

module.exports = app;