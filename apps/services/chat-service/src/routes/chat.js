const express = require('express');
const { body, param, query } = require('express-validator');
const router = express.Router();
const { 
  createChat, 
  getChats, 
  getChatById, 
  getChatMessages, 
  sendMessage,
  deleteMessage,
  updateChat
} = require('../controllers/chatController');

// Validation middleware
const validateCreateChat = [
  body('participants').isArray({ min: 2 }).withMessage('At least 2 participants required'),
  body('participants.*').isString().withMessage('Participant IDs must be strings'),
  body('type').optional().isIn(['direct', 'group']).withMessage('Chat type must be direct or group'),
  body('name').optional().isLength({ max: 100 }).withMessage('Name must be less than 100 characters')
];

const validateSendMessage = [
  body('chatId').isMongoId().withMessage('Valid chat ID required'),
  body('content').notEmpty().withMessage('Message content required'),
  body('content').isLength({ max: 10000 }).withMessage('Message too long'),
  body('messageType').optional().isIn(['text', 'image', 'video', 'file', 'system']).withMessage('Invalid message type')
];

// Create a new chat
router.post('/chats', validateCreateChat, createChat);

// Get user's chats
router.get('/chats', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  query('type').optional().isIn(['direct', 'group'])
], getChats);

// Get specific chat by ID
router.get('/chats/:chatId', [
  param('chatId').isMongoId().withMessage('Valid chat ID required')
], getChatById);

// Get messages from a specific chat
router.get('/chats/:chatId/messages', [
  param('chatId').isMongoId().withMessage('Valid chat ID required'),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  query('before').optional().isISO8601().withMessage('Invalid date format')
], getChatMessages);

// Send a message to a chat
router.post('/messages', validateSendMessage, sendMessage);

// Update a chat (e.g., add/remove participants, change name)
router.put('/chats/:chatId', [
  param('chatId').isMongoId().withMessage('Valid chat ID required')
], updateChat);

// Delete a message
router.delete('/messages/:messageId', [
  param('messageId').isMongoId().withMessage('Valid message ID required')
], deleteMessage);

module.exports = router;