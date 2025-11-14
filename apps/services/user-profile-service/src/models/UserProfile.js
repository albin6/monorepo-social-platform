const mongoose = require('mongoose');

const userProfileSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  firstName: {
    type: String,
    trim: true,
    maxlength: 50
  },
  lastName: {
    type: String,
    trim: true,
    maxlength: 50
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  bio: {
    type: String,
    maxlength: 500
  },
  age: {
    type: Number,
    min: 13,
    max: 120
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other', 'prefer_not_to_say'],
    default: 'prefer_not_to_say'
  },
  location: {
    type: {
      type: String,
      default: 'Point',
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      index: '2dsphere'
    },
    address: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  },
  profilePicture: {
    type: String, // URL to image in S3 or similar
    default: ''
  },
  coverPicture: {
    type: String,
    default: ''
  },
  dateOfBirth: {
    type: Date
  },
  privacySettings: {
    showEmail: { type: Boolean, default: false },
    showAge: { type: Boolean, default: true },
    showLocation: { type: Boolean, default: true },
    allowFriendRequests: { type: Boolean, default: true }
  },
  socialLinks: [{
    platform: String,
    url: String
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  lastSeen: {
    type: Date,
    default: Date.now
  },
  preferences: {
    notificationSettings: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      sms: { type: Boolean, default: false }
    },
    discoverability: {
      allowDiscovery: { type: Boolean, default: true },
      showInSearch: { type: Boolean, default: true },
      distanceUnit: { type: String, default: 'km' }
    }
  }
}, {
  timestamps: true
});

// Add indexes for common queries
userProfileSchema.index({ 
  username: 1,
  'location.coordinates': '2dsphere',
  age: 1,
  gender: 1,
  createdAt: -1 
});

module.exports = mongoose.model('UserProfile', userProfileSchema);