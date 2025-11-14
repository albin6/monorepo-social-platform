const mongoose = require('mongoose');

const friendshipSchema = new mongoose.Schema({
  userId1: {
    type: String,
    required: true,
    index: true
  },
  userId2: {
    type: String,
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['active', 'blocked', 'removed'],
    default: 'active',
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  isBlocked: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Compound index to ensure unique friendships (regardless of who initiated)
friendshipSchema.index({ 
  $or: [
    { userId1: 1, userId2: 1 },
    { userId2: 1, userId1: 1 }
  ] 
}, { unique: true });

// Pre-save middleware to update updatedAt
friendshipSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Friendship', friendshipSchema);