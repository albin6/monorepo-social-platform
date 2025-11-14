// src/config/redis.js
const redis = require('redis');

// Create Redis client
const redisClient = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

// Handle Redis connection errors
redisClient.on('error', (err) => {
  console.error('Chat Service - Redis Client Error:', err);
});

redisClient.on('connect', () => {
  console.log('Chat Service - Redis Client Connected');
});

// Connect to Redis
const connectRedis = async () => {
  try {
    await redisClient.connect();
    console.log('Chat Service - Connected to Redis successfully');
  } catch (error) {
    console.error('Chat Service - Failed to connect to Redis:', error);
    process.exit(1);
  }
};

// Redis utility functions for chat service
const redisUtils = {
  // Store WebSocket connections
  storeConnection: async (userId, socketId) => {
    try {
      await redisClient.setEx(`user:socket:${userId}`, 3600, socketId); // 1 hour expiry
    } catch (error) {
      console.error('Error storing connection:', error);
    }
  },

  // Get user's socket ID
  getUserSocketId: async (userId) => {
    try {
      return await redisClient.get(`user:socket:${userId}`);
    } catch (error) {
      console.error('Error getting user socket ID:', error);
      return null;
    }
  },

  // Remove user's socket connection
  removeConnection: async (userId) => {
    try {
      await redisClient.del(`user:socket:${userId}`);
    } catch (error) {
      console.error('Error removing connection:', error);
    }
  },

  // Mark message as delivered
  markMessageDelivered: async (userId, messageId) => {
    try {
      await redisClient.setEx(`msg:delivered:${userId}:${messageId}`, 86400, '1'); // 24 hours
    } catch (error) {
      console.error('Error marking message as delivered:', error);
    }
  },

  // Mark message as read
  markMessageRead: async (userId, messageId) => {
    try {
      await redisClient.setEx(`msg:read:${userId}:${messageId}`, 86400, '1'); // 24 hours
    } catch (error) {
      console.error('Error marking message as read:', error);
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

  // Cache chat list for user
  cacheUserChats: async (userId, chats, ttl = 600) => {
    try {
      await redisClient.setEx(`user:chats:${userId}`, ttl, JSON.stringify(chats));
    } catch (error) {
      console.error('Error caching user chats:', error);
    }
  },

  // Get cached chat list for user
  getCachedUserChats: async (userId) => {
    try {
      const cachedChats = await redisClient.get(`user:chats:${userId}`);
      return cachedChats ? JSON.parse(cachedChats) : null;
    } catch (error) {
      console.error('Error getting cached user chats:', error);
      return null;
    }
  },

  // Delete cached chat list for user
  deleteCachedUserChats: async (userId) => {
    try {
      await redisClient.del(`user:chats:${userId}`);
    } catch (error) {
      console.error('Error deleting cached user chats:', error);
    }
  },

  // Cache chat messages
  cacheChatMessages: async (chatId, messages, ttl = 600) => {
    try {
      await redisClient.setEx(`chat:messages:${chatId}`, ttl, JSON.stringify(messages));
    } catch (error) {
      console.error('Error caching chat messages:', error);
    }
  },

  // Get cached chat messages
  getCachedChatMessages: async (chatId) => {
    try {
      const cachedMessages = await redisClient.get(`chat:messages:${chatId}`);
      return cachedMessages ? JSON.parse(cachedMessages) : null;
    } catch (error) {
      console.error('Error getting cached chat messages:', error);
      return null;
    }
  },

  // Add message to cached chat messages
  addMessageToCache: async (chatId, message) => {
    try {
      const key = `chat:messages:${chatId}`;
      const existingMessages = await redisUtils.getCachedChatMessages(chatId);
      
      if (existingMessages) {
        existingMessages.push(message);
        // Keep only last 50 messages in cache
        const recentMessages = existingMessages.slice(-50);
        await redisClient.setEx(key, 600, JSON.stringify(recentMessages));
      }
    } catch (error) {
      console.error('Error adding message to cache:', error);
    }
  },

  // Set user online status
  setUserOnline: async (userId, socketId, ttl = 300) => {
    try {
      await redisClient.setEx(`user:online:${userId}`, ttl, socketId);
    } catch (error) {
      console.error('Error setting user online status:', error);
    }
  },

  // Set user offline status
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
      const socketId = await redisClient.get(`user:online:${userId}`);
      return !!socketId;
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

  // Store notification queue for offline users
  storeNotification: async (userId, notification, ttl = 86400) => { // 24 hours
    try {
      const key = `notifications:${userId}`;
      const notifications = await redisClient.get(key) || '[]';
      const notificationList = JSON.parse(notifications);
      notificationList.push({ ...notification, timestamp: Date.now() });
      
      // Keep only last 100 notifications
      if (notificationList.length > 100) {
        notificationList = notificationList.slice(-100);
      }
      
      await redisClient.setEx(key, ttl, JSON.stringify(notificationList));
    } catch (error) {
      console.error('Error storing notification:', error);
    }
  },

  // Get and clear notifications for user
  getAndClearNotifications: async (userId) => {
    try {
      const key = `notifications:${userId}`;
      const notifications = await redisClient.get(key);
      if (notifications) {
        await redisClient.del(key); // Clear the notifications after retrieval
        return JSON.parse(notifications);
      }
      return [];
    } catch (error) {
      console.error('Error getting notifications:', error);
      return [];
    }
  }
};

module.exports = {
  redisClient,
  connectRedis,
  redisUtils
};