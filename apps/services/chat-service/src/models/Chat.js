const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  participants: [{
    type: String, // userId
    required: true,
    ref: 'UserProfile'
  }],
  type: {
    type: String,
    enum: ['direct', 'group'],
    default: 'direct',
    required: true
  },
  name: {
    type: String,
    maxlength: 100
  },
  description: {
    type: String,
    maxlength: 500
  },
  avatar: {
    type: String // URL to group avatar
  },
  admins: [{
    type: String, // userId
    ref: 'UserProfile'
  }],
  isArchived: {
    type: Boolean,
    default: false
  },
  isMuted: {
    type: Boolean,
    default: false
  },
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  lastMessageAt: {
    type: Date
  },
  unreadCount: {
    type: Map, // Map of userId -> count
    of: Number,
    default: {}
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
chatSchema.index({ participants: 1 });
chatSchema.index({ lastMessageAt: -1 });
chatSchema.index({ type: 1, participants: 1 });

module.exports = mongoose.model('Chat', chatSchema);