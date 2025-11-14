// src/config/redis.js
const redis = require('redis');

// Create Redis client
const redisClient = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

// Handle Redis connection errors
redisClient.on('error', (err) => {
  console.error('Notification Service - Redis Client Error:', err);
});

redisClient.on('connect', () => {
  console.log('Notification Service - Redis Client Connected');
});

// Connect to Redis
const connectRedis = async () => {
  try {
    await redisClient.connect();
    console.log('Notification Service - Connected to Redis successfully');
  } catch (error) {
    console.error('Notification Service - Failed to connect to Redis:', error);
    process.exit(1);
  }
};

// Redis utility functions for notification service
const redisUtils = {
  // Store user's WebSocket connection
  storeUserConnection: async (userId, socketId) => {
    try {
      await redisClient.setEx(`user:notification:socket:${userId}`, 3600, socketId); // 1 hour expiry
    } catch (error) {
      console.error('Error storing user connection:', error);
    }
  },

  // Get user's WebSocket connection
  getUserConnection: async (userId) => {
    try {
      return await redisClient.get(`user:notification:socket:${userId}`);
    } catch (error) {
      console.error('Error getting user connection:', error);
      return null;
    }
  },

  // Remove user's connection
  removeUserConnection: async (userId) => {
    try {
      await redisClient.del(`user:notification:socket:${userId}`);
    } catch (error) {
      console.error('Error removing user connection:', error);
    }
  },

  // Cache user's notifications
  cacheUserNotifications: async (userId, notifications, ttl = 300) => { // 5 minutes
    try {
      await redisClient.setEx(`user:notifications:${userId}`, ttl, JSON.stringify(notifications));
    } catch (error) {
      console.error('Error caching user notifications:', error);
    }
  },

  // Get cached user notifications
  getCachedUserNotifications: async (userId) => {
    try {
      const cachedNotifications = await redisClient.get(`user:notifications:${userId}`);
      return cachedNotifications ? JSON.parse(cachedNotifications) : null;
    } catch (error) {
      console.error('Error getting cached user notifications:', error);
      return null;
    }
  },

  // Delete cached user notifications (when new notifications arrive)
  deleteCachedUserNotifications: async (userId) => {
    try {
      await redisClient.del(`user:notifications:${userId}`);
    } catch (error) {
      console.error('Error deleting cached user notifications:', error);
    }
  },

  // Cache user's unread notification count
  cacheUnreadCount: async (userId, count, ttl = 120) => { // 2 minutes
    try {
      await redisClient.setEx(`user:notifications:unread:${userId}`, ttl, count.toString());
    } catch (error) {
      console.error('Error caching unread count:', error);
    }
  },

  // Get cached unread notification count
  getCachedUnreadCount: async (userId) => {
    try {
      const count = await redisClient.get(`user:notifications:unread:${userId}`);
      return count ? parseInt(count) : 0;
    } catch (error) {
      console.error('Error getting cached unread count:', error);
      return 0;
    }
  },

  // Delete cached unread count
  deleteCachedUnreadCount: async (userId) => {
    try {
      await redisClient.del(`user:notifications:unread:${userId}`);
    } catch (error) {
      console.error('Error deleting cached unread count:', error);
    }
  },

  // Mark notification as delivered in Redis
  markNotificationDelivered: async (userId, notificationId) => {
    try {
      await redisClient.setEx(`notification:delivered:${userId}:${notificationId}`, 86400, '1'); // 24 hours
    } catch (error) {
      console.error('Error marking notification as delivered:', error);
    }
  },

  // Mark notification as seen in Redis
  markNotificationSeen: async (userId, notificationId) => {
    try {
      await redisClient.setEx(`notification:seen:${userId}:${notificationId}`, 86400, '1'); // 24 hours
    } catch (error) {
      console.error('Error marking notification as seen:', error);
    }
  },

  // Mark notification as read in Redis
  markNotificationRead: async (userId, notificationId) => {
    try {
      await redisClient.setEx(`notification:read:${userId}:${notificationId}`, 86400, '1'); // 24 hours
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  },

  // Add notification to user's real-time notification queue
  queueRealTimeNotification: async (userId, notification, ttl = 300) => {
    try {
      const key = `user:realtime_notifications:${userId}`;
      const notifications = await redisClient.get(key) || '[]';
      const notificationList = JSON.parse(notifications);
      notificationList.push({ ...notification, queuedAt: Date.now() });
      
      // Keep only last 50 notifications in queue
      if (notificationList.length > 50) {
        notificationList = notificationList.slice(-50);
      }
      
      await redisClient.setEx(key, ttl, JSON.stringify(notificationList));
    } catch (error) {
      console.error('Error queuing real-time notification:', error);
    }
  },

  // Get and clear real-time notifications for user
  getAndClearRealTimeNotifications: async (userId) => {
    try {
      const key = `user:realtime_notifications:${userId}`;
      const notifications = await redisClient.get(key);
      if (notifications) {
        await redisClient.del(key); // Clear the queue after retrieval
        return JSON.parse(notifications);
      }
      return [];
    } catch (error) {
      console.error('Error getting real-time notifications:', error);
      return [];
    }
  },

  // Add to user's notification feed (recent notifications list)
  addToNotificationFeed: async (userId, notification, limit = 100) => {
    try {
      const key = `user:notification_feed:${userId}`;
      // Add to list (right side)
      await redisClient.rPush(key, JSON.stringify(notification));
      
      // Keep only the last 'limit' notifications
      await redisClient.lTrim(key, -limit, -1);
      
      // Set expiration
      await redisClient.expire(key, 86400); // 24 hours
    } catch (error) {
      console.error('Error adding to notification feed:', error);
    }
  },

  // Get user's notification feed
  getNotificationFeed: async (userId) => {
    try {
      const key = `user:notification_feed:${userId}`;
      const notifications = await redisClient.lRange(key, 0, -1);
      return notifications.map(n => JSON.parse(n));
    } catch (error) {
      console.error('Error getting notification feed:', error);
      return [];
    }
  }
};

module.exports = {
  redisClient,
  connectRedis,
  redisUtils
};