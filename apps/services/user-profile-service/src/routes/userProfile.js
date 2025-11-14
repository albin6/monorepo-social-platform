const express = require('express');
const router = express.Router();
const { body, query, param } = require('express-validator');
const { 
  getUserProfile, 
  updateUserProfile, 
  uploadProfilePicture, 
  searchUsers, 
  getUsersWithinRadius 
} = require('../controllers/userProfileController');

// Validation middleware
const validateUserProfileUpdate = [
  body('firstName').optional().isLength({ max: 50 }).withMessage('First name must be less than 50 characters'),
  body('lastName').optional().isLength({ max: 50 }).withMessage('Last name must be less than 50 characters'),
  body('username').optional().isLength({ min: 3, max: 30 }).withMessage('Username must be between 3 and 30 characters'),
  body('bio').optional().isLength({ max: 500 }).withMessage('Bio must be less than 500 characters'),
  body('age').optional().isInt({ min: 13, max: 120 }).withMessage('Age must be between 13 and 120'),
  body('gender').optional().isIn(['male', 'female', 'other', 'prefer_not_to_say']).withMessage('Invalid gender value'),
  body('location.coordinates').optional().isArray({ min: 2, max: 2 }).withMessage('Coordinates must be an array of [longitude, latitude]'),
  body('location.coordinates.0').optional().isFloat({ min: -180, max: 180 }).withMessage('Longitude must be between -180 and 180'),
  body('location.coordinates.1').optional().isFloat({ min: -90, max: 90 }).withMessage('Latitude must be between -90 and 90')
];

// Get current user's profile
router.get('/profile', getUserProfile);

// Update user profile
router.put('/profile', validateUserProfileUpdate, updateUserProfile);

// Upload profile picture (this would integrate with S3 in production)
router.post('/profile-picture', uploadProfilePicture);

// Search users with filters and pagination
router.get('/search', [
  query('q').optional().trim().escape(),
  query('gender').optional().isIn(['male', 'female', 'other', 'prefer_not_to_say']),
  query('minAge').optional().isInt({ min: 13, max: 100 }),
  query('maxAge').optional().isInt({ min: 13, max: 100 }),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  query('sortBy').optional().isIn(['createdAt', 'lastSeen', 'distance']),
  query('order').optional().isIn(['asc', 'desc']),
  query('radius').optional().isFloat({ min: 0.1, max: 1000 })
], searchUsers);

// Get users within a specific radius (for discovery feature)
router.get('/within-radius', [
  query('longitude').isFloat({ min: -180, max: 180 }),
  query('latitude').isFloat({ min: -90, max: 90 }),
  query('radius').isFloat({ min: 0.1, max: 1000 }).default(50), // in kilometers
  query('limit').optional().isInt({ min: 1, max: 50 }).default(20)
], getUsersWithinRadius);

module.exports = router;