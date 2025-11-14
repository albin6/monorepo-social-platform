const Chat = require('../models/Chat');
const Message = require('../models/Message');
const { redisUtils } = require('../config/redis');
const jwt = require('jsonwebtoken');

// Create a new chat
const createChat = async (req, res) => {
  try {
    // Extract user ID from JWT token
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authorization token required' });
    }
    
    const token = authHeader.split(' ')[1];
    
    try {
      const secret = process.env.JWT_SECRET || 'fallback_secret_key';
      const decoded = jwt.verify(token, secret);
      const userId = decoded.userId;
      const { participants, type = 'direct', name, description } = req.body;
      
      // Validate that the requesting user is in the participants list
      if (!participants.includes(userId)) {
        return res.status(400).json({ message: 'Creator must be included in participants' });
      }
      
      // For direct chats, ensure only 2 participants
      if (type === 'direct' && participants.length !== 2) {
        return res.status(400).json({ message: 'Direct chat must have exactly 2 participants' });
      }
      
      // Check if a direct chat already exists between these users
      if (type === 'direct') {
        const existingChat = await Chat.findOne({
          type: 'direct',
          participants: { $size: 2, $all: participants }
        });
        
        if (existingChat) {
          return res.status(409).json({ 
            message: 'Chat already exists between these users',
            chat: existingChat 
          });
        }
      }
      
      // Create the new chat
      const chat = new Chat({
        participants,
        type,
        name: type === 'group' ? name : undefined,
        description: type === 'group' ? description : undefined,
        admins: type === 'group' ? [userId] : []
      });
      
      await chat.save();
      
      // Clear any cached chat lists for participants
      for (const participantId of participants) {
        await redisUtils.deleteCachedUserChats(participantId);
      }
      
      res.status(201).json({ chat });
    } catch (verifyError) {
      if (verifyError.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired' });
      }
      return res.status(401).json({ message: 'Invalid token' });
    }
  } catch (error) {
    console.error('Create chat error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get user's chats
const getChats = async (req, res) => {
  try {
    // Extract user ID from JWT token
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authorization token required' });
    }
    
    const token = authHeader.split(' ')[1];
    
    try {
      const secret = process.env.JWT_SECRET || 'fallback_secret_key';
      const decoded = jwt.verify(token, secret);
      const userId = decoded.userId;
      const { page = 1, limit = 20, type } = req.query;
      
      // Build query to find chats where user is a participant
      let query = { participants: userId };
      if (type) {
        query.type = type;
      }
      
      // Try to get from cache first
      const cacheKey = `user_chats:${userId}:${type || 'all'}:${page}:${limit}`;
      let chats = await redisUtils.getCachedUserChats(cacheKey);
      
      if (!chats) {
        // Calculate skip for pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        // Find chats where user is a participant
        chats = await Chat.find(query)
          .populate('lastMessage', 'content senderId createdAt messageType isDeleted')
          .populate('participants', 'username firstName lastName profilePicture')
          .sort({ lastMessageAt: -1 })
          .skip(skip)
          .limit(parseInt(limit))
          .lean();
        
        // Cache the results
        await redisUtils.cacheUserChats(cacheKey, chats);
      }
      
      // Get total count for pagination
      const total = await Chat.countDocuments(query);
      
      res.json({
        chats,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      });
    } catch (verifyError) {
      if (verifyError.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired' });
      }
      return res.status(401).json({ message: 'Invalid token' });
    }
  } catch (error) {
    console.error('Get chats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get specific chat by ID
const getChatById = async (req, res) => {
  try {
    const { chatId } = req.params;
    
    // Extract user ID from JWT token
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authorization token required' });
    }
    
    const token = authHeader.split(' ')[1];
    
    try {
      const secret = process.env.JWT_SECRET || 'fallback_secret_key';
      const decoded = jwt.verify(token, secret);
      const userId = decoded.userId;
      
      // Find the chat where user is a participant
      const chat = await Chat.findOne({
        _id: chatId,
        participants: userId
      })
      .populate('participants', 'username firstName lastName profilePicture')
      .populate('admins', 'username')
      .populate('lastMessage', 'content senderId createdAt messageType');
      
      if (!chat) {
        return res.status(404).json({ message: 'Chat not found or access denied' });
      }
      
      res.json({ chat });
    } catch (verifyError) {
      if (verifyError.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired' });
      }
      return res.status(401).json({ message: 'Invalid token' });
    }
  } catch (error) {
    console.error('Get chat by ID error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get messages from a specific chat
const getChatMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { page = 1, limit = 50, before } = req.query;
    
    // Extract user ID from JWT token
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authorization token required' });
    }
    
    const token = authHeader.split(' ')[1];
    
    try {
      const secret = process.env.JWT_SECRET || 'fallback_secret_key';
      const decoded = jwt.verify(token, secret);
      const userId = decoded.userId;
      
      // Verify user has access to this chat
      const chat = await Chat.findOne({
        _id: chatId,
        participants: userId
      });
      
      if (!chat) {
        return res.status(404).json({ message: 'Chat not found or access denied' });
      }
      
      // Try to get from cache first
      const cacheKey = `${chatId}_messages_${page}_${limit}_${before || 'none'}`;
      let messages = await redisUtils.getCachedChatMessages(cacheKey);
      
      if (!messages) {
        // Build query for messages
        let query = { chatId };
        
        // If 'before' date is provided, get messages before that date
        if (before) {
          query.createdAt = { $lt: new Date(before) };
        }
        
        // Calculate skip for pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        // Find messages in the chat
        messages = await Message.find(query)
          .populate('senderId', 'username firstName lastName profilePicture')
          .populate('replyTo', 'content senderId createdAt')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit))
          .lean();
        
        // Cache the results
        await redisUtils.cacheChatMessages(cacheKey, messages);
      }
      
      // Get total count for pagination
      const total = await Message.countDocuments({ chatId });
      
      res.json({
        messages: messages.reverse(), // Reverse to get chronological order (oldest first)
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      });
    } catch (verifyError) {
      if (verifyError.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired' });
      }
      return res.status(401).json({ message: 'Invalid token' });
    }
  } catch (error) {
    console.error('Get chat messages error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Send a message to a chat
const sendMessage = async (req, res) => {
  try {
    const { chatId, content, messageType = 'text', replyTo = null } = req.body;
    
    // Extract user ID from JWT token
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authorization token required' });
    }
    
    const token = authHeader.split(' ')[1];
    
    try {
      const secret = process.env.JWT_SECRET || 'fallback_secret_key';
      const decoded = jwt.verify(token, secret);
      const userId = decoded.userId;
      
      // Verify user has access to this chat
      const chat = await Chat.findOne({
        _id: chatId,
        participants: userId
      });
      
      if (!chat) {
        return res.status(404).json({ message: 'Chat not found or access denied' });
      }
      
      // Create and save the message
      const message = new Message({
        chatId,
        senderId: userId,
        content,
        messageType,
        replyTo
      });
      
      await message.save();
      
      // Update chat with last message info
      chat.lastMessage = message._id;
      chat.lastMessageAt = message.createdAt;
      if (chat.unreadCount) {
        // Reset unread count for sender
        chat.unreadCount.set(userId, 0);
      }
      await chat.save();
      
      // Add message to Redis cache
      await redisUtils.addMessageToCache(chatId, message);
      
      res.status(201).json({ message });
    } catch (verifyError) {
      if (verifyError.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired' });
      }
      return res.status(401).json({ message: 'Invalid token' });
    }
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update a chat (e.g., add/remove participants, change name)
const updateChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const updateData = req.body;
    
    // Extract user ID from JWT token
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authorization token required' });
    }
    
    const token = authHeader.split(' ')[1];
    
    try {
      const secret = process.env.JWT_SECRET || 'fallback_secret_key';
      const decoded = jwt.verify(token, secret);
      const userId = decoded.userId;
      
      // Find the chat and verify user is an admin (for group chats) or participant (for direct chats)
      const chat = await Chat.findById(chatId);
      
      if (!chat) {
        return res.status(404).json({ message: 'Chat not found' });
      }
      
      // For group chats, user must be an admin to make changes
      if (chat.type === 'group' && !chat.admins.includes(userId)) {
        return res.status(403).json({ message: 'Only admins can update this chat' });
      }
      
      // For direct chats, both participants can make changes
      if (chat.type === 'direct' && !chat.participants.includes(userId)) {
        return res.status(403).json({ message: 'You are not a participant of this chat' });
      }
      
      // Update allowed fields
      const allowedUpdates = ['name', 'description', 'avatar', 'isArchived', 'isMuted'];
      const validUpdateData = {};
      
      for (const [key, value] of Object.entries(updateData)) {
        if (allowedUpdates.includes(key)) {
          validUpdateData[key] = value;
        }
      }
      
      // Update the chat
      Object.assign(chat, validUpdateData);
      await chat.save();
      
      // Clear cached chat lists for participants
      for (const participantId of chat.participants) {
        await redisUtils.deleteCachedUserChats(participantId);
      }
      
      res.json({ chat });
    } catch (verifyError) {
      if (verifyError.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired' });
      }
      return res.status(401).json({ message: 'Invalid token' });
    }
  } catch (error) {
    console.error('Update chat error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete a message
const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    
    // Extract user ID from JWT token
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authorization token required' });
    }
    
    const token = authHeader.split(' ')[1];
    
    try {
      const secret = process.env.JWT_SECRET || 'fallback_secret_key';
      const decoded = jwt.verify(token, secret);
      const userId = decoded.userId;
      
      // Find the message
      const message = await Message.findById(messageId);
      
      if (!message) {
        return res.status(404).json({ message: 'Message not found' });
      }
      
      // Only message sender can delete their own message
      if (message.senderId !== userId) {
        return res.status(403).json({ message: 'Only the message sender can delete this message' });
      }
      
      // Mark message as deleted (soft delete)
      message.isDeleted = true;
      message.deletedFor = [userId]; // Track who has deleted the message
      await message.save();
      
      // Update cache
      await redisUtils.addMessageToCache(message.chatId.toString(), message);
      
      res.json({ message: 'Message deleted successfully' });
    } catch (verifyError) {
      if (verifyError.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired' });
      }
      return res.status(401).json({ message: 'Invalid token' });
    }
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  createChat,
  getChats,
  getChatById,
  getChatMessages,
  sendMessage,
  deleteMessage,
  updateChat
};