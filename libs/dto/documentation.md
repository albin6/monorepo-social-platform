# DTOs and API Response Formats Documentation

## Overview
The DTOs (Data Transfer Objects) and API Response Formats library provides standardized data structures for the Social Platform. This library includes DTOs for various entities and standardized API response formats to ensure consistency across services.

## Classes

### APIResponseDTO
Standardized API response format.

### PaginationDTO
Pagination metadata for API responses.

### PagedResponseDTO
Standardized API response for paged data.

### ValidationErrorDTO
Standardized format for validation errors.

### FileUploadDTO
Standardized DTO for file upload metadata.

### SearchDTO
Standardized DTO for search parameters.

### NotificationDTO
Standardized DTO for notifications.

### MessageDTO
Standardized DTO for messages.

### ConversationDTO
Standardized DTO for conversations.

### FriendRequestDTO
Standardized DTO for friend requests.

### ActivityDTO
Standardized DTO for activities.

### UserDTO
Standardized DTO for user data.

### RegistrationDTO
Standardized DTO for user registration data.

### LoginDTO
Standardized DTO for login data.

### LoginResponseDTO
Standardized DTO for login response data.

### TokenRefreshDTO
Standardized DTO for token refresh data.

### PasswordResetRequestDTO
Standardized DTO for password reset request data.

### PasswordResetDTO
Standardized DTO for password reset data.

### PasswordChangeDTO
Standardized DTO for password change data.

### ProfileUpdateDTO
Standardized DTO for profile update data.

### OTPVerificationDTO
Standardized DTO for OTP verification data.

## API Response DTOs

### APIResponseDTO
The base API response class.

#### Constructor
```javascript
new APIResponseDTO(success, data, message, errors)
```

**Parameters:**
- `success` (boolean): Whether the request was successful
- `data` (any, optional): Response data
- `message` (string, optional): Response message
- `errors` (Array, optional): Error details

#### Static Methods
- `success(data, message)`: Create a successful response
- `error(message, errors)`: Create an error response
- `notFound(message)`: Create a not found response
- `unauthorized(message)`: Create an unauthorized response
- `forbidden(message)`: Create a forbidden response
- `badRequest(message, errors)`: Create a bad request response
- `serverError(message)`: Create a server error response

#### Example Usage
```javascript
// Successful response
const response = APIResponseDTO.success({ id: 1, name: 'John' }, 'User retrieved successfully');

// Error response
const error = APIResponseDTO.badRequest('Invalid input', [
  { field: 'email', message: 'Invalid email format' }
]);

// Convert to plain object for JSON response
res.json(response.toObject());
```

### PaginationDTO
Handles pagination metadata.

#### Constructor
```javascript
new PaginationDTO(data)
```

**Parameters:**
- `data` (Object, optional): Pagination data with properties:
  - `page` (number, optional): Current page (default: 1)
  - `limit` (number, optional): Items per page (default: 10)
  - `total` (number, optional): Total items (default: 0)

#### Example Usage
```javascript
const pagination = new PaginationDTO({
  page: 2,
  limit: 20,
  total: 150
});

console.log(pagination.toObject());
// {
//   page: 2,
//   limit: 20,
//   total: 150,
//   totalPages: 8,
//   hasNext: true,
//   hasPrev: true,
//   next: 3,
//   prev: 1
// }
```

### PagedResponseDTO
Combines API response with pagination.

#### Constructor
```javascript
new PagedResponseDTO(data, pagination, message)
```

**Parameters:**
- `data` (Array): Array of items
- `pagination` (PaginationDTO): Pagination metadata
- `message` (string, optional): Response message

#### Example Usage
```javascript
const items = [item1, item2, item3];
const pagination = new PaginationDTO({ page: 1, limit: 10, total: 50 });
const response = new PagedResponseDTO(items, pagination, 'Items retrieved successfully');

res.json(response.toObject());
// {
//   success: true,
//   data: [item1, item2, item3],
//   message: 'Items retrieved successfully',
//   pagination: { ... },
//   timestamp: '2023-01-01T00:00:00.000Z'
// }
```

### ValidationErrorDTO
Standardized validation error format.

#### Constructor
```javascript
new ValidationErrorDTO(errors)
```

**Parameters:**
- `errors` (Array): Array of error objects with field and message properties

#### Example Usage
```javascript
const validationErrors = [
  { field: 'email', message: 'Invalid email format' },
  { field: 'password', message: 'Password too weak' }
];

const errorResponse = new ValidationErrorDTO(validationErrors);
res.status(400).json(errorResponse.toObject());
```

## Entity DTOs

### UserDTO
Represents user data.

#### Constructor
```javascript
new UserDTO(user)
```

**Parameters:**
- `user` (Object): User object from database

**Properties:**
- `id`: User ID
- `username`: Username
- `email`: Email address
- `firstName`, `lastName`: Name fields
- `fullName`: Combined name
- `avatar`: Avatar URL
- `bio`: User bio
- `dateOfBirth`: Date of birth
- `phoneNumber`: Phone number
- `website`: Website URL
- `location`: Location
- `createdAt`, `updatedAt`: Timestamps
- `isVerified`: Verification status
- `isActive`: Active status

#### Example Usage
```javascript
const user = await User.findById(userId);
const userDto = new UserDTO(user);
res.json(APIResponseDTO.success(userDto.toObject()));
```

### MessageDTO
Represents message data.

#### Constructor
```javascript
new MessageDTO(message)
```

**Parameters:**
- `message` (Object): Message object from database

**Properties:**
- `id`: Message ID
- `conversationId`: Conversation ID
- `senderId`: Sender ID
- `content`: Message content
- `type`: Message type (text, image, etc.)
- `status`: Message status (sent, delivered, read)
- `sentAt`, `readAt`, `deliveredAt`: Timestamps
- `attachments`: Array of attachments

### ConversationDTO
Represents conversation data.

#### Constructor
```javascript
new ConversationDTO(conversation)
```

**Parameters:**
- `conversation` (Object): Conversation object from database

**Properties:**
- `id`: Conversation ID
- `type`: Conversation type (private, group)
- `name`: Conversation name (for groups)
- `participants`: Array of participant IDs
- `isAdmin`: Array of admin IDs
- `avatar`: Avatar URL
- `isArchived`, `isMuted`: Status flags
- `lastMessage`: Last message object
- `unreadCount`: Unread message count

## Authentication DTOs

### LoginResponseDTO
Response for successful login.

#### Constructor
```javascript
new LoginResponseDTO(user, token, refreshToken)
```

**Parameters:**
- `user`: User object
- `token`: Access token
- `refreshToken`: Refresh token

**Example Response:**
```javascript
{
  success: true,
  data: {
    user: { /* UserDTO */ },
    token: 'access_token',
    refreshToken: 'refresh_token',
    expiresIn: 3600
  },
  message: 'Success',
  timestamp: '2023-01-01T00:00:00.000Z'
}
```

## Usage Examples

### Creating API Responses
```javascript
const { APIResponseDTO, UserDTO } = require('./libs/dto/dto');
const { UserDTO: AuthUserDTO } = require('./libs/dto/auth/auth.dto');

// Get user from database
const user = await User.findById(userId);

if (!user) {
  return res.status(404).json(APIResponseDTO.notFound('User not found'));
}

// Create DTO and return response
const userDto = new AuthUserDTO.UserDTO(user);
const response = APIResponseDTO.success(userDto.toObject(), 'User retrieved successfully');
res.json(response.toObject());
```

### Handling Validation Errors
```javascript
const { ValidationErrorDTO } = require('./libs/dto/dto');
const { AuthValidators } = require('../validators/auth/auth.validators');

const validationResult = AuthValidators.validate(
  AuthValidators.registerSchema,
  userData
);

if (!validationResult.isValid) {
  const errorDto = new ValidationErrorDTO(validationResult.errors);
  return res.status(400).json(errorDto.toObject());
}

// Process valid data
```

### Paged Responses
```javascript
const { PagedResponseDTO, PaginationDTO } = require('./libs/dto/dto');

// Get data from database
const { data, total } = await getUserList(page, limit);

// Create pagination DTO
const pagination = new PaginationDTO({ page, limit, total });

// Create paged response
const response = new PagedResponseDTO(data, pagination, 'Users retrieved successfully');
res.json(response.toObject());
```

### Error Handling
```javascript
try {
  // Some operation
  const result = await someOperation();
  res.json(APIResponseDTO.success(result));
} catch (error) {
  if (error.name === 'ValidationError') {
    const errorDto = new ValidationErrorDTO(error.details);
    res.status(400).json(errorDto.toObject());
  } else if (error.name === 'UnauthorizedError') {
    res.status(401).json(APIResponseDTO.unauthorized('Authentication required'));
  } else {
    res.status(500).json(APIResponseDTO.serverError('Internal server error'));
  }
}
```

### Entity Creation
```javascript
const { AuthValidators } = require('../validators/auth/auth.validators');
const { RegistrationDTO } = require('./libs/dto/auth/auth.dto');

// Validate input
const validation = AuthValidators.validate(
  AuthValidators.registerSchema,
  userData
);

if (!validation.isValid) {
  const errorDto = new ValidationErrorDTO(validation.errors);
  return res.status(400).json(errorDto.toObject());
}

// Create DTO with validated data
const registrationDto = new AuthUserDTO.RegistrationDTO(validation.data);

// Use DTO to create user
const user = await createUser(registrationDto);
```

## Best Practices

1. **Consistency**: Use DTOs consistently across all services
2. **Validation**: Always validate input before creating DTOs
3. **Security**: Never expose sensitive information in DTOs
4. **Performance**: Use DTOs to limit data transmission
5. **Maintainability**: Update DTOs when entity structures change

## Error Handling
- DTOs handle null/undefined values gracefully
- Timestamps are properly converted to Date objects
- Nested objects are properly structured
- Validation should be performed before DTO creation