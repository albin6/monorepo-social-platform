// src/config/redis.js
const redis = require('redis');

// Create Redis client
const redisClient = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

// Handle Redis connection errors
redisClient.on('error', (err) => {
  console.error('Friend Request Service - Redis Client Error:', err);
});

redisClient.on('connect', () => {
  console.log('Friend Request Service - Redis Client Connected');
});

// Connect to Redis
const connectRedis = async () => {
  try {
    await redisClient.connect();
    console.log('Friend Request Service - Connected to Redis successfully');
  } catch (error) {
    console.error('Friend Request Service - Failed to connect to Redis:', error);
    process.exit(1);
  }
};

// Redis utility functions for friend request service
const redisUtils = {
  // Cache friend request count for a user
  cacheFriendRequestCount: async (userId, count, ttl = 300) => {
    try {
      await redisClient.setEx(`user:friend_requests:count:${userId}`, ttl, count.toString());
    } catch (error) {
      console.error('Error caching friend request count:', error);
    }
  },

  // Get cached friend request count
  getCachedFriendRequestCount: async (userId) => {
    try {
      const count = await redisClient.get(`user:friend_requests:count:${userId}`);
      return count ? parseInt(count) : 0;
    } catch (error) {
      console.error('Error getting cached friend request count:', error);
      return 0;
    }
  },

  // Cache friend list for a user
  cacheFriendList: async (userId, friendList, ttl = 600) => {
    try {
      await redisClient.setEx(`user:friends:${userId}`, ttl, JSON.stringify(friendList));
    } catch (error) {
      console.error('Error caching friend list:', error);
    }
  },

  // Get cached friend list
  getCachedFriendList: async (userId) => {
    try {
      const friends = await redisClient.get(`user:friends:${userId}`);
      return friends ? JSON.parse(friends) : [];
    } catch (error) {
      console.error('Error getting cached friend list:', error);
      return [];
    }
  },

  // Delete cached friend list (when friend list changes)
  deleteCachedFriendList: async (userId) => {
    try {
      await redisClient.del(`user:friends:${userId}`);
    } catch (error) {
      console.error('Error deleting cached friend list:', error);
    }
  },

  // Cache recent friend requests for a user
  cacheRecentFriendRequests: async (userId, requests, ttl = 300) => {
    try {
      await redisClient.setEx(`user:recent_requests:${userId}`, ttl, JSON.stringify(requests));
    } catch (error) {
      console.error('Error caching recent friend requests:', error);
    }
  },

  // Get cached recent friend requests
  getCachedRecentFriendRequests: async (userId) => {
    try {
      const requests = await redisClient.get(`user:recent_requests:${userId}`);
      return requests ? JSON.parse(requests) : [];
    } catch (error) {
      console.error('Error getting cached recent friend requests:', error);
      return [];
    }
  },

  // Delete cached recent friend requests
  deleteCachedRecentFriendRequests: async (userId) => {
    try {
      await redisClient.del(`user:recent_requests:${userId}`);
    } catch (error) {
      console.error('Error deleting cached recent friend requests:', error);
    }
  },

  // Set friend online status in Redis
  setFriendOnlineStatus: async (userId, friendId, isOnline = true) => {
    try {
      const key = `friend:online:${userId}:${friendId}`;
      if (isOnline) {
        await redisClient.setEx(key, 300, 'online'); // 5 minutes
      } else {
        await redisClient.del(key);
      }
    } catch (error) {
      console.error('Error setting friend online status:', error);
    }
  },

  // Get friend online statuses for a user
  getFriendOnlineStatuses: async (userId) => {
    try {
      const keys = await redisClient.keys(`friend:online:${userId}:*`);
      const friendIds = keys.map(key => key.split(':')[3]); // Extract friend ID from key
      return friendIds;
    } catch (error) {
      console.error('Error getting friend online statuses:', error);
      return [];
    }
  }
};

module.exports = {
  redisClient,
  connectRedis,
  redisUtils
};