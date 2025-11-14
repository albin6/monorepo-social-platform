# User Profile Service

## Purpose
The User Profile Service manages user profile data, including personal information, preferences, privacy settings, and profile pictures. It provides APIs for creating, reading, updating, and deleting user profiles, as well as searching and filtering user profiles.

## API Summary

### Profile Endpoints

#### GET /profiles/:userId
- Get user profile by ID
- Response: `{ id, username, firstName, lastName, email, bio, avatar, coverPhoto, location, website, socialLinks, privacySettings, createdAt, updatedAt }`

#### PUT /profiles/:userId
- Update user profile
- Requires authentication and authorization
- Request body: `{ firstName, lastName, bio, avatar, coverPhoto, location, website, socialLinks, privacySettings }`
- Response: `{ user }`

#### GET /profiles
- Search and filter user profiles
- Query parameters: `username`, `name`, `location`, `limit`, `offset`
- Response: `{ profiles: [...], total, limit, offset }`

#### GET /profiles/:userId/followers
- Get user's followers
- Response: `{ followers: [...], total }`

#### GET /profiles/:userId/following
- Get users that a user is following
- Response: `{ following: [...], total }`

#### POST /profiles/:userId/avatar
- Upload/update profile avatar
- Requires authentication
- Response: `{ avatarUrl }`

#### POST /profiles/:userId/cover
- Upload/update profile cover photo
- Requires authentication
- Response: `{ coverUrl }`

#### GET /profiles/:userId/posts
- Get user's posts
- Response: `{ posts: [...], total }`

### Privacy Settings Endpoints

#### GET /profiles/:userId/privacy
- Get user's privacy settings
- Response: `{ profileVisibility, contactInfoVisibility, blockList, allowFollowers }`

#### PUT /profiles/:userId/privacy
- Update user's privacy settings
- Request body: `{ profileVisibility, contactInfoVisibility, blockList, allowFollowers }`
- Response: `{ privacySettings }`

## Architecture

The service follows a modular architecture with separation of concerns:

- **Controllers**: Handle HTTP requests and responses
- **Models**: Define data schemas and database interactions
- **Routes**: Define API endpoints
- **Services**: Contain business logic
- **Utils**: Utility functions for validation, image processing, etc.

## Features

- Profile creation, retrieval, and updates
- Privacy controls for different profile elements
- Image upload and processing for avatars and cover photos
- User search and filtering capabilities
- Follower/following relationships
- Profile statistics and activity tracking