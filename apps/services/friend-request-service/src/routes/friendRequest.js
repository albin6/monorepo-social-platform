const express = require('express');
const { body, param, query } = require('express-validator');
const router = express.Router();
const { 
  sendFriendRequest, 
  respondToFriendRequest, 
  getFriendRequests, 
  getFriendsList, 
  unfriend,
  getPendingRequestsCount
} = require('../controllers/friendRequestController');

// Validation middleware
const validateSendRequest = [
  body('receiverId').notEmpty().withMessage('Receiver ID is required'),
  body('message').optional().isLength({ max: 200 }).withMessage('Message must be less than 200 characters')
];

const validateRespondRequest = [
  body('requestId').notEmpty().withMessage('Request ID is required'),
  body('action').isIn(['accept', 'reject', 'cancel']).withMessage('Action must be accept, reject, or cancel')
];

// Send a friend request
router.post('/send', validateSendRequest, sendFriendRequest);

// Respond to a friend request (accept/reject)
router.post('/respond', validateRespondRequest, respondToFriendRequest);

// Get friend requests (incoming/outgoing)
router.get('/requests', [
  query('type').optional().isIn(['sent', 'received']).withMessage('Type must be sent or received')
], getFriendRequests);

// Get pending friend requests count
router.get('/requests/count', getPendingRequestsCount);

// Get friends list
router.get('/friends', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
], getFriendsList);

// Unfriend someone
router.delete('/unfriend/:userId', [
  param('userId').notEmpty().withMessage('User ID is required')
], unfriend);

module.exports = router;