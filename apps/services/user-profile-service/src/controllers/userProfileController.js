const UserProfile = require('../models/UserProfile');
const { redisUtils } = require('../config/redis');
const jwt = require('jsonwebtoken');

// Get current user's profile
const getUserProfile = async (req, res) => {
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
      
      // First, try to get from cache
      let userProfile = await redisUtils.getCachedUserProfile(userId);
      
      if (!userProfile) {
        // If not in cache, get from database
        userProfile = await UserProfile.findOne({ userId: userId });
        
        if (!userProfile) {
          return res.status(404).json({ message: 'User profile not found' });
        }
        
        // Cache the profile for future requests
        await redisUtils.cacheUserProfile(userId, userProfile.toObject());
      }
      
      res.json({ user: userProfile });
    } catch (verifyError) {
      if (verifyError.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired' });
      }
      return res.status(401).json({ message: 'Invalid token' });
    }
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update user profile
const updateUserProfile = async (req, res) => {
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
      
      // Prepare update object, only update provided fields
      const updateData = {};
      const allowedUpdates = [
        'firstName', 'lastName', 'username', 'bio', 
        'age', 'gender', 'location', 'profilePicture', 
        'coverPicture', 'privacySettings', 'socialLinks', 
        'preferences'
      ];
      
      for (const key in req.body) {
        if (allowedUpdates.includes(key)) {
          updateData[key] = req.body[key];
        }
      }
      
      // Add last updated timestamp
      updateData.updatedAt = new Date();
      
      // Update user profile in the database
      const updatedProfile = await UserProfile.findOneAndUpdate(
        { userId: userId },
        updateData,
        { new: true, runValidators: true } // Return updated document and run validators
      );
      
      if (!updatedProfile) {
        return res.status(404).json({ message: 'User profile not found' });
      }
      
      // Update cache with new profile data
      await redisUtils.cacheUserProfile(userId, updatedProfile.toObject());
      
      res.json({ user: updatedProfile });
    } catch (verifyError) {
      if (verifyError.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired' });
      }
      return res.status(401).json({ message: 'Invalid token' });
    }
  } catch (error) {
    console.error('Update user profile error:', error);
    
    // Check if it's a duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(409).json({ 
        message: `A profile with this ${field} already exists` 
      });
    }
    
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Upload profile picture (placeholder - in production, this would integrate with S3)
const uploadProfilePicture = async (req, res) => {
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
      
      // In a real application, this would handle file upload to S3
      // For now, we'll simulate this with a placeholder URL
      // In a real implementation, you'd use multer or similar for file handling
      const imageUrl = req.body.imageUrl || `https://example.com/uploads/${userId}_profile.jpg`;
      
      // Update user's profile picture
      const updatedProfile = await UserProfile.findOneAndUpdate(
        { userId: userId },
        { 
          profilePicture: imageUrl,
          updatedAt: new Date()
        },
        { new: true }
      );
      
      if (!updatedProfile) {
        return res.status(404).json({ message: 'User profile not found' });
      }
      
      // Update cache with new profile data
      await redisUtils.cacheUserProfile(userId, updatedProfile.toObject());
      
      res.json({ user: updatedProfile, imageUrl });
    } catch (verifyError) {
      if (verifyError.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired' });
      }
      return res.status(401).json({ message: 'Invalid token' });
    }
  } catch (error) {
    console.error('Upload profile picture error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Search users with filters and pagination
const searchUsers = async (req, res) => {
  try {
    // Extract query parameters
    const {
      q = '',
      gender,
      minAge,
      maxAge,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      order = 'desc',
      radius
    } = req.query;
    
    // Build search query
    const queryFilters = { isActive: true }; // Only active users
    
    // Text search on username, firstName, lastName, bio
    if (q) {
      queryFilters.$or = [
        { username: { $regex: q, $options: 'i' } },
        { firstName: { $regex: q, $options: 'i' } },
        { lastName: { $regex: q, $options: 'i' } },
        { bio: { $regex: q, $options: 'i' } }
      ];
    }
    
    // Gender filter
    if (gender) {
      queryFilters.gender = gender;
    }
    
    // Age filters
    if (minAge || maxAge) {
      queryFilters.age = {};
      if (minAge) queryFilters.age.$gte = parseInt(minAge);
      if (maxAge) queryFilters.age.$lte = parseInt(maxAge);
    }
    
    // Location radius filter (if coordinates provided)
    if (radius) {
      // This assumes location.coordinates is a GeoJSON Point
      const [longitude, latitude] = req.query.coordinates 
        ? JSON.parse(req.query.coordinates) 
        : [req.query.longitude, req.query.latitude];
      
      if (longitude && latitude) {
        queryFilters.location = {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [parseFloat(longitude), parseFloat(latitude)]
            },
            $maxDistance: parseFloat(radius) * 1000 // Convert km to meters
          }
        };
      }
    }
    
    // Create a search key for caching
    const searchKey = `${JSON.stringify(queryFilters)}_${page}_${limit}_${sortBy}_${order}`;
    
    // Try to get from cache first
    const cachedResults = await redisUtils.getCachedDiscoveryResults(searchKey);
    if (cachedResults) {
      return res.json(cachedResults);
    }
    
    // Build sort object
    const sortObj = {};
    sortObj[sortBy] = order === 'asc' ? 1 : -1;
    
    // Execute search query
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const users = await UserProfile.find(queryFilters)
      .select('-password') // Don't return password field
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit))
      .lean(); // Use lean() for better performance
    
    // Count total results
    const total = await UserProfile.countDocuments(queryFilters);
    
    const result = {
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    };
    
    // Cache the results (for 10 minutes)
    await redisUtils.cacheDiscoveryResults(searchKey, result, 600);
    
    res.json(result);
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get users within a specific radius (for discovery feature)
const getUsersWithinRadius = async (req, res) => {
  try {
    const { longitude, latitude, radius = 50, limit = 20 } = req.query;
    
    // Validate coordinates
    const lon = parseFloat(longitude);
    const lat = parseFloat(latitude);
    const rad = parseFloat(radius);
    
    if (isNaN(lon) || isNaN(lat) || isNaN(rad)) {
      return res.status(400).json({ message: 'Invalid coordinates or radius' });
    }
    
    // Query users within radius
    const users = await UserProfile.find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [lon, lat]
          },
          $maxDistance: rad * 1000 // Convert km to meters
        }
      },
      isActive: true
    })
    .select('-password') // Don't return password field
    .limit(parseInt(limit))
    .lean();
    
    res.json({ users, count: users.length });
  } catch (error) {
    console.error('Get users within radius error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  uploadProfilePicture,
  searchUsers,
  getUsersWithinRadius
};