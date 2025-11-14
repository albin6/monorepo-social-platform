const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

// Import database and Redis connection
const { connectRedis, redisUtils } = require('./config/redis');

// Import OTP utilities
const { generateOTP, isValidOTP, sendOTP } = require('./utils/otpUtils');

const app = express();
const PORT = process.env.PORT || 3008;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Connect to Redis
connectRedis();

// Generate and send OTP
app.post('/api/v1/generate', async (req, res) => {
  try {
    const { identifier, channel = 'email' } = req.body;
    
    if (!identifier) {
      return res.status(400).json({ message: 'Identifier is required' });
    }
    
    // Check if user is in cooldown
    const inCooldown = await redisUtils.isInOTPCooldown(identifier);
    if (inCooldown) {
      return res.status(429).json({ 
        message: 'Please wait before requesting another OTP',
        retryAfter: parseInt(process.env.OTP_COOLDOWN_SECONDS || '60')
      });
    }
    
    // Check if user has exceeded max attempts
    const attempts = await redisUtils.getOTPAttempts(identifier);
    const maxAttempts = parseInt(process.env.MAX_OTP_ATTEMPTS || '5');
    
    if (attempts >= maxAttempts) {
      return res.status(429).json({ 
        message: 'Maximum OTP attempts exceeded. Please try again later.' 
      });
    }
    
    // Generate OTP
    const otpLength = parseInt(process.env.OTP_LENGTH || '6');
    const otp = generateOTP(otpLength);
    
    // Store OTP in Redis with TTL
    const expirySeconds = parseInt(process.env.OTP_EXPIRY_SECONDS || '300'); // 5 minutes
    await redisUtils.storeOTP(identifier, otp, expirySeconds);
    
    // Set cooldown to prevent spam
    const cooldownSeconds = parseInt(process.env.OTP_COOLDOWN_SECONDS || '60'); // 1 minute
    await redisUtils.setOTPCooldown(identifier, cooldownSeconds);
    
    // Update attempts count
    await redisUtils.storeOTPAttempts(identifier, attempts + 1);
    
    // Send OTP (in real app, this would be via SMS/email)
    const sendResult = await sendOTP(identifier, otp, channel);
    
    if (!sendResult.success) {
      return res.status(500).json({ message: 'Failed to send OTP' });
    }
    
    res.json({ 
      success: true, 
      messageId: sendResult.messageId,
      expiry: expirySeconds,
      identifier: sendResult.destination
    });
  } catch (error) {
    console.error('Generate OTP error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Verify OTP
app.post('/api/v1/verify', async (req, res) => {
  try {
    const { identifier, otp } = req.body;
    
    if (!identifier || !otp) {
      return res.status(400).json({ message: 'Identifier and OTP are required' });
    }
    
    // Validate OTP format
    const otpLength = parseInt(process.env.OTP_LENGTH || '6');
    if (!isValidOTP(otp, otpLength)) {
      return res.status(400).json({ message: `Invalid OTP format. Must be ${otpLength} digits.` });
    }
    
    // Get stored OTP
    const storedOTP = await redisUtils.getOTP(identifier);
    
    if (!storedOTP) {
      return res.status(400).json({ message: 'OTP has expired or is invalid' });
    }
    
    if (storedOTP !== otp) {
      // Increment attempts
      const attempts = await redisUtils.getOTPAttempts(identifier);
      const maxAttempts = parseInt(process.env.MAX_OTP_ATTEMPTS || '5');
      
      if (attempts >= maxAttempts - 1) {
        // Max attempts reached, delete OTP and attempts
        await redisUtils.deleteOTP(identifier);
        await redisUtils.deleteOTPAttempts(identifier);
        return res.status(400).json({ message: 'Maximum attempts exceeded. Please request a new OTP.' });
      }
      
      // Update attempts
      await redisUtils.storeOTPAttempts(identifier, attempts + 1);
      
      return res.status(400).json({ message: 'Invalid OTP' });
    }
    
    // OTP is valid, delete it and reset attempts
    await redisUtils.deleteOTP(identifier);
    await redisUtils.deleteOTPAttempts(identifier);
    
    res.json({ success: true, message: 'OTP verified successfully' });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Resend OTP (with cooldown)
app.post('/api/v1/resend', async (req, res) => {
  try {
    const { identifier, channel = 'email' } = req.body;
    
    if (!identifier) {
      return res.status(400).json({ message: 'Identifier is required' });
    }
    
    // Check if there's already an OTP stored (not expired)
    const existingOTP = await redisUtils.getOTP(identifier);
    if (!existingOTP) {
      return res.status(400).json({ message: 'No active OTP to resend. Please generate a new one.' });
    }
    
    // Check if user is in cooldown
    const inCooldown = await redisUtils.isInOTPCooldown(identifier);
    if (inCooldown) {
      return res.status(429).json({ 
        message: 'Please wait before requesting to resend OTP',
        retryAfter: parseInt(process.env.OTP_COOLDOWN_SECONDS || '60')
      });
    }
    
    // Set cooldown
    const cooldownSeconds = parseInt(process.env.OTP_COOLDOWN_SECONDS || '60');
    await redisUtils.setOTPCooldown(identifier, cooldownSeconds);
    
    // Send the same OTP again
    const sendResult = await sendOTP(identifier, existingOTP, channel);
    
    if (!sendResult.success) {
      return res.status(500).json({ message: 'Failed to resend OTP' });
    }
    
    // Find remaining expiry time
    // In a real implementation, you'd track the original TTL to show remaining time
    res.json({ 
      success: true, 
      messageId: sendResult.messageId,
      message: 'OTP resent successfully'
    });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'OTP Service is running!' });
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

app.listen(PORT, () => {
  console.log(`OTP Service is running on port ${PORT}`);
});

module.exports = app;