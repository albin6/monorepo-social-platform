# Database Schema Documentation

## Auth Service

### User Collection
```javascript
{
  _id: ObjectId,
  email: String,           // Required, unique, lowercase
  username: String,        // Required, unique, lowercase
  password: String,        // Required, hashed
  firstName: String,
  lastName: String,
  bio: String,
  avatar: String,
  isActive: Boolean,       // Default: true
  isVerified: Boolean,     // Default: false
  lastLogin: Date,
  loginAttempts: Number,   // Default: 0
  lockUntil: Date,        // For account locking
  createdAt: Date,
  updatedAt: Date
}
```

## User Profile Service

### UserProfile Collection
```javascript
{
  _id: ObjectId,
  userId: String,          // Required, unique, references user in auth service
  firstName: String,
  lastName: String, 
  username: String,        // Required, unique
  email: String,           // Required, unique
  bio: String,
  age: Number,
  gender: String,          // Enum: ['male', 'female', 'other', 'prefer_not_to_say']
  location: {
    type: String,          // Default: 'Point'
    coordinates: [Number], // [longitude, latitude]
    address: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  },
  profilePicture: String,  // URL to image
  coverPicture: String,
  dateOfBirth: Date,
  privacySettings: {
    showEmail: Boolean,    // Default: false
    showAge: Boolean,      // Default: true
    showLocation: Boolean, // Default: true
    allowFriendRequests: Boolean // Default: true
  },
  socialLinks: [{
    platform: String,
    url: String
  }],
  isActive: Boolean,       // Default: true
  isVerified: Boolean,     // Default: false
  lastSeen: Date,         // Default: Date.now
  preferences: {
    notificationSettings: {
      email: Boolean,      // Default: true
      push: Boolean,       // Default: true
      sms: Boolean,        // Default: false
    },
    discoverability: {
      allowDiscovery: Boolean, // Default: true
      showInSearch: Boolean,   // Default: true
      distanceUnit: String,    // Default: 'km'
    }
  },
  createdAt: Date,
  updatedAt: Date
}
```

## Friend Request Service

### FriendRequest Collection
```javascript
{
  _id: ObjectId,
  senderId: String,        // Required, references user
  receiverId: String,      // Required, references user
  status: String,          // Enum: ['pending', 'accepted', 'rejected', 'cancelled']
  createdAt: Date,
  updatedAt: Date,
  message: String,         // Optional, max 200 chars
  __v: Number
}
```

### Friendship Collection
```javascript
{
  _id: ObjectId,
  userId1: String,         // Required, references user
  userId2: String,         // Required, references user
  status: String,          // Enum: ['active', 'blocked', 'removed']
  createdAt: Date,
  updatedAt: Date,
  isBlocked: Boolean,      // Default: false
  __v: Number
}
```

## Chat Service

### Chat Collection
```javascript
{
  _id: ObjectId,
  participants: [String],  // Array of userIds, required
  type: String,            // Required, Enum: ['direct', 'group']
  name: String,            // Optional, for group chats
  description: String,     // Optional
  avatar: String,          // URL for group avatars
  admins: [String],        // Array of userIds (for group chats)
  isArchived: Boolean,     // Default: false
  isMuted: Boolean,        // Default: false
  lastMessage: ObjectId,   // Reference to Message
  lastMessageAt: Date,
  unreadCount: Map,        // Map of userId -> count
  createdAt: Date,
  updatedAt: Date
}
```

### Message Collection
```javascript
{
  _id: ObjectId,
  chatId: ObjectId,        // Required, reference to Chat
  senderId: String,        // Required, reference to user
  content: String,         // Required, max 10000 chars
  messageType: String,     // Enum: ['text', 'image', 'video', 'file', 'system']
  mediaUrl: String,        // URL if messageType is media
  mediaType: String,       // Type of media if applicable
  replyTo: ObjectId,       // Reference to parent message
  isEdited: Boolean,       // Default: false
  isDeleted: Boolean,      // Default: false
  deletedFor: [String],    // Array of userIds who deleted the message
  readBy: [String],        // Array of userIds who read the message
  deliveredTo: [String],   // Array of userIds who received the message
  reactions: [{
    userId: String,
    reaction: String,      // Emoji, max 10 chars
    timestamp: Date,       // Default: Date.now
  }],
  mentions: [{
    userId: String,        // User ID mentioned
    startIndex: Number,    // Position where mention starts in content
    endIndex: Number       // Position where mention ends in content
  }],
  createdAt: Date,
  updatedAt: Date
}
```

## Notification Service

### Notification Collection
```javascript
{
  _id: ObjectId,
  userId: String,          // Required, reference to user receiving notification
  type: String,            // Required, Enum: ['friend_request', 'message', 'call', etc.]
  title: String,           // Required, max 100 chars
  message: String,         // Required, max 500 chars
  data: Mixed,             // Additional data as needed
  isRead: Boolean,         // Default: false
  isSeen: Boolean,         // Default: false
  readAt: Date,
  seenAt: Date,
  expiresAt: Date,         // Optional expiration
  createdAt: Date,
  updatedAt: Date
}
```

## Indexes Summary

### Auth Service
- User: { email: 1 } (unique), { username: 1 } (unique)

### User Profile Service
- UserProfile: { userId: 1 } (unique), { username: 1 } (unique), { 'location.coordinates': '2dsphere' }, { age: 1 }, { gender: 1 }, { createdAt: -1 }

### Friend Request Service
- FriendRequest: { senderId: 1, receiverId: 1 } (unique), { receiverId: 1, status: 1 }
- Friendship: { userId1: 1, userId2: 1 } (unique)

### Chat Service
- Chat: { participants: 1 }, { lastMessageAt: -1 }, { type: 1, participants: 1 }
- Message: { chatId: 1, createdAt: -1 }, { senderId: 1, createdAt: -1 }, { chatId: 1, senderId: 1 }, { createdAt: -1 }

### Notification Service
- Notification: { userId: 1, createdAt: -1 }, { userId: 1, isRead: 1 }, { userId: 1, isSeen: 1 }, { expiresAt: 1 } (TTL)