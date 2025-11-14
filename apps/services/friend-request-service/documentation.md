# Friend Request Service

## Purpose
The Friend Request Service manages friend connections, follow relationships, and social network connections between users. It provides APIs for sending, accepting, declining, and managing friend requests as well as maintaining a list of connections.

## API Summary

### Friend Request Endpoints

#### POST /friend-requests
- Send a friend request
- Request body: `{ senderId, receiverId, message (optional) }`
- Response: `{ friendRequest }`

#### GET /friend-requests
- Get friend requests for the authenticated user
- Query parameters: `status`, `limit`, `offset`
- Response: `{ friendRequests: [...], total, limit, offset }`

#### PUT /friend-requests/:requestId/accept
- Accept a friend request
- Response: `{ message: "Friend request accepted", friendConnection }`

#### PUT /friend-requests/:requestId/decline
- Decline a friend request
- Response: `{ message: "Friend request declined" }`

#### PUT /friend-requests/:requestId/cancel
- Cancel a sent friend request
- Response: `{ message: "Friend request cancelled" }`

#### DELETE /friend-requests/:requestId
- Delete a friend request
- Response: `{ message: "Friend request deleted" }`

### Connection Endpoints

#### GET /connections
- Get user's connections (friends/followings)
- Query parameters: `type`, `limit`, `offset`
- Response: `{ connections: [...], total, limit, offset }`

#### GET /connections/:userId
- Get specific connection details
- Response: `{ connection }`

#### DELETE /connections/:userId
- Remove a connection
- Response: `{ message: "Connection removed" }`

#### POST /connections/:userId/block
- Block a user
- Response: `{ message: "User blocked" }`

#### DELETE /connections/:userId/block
- Unblock a user
- Response: `{ message: "User unblocked" }`

#### GET /connections/:userId/is-connected
- Check if two users are connected
- Response: `{ isConnected: true/false }`

### Followers/Following Endpoints

#### POST /connections/:userId/follow
- Follow a user
- Response: `{ message: "Started following user", connection }`

#### DELETE /connections/:userId/follow
- Unfollow a user
- Response: `{ message: "Stopped following user" }`

#### GET /connections/:userId/followers
- Get user's followers
- Response: `{ followers: [...] }`

#### GET /connections/:userId/following
- Get users that a user is following
- Response: `{ following: [...] }`

#### GET /connections/:userId/follow-status
- Get follow status with another user
- Response: `{ status: "following"|"followed_by"|"mutual"|"none" }`

## Architecture

The service follows a modular architecture with separation of concerns:

- **Controllers**: Handle HTTP requests and responses
- **Models**: Define friend request and connection schemas
- **Routes**: Define API endpoints
- **Services**: Contain business logic for connection management
- **Utils**: Utility functions for validation, etc.

## Features

- Friend request management (send, accept, decline, cancel)
- Follow/unfollow functionality
- Connection status tracking
- User blocking/unblocking
- Mutual friend identification
- Connection statistics and analytics