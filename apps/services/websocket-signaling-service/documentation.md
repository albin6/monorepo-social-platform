# Websocket Signaling Service

## Purpose
The Websocket Signaling Service manages real-time communication between clients using WebSockets. It handles connection establishment, message routing, presence information, and signaling for peer-to-peer connections. This service serves as the backbone for real-time features like chat, notifications, and live updates.

## API Summary

### WebSocket Endpoints

#### WebSocket Connection: /ws
- Establish WebSocket connection
- Requires authentication token
- Supports connection validation and heartbeat

#### WebSocket Events

- `connect`: Emitted when a client connects
- `disconnect`: Emitted when a client disconnects
- `join-room`: Join a specific room/channel
- `leave-room`: Leave a specific room/channel
- `message`: Send message to a specific user or room
- `presence`: Update user presence status
- `typing`: Indicate typing status
- `read-receipt`: Mark messages as read

### REST Endpoints (for connection management)

#### POST /connections
- Register a new WebSocket connection
- Request body: `{ userId, socketId, deviceInfo }`
- Response: `{ connectionId, status }`

#### DELETE /connections/:connectionId
- Disconnect a WebSocket connection
- Response: `{ message: "Connection closed" }`

#### GET /connections/:userId
- Get active connections for a user
- Response: `{ connections: [...] }`

#### GET /presence/:userId
- Get user's online status
- Response: `{ userId, status, lastSeen, connections }`

#### PUT /presence/:userId
- Update user's presence status
- Request body: `{ status, lastSeen }`
- Response: `{ userId, status }`

#### POST /broadcast
- Broadcast message to all connected users
- Requires admin privileges
- Request body: `{ message, type }`
- Response: `{ message: "Broadcast sent" }`

#### POST /rooms
- Create a new room
- Request body: `{ name, type, participants, isPrivate }`
- Response: `{ room }`

#### GET /rooms/:roomId
- Get room information
- Response: `{ room }`

#### POST /rooms/:roomId/join
- Join a room
- Response: `{ message: "Joined room" }`

#### POST /rooms/:roomId/leave
- Leave a room
- Response: `{ message: "Left room" }`

## Architecture

The service follows a modular architecture optimized for real-time communication:

- **Controllers**: Handle WebSocket and HTTP requests
- **Models**: Define connection and presence schemas
- **Routes**: Define REST API endpoints
- **Services**: Handle real-time communication logic
- **Utils**: WebSocket utilities, connection management, etc.

## Features

- Real-time messaging with WebSocket
- Room-based communication
- User presence tracking
- Message broadcasting
- Connection pooling and management
- Heartbeat/ping-pong for connection health
- Automatic reconnection handling