# Auth Service

## Purpose
The Auth Service handles user authentication, authorization, and session management for the social platform. It provides secure login, registration, password management, and JWT token generation/verification.

## API Summary

### Authentication Endpoints

#### POST /auth/register
- Register a new user account
- Request body: `{ email, password, username, firstName, lastName }`
- Response: `{ user, token }`

#### POST /auth/login
- Authenticate user with email/password
- Request body: `{ email, password }`
- Response: `{ user, token }`

#### POST /auth/logout
- Invalidate user session
- Requires authentication token
- Response: `{ message: "Logged out successfully" }`

#### POST /auth/refresh
- Refresh authentication token
- Request body: `{ refreshToken }`
- Response: `{ newToken }`

#### POST /auth/forgot-password
- Initiate password reset process
- Request body: `{ email }`
- Response: `{ message: "Password reset email sent" }`

#### POST /auth/reset-password
- Complete password reset process
- Request body: `{ token, newPassword }`
- Response: `{ message: "Password reset successfully" }`

#### GET /auth/profile
- Get current user profile
- Requires authentication token
- Response: `{ user }`

#### PUT /auth/profile
- Update user profile
- Requires authentication token
- Request body: `{ firstName, lastName, bio, avatar }`
- Response: `{ user }`

## Architecture

The service follows a modular architecture with separation of concerns:

- **Controllers**: Handle HTTP requests and responses
- **Models**: Define data schemas and database interactions
- **Routes**: Define API endpoints
- **Services**: Contain business logic
- **Utils**: Utility functions for encryption, validation, etc.

## Security Features

- JWT-based authentication with refresh tokens
- Password encryption using bcrypt
- Rate limiting for login attempts
- Input validation and sanitization
- Secure session management