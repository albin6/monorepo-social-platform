const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Import the User model
const router = express.Router();

// In-memory session storage (in a real app, use Redis or database)
let sessions = new Map(); // Store refresh tokens

// Validation helper
const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// Helper to generate JWT tokens
const generateToken = (payload) => {
  // Use JWT library with a secret key from environment
  const secret = process.env.JWT_SECRET || 'fallback_secret_key';
  const expiresIn = process.env.JWT_EXPIRES_IN || '1h';
  return jwt.sign(payload, secret, { expiresIn });
};

// Helper to generate refresh tokens
const generateRefreshToken = (payload) => {
  const secret = process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret_key';
  const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
  return jwt.sign(payload, secret, { expiresIn });
};

// User registration
router.post('/register', async (req, res) => {
  try {
    const { email, password, username, firstName, lastName } = req.body;

    // Basic validation
    if (!email || !password || !username) {
      return res.status(400).json({
        message: 'Email, password, and username are required'
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        message: 'Invalid email format'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: 'Password must be at least 6 characters'
      });
    }

    // Check if user already exists in database
    const existingUser = await User.findOne({
      $or: [{ email: email }, { username: username }]
    });

    if (existingUser) {
      return res.status(409).json({
        message: 'User with this email or username already exists'
      });
    }

    // Create new user (password will be hashed automatically by the pre-save middleware)
    const newUser = new User({
      email,
      username,
      password, // Plain password - will be hashed by the pre-save middleware
      firstName: firstName || '',
      lastName: lastName || ''
    });

    // Save user to database
    await newUser.save();

    // Generate tokens
    const token = generateToken({ userId: newUser._id, email: newUser.email });
    const refreshToken = generateRefreshToken({ userId: newUser._id, type: 'refresh' });
    sessions.set(refreshToken, newUser._id.toString());

    // Don't return password in response
    const userResponse = { ...newUser.toObject() };
    delete userResponse.password; // Remove password from response

    res.status(201).json({
      success: true,
      user: userResponse,
      token,
      refreshToken
    });
  } catch (error) {
    console.error('Registration error:', error);

    // Check if it's a duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(409).json({
        message: `A user with this ${field} already exists`
      });
    }

    res.status(500).json({
      message: 'Internal server error during registration'
    });
  }
});

// User login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required'
      });
    }

    // Find user in database
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(401).json({
        message: 'Invalid email or password'
      });
    }

    // Check if account is locked
    if (user.isLocked) {
      return res.status(423).json({
        message: 'Account temporarily locked due to multiple failed login attempts'
      });
    }

    // Verify password using the method defined in the User model
    const passwordMatch = await user.validatePassword(password);
    if (!passwordMatch) {
      // Increment login attempts
      await user.incLoginAttempts();
      return res.status(401).json({
        message: 'Invalid email or password'
      });
    }

    // Reset login attempts on successful login
    if (user.loginAttempts > 0 || user.lockUntil) {
      await User.findByIdAndUpdate(user._id, {
        loginAttempts: 0,
        lockUntil: undefined,
        lastLogin: new Date()
      });
    }

    // Generate tokens
    const token = generateToken({ userId: user._id, email: user.email });
    const refreshToken = generateRefreshToken({ userId: user._id, type: 'refresh' });
    sessions.set(refreshToken, user._id.toString());

    // Don't return password in response
    const userResponse = { ...user.toObject() };
    delete userResponse.password; // Remove password from response

    res.json({
      user: userResponse,
      token,
      refreshToken
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      message: 'Internal server error during login'
    });
  }
});

// Logout
router.post('/logout', (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken && sessions.has(refreshToken)) {
      sessions.delete(refreshToken);
    }

    res.json({
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      message: 'Internal server error during logout'
    });
  }
});

// Refresh token
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        message: 'Refresh token is required'
      });
    }

    // Verify the refresh token
    try {
      const secret = process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret_key';
      const decoded = jwt.verify(refreshToken, secret);
      const userId = decoded.userId;

      // Check if the refresh token is in our session map
      if (!sessions.has(refreshToken) || sessions.get(refreshToken) !== userId.toString()) {
        return res.status(401).json({
          message: 'Invalid refresh token'
        });
      }

      // Find user in database
      const user = await User.findById(userId);
      if (!user) {
        sessions.delete(refreshToken);
        return res.status(401).json({
          message: 'User not found'
        });
      }

      // Generate new access token
      const newToken = generateToken({ userId: user._id, email: user.email });

      res.json({
        token: newToken
      });
    } catch (verifyError) {
      if (verifyError.name === 'TokenExpiredError') {
        return res.status(401).json({
          message: 'Refresh token expired'
        });
      }
      throw verifyError;
    }
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({
      message: 'Internal server error during token refresh'
    });
  }
});

// Forgot password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: 'Email is required'
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        message: 'Invalid email format'
      });
    }

    const user = await User.findOne({ email: email });
    if (!user) {
      // For security, don't reveal if email exists
      return res.json({
        message: 'If the email exists, a reset link has been sent'
      });
    }

    // In a real app, send reset email with token
    // For now, just return success
    res.json({
      message: 'If the email exists, a reset link has been sent'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      message: 'Internal server error'
    });
  }
});

// Reset password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body; // In a real app, token comes from URL param or email

    if (!token || !newPassword) {
      return res.status(400).json({
        message: 'Token and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: 'New password must be at least 6 characters'
      });
    }

    // In a real app, you would verify the reset token
    // For this implementation, we'll assume the reset token is valid and update the password
    // The reset token would typically be stored in the database or Redis with an expiration
    // For now, just return a success message
    res.json({
      message: 'Password reset successfully'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      message: 'Internal server error'
    });
  }
});

// Get user profile
router.get('/profile', async (req, res) => {
  try {
    // In a real app, extract user ID from JWT token in Authorization header
    // For this example, we'll need to implement proper token verification
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authorization token required' });
    }

    const token = authHeader.split(' ')[1];

    try {
      const secret = process.env.JWT_SECRET || 'fallback_secret_key';
      const decoded = jwt.verify(token, secret);
      const userId = decoded.userId;

      // Find user in database
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Don't return password in response
      const userResponse = { ...user.toObject() };
      delete userResponse.password;

      res.json({ user: userResponse });
    } catch (verifyError) {
      if (verifyError.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired' });
      }
      return res.status(401).json({ message: 'Invalid token' });
    }
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update user profile
router.put('/profile', async (req, res) => {
  try {
    // Extract user ID from JWT token in Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authorization token required' });
    }

    const token = authHeader.split(' ')[1];

    try {
      const secret = process.env.JWT_SECRET || 'fallback_secret_key';
      const decoded = jwt.verify(token, secret);
      const userId = decoded.userId;

      const { firstName, lastName, bio, avatar } = req.body;

      // Update user in database
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          firstName: firstName || undefined,
          lastName: lastName || undefined,
          bio: bio || undefined,
          avatar: avatar || undefined
        },
        { new: true } // Return updated document
      );

      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Don't return password in response
      const userResponse = { ...updatedUser.toObject() };
      delete userResponse.password;

      res.json({ user: userResponse });
    } catch (verifyError) {
      if (verifyError.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired' });
      }
      return res.status(401).json({ message: 'Invalid token' });
    }
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;