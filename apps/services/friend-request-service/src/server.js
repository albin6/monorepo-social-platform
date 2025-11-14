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
const friendRequestRoutes = require('./routes/friendRequest');

const app = express();
const PORT = process.env.PORT || 3005;

// Connect to database and Redis
connectDB();
connectRedis();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/v1', friendRequestRoutes); // Use versioned API routes

app.get('/', (req, res) => {
  res.json({ message: 'Friend Request Service is running!' });
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
  console.log(`Friend Request Service is running on port ${PORT}`);
});

module.exports = app;