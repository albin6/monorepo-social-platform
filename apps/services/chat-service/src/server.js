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
const Chat = require('./models/Chat');
const Message = require('./models/Message');

// Import REST API routes
const chatRoutes = require('./routes/chat');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3004;

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

// REST API routes
app.use('/api/v1', chatRoutes);

// Initialize Socket.IO with CORS options
const io = socketIo(server, {
  cors: corsOptions,
  transports: ['websocket', 'polling']
});

// Middleware for Socket.IO authentication
io.use(async (socket, next) => {
  try {
    // In a real application, you would verify the JWT token sent with the connection
    // For this implementation, we'll assume the token is validated by the frontend
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }
    
    // Here you would typically decode the JWT token to get the userId
    // For this example, we'll trust the userId sent by the client
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
  console.log(`User ${socket.userId} connected with socket ID ${socket.id}`);
  
  // Store user's socket connection
  redisUtils.storeConnection(socket.userId, socket.id);
  redisUtils.setUserOnline(socket.userId, socket.id);

  // Join user to their chat rooms
  socket.on('join_chat', async (chatId) => {
    try {
      // Verify user has access to this chat
      const chat = await Chat.findOne({
        _id: chatId,
        participants: socket.userId
      });
      
      if (chat) {
        socket.join(chatId);
        console.log(`User ${socket.userId} joined chat ${chatId}`);
      } else {
        socket.emit('error', { message: 'Access denied to chat' });
      }
    } catch (error) {
      console.error('Error joining chat:', error);
      socket.emit('error', { message: 'Error joining chat' });
    }
  });

  // Leave chat room
  socket.on('leave_chat', (chatId) => {
    socket.leave(chatId);
    console.log(`User ${socket.userId} left chat ${chatId}`);
  });

  // Handle typing indicators
  socket.on('typing_start', async ({ chatId }) => {
    try {
      // Set typing status in Redis
      await redisUtils.setTypingStatus(socket.userId, chatId, true);
      
      // Broadcast to other users in the chat
      socket.to(chatId).emit('user_typing', {
        userId: socket.userId,
        chatId
      });
    } catch (error) {
      console.error('Error handling typing start:', error);
    }
  });

  socket.on('typing_stop', async ({ chatId }) => {
    try {
      // Remove typing status from Redis
      await redisUtils.setTypingStatus(socket.userId, chatId, false);
      
      // Broadcast to other users in the chat
      socket.to(chatId).emit('user_stopped_typing', {
        userId: socket.userId,
        chatId
      });
    } catch (error) {
      console.error('Error handling typing stop:', error);
    }
  });

  // Handle message sending
  socket.on('send_message', async (data) => {
    try {
      const { chatId, content, messageType = 'text', replyTo = null } = data;
      
      // Verify user has access to this chat
      const chat = await Chat.findOne({
        _id: chatId,
        participants: socket.userId
      });
      
      if (!chat) {
        return socket.emit('error', { message: 'Access denied to chat' });
      }

      // Create and save the message
      const message = new Message({
        chatId,
        senderId: socket.userId,
        content,
        messageType,
        replyTo
      });

      await message.save();
      
      // Update chat with last message info
      chat.lastMessage = message._id;
      chat.lastMessageAt = message.createdAt;
      if (chat.unreadCount) {
        // Reset unread count for sender
        chat.unreadCount.set(socket.userId, 0);
      }
      await chat.save();

      // Add message to Redis cache
      await redisUtils.addMessageToCache(chatId, message);

      // Mark message as delivered to sender immediately
      await redisUtils.markMessageDelivered(socket.userId, message._id);

      // Broadcast message to all users in the chat
      io.to(chatId).emit('new_message', {
        ...message.toObject(),
        // Add delivery and read status information
        deliveredTo: [socket.userId], // Sender's status
        readBy: [] // Initially no one has read it
      });

      // Update delivery status for other participants
      for (const participantId of chat.participants) {
        if (participantId !== socket.userId) {
          // Check if recipient is online
          const isOnline = await redisUtils.isUserOnline(participantId);
          
          if (isOnline) {
            // Get recipient's socket ID and send message directly
            const recipientSocketId = await redisUtils.getUserSocketId(participantId);
            if (recipientSocketId) {
              io.to(recipientSocketId).emit('new_message', {
                ...message.toObject(),
                deliveredTo: [socket.userId, participantId], // Update delivery status
                readBy: [] // Still not read
              });
              
              // Mark as delivered to this recipient
              await redisUtils.markMessageDelivered(participantId, message._id);
              
              // Update chat's unread count for recipient
              if (chat.unreadCount) {
                const currentCount = chat.unreadCount.get(participantId) || 0;
                chat.unreadCount.set(participantId, currentCount + 1);
                await chat.save();
              }
            }
          } else {
            // Store notification for offline user
            await redisUtils.storeNotification(participantId, {
              type: 'new_message',
              chatId,
              messageId: message._id,
              senderId: socket.userId,
              content: message.content,
              timestamp: message.createdAt
            });
          }
        }
      }

    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('error', { message: 'Error sending message' });
    }
  });

  // Handle message read receipt
  socket.on('message_read', async ({ chatId, messageId }) => {
    try {
      // Verify user has access to this chat
      const chat = await Chat.findOne({
        _id: chatId,
        participants: socket.userId
      });
      
      if (!chat) {
        return;
      }

      // Mark message as read in database
      await Message.updateOne(
        { _id: messageId, chatId },
        { $addToSet: { readBy: socket.userId } }
      );

      // Mark message as read in Redis
      await redisUtils.markMessageRead(socket.userId, messageId);
      
      // Update chat's unread count
      if (chat.unreadCount) {
        chat.unreadCount.set(socket.userId, 0);
        await chat.save();
      }

      // Broadcast read receipt to sender
      const message = await Message.findById(messageId);
      if (message && message.senderId !== socket.userId) {
        // Find sender's socket ID and notify them
        const senderSocketId = await redisUtils.getUserSocketId(message.senderId);
        if (senderSocketId) {
          io.to(senderSocketId).emit('message_read_receipt', {
            messageId,
            readerId: socket.userId,
            chatId
          });
        }
      }
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  });

  // Handle message delivery receipt
  socket.on('message_delivered', async ({ chatId, messageId }) => {
    try {
      // Verify user has access to this chat
      const chat = await Chat.findOne({
        _id: chatId,
        participants: socket.userId
      });
      
      if (!chat) {
        return;
      }

      // Mark message as delivered in database
      await Message.updateOne(
        { _id: messageId, chatId },
        { $addToSet: { deliveredTo: socket.userId } }
      );

      // Mark message as delivered in Redis
      await redisUtils.markMessageDelivered(socket.userId, messageId);

      // Broadcast delivery receipt to sender
      const message = await Message.findById(messageId);
      if (message && message.senderId !== socket.userId) {
        // Find sender's socket ID and notify them
        const senderSocketId = await redisUtils.getUserSocketId(message.senderId);
        if (senderSocketId) {
          io.to(senderSocketId).emit('message_delivered_receipt', {
            messageId,
            receiverId: socket.userId,
            chatId
          });
        }
      }
    } catch (error) {
      console.error('Error marking message as delivered:', error);
    }
  });

  // Handle disconnection
  socket.on('disconnect', async (reason) => {
    console.log(`User ${socket.userId} disconnected: ${reason}`);
    
    // Remove connection from Redis
    await redisUtils.removeConnection(socket.userId);
    await redisUtils.setUserOffline(socket.userId);
  });
});

// REST API routes
app.get('/', (req, res) => {
  res.json({ message: 'Chat Service is running!' });
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
  console.log(`Chat Service is running on port ${PORT}`);
});

module.exports = app;