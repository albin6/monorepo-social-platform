# Chat Service

## Purpose
The Chat Service handles all messaging functionality for the social platform, including one-on-one conversations, group chats, message history, file sharing, and message synchronization across devices. It provides APIs for sending, receiving, and managing messages.

## API Summary

### Conversation Endpoints

#### GET /conversations
- Get user's conversations
- Query parameters: `type`, `limit`, `offset`
- Response: `{ conversations: [...], total, limit, offset }`

#### GET /conversations/:conversationId
- Get specific conversation details
- Response: `{ conversation }`

#### POST /conversations
- Create a new conversation
- Request body: `{ type, participants, name (for groups) }`
- Response: `{ conversation }`

#### PUT /conversations/:conversationId
- Update conversation (name, avatar, etc. for groups)
- Response: `{ conversation }`

#### DELETE /conversations/:conversationId
- Delete conversation
- Response: `{ message: "Conversation deleted" }`

### Message Endpoints

#### GET /conversations/:conversationId/messages
- Get messages from a conversation
- Query parameters: `limit`, `offset`, `before`, `after`
- Response: `{ messages: [...], total, limit, offset }`

#### POST /conversations/:conversationId/messages
- Send a message in a conversation
- Request body: `{ content, type, attachments }`
- Response: `{ message }`

#### PUT /conversations/:conversationId/messages/:messageId
- Edit an existing message
- Response: `{ message }`

#### DELETE /conversations/:conversationId/messages/:messageId
- Delete a message
- Response: `{ message: "Message deleted" }`

#### POST /conversations/:conversationId/messages/:messageId/reactions
- Add a reaction to a message
- Request body: `{ reaction }`
- Response: `{ message }`

#### DELETE /conversations/:conversationId/messages/:messageId/reactions
- Remove a reaction from a message
- Response: `{ message }`

### Participant Endpoints

#### GET /conversations/:conversationId/participants
- Get conversation participants
- Response: `{ participants: [...] }`

#### POST /conversations/:conversationId/participants
- Add participant to conversation (for groups)
- Request body: `{ userId }`
- Response: `{ message: "Participant added" }`

#### DELETE /conversations/:conversationId/participants/:userId
- Remove participant from conversation
- Response: `{ message: "Participant removed" }`

### File Attachment Endpoints

#### POST /conversations/:conversationId/attachments
- Upload file to conversation
- Request body: form data with file
- Response: `{ attachment }`

#### GET /conversations/:conversationId/attachments
- Get conversation attachments
- Response: `{ attachments: [...] }`

### Read Receipt Endpoints

#### POST /conversations/:conversationId/read-receipts
- Mark messages as read
- Request body: `{ messageIds }`
- Response: `{ message: "Messages marked as read" }`

#### GET /conversations/:conversationId/unread-count
- Get unread message count
- Response: `{ count }`

## Architecture

The service follows a modular architecture with separation of concerns:

- **Controllers**: Handle HTTP requests and responses
- **Models**: Define conversation and message schemas
- **Routes**: Define API endpoints
- **Services**: Contain business logic for messaging
- **Utils**: Utility functions for file processing, etc.

## Features

- One-on-one and group chat capabilities
- Message history and search
- File attachments (images, documents, etc.)
- Message reactions and replies
- Read receipts and typing indicators
- Message encryption (optional)
- Conversation management (mute, archive, etc.)