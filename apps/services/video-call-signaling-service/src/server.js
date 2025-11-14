// src/server.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const http = require('http');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3007;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Import socket.io and set up WebSocket connection
const io = require('socket.io')(server, {
  cors: {
    origin: process.env.CORS_ORIGIN,
    methods: ['GET', 'POST']
  }
});

// WebRTC signaling connection handling
io.on('connection', (socket) => {
  console.log('WebRTC client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('WebRTC client disconnected:', socket.id);
  });

  // WebRTC signaling events
  socket.on('call-initiate', (data) => {
    // Handle call initiation
    console.log('Call initiated:', data);
    // Forward to callee
    socket.to(data.calleeId).emit('call-initiated', data);
  });

  socket.on('call-answer', (data) => {
    // Handle call answer
    console.log('Call answered:', data);
    // Forward answer to caller
    socket.to(data.callerId).emit('call-answered', data);
  });

  socket.on('ice-candidate', (data) => {
    // Handle ICE candidate exchange
    console.log('ICE candidate received:', data);
    // Forward to other participant
    socket.to(data.targetId).emit('ice-candidate', data.candidate);
  });

  socket.on('call-hangup', (data) => {
    // Handle hangup
    console.log('Call hung up:', data);
    // Notify other participants
    socket.to(data.roomId).emit('call-ended', { callerId: data.callerId });
  });
});

// Routes will be added here
app.get('/', (req, res) => {
  res.json({ message: 'Video Call Signaling Service is running!' });
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
  console.log(`Video Call Signaling Service is running on port ${PORT}`);
});

module.exports = { app, server };