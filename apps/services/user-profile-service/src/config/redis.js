// src/config/redis.js
const redis = require('redis');

// Create Redis client
const redisClient = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

// Handle Redis connection errors
redisClient.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

redisClient.on('connect', () => {
  console.log('Redis Client Connected');
});

// Connect to Redis
const connectRedis = async () => {
  try {
    await redisClient.connect();
    console.log('Connected to Redis successfully');
  } catch (error) {
    console.error('Failed to connect to Redis:', error);
    process.exit(1);
  }
};

// Redis utility functions for cache and real-time state tracking
const redisUtils = {
  // Cache user profile data
  cacheUserProfile: async (userId, profileData, ttl = 3600) => {
    try {
      await redisClient.setEx(`user:profile:${userId}`, ttl, JSON.stringify(profileData));
    } catch (error) {
      console.error('Error caching user profile:', error);
    }
  },

  // Get cached user profile
  getCachedUserProfile: async (userId) => {
    try {
      const cachedProfile = await redisClient.get(`user:profile:${userId}`);
      return cachedProfile ? JSON.parse(cachedProfile) : null;
    } catch (error) {
      console.error('Error getting cached user profile:', error);
      return null;
    }
  },

  // Delete cached user profile
  deleteCachedUserProfile: async (userId) => {
    try {
      await redisClient.del(`user:profile:${userId}`);
    } catch (error) {
      console.error('Error deleting cached user profile:', error);
    }
  },

  // Track user online status
  setUserOnline: async (userId, ttl = 300) => { // 5 minutes default
    try {
      await redisClient.setEx(`user:online:${userId}`, ttl, 'online');
    } catch (error) {
      console.error('Error setting user online status:', error);
    }
  },

  // Track user offline status
  setUserOffline: async (userId) => {
    try {
      await redisClient.del(`user:online:${userId}`);
    } catch (error) {
      console.error('Error setting user offline status:', error);
    }
  },

  // Check if user is online
  isUserOnline: async (userId) => {
    try {
      const status = await redisClient.get(`user:online:${userId}`);
      return status === 'online';
    } catch (error) {
      console.error('Error checking user online status:', error);
      return false;
    }
  },

  // Get all online users
  getAllOnlineUsers: async () => {
    try {
      const keys = await redisClient.keys('user:online:*');
      const userIds = keys.map(key => key.split(':')[2]); // Extract user ID from key
      return userIds;
    } catch (error) {
      console.error('Error getting all online users:', error);
      return [];
    }
  },

  // Set typing indicator
  setTypingStatus: async (userId, chatId, isTyping = true, ttl = 10) => {
    try {
      const key = `typing:${chatId}:${userId}`;
      if (isTyping) {
        await redisClient.setEx(key, ttl, 'typing');
      } else {
        await redisClient.del(key);
      }
    } catch (error) {
      console.error('Error setting typing status:', error);
    }
  },

  // Get typing users in a chat
  getTypingUsers: async (chatId) => {
    try {
      const keys = await redisClient.keys(`typing:${chatId}:*`);
      const userIds = keys.map(key => key.split(':')[2]); // Extract user ID from key
      return userIds;
    } catch (error) {
      console.error('Error getting typing users:', error);
      return [];
    }
  },

  // Cache user discovery search results
  cacheDiscoveryResults: async (searchKey, results, ttl = 600) => {
    try {
      await redisClient.setEx(`discovery:${searchKey}`, ttl, JSON.stringify(results));
    } catch (error) {
      console.error('Error caching discovery results:', error);
    }
  },

  // Get cached discovery results
  getCachedDiscoveryResults: async (searchKey) => {
    try {
      const cachedResults = await redisClient.get(`discovery:${searchKey}`);
      return cachedResults ? JSON.parse(cachedResults) : null;
    } catch (error) {
      console.error('Error getting cached discovery results:', error);
      return null;
    }
  }
};

module.exports = {
  redisClient,
  connectRedis,
  redisUtils
};