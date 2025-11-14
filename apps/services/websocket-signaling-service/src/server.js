const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

// Redis client for connection management and routing
const redis = require('redis');
const redisClient = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', (err) => {
  console.error('WebSocket Signaling Service - Redis Client Error:', err);
});

redisClient.on('connect', () => {
  console.log('WebSocket Signaling Service - Redis Client Connected');
});

const connectRedis = async () => {
  try {
    await redisClient.connect();
    console.log('WebSocket Signaling Service - Connected to Redis successfully');
  } catch (error) {
    console.error('WebSocket Signaling Service - Failed to connect to Redis:', error);
    process.exit(1);
  }
};

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3003;

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true
};

app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json());

// Connect to Redis
connectRedis();

// Initialize Socket.IO with CORS options
const io = socketIo(server, {
  cors: corsOptions,
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000
});

// Store user connections (for direct messaging)
const userSocketMap = new Map();

// Store active video calls
const activeCalls = new Map();

// Middleware for Socket.IO authentication
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }
    
    // In a real app, you would verify the JWT token here
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
  
  // Store user's socket connection in Redis
  redisClient.setEx(`user:socket:${socket.userId}`, 3600, socket.id); // 1 hour expiry
  
  // Store in local map as well
  userSocketMap.set(socket.userId, socket.id);

  // Join user's room
  socket.join(`user_${socket.userId}`);

  // Handle direct messaging
  socket.on('send_message', async (data) => {
    try {
      const { recipientId, message, chatId } = data;
      
      if (!recipientId) {
        return socket.emit('error', { message: 'Recipient ID is required' });
      }

      // Check if recipient is online using Redis
      const recipientSocketId = await redisClient.get(`user:socket:${recipientId}`);
      
      if (recipientSocketId) {
        // Send to specific socket
        io.to(recipientSocketId).emit('new_message', {
          senderId: socket.userId,
          message,
          chatId,
          timestamp: new Date()
        });
        
        // Emit delivery confirmation back to sender
        socket.emit('message_delivered', {
          messageId: data.messageId,
          recipientId,
          deliveredAt: new Date()
        });
      } else {
        // Recipient is offline, store for later delivery or send to notification service
        socket.emit('message_sent_offline', {
          senderId: socket.userId,
          message,
          chatId,
          isDelivered: false,
          timestamp: new Date()
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('error', { message: 'Error sending message' });
    }
  });

  // Handle typing indicators
  socket.on('typing_start', (data) => {
    const { chatId } = data;
    if (chatId) {
      // Broadcast typing indicator to other participants in the chat
      socket.to(chatId).emit('user_typing', {
        userId: socket.userId,
        chatId
      });
    }
  });

  socket.on('typing_stop', (data) => {
    const { chatId } = data;
    if (chatId) {
      // Broadcast stop typing to other participants in the chat
      socket.to(chatId).emit('user_stopped_typing', {
        userId: socket.userId,
        chatId
      });
    }
  });

  // Handle video call signaling
  // Initiate a video call
  socket.on('video_call_initiate', async (data) => {
    try {
      const { recipientId, callType = 'video', callId = generateCallId() } = data;
      
      if (!recipientId) {
        return socket.emit('call_error', { message: 'Recipient ID is required' });
      }

      // Store call info
      const callInfo = {
        callId,
        callerId: socket.userId,
        recipientId,
        callType,
        status: 'initiated',
        timestamp: new Date()
      };
      
      activeCalls.set(callId, callInfo);
      
      // Check if recipient is online
      const recipientSocketId = await redisClient.get(`user:socket:${recipientId}`);
      
      if (recipientSocketId) {
        // Notify recipient of incoming call
        io.to(recipientSocketId).emit('video_call_incoming', {
          callId,
          callerId: socket.userId,
          callerName: data.callerName || 'Unknown',
          callType,
          timestamp: new Date()
        });
        
        // Confirm to caller that call was initiated
        socket.emit('call_initiated', {
          callId,
          recipientId,
          status: 'calling'
        });
      } else {
        // Recipient is offline
        socket.emit('call_error', {
          message: 'Recipient is offline',
          callId
        });
      }
    } catch (error) {
      console.error('Error initiating video call:', error);
      socket.emit('call_error', { message: 'Error initiating video call' });
    }
  });

  // Handle SDP offer from caller
  socket.on('sdp_offer', async (data) => {
    try {
      const { callId, offer, recipientId } = data;
      
      if (!callId || !offer || !recipientId) {
        return socket.emit('call_error', { message: 'Missing required call data' });
      }

      // Check if call exists and is valid
      const call = activeCalls.get(callId);
      if (!call || call.recipientId !== socket.userId) {
        return socket.emit('call_error', { message: 'Invalid call' });
      }

      // Get recipient socket ID
      const recipientSocketId = await redisClient.get(`user:socket:${recipientId}`);
      
      if (recipientSocketId) {
        // Send offer to recipient
        io.to(recipientSocketId).emit('sdp_offer_received', {
          callId,
          offer,
          callerId: socket.userId
        });
      }
    } catch (error) {
      console.error('Error handling SDP offer:', error);
      socket.emit('call_error', { message: 'Error handling SDP offer' });
    }
  });

  // Handle SDP answer from callee
  socket.on('sdp_answer', async (data) => {
    try {
      const { callId, answer, callerId } = data;
      
      if (!callId || !answer || !callerId) {
        return socket.emit('call_error', { message: 'Missing required call data' });
      }

      // Check if call exists and is valid
      const call = activeCalls.get(callId);
      if (!call || call.callerId !== socket.userId) {
        return socket.emit('call_error', { message: 'Invalid call' });
      }

      // Get caller socket ID
      const callerSocketId = await redisClient.get(`user:socket:${callerId}`);
      
      if (callerSocketId) {
        // Send answer to caller
        io.to(callerSocketId).emit('sdp_answer_received', {
          callId,
          answer,
          calleeId: socket.userId
        });
        
        // Update call status to active
        call.status = 'active';
        activeCalls.set(callId, call);
      }
    } catch (error) {
      console.error('Error handling SDP answer:', error);
      socket.emit('call_error', { message: 'Error handling SDP answer' });
    }
  });

  // Handle ICE candidates
  socket.on('ice_candidate', async (data) => {
    try {
      const { callId, candidate, recipientId } = data;
      
      if (!callId || !candidate || !recipientId) {
        return socket.emit('call_error', { message: 'Missing required ICE candidate data' });
      }

      // Get recipient socket ID
      const recipientSocketId = await redisClient.get(`user:socket:${recipientId}`);
      
      if (recipientSocketId) {
        // Send ICE candidate to recipient
        io.to(recipientSocketId).emit('ice_candidate_received', {
          callId,
          candidate,
          senderId: socket.userId
        });
      }
    } catch (error) {
      console.error('Error handling ICE candidate:', error);
      socket.emit('call_error', { message: 'Error handling ICE candidate' });
    }
  });

  // Handle call acceptance
  socket.on('video_call_accept', async (data) => {
    try {
      const { callId } = data;
      
      if (!callId) {
        return socket.emit('call_error', { message: 'Call ID is required' });
      }

      const call = activeCalls.get(callId);
      if (!call || call.recipientId !== socket.userId) {
        return socket.emit('call_error', { message: 'Invalid call' });
      }

      call.status = 'accepted';
      activeCalls.set(callId, call);

      // Notify caller that call is accepted
      const callerSocketId = await redisClient.get(`user:socket:${call.callerId}`);
      if (callerSocketId) {
        io.to(callerSocketId).emit('video_call_accepted', {
          callId,
          calleeId: socket.userId
        });
      }
      
      // Send the acceptance to callee as confirmation
      socket.emit('call_accepted', {
        callId,
        callerId: call.callerId
      });
    } catch (error) {
      console.error('Error accepting video call:', error);
      socket.emit('call_error', { message: 'Error accepting video call' });
    }
  });

  // Handle call rejection
  socket.on('video_call_reject', async (data) => {
    try {
      const { callId } = data;
      
      if (!callId) {
        return socket.emit('call_error', { message: 'Call ID is required' });
      }

      const call = activeCalls.get(callId);
      if (!call || call.recipientId !== socket.userId) {
        return socket.emit('call_error', { message: 'Invalid call' });
      }

      call.status = 'rejected';
      activeCalls.set(callId, call);

      // Notify caller that call is rejected
      const callerSocketId = await redisClient.get(`user:socket:${call.callerId}`);
      if (callerSocketId) {
        io.to(callerSocketId).emit('video_call_rejected', {
          callId,
          calleeId: socket.userId
        });
      }
      
      // Send rejection to callee as confirmation
      socket.emit('call_rejected', { callId });
      
      // Clean up the call
      setTimeout(() => {
        activeCalls.delete(callId);
      }, 5000); // Keep for a bit in case of reconnection
    } catch (error) {
      console.error('Error rejecting video call:', error);
      socket.emit('call_error', { message: 'Error rejecting video call' });
    }
  });

  // Handle call ending
  socket.on('video_call_end', async (data) => {
    try {
      const { callId } = data;
      
      if (!callId) {
        return socket.emit('call_error', { message: 'Call ID is required' });
      }

      const call = activeCalls.get(callId);
      if (!call || (call.callerId !== socket.userId && call.recipientId !== socket.userId)) {
        return socket.emit('call_error', { message: 'Invalid call' });
      }

      // Notify both parties that call is ended
      const callerSocketId = await redisClient.get(`user:socket:${call.callerId}`);
      const recipientSocketId = await redisClient.get(`user:socket:${call.recipientId}`);
      
      if (callerSocketId) {
        io.to(callerSocketId).emit('video_call_ended', {
          callId,
          endedBy: socket.userId
        });
      }
      
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('video_call_ended', {
          callId,
          endedBy: socket.userId
        });
      }
      
      // Clean up the call
      activeCalls.delete(callId);
    } catch (error) {
      console.error('Error ending video call:', error);
      socket.emit('call_error', { message: 'Error ending video call' });
    }
  });

  // Handle disconnection
  socket.on('disconnect', async (reason) => {
    console.log(`User ${socket.userId} disconnected: ${reason}`);
    
    // Remove from local map
    userSocketMap.delete(socket.userId);
    
    // Remove from Redis
    await redisClient.del(`user:socket:${socket.userId}`);
    
    // Check if this user had active calls and notify the other party
    for (const [callId, call] of activeCalls) {
      if ((call.callerId === socket.userId || call.recipientId === socket.userId) && call.status === 'active') {
        // Notify the other party that the call is disconnected
        const otherPartyId = call.callerId === socket.userId ? call.recipientId : call.callerId;
        const otherPartySocketId = await redisClient.get(`user:socket:${otherPartyId}`);
        
        if (otherPartySocketId) {
          io.to(otherPartySocketId).emit('video_call_ended', {
            callId,
            endedBy: socket.userId,
            reason: 'user_disconnected'
          });
        }
        
        // Clean up the call
        activeCalls.delete(callId);
      }
    }
  });
});

// Helper function to generate unique call ID
function generateCallId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// REST API health check
app.get('/', (req, res) => {
  res.json({ 
    message: 'WebSocket Signaling Service is running!',
    connections: io.engine.clientsCount,
    activeCalls: activeCalls.size
  });
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
  console.log(`WebSocket Signaling Service is running on port ${PORT}`);
});

module.exports = app;