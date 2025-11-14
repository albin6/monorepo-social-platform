const express = require('express');
const { param, query, body } = require('express-validator');
const router = express.Router();
const { 
  getNotifications, 
  getUnreadCount, 
  markAsRead, 
  markAllAsRead, 
  deleteNotification,
  markAsSeen
} = require('../controllers/notificationController');

// Validation middleware
const validateNotificationType = [
  query('type').optional().isIn([
    'friend_request', 'friend_request_accepted', 'friend_request_rejected',
    'message', 'call', 'system', 'mention', 'reaction',
    'group_invite', 'post_like', 'post_comment'
  ]).withMessage('Invalid notification type')
];

// Get user's notifications
router.get('/notifications', [
  ...validateNotificationType,
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  query('isRead').optional().isIn(['true', 'false']),
  query('isSeen').optional().isIn(['true', 'false'])
], getNotifications);

// Get unread notification count
router.get('/notifications/unread-count', getUnreadCount);

// Mark a notification as read
router.put('/notifications/:notificationId/read', [
  param('notificationId').isMongoId().withMessage('Valid notification ID required')
], markAsRead);

// Mark all notifications as read
router.put('/notifications/mark-all-read', markAllAsRead);

// Mark a notification as seen
router.put('/notifications/:notificationId/seen', [
  param('notificationId').isMongoId().withMessage('Valid notification ID required')
], markAsSeen);

// Delete a notification
router.delete('/notifications/:notificationId', [
  param('notificationId').isMongoId().withMessage('Valid notification ID required')
], deleteNotification);

module.exports = router;