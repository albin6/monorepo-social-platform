const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  chatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat',
    required: true
  },
  senderId: {
    type: String, // userId
    required: true,
    ref: 'UserProfile'
  },
  content: {
    type: String,
    required: true,
    maxlength: 10000
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'video', 'file', 'system'],
    default: 'text'
  },
  mediaUrl: {
    type: String
  },
  mediaType: {
    type: String
  },
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedFor: [{
    type: String // userId of users who deleted the message
  }],
  readBy: [{
    type: String, // userId
    ref: 'UserProfile'
  }],
  deliveredTo: [{
    type: String, // userId
    ref: 'UserProfile'
  }],
  reactions: [{
    userId: {
      type: String,
      ref: 'UserProfile'
    },
    reaction: {
      type: String,
      maxlength: 10
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  mentions: [{
    userId: {
      type: String,
      ref: 'UserProfile'
    },
    startIndex: Number,
    endIndex: Number
  }]
}, {
  timestamps: true
});

// Indexes for efficient queries
messageSchema.index({ chatId: 1, createdAt: -1 });
messageSchema.index({ senderId: 1, createdAt: -1 });
messageSchema.index({ chatId: 1, senderId: 1 });
messageSchema.index({ createdAt: -1 });

// Post-save middleware to publish message to Kafka
messageSchema.post('save', async function(doc) {
  try {
    // Dynamically import kafka service to avoid circular dependency issues
    const kafkaService = require('../services/kafkaService');

    // Publish message to Kafka for archiving and analytics
    await kafkaService.produceMessage('chat_messages', {
      key: doc.chatId.toString(),
      value: JSON.stringify({
        messageId: doc._id.toString(),
        chatId: doc.chatId.toString(),
        senderId: doc.senderId,
        content: doc.content,
        messageType: doc.messageType,
        timestamp: doc.createdAt,
        isDeleted: doc.isDeleted
      })
    });
  } catch (error) {
    console.error('Error publishing message to Kafka:', error);
    // Don't throw error as it would affect the main operation
  }
});

module.exports = mongoose.model('Message', messageSchema);