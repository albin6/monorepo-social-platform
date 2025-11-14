// apps/web/src/config/environment.js

// Environment configuration
const environmentConfig = {
  // API Configuration
  API_BASE_URL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001',
  
  // WebSocket Configuration
  WEBSOCKET_URL: process.env.REACT_APP_WEBSOCKET_URL || 'ws://localhost:3003',
  NOTIFICATIONS_URL: process.env.REACT_APP_NOTIFICATIONS_URL || 'ws://localhost:3006',
  
  // Authentication
  JWT_TOKEN_KEY: process.env.REACT_APP_JWT_TOKEN_KEY || 'social_platform_jwt_token',
  REFRESH_TOKEN_KEY: process.env.REACT_APP_REFRESH_TOKEN_KEY || 'social_platform_refresh_token',
  
  // Third-party Services
  CLOUDINARY: {
    CLOUD_NAME: process.env.REACT_APP_CLOUDINARY_CLOUD_NAME,
    API_KEY: process.env.REACT_APP_CLOUDINARY_API_KEY,
  },
  
  // TURN/STUN Servers for WebRTC
  TURN_SERVER: {
    URL: process.env.REACT_APP_TURN_SERVER_URL || 'turn:your-turn-server.com:3478',
    USERNAME: process.env.REACT_APP_TURN_USERNAME,
    PASSWORD: process.env.REACT_APP_TURN_PASSWORD,
  },
  
  // Feature Flags
  FEATURES: {
    ENABLE_VIDEO_CALLS: process.env.REACT_APP_ENABLE_VIDEO_CALLS === 'true',
    ENABLE_STORIES: process.env.REACT_APP_ENABLE_STORIES === 'true',
    ENABLE_LIVE_STREAMING: process.env.REACT_APP_ENABLE_LIVE_STREAMING === 'true',
  },
  
  // Social Media Integration
  SOCIAL: {
    GOOGLE_CLIENT_ID: process.env.REACT_APP_GOOGLE_CLIENT_ID,
    FACEBOOK_APP_ID: process.env.REACT_APP_FACEBOOK_APP_ID,
    TWITTER_API_KEY: process.env.REACT_APP_TWITTER_API_KEY,
  },
  
  // Analytics
  ANALYTICS: {
    GOOGLE_ANALYTICS_ID: process.env.REACT_APP_GOOGLE_ANALYTICS_ID,
    SENTRY_DSN: process.env.REACT_APP_SENTRY_DSN,
  },
  
  // Push Notifications
  PUSH_NOTIFICATIONS: {
    VAPID_PUBLIC_KEY: process.env.REACT_APP_VAPID_PUBLIC_KEY,
  },
  
  // Default Settings
  DEFAULTS: {
    AVATAR_PLACEHOLDER: '/images/default-avatar.png',
    COVER_PLACEHOLDER: '/images/default-cover.jpg',
    CHAT_PAGE_SIZE: 50,
    NOTIFICATIONS_PAGE_SIZE: 20,
    FRIENDS_PAGE_SIZE: 20,
  },
  
  // Timeouts and intervals
  TIMEOUTS: {
    API_REQUEST: 10000, // 10 seconds
    WEBSOCKET_RECONNECT: 5000, // 5 seconds
    NOTIFICATION_LIFETIME: 5000, // 5 seconds
    PING_INTERVAL: 30000, // 30 seconds
  }
};

export default environmentConfig;

// Helper function to check if running in development
export const isDevelopment = () => process.env.NODE_ENV === 'development';
export const isProduction = () => process.env.NODE_ENV === 'production';
export const isTest = () => process.env.NODE_ENV === 'test';