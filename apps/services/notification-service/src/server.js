const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

// Import database and Redis connection
const connectDB = require('./config/db');
const { connectRedis, redisUtils } = require('./config/redis');

// Import models
const Notification = require('./models/Notification');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3006;

// CORS configuration allowing the frontend origin
const corsOptions = {
  origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true
};

app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json());

// Connect to database and Redis
connectDB();
connectRedis();

// Initialize Socket.IO with CORS options
const io = socketIo(server, {
  cors: corsOptions,
  transports: ['websocket', 'polling']
});

// Middleware for Socket.IO authentication
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }
    
    // In a real app, you would verify the JWT token here
    // For this implementation, we'll trust the userId sent by the client
    socket.userId = socket.handshake.auth.userId;
    
    if (!socket.userId) {
      return next(new Error('Authentication error: Invalid user ID'));
    }
    
    next();
  } catch (error) {
    next(new Error('Authentication error'));
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`User ${socket.userId} connected to notification service with socket ID ${socket.id}`);
  
  // Store the connection in Redis
  redisUtils.storeUserConnection(socket.userId, socket.id);

  // Join user to their notification room
  socket.join(`user_${socket.userId}`);

  // Mark notifications as seen when user opens notification panel
  socket.on('notifications_seen', async () => {
    try {
      // Update notifications in database as seen
      await Notification.updateMany(
        { userId: socket.userId, isSeen: false },
        { isSeen: true, seenAt: new Date() }
      );
      
      // Update count in Redis
      await redisUtils.deleteCachedUnreadCount(socket.userId);
      
      console.log(`Marked all notifications as seen for user ${socket.userId}`);
    } catch (error) {
      console.error('Error marking notifications as seen:', error);
    }
  });

  // Mark a specific notification as read
  socket.on('notification_read', async ({ notificationId }) => {
    try {
      // Update notification in database as read
      await Notification.updateOne(
        { _id: notificationId, userId: socket.userId },
        { isRead: true, readAt: new Date() }
      );
      
      // Update in Redis
      await redisUtils.markNotificationRead(socket.userId, notificationId);
      
      // Update count in Redis
      await redisUtils.deleteCachedUnreadCount(socket.userId);
      
      console.log(`Marked notification ${notificationId} as read for user ${socket.userId}`);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  });

  // Handle user going offline
  socket.on('disconnect', async (reason) => {
    console.log(`User ${socket.userId} disconnected from notification service: ${reason}`);
    
    // Remove connection from Redis
    await redisUtils.removeUserConnection(socket.userId);
  });
});

// Function to send a notification to a user
const sendNotification = async (userId, notificationData) => {
  try {
    // Create notification in database
    const notification = new Notification({
      userId,
      type: notificationData.type,
      title: notificationData.title,
      message: notificationData.message,
      data: notificationData.data,
      // Add expiration if provided
      ...(notificationData.expiresAt && { expiresAt: notificationData.expiresAt })
    });
    
    await notification.save();
    
    // Store in user's real-time queue
    await redisUtils.queueRealTimeNotification(userId, notification);
    
    // Add to notification feed
    await redisUtils.addToNotificationFeed(userId, notification);
    
    // Update notification counts in Redis
    await redisUtils.deleteCachedUnreadCount(userId);
    
    // Get user's socket ID to send real-time notification
    const socketId = await redisUtils.getUserConnection(userId);
    
    if (socketId) {
      // Send real-time notification via WebSocket
      io.to(socketId).emit('new_notification', {
        ...notification.toObject(),
        isRealTime: true
      });
      
      // Update real-time unread count
      const unreadCount = await Notification.countDocuments({
        userId,
        isRead: false
      });
      
      io.to(socketId).emit('notification_count_update', { count: unreadCount });
    } else {
      // User is offline, the notification is queued and will be delivered when they connect
      console.log(`User ${userId} is offline, notification queued for delivery.`);
    }
  } catch (error) {
    console.error('Error sending notification:', error);
  }
};

// Import REST API routes
const notificationRoutes = require('./routes/notification');

// REST API routes
app.use('/api/v1', notificationRoutes);

// Set up event listeners to receive notifications from other services
// In a real implementation, this would be via message queue (like Kafka) or direct API calls
app.post('/api/v1/notify', express.json(), async (req, res) => {
  try {
    const { userId, type, title, message, data, expiresAt } = req.body;

    if (!userId || !type || !title || !message) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    await sendNotification(userId, {
      type,
      title,
      message,
      data,
      expiresAt
    });

    res.status(200).json({ message: 'Notification sent successfully' });
  } catch (error) {
    console.error('Error in notification endpoint:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Notification Service is running!' });
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

server.listen(PORT, () => {
  console.log(`Notification Service is running on port ${PORT}`);
});

module.exports = { app, sendNotification };