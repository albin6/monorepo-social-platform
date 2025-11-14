# JWT Utilities Documentation

## Overview
The JWT Utilities library provides a comprehensive set of functions for handling JSON Web Tokens (JWT) in the Social Platform. This library includes methods for token generation, verification, and management.

## Classes

### JWTUtils
The main class that provides all JWT-related functionality.

## Methods

### JWTUtils.generateToken(payload, secret, expiresIn)
Generate a JWT token with the provided payload.

**Parameters:**
- `payload` (Object): Data to include in the token
- `secret` (string): Secret key for signing
- `expiresIn` (string, optional): Token expiration time (default: '1h')

**Returns:**
- `string`: Signed JWT token

**Example:**
```javascript
const token = JWTUtils.generateToken(
  { userId: '123', role: 'user' },
  'your-secret-key',
  '24h'
);
```

### JWTUtils.verifyToken(token, secret)
Verify a JWT token's validity and signature.

**Parameters:**
- `token` (string): JWT token to verify
- `secret` (string): Secret key for verification

**Returns:**
- `Object|null`: Decoded token payload or null if invalid

**Example:**
```javascript
const decoded = JWTUtils.verifyToken(token, 'your-secret-key');
if (decoded) {
  console.log('Token is valid:', decoded);
} else {
  console.log('Token is invalid');
}
```

### JWTUtils.generateRefreshToken(payload, secret, expiresIn)
Generate a refresh token with a longer expiration time.

**Parameters:**
- `payload` (Object): Data to include in the token
- `secret` (string): Secret key for signing
- `expiresIn` (string, optional): Token expiration time (default: '7d')

**Returns:**
- `string`: Signed refresh token

### JWTUtils.decodeToken(token)
Decode a JWT token without verification.

**Parameters:**
- `token` (string): JWT token to decode

**Returns:**
- `Object|null`: Decoded token payload or null if invalid

### JWTUtils.isTokenExpired(token, secret)
Check if a token is expired.

**Parameters:**
- `token` (string): JWT token to check
- `secret` (string): Secret key for verification

**Returns:**
- `boolean`: True if token is expired, false otherwise

### JWTUtils.getTokenExpiration(token, secret)
Get the expiration timestamp of a token.

**Parameters:**
- `token` (string): JWT token
- `secret` (string): Secret key

**Returns:**
- `number|null`: Expiration timestamp or null if invalid

### JWTUtils.getTokenPayload(token, secret)
Get the payload of a token.

**Parameters:**
- `token` (string): JWT token
- `secret` (string): Secret key

**Returns:**
- `Object|null`: Token payload or null if invalid

## Usage Examples

### Basic Token Generation
```javascript
const JWTUtils = require('./libs/utils/jwt/jwt.utils');

// Generate an access token
const accessToken = JWTUtils.generateToken(
  { userId: '123', role: 'user' },
  process.env.JWT_SECRET,
  '1h'
);

// Generate a refresh token
const refreshToken = JWTUtils.generateRefreshToken(
  { userId: '123' },
  process.env.REFRESH_TOKEN_SECRET,
  '7d'
);
```

### Token Verification
```javascript
const JWTUtils = require('./libs/utils/jwt/jwt.utils');

// Verify a token
const decoded = JWTUtils.verifyToken(accessToken, process.env.JWT_SECRET);
if (decoded) {
  console.log('User ID:', decoded.userId);
  console.log('Role:', decoded.role);
} else {
  console.log('Invalid token');
}

// Check if token is expired
if (!JWTUtils.isTokenExpired(accessToken, process.env.JWT_SECRET)) {
  console.log('Token is still valid');
} else {
  console.log('Token has expired');
}
```

## Security Recommendations

1. Use strong, random secrets for signing tokens
2. Keep secrets in environment variables, never in code
3. Use appropriate expiration times for different token types
4. Implement proper token refresh mechanisms
5. Revoke tokens on logout when possible
6. Use HTTPS to prevent token interception

## Error Handling

The JWT utilities handle errors gracefully:
- Verification failures return null instead of throwing errors
- Invalid tokens are handled safely
- Proper error messages are logged for debugging