// tests/integration/testData.js
// Test data for integration tests

const testUsers = [
  {
    id: 'test-user-1',
    username: 'testuser1',
    email: 'testuser1@example.com',
    password: 'SecurePassword123!',
    firstName: 'Test',
    lastName: 'User1',
    dateOfBirth: '1990-01-01',
    bio: 'Test user for integration tests',
    isVerified: true,
    isPrivate: false
  },
  {
    id: 'test-user-2',
    username: 'testuser2',
    email: 'testuser2@example.com',
    password: 'SecurePassword123!',
    firstName: 'Test',
    lastName: 'User2',
    dateOfBirth: '1992-05-15',
    bio: 'Another test user for integration tests',
    isVerified: true,
    isPrivate: false
  },
  {
    id: 'test-user-3',
    username: 'testuser3',
    email: 'testuser3@example.com',
    password: 'SecurePassword123!',
    firstName: 'Test',
    lastName: 'User3',
    dateOfBirth: '1988-11-30',
    bio: 'Yet another test user for integration tests',
    isVerified: false, // Unverified user for testing
    isPrivate: true    // Private profile for testing
  }
];

const testProfiles = [
  {
    id: 'test-profile-1',
    userId: 'test-user-1',
    location: 'New York, NY',
    website: 'https://testuser1.com',
    phone: '+1234567890',
    occupation: 'Software Engineer',
    company: 'Test Company'
  },
  {
    id: 'test-profile-2',
    userId: 'test-user-2',
    location: 'San Francisco, CA',
    website: 'https://testuser2.com',
    phone: '+1987654321',
    occupation: 'Product Manager',
    company: 'Another Test Company'
  }
];

const testFriendRequests = [
  {
    id: 'test-friend-request-1',
    senderId: 'test-user-1',
    receiverId: 'test-user-2',
    status: 'pending',
    message: 'Hi, I would like to connect with you!',
    createdAt: new Date().toISOString()
  },
  {
    id: 'test-friend-request-2',
    senderId: 'test-user-3',
    receiverId: 'test-user-1',
    status: 'pending',
    message: 'Let\'s connect!',
    createdAt: new Date().toISOString()
  }
];

const testChatConversations = [
  {
    id: 'test-conversation-1',
    type: 'private',
    participants: ['test-user-1', 'test-user-2'],
    name: null,
    isArchived: false,
    isMuted: false
  },
  {
    id: 'test-conversation-2',
    type: 'group',
    participants: ['test-user-1', 'test-user-2', 'test-user-3'],
    name: 'Test Group Chat',
    isArchived: false,
    isMuted: false
  }
];

const testChatMessages = [
  {
    id: 'test-message-1',
    conversationId: 'test-conversation-1',
    senderId: 'test-user-1',
    content: 'Hello, this is a test message!',
    type: 'text',
    createdAt: new Date().toISOString()
  },
  {
    id: 'test-message-2',
    conversationId: 'test-conversation-1',
    senderId: 'test-user-2',
    content: 'Hi there! This is a reply to the test message.',
    type: 'text',
    createdAt: new Date(Date.now() + 10000).toISOString() // 10 seconds after first message
  }
];

const testNotifications = [
  {
    id: 'test-notification-1',
    userId: 'test-user-1',
    type: 'friend_request',
    title: 'New Friend Request',
    message: 'testuser2 wants to connect with you',
    isRead: false,
    createdAt: new Date().toISOString(),
    data: {
      senderId: 'test-user-2',
      requestType: 'friend_request'
    }
  },
  {
    id: 'test-notification-2',
    userId: 'test-user-2',
    type: 'message',
    title: 'New Message',
    message: 'testuser1 sent you a message',
    isRead: false,
    createdAt: new Date().toISOString(),
    data: {
      senderId: 'test-user-1',
      conversationId: 'test-conversation-1',
      messageId: 'test-message-1'
    }
  }
];

const testVideoCalls = [
  {
    id: 'test-call-1',
    callSessionId: 'call-session-123',
    callerId: 'test-user-1',
    calleeId: 'test-user-2',
    callType: 'video',
    status: 'completed',
    callStartedAt: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
    callEndedAt: new Date(Date.now() - 240000).toISOString(),   // 4 minutes ago
    durationSeconds: 60,
    signalingServerInfo: {
      server: 'staging-turn-server',
      protocol: 'TURN'
    }
  }
];

module.exports = {
  testUsers,
  testProfiles,
  testFriendRequests,
  testChatConversations,
  testChatMessages,
  testNotifications,
  testVideoCalls
};