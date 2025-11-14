// apps/web/src/config/constants.js

// Application constants
export const APP_CONSTANTS = {
  NAME: 'Social Platform',
  VERSION: '1.0.0',
  LOCALE: 'en-US',
};

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: '/auth/verify-email',
    PROFILE: '/auth/profile',
  },
  USERS: {
    PROFILE: (userId) => `/profiles/${userId}`,
    SEARCH: '/profiles',
    FOLLOWERS: (userId) => `/profiles/${userId}/followers`,
    FOLLOWING: (userId) => `/profiles/${userId}/following`,
    PRIVACY: (userId) => `/profiles/${userId}/privacy`,
  },
  CHAT: {
    CONVERSATIONS: '/conversations',
    MESSAGES: (conversationId) => `/conversations/${conversationId}/messages`,
    ATTACHMENTS: (conversationId) => `/conversations/${conversationId}/attachments`,
    TYPING: (conversationId) => `/conversations/${conversationId}/typing`,
  },
  FRIENDS: {
    REQUESTS: '/friend-requests',
    FRIENDS_LIST: '/connections',
    FOLLOW: (userId) => `/connections/${userId}/follow`,
    UNFOLLOW: (userId) => `/connections/${userId}/follow`,
    BLOCK: (userId) => `/connections/${userId}/block`,
    UNBLOCK: (userId) => `/connections/${userId}/block`,
  },
  NOTIFICATIONS: {
    NOTIFICATIONS: '/notifications',
    READ: (notificationId) => `/notifications/${notificationId}/read`,
    READ_ALL: '/notifications/read-all',
    DELETE: (notificationId) => `/notifications/${notificationId}`,
  },
  VIDEO_CALL: {
    CALLS: '/calls',
    JOIN: (callId) => `/calls/${callId}/join`,
    ACCEPT: (callId) => `/calls/${callId}/accept`,
    REJECT: (callId) => `/calls/${callId}/reject`,
    HANGUP: (callId) => `/calls/${callId}/hangup`,
    HISTORY: '/calls/history',
  },
  MEDIA: {
    UPLOAD_AVATAR: '/media/avatar',
    UPLOAD_COVER: '/media/cover',
    UPLOAD_ATTACHMENT: '/media/attachment',
  },
  OTP: {
    GENERATE: '/otp/generate',
    VALIDATE: '/otp/validate',
    RESEND: '/otp/resend',
  },
};

// Socket event constants
export const SOCKET_EVENTS = {
  // Connection events
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  RECONNECT: 'reconnect',
  
  // Chat events
  MESSAGE: 'message',
  TYPING_START: 'typing-start',
  TYPING_STOP: 'typing-stop',
  READ_RECEIPT: 'read-receipt',
  JOIN_ROOM: 'join-room',
  LEAVE_ROOM: 'leave-room',
  
  // Friend request events
  FRIEND_REQUEST_SENT: 'friend-request-sent',
  FRIEND_REQUEST_RECEIVED: 'friend-request-received',
  FRIEND_REQUEST_RESPONDED: 'friend-request-responded',
  
  // Notification events
  NOTIFICATION: 'notification',
  
  // Video call events
  CALL_INITIATED: 'call-initiated',
  CALL_ANSWERED: 'call-answered',
  CALL_REJECTED: 'call-rejected',
  CALL_ENDED: 'call-ended',
  ICE_CANDIDATE: 'ice-candidate',
  CALL_USER: 'call-user',
  
  // User presence events
  USER_ONLINE: 'user-online',
  USER_OFFLINE: 'user-offline',
  USER_TYPING: 'user-typing',
};

// Message types
export const MESSAGE_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  VIDEO: 'video',
  AUDIO: 'audio',
  FILE: 'file',
  LOCATION: 'location',
  SYSTEM: 'system',
};

// Notification types
export const NOTIFICATION_TYPES = {
  FRIEND_REQUEST: 'friend_request',
  FRIEND_REQUEST_ACCEPTED: 'friend_request_accepted',
  MESSAGE: 'message',
  COMMENT: 'comment',
  LIKE: 'like',
  MENTION: 'mention',
  SYSTEM: 'system',
  MARKETING: 'marketing',
};

// Video call types
export const VIDEO_CALL_TYPES = {
  AUDIO_ONLY: 'audio',
  VIDEO: 'video',
};

// Video call statuses
export const VIDEO_CALL_STATUSES = {
  INITIATED: 'initiated',
  RINGING: 'ringing',
  CONNECTED: 'connected',
  ENDED: 'ended',
  MISSED: 'missed',
  REJECTED: 'rejected',
};

// User statuses
export const USER_STATUSES = {
  ONLINE: 'online',
  OFFLINE: 'offline',
  AWAY: 'away',
  BUSY: 'busy',
};

// Privacy settings
export const PRIVACY_SETTINGS = {
  PROFILE_VISIBILITY: {
    PUBLIC: 'public',
    FRIENDS: 'friends',
    PRIVATE: 'private',
  },
  CONTACT_INFO_VISIBILITY: {
    PUBLIC: 'public',
    FRIENDS: 'friends',
    PRIVATE: 'private',
  },
};

// File upload constants
export const FILE_UPLOAD = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  SUPPORTED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  SUPPORTED_VIDEO_TYPES: ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska'],
  SUPPORTED_AUDIO_TYPES: ['audio/mpeg', 'audio/wav', 'audio/mp4'],
  SUPPORTED_DOC_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
};

// Status codes
export const STATUS_CODES = {
  SUCCESS: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};