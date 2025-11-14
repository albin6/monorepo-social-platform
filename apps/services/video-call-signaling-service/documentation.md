# Video Call Signaling Service

## Purpose
The Video Call Signaling Service manages WebRTC signaling for video and audio calls between users. It handles connection establishment, session negotiation, ICE candidate exchange, and call routing. This service enables real-time video and audio communication between users of the social platform.

## API Summary

### WebRTC Signaling Endpoints

#### WebSocket Connection: /rtc
- Establish WebRTC signaling WebSocket connection
- Requires authentication token
- Supports connection validation and heartbeat

#### WebSocket Events

- `call-initiate`: Initiate a new call with offer SDP
- `call-answer`: Respond to an incoming call with answer SDP
- `ice-candidate`: Exchange ICE candidates for connection establishment
- `call-hangup`: End the call
- `call-reject`: Reject an incoming call
- `call-accept`: Accept an incoming call
- `call-sdp-update`: Update session description during call

### Video Call Endpoints

#### POST /calls
- Initiate a video call to a user
- Request body: `{ callerId, calleeId, callType, roomName }`
- Response: `{ callSession, roomId }`

#### PUT /calls/:callId/accept
- Accept an incoming call
- Response: `{ callSession }`

#### PUT /calls/:callId/reject
- Reject an incoming call
- Response: `{ message: "Call rejected" }`

#### PUT /calls/:callId/hangup
- End a call
- Response: `{ message: "Call ended" }`

#### PUT /calls/:callId/mute-audio
- Mute/unmute audio during call
- Request body: `{ mute: true/false }`
- Response: `{ message: "Audio muted/unmuted" }`

#### PUT /calls/:callId/mute-video
- Mute/unmute video during call
- Request body: `{ mute: true/false }`
- Response: `{ message: "Video muted/unmuted" }`

#### PUT /calls/:callId/switch-camera
- Switch camera during call
- Response: `{ message: "Camera switched" }`

#### GET /calls/:callId
- Get call session details
- Response: `{ callSession }`

#### GET /calls/history
- Get call history for a user
- Query parameters: `limit`, `offset`, `type`, `status`
- Response: `{ calls: [...], total, limit, offset }`

### Room Endpoints

#### POST /rooms
- Create a video call room
- Request body: `{ name, maxParticipants, isPrivate }`
- Response: `{ room }`

#### GET /rooms/:roomId
- Get room details
- Response: `{ room }`

#### POST /rooms/:roomId/join
- Join a video call room
- Response: `{ room, peerId }`

#### POST /rooms/:roomId/leave
- Leave a video call room
- Response: `{ message: "Left room" }`

#### DELETE /rooms/:roomId
- Delete a video call room
- Response: `{ message: "Room deleted" }`

### STUN/TURN Server Endpoints

#### GET /ice-config
- Get ICE server configuration for WebRTC
- Response: `{ iceServers: [...] }`

### Call Analytics Endpoints

#### GET /calls/:callId/analytics
- Get call analytics and statistics
- Response: `{ analytics: { duration, quality, participants, ... } }`

## Architecture

The service follows a modular architecture optimized for real-time communication:

- **Controllers**: Handle WebSocket and HTTP requests
- **Models**: Define call session and room schemas
- **Routes**: Define REST API endpoints
- **Services**: Handle WebRTC signaling and call logic
- **Utils**: WebRTC utilities, connection management, etc.

## Features

- WebRTC signaling for video calls
- Real-time audio and video communication
- Group video call support
- Call history tracking
- Video call analytics
- ICE server configuration
- Call quality metrics
- Screen sharing support
- Device management during calls