# Social Platform Web Application

The frontend web application for the Social Platform built with React and Redux Toolkit.

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Development](#development)
- [State Management](#state-management)
- [API Integration](#api-integration)
- [Testing](#testing)
- [Deployment](#deployment)

## Overview

The Social Platform web application provides a modern, responsive interface for users to connect, communicate, and share experiences. Built with React and following industry best practices, it offers a seamless social networking experience.

## Features

- **User Authentication**: Secure login, registration, and session management
- **Real-time Chat**: Instant messaging with typing indicators and read receipts
- **User Profiles**: Complete profile management with avatar and cover uploads
- **Friend Management**: Send, accept, and manage friend requests
- **Video Calling**: Real-time video and audio calls with WebRTC
- **Notifications**: Real-time notifications with different types
- **Discovery**: Find and connect with new people
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Technology Stack

- **Frontend Framework**: React 18
- **State Management**: Redux Toolkit
- **Routing**: React Router DOM
- **API Client**: Axios
- **Real-time Communication**: Socket.IO Client
- **UI Components**: Custom components with CSS
- **Form Handling**: React Hook Form
- **Validation**: Yup
- **Icons**: React Icons
- **Date Handling**: date-fns
- **Build Tool**: Create React App

## Project Structure

```
apps/web/
├── public/                 # Static assets
├── src/
│   ├── components/         # Reusable UI components
│   ├── pages/              # Page components (organized by feature)
│   │   ├── auth/           # Authentication pages
│   │   ├── profile/        # Profile pages
│   │   ├── chat/           # Chat pages
│   │   ├── friend-requests/ # Friend request pages
│   │   ├── video-call/     # Video call pages
│   │   ├── notifications/  # Notification pages
│   │   └── discovery/      # Discovery pages
│   ├── hooks/              # Custom React hooks
│   ├── services/           # API service functions
│   ├── contexts/           # React Context providers
│   ├── store/              # Redux store and slices
│   │   └── slices/         # Redux state slices
│   ├── assets/             # Images, icons, fonts
│   ├── styles/             # CSS styles
│   ├── utils/              # Utility functions
│   ├── config/             # Configuration files
│   ├── router/             # Routing configuration
│   └── tests/              # Test files
├── .env                    # Environment variables
├── package.json            # Project dependencies
└── README.md               # This file
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd social-platform/apps/web
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

4. Update the environment variables in `.env` with your configuration.

5. Start the development server:
```bash
npm start
```

The application will be available at `http://localhost:3000`.

## Environment Variables

The application uses the following environment variables:

- `REACT_APP_API_BASE_URL`: Base URL for the API server
- `REACT_APP_WEBSOCKET_URL`: WebSocket URL for real-time features
- `REACT_APP_NOTIFICATIONS_URL`: URL for notifications server
- `REACT_APP_JWT_TOKEN_KEY`: Local storage key for JWT token
- `REACT_APP_REFRESH_TOKEN_KEY`: Local storage key for refresh token
- `REACT_APP_CLOUDINARY_CLOUD_NAME`: Cloudinary cloud name for media uploads
- `REACT_APP_CLOUDINARY_API_KEY`: Cloudinary API key
- `REACT_APP_TURN_SERVER_URL`: TURN server URL for WebRTC
- `REACT_APP_TURN_USERNAME`: TURN server username
- `REACT_APP_TURN_PASSWORD`: TURN server password

## Development

### Running in Development Mode

```bash
npm start
```

This will start the development server with hot reloading enabled.

### Building for Production

```bash
npm run build
```

This will create an optimized production build in the `build` directory.

### Running Tests

```bash
npm test
```

This will run the tests in interactive watch mode.

### Available Scripts

- `npm start` - Starts the development server
- `npm run build` - Builds the app for production
- `npm test` - Runs the test watcher
- `npm run eject` - Ejects from Create React App (irreversible)

## State Management

The application uses Redux Toolkit for state management with the following slices:

- `userSlice`: Manages user profile and authentication state
- `chatSlice`: Handles chat conversations and messages
- `notificationSlice`: Manages notifications
- `friendSlice`: Handles friend requests and relationships
- `videoCallSlice`: Manages video call state

### Async Thunks

Each slice includes async thunks for API interactions that handle loading states and error handling automatically.

## API Integration

API calls are handled through:

1. `src/utils/apiUtils.js` - Axios client with interceptors for authentication
2. `src/services/` - Individual service files for each domain (users, chat, etc.)
3. Redux Toolkit async thunks for managing async state in the store

Authentication tokens are automatically included in requests and refreshed when needed.

## Testing

The application includes:

- Unit tests for components using React Testing Library
- Integration tests for API services
- Redux store tests for slice reducers and thunks
- Mock service workers for API mocking in tests

To run all tests:
```bash
npm test -- --watchAll=false
```

## Deployment

The application is built as a static site and can be deployed to:

- Static hosting services (Netlify, Vercel, GitHub Pages)
- CDN with a reverse proxy for API requests
- Traditional web servers (Apache, Nginx)

For production deployment, ensure that the environment variables are properly configured with production URLs.

### Build Optimization

The build process includes:
- Code splitting for route-based loading
- Asset optimization and compression
- Tree shaking to remove unused code
- Bundle analysis for performance optimization

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.