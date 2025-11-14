// src/config/redis.js
const redis = require('redis');

// Create Redis client
const redisClient = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

// Handle Redis connection errors
redisClient.on('error', (err) => {
  console.error('OTP Service - Redis Client Error:', err);
});

redisClient.on('connect', () => {
  console.log('OTP Service - Redis Client Connected');
});

// Connect to Redis
const connectRedis = async () => {
  try {
    await redisClient.connect();
    console.log('OTP Service - Connected to Redis successfully');
  } catch (error) {
    console.error('OTP Service - Failed to connect to Redis:', error);
    process.exit(1);
  }
};

// Redis utility functions for OTP service
const redisUtils = {
  // Store OTP with TTL
  storeOTP: async (identifier, otp, ttl = 300) => { // Default 5 minutes
    try {
      await redisClient.setEx(`otp:${identifier}`, ttl, otp);
    } catch (error) {
      console.error('Error storing OTP:', error);
    }
  },

  // Get stored OTP
  getOTP: async (identifier) => {
    try {
      return await redisClient.get(`otp:${identifier}`);
    } catch (error) {
      console.error('Error getting OTP:', error);
      return null;
    }
  },

  // Delete stored OTP
  deleteOTP: async (identifier) => {
    try {
      await redisClient.del(`otp:${identifier}`);
    } catch (error) {
      console.error('Error deleting OTP:', error);
    }
  },

  // Store OTP attempts count
  storeOTPAttempts: async (identifier, attempts, ttl = 900) => { // 15 minutes
    try {
      await redisClient.setEx(`otp_attempts:${identifier}`, ttl, attempts.toString());
    } catch (error) {
      console.error('Error storing OTP attempts:', error);
    }
  },

  // Get OTP attempts count
  getOTPAttempts: async (identifier) => {
    try {
      const attempts = await redisClient.get(`otp_attempts:${identifier}`);
      return attempts ? parseInt(attempts) : 0;
    } catch (error) {
      console.error('Error getting OTP attempts:', error);
      return 0;
    }
  },

  // Delete OTP attempts
  deleteOTPAttempts: async (identifier) => {
    try {
      await redisClient.del(`otp_attempts:${identifier}`);
    } catch (error) {
      console.error('Error deleting OTP attempts:', error);
    }
  },

  // Store OTP cooldown (to prevent spam)
  setOTPCooldown: async (identifier, ttl = 60) => { // 1 minute cooldown
    try {
      await redisClient.setEx(`otp_cooldown:${identifier}`, ttl, '1');
    } catch (error) {
      console.error('Error setting OTP cooldown:', error);
    }
  },

  // Check if identifier is in OTP cooldown
  isInOTPCooldown: async (identifier) => {
    try {
      const cooldown = await redisClient.get(`otp_cooldown:${identifier}`);
      return !!cooldown;
    } catch (error) {
      console.error('Error checking OTP cooldown:', error);
      return false;
    }
  }
};

module.exports = {
  redisClient,
  connectRedis,
  redisUtils
};