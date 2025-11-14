# Notification Service

## Purpose
The Notification Service manages all types of notifications for users, including push notifications, in-app notifications, and email notifications. It provides APIs for creating, sending, managing, and tracking notifications across different channels and devices.

## API Summary

### Notification Endpoints

#### POST /notifications
- Create and send a new notification
- Request body: `{ userId, type, title, message, data, channels }`
- Response: `{ notification }`

#### GET /notifications
- Get user's notifications
- Query parameters: `type`, `status`, `limit`, `offset`, `from`, `to`
- Response: `{ notifications: [...], total, limit, offset }`

#### PUT /notifications/:notificationId/read
- Mark a notification as read
- Response: `{ notification }`

#### PUT /notifications/:notificationId/unread
- Mark a notification as unread
- Response: `{ notification }`

#### PUT /notifications/read-all
- Mark all notifications as read for a user
- Response: `{ message: "All notifications marked as read" }`

#### DELETE /notifications/:notificationId
- Delete a notification
- Response: `{ message: "Notification deleted" }`

#### DELETE /notifications
- Delete all notifications for a user (with optional filters)
- Response: `{ message: "Notifications deleted" }`

### Subscription Endpoints

#### POST /subscriptions
- Subscribe a device to notifications
- Request body: `{ userId, deviceId, deviceType, token, channels }`
- Response: `{ subscription }`

#### GET /subscriptions
- Get user's notification subscriptions
- Response: `{ subscriptions: [...] }`

#### PUT /subscriptions/:subscriptionId
- Update a subscription
- Response: `{ subscription }`

#### DELETE /subscriptions/:subscriptionId
- Unsubscribe a device
- Response: `{ message: "Unsubscribed" }`

### Preference Endpoints

#### GET /preferences/:userId
- Get user's notification preferences
- Response: `{ preferences }`

#### PUT /preferences/:userId
- Update user's notification preferences
- Request body: `{ emailNotifications, pushNotifications, smsNotifications, notificationTypes }`
- Response: `{ preferences }`

### Template Endpoints

#### GET /templates
- Get notification templates
- Query parameters: `type`
- Response: `{ templates: [...] }`

#### GET /templates/:templateId
- Get specific notification template
- Response: `{ template }`

#### POST /templates
- Create a new notification template
- Request body: `{ name, type, title, message, dataSchema }`
- Response: `{ template }`

#### PUT /templates/:templateId
- Update a notification template
- Response: `{ template }`

#### DELETE /templates/:templateId
- Delete a notification template
- Response: `{ message: "Template deleted" }`

### Bulk Notification Endpoints

#### POST /notifications/bulk
- Send notifications to multiple users
- Request body: `{ userIds, type, title, message, data }`
- Response: `{ message: "Bulk notifications sent", count: numberSent }`

#### POST /notifications/broadcast
- Broadcast notification to all users
- Request body: `{ type, title, message, data }`
- Response: `{ message: "Broadcast notification sent", count: totalUsers }`

## Architecture

The service follows a modular architecture with separation of concerns:

- **Controllers**: Handle HTTP requests and responses
- **Models**: Define notification, subscription, and preference schemas
- **Routes**: Define API endpoints
- **Services**: Contain business logic for notification management
- **Utils**: Utility functions for message formatting, etc.

## Features

- Multi-channel notifications (push, email, in-app)
- Notification templates for consistent messaging
- User preference management
- Device subscription management
- Read/unread status tracking
- Notification history and search
- Bulk and broadcast notifications
- Delivery status tracking
- Notification scheduling