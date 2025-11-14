const mongoose = require('mongoose');

const friendRequestSchema = new mongoose.Schema({
  senderId: {
    type: String,
    required: true,
    index: true
  },
  receiverId: {
    type: String,
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'cancelled'],
    default: 'pending',
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
  message: {
    type: String,
    maxlength: 200
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
friendRequestSchema.index({ senderId: 1, receiverId: 1 }, { unique: true });
friendRequestSchema.index({ receiverId: 1, status: 1 });

// Pre-save middleware to update updatedAt
friendRequestSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Method to check if request is still pending
friendRequestSchema.methods.isPending = function() {
  return this.status === 'pending';
};

// Method to check if request is accepted
friendRequestSchema.methods.isAccepted = function() {
  return this.status === 'accepted';
};

// Method to check if request is rejected
friendRequestSchema.methods.isRejected = function() {
  return this.status === 'rejected';
};

module.exports = mongoose.model('FriendRequest', friendRequestSchema);