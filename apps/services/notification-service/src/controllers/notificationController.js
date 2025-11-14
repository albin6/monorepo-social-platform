const Notification = require('../models/Notification');
const { redisUtils } = require('../config/redis');
const jwt = require('jsonwebtoken');

// Get user's notifications
const getNotifications = async (req, res) => {
  try {
    // Extract user ID from JWT token
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authorization token required' });
    }
    
    const token = authHeader.split(' ')[1];
    
    try {
      const secret = process.env.JWT_SECRET || 'fallback_secret_key';
      const decoded = jwt.verify(token, secret);
      const userId = decoded.userId;
      const { page = 1, limit = 20, type, isRead, isSeen } = req.query;
      
      // Build query to find notifications for the user
      let query = { userId };
      
      if (type) {
        query.type = type;
      }
      
      if (isRead !== undefined) {
        query.isRead = isRead === 'true';
      }
      
      if (isSeen !== undefined) {
        query.isSeen = isSeen === 'true';
      }
      
      // Try to get from cache first
      const cacheKey = `notifications_${userId}_${type || 'all'}_${isRead || 'all'}_${isSeen || 'all'}_${page}_${limit}`;
      let notifications = await redisUtils.getCachedUserNotifications(cacheKey);
      
      if (!notifications) {
        // Calculate skip for pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        // Find notifications
        notifications = await Notification.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit))
          .lean();
        
        // Cache the results
        await redisUtils.cacheUserNotifications(cacheKey, notifications);
      }
      
      // Get total count for pagination
      const total = await Notification.countDocuments(query);
      
      res.json({
        notifications,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      });
    } catch (verifyError) {
      if (verifyError.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired' });
      }
      return res.status(401).json({ message: 'Invalid token' });
    }
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get unread notification count
const getUnreadCount = async (req, res) => {
  try {
    // Extract user ID from JWT token
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authorization token required' });
    }
    
    const token = authHeader.split(' ')[1];
    
    try {
      const secret = process.env.JWT_SECRET || 'fallback_secret_key';
      const decoded = jwt.verify(token, secret);
      const userId = decoded.userId;
      
      // Try to get from cache first
      let count = await redisUtils.getCachedUnreadCount(userId);
      
      if (count === 0) { // If not in cache or expired
        // Get from database
        count = await Notification.countDocuments({
          userId,
          isRead: false
        });
        
        // Cache the count
        await redisUtils.cacheUnreadCount(userId, count);
      }
      
      res.json({ count });
    } catch (verifyError) {
      if (verifyError.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired' });
      }
      return res.status(401).json({ message: 'Invalid token' });
    }
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Mark a notification as read
const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    
    // Extract user ID from JWT token
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authorization token required' });
    }
    
    const token = authHeader.split(' ')[1];
    
    try {
      const secret = process.env.JWT_SECRET || 'fallback_secret_key';
      const decoded = jwt.verify(token, secret);
      const userId = decoded.userId;
      
      // Find and update the notification
      const notification = await Notification.findOne({
        _id: notificationId,
        userId
      });
      
      if (!notification) {
        return res.status(404).json({ message: 'Notification not found' });
      }
      
      notification.isRead = true;
      notification.readAt = new Date();
      await notification.save();
      
      // Update in Redis
      await redisUtils.markNotificationRead(userId, notificationId);
      
      // Clear cached counts
      await redisUtils.deleteCachedUnreadCount(userId);
      
      res.json({ message: 'Notification marked as read', notification });
    } catch (verifyError) {
      if (verifyError.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired' });
      }
      return res.status(401).json({ message: 'Invalid token' });
    }
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Mark all notifications as read
const markAllAsRead = async (req, res) => {
  try {
    // Extract user ID from JWT token
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authorization token required' });
    }
    
    const token = authHeader.split(' ')[1];
    
    try {
      const secret = process.env.JWT_SECRET || 'fallback_secret_key';
      const decoded = jwt.verify(token, secret);
      const userId = decoded.userId;
      
      // Update all unread notifications for the user
      await Notification.updateMany(
        { userId, isRead: false },
        { isRead: true, readAt: new Date() }
      );
      
      // Clear cached counts
      await redisUtils.deleteCachedUnreadCount(userId);
      
      res.json({ message: 'All notifications marked as read' });
    } catch (verifyError) {
      if (verifyError.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired' });
      }
      return res.status(401).json({ message: 'Invalid token' });
    }
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Mark a notification as seen
const markAsSeen = async (req, res) => {
  try {
    const { notificationId } = req.params;
    
    // Extract user ID from JWT token
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authorization token required' });
    }
    
    const token = authHeader.split(' ')[1];
    
    try {
      const secret = process.env.JWT_SECRET || 'fallback_secret_key';
      const decoded = jwt.verify(token, secret);
      const userId = decoded.userId;
      
      // Find and update the notification
      const notification = await Notification.findOne({
        _id: notificationId,
        userId
      });
      
      if (!notification) {
        return res.status(404).json({ message: 'Notification not found' });
      }
      
      notification.isSeen = true;
      notification.seenAt = new Date();
      await notification.save();
      
      // Update in Redis
      await redisUtils.markNotificationSeen(userId, notificationId);
      
      res.json({ message: 'Notification marked as seen', notification });
    } catch (verifyError) {
      if (verifyError.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired' });
      }
      return res.status(401).json({ message: 'Invalid token' });
    }
  } catch (error) {
    console.error('Mark notification as seen error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete a notification
const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    
    // Extract user ID from JWT token
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authorization token required' });
    }
    
    const token = authHeader.split(' ')[1];
    
    try {
      const secret = process.env.JWT_SECRET || 'fallback_secret_key';
      const decoded = jwt.verify(token, secret);
      const userId = decoded.userId;
      
      // Find and delete the notification
      const notification = await Notification.findOne({
        _id: notificationId,
        userId
      });
      
      if (!notification) {
        return res.status(404).json({ message: 'Notification not found' });
      }
      
      await Notification.deleteOne({ _id: notificationId });
      
      // Clear cached data
      await redisUtils.deleteCachedUserNotifications(`${userId}_all_1_20`);
      await redisUtils.deleteCachedUnreadCount(userId);
      
      res.json({ message: 'Notification deleted successfully' });
    } catch (verifyError) {
      if (verifyError.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired' });
      }
      return res.status(401).json({ message: 'Invalid token' });
    }
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  markAsSeen
};