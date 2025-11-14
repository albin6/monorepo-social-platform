const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: String, // ID of the user receiving the notification
    required: true,
    index: true,
    ref: 'UserProfile'
  },
  type: {
    type: String,
    required: true,
    enum: [
      'friend_request', 'friend_request_accepted', 'friend_request_rejected',
      'message', 'call', 'system', 'mention', 'reaction',
      'group_invite', 'post_like', 'post_comment'
    ],
    index: true
  },
  title: {
    type: String,
    required: true,
    maxlength: 100
  },
  message: {
    type: String,
    required: true,
    maxlength: 500
  },
  data: {
    // Additional data associated with the notification
    type: mongoose.Schema.Types.Mixed
  },
  isRead: {
    type: Boolean,
    default: false,
    index: true
  },
  isSeen: {
    type: Boolean,
    default: false,
    index: true
  },
  readAt: {
    type: Date
  },
  seenAt: {
    type: Date
  },
  expiresAt: {
    type: Date // Optional expiration date
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ userId: 1, isSeen: 1 });
notificationSchema.index({ expiresAt: 1 }); // For TTL operations

// TTL index to automatically delete expired notifications
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Notification', notificationSchema);