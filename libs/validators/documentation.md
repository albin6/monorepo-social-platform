# Validation Schemas Documentation

## Overview
The Validation Schemas library provides a comprehensive set of validation schemas for the Social Platform. This library uses Joi for schema validation and includes schemas for authentication, user data, and other common validation needs.

## Classes

### Validators
The main validation class that provides general validation schemas.

### AuthValidators
The authentication-specific validation class that provides schemas for authentication-related operations.

## Validators Class Methods

### validate(schema, data)
Validate data against a provided schema.

**Parameters:**
- `schema` (Joi.Schema): Joi schema to validate against
- `data` (any): Data to validate

**Returns:**
- `Object`: Validation result with properties:
  - `isValid` (boolean): True if validation passed
  - `data` (any, optional): Validated and transformed data if valid
  - `errors` (Array, optional): Array of validation errors if invalid

### validatePagination(data)
Validate pagination parameters.

**Parameters:**
- `data` (Object): Pagination parameters

**Returns:**
- `Object`: Validation result

### validateId(data)
Validate ID parameters (24-character hex string).

**Parameters:**
- `data` (Object): ID parameter

**Returns:**
- `Object`: Validation result

### validateUUID(data)
Validate UUID parameters (UUID v4).

**Parameters:**
- `data` (Object): UUID parameter

**Returns:**
- `Object`: Validation result

### validateEmail(data)
Validate email parameters.

**Parameters:**
- `data` (Object): Email parameter

**Returns:**
- `Object`: Validation result

### validateFileUpload(data)
Validate file upload parameters.

**Parameters:**
- `data` (Object): File upload parameter

**Returns:**
- `Object`: Validation result

### validateTextContent(data)
Validate text content parameters.

**Parameters:**
- `data` (Object): Text content parameter

**Returns:**
- `Object`: Validation result

### validateSearch(data)
Validate search parameters.

**Parameters:**
- `data` (Object): Search parameters

**Returns:**
- `Object`: Validation result

### validateNotificationPreferences(data)
Validate notification preferences parameters.

**Parameters:**
- `data` (Object): Notification preferences

**Returns:**
- `Object`: Validation result

## AuthValidators Class Methods

### validate(schema, data)
Validate authentication data against a provided schema.

**Parameters:**
- `schema` (Joi.Schema): Joi schema to validate against
- `data` (any): Data to validate

**Returns:**
- `Object`: Validation result

## Available Schemas

### Pagination Schema
Validates pagination parameters:
- `page`: Page number (integer, min 1, default 1)
- `limit`: Items per page (integer, min 1, max 100, default 10)
- `sort`: Sort order (format: field:direction)
- `search`: Search query (max 100 characters)

### ID Parameter Schema
Validates ID parameters:
- `id`: 24-character hex string

### UUID Parameter Schema
Validates UUID parameters:
- `uuid`: UUID v4 format

### Email Parameter Schema
Validates email parameters:
- `email`: Valid email address

### File Upload Schema
Validates file upload parameters:
- `originalname`: Original file name
- `mimetype`: File MIME type (restricted to safe types)
- `size`: File size (max 10MB)

### Text Content Schema
Validates text content:
- `content`: Text content (min 1, max 5000 characters)

### Search Schema
Validates search parameters:
- `query`: Search query (min 1, max 200 characters)
- `type`: Search type (user, post, group, all)
- `limit`: Results limit (max 50)

### Notification Preferences Schema
Validates notification preferences:
- `emailNotifications`: Boolean (default true)
- `pushNotifications`: Boolean (default true)
- `smsNotifications`: Boolean (default false)
- `notificationTypes`: Array of valid notification types

### Register Schema
Validates user registration:
- `username`: Alphanumeric (3-30 chars)
- `email`: Valid email address
- `password`: Min 8 chars, with uppercase, lowercase, number, special character
- `firstName`: Max 50 chars
- `lastName`: Max 50 chars
- `dateOfBirth`: Valid date (13-100 years ago)
- `phoneNumber`: Valid phone number format
- `bio`: Max 500 chars
- `avatar`: Valid URL

### Login Schema
Validates user login:
- `email`: Valid email address
- `password`: Required (min 1 char)

### Password Reset Request Schema
Validates password reset request:
- `email`: Valid email address

### Password Reset Schema
Validates password reset:
- `token`: 64-character token
- `newPassword`: Min 8 chars, with requirements

### Password Change Schema
Validates password change:
- `currentPassword`: Required
- `newPassword`: Min 8 chars, with requirements

### Profile Update Schema
Validates profile update:
- `firstName`: Max 50 chars (optional)
- `lastName`: Max 50 chars (optional)
- And other profile fields...

### OTP Verification Schema
Validates OTP verification:
- `otp`: 6-digit code
- `email`: Valid email address

## Usage Examples

### Basic Validation
```javascript
const { Validators } = require('./libs/validators/validators');

const result = Validators.validate(
  Validators.paginationSchema,
  { page: 1, limit: 10, sort: 'createdAt:desc' }
);

if (result.isValid) {
  console.log('Data is valid:', result.data);
} else {
  console.log('Validation errors:', result.errors);
}
```

### Pagination Validation
```javascript
const result = Validators.validatePagination({
  page: 2,
  limit: 20,
  sort: 'name:asc'
});

if (result.isValid) {
  console.log('Valid pagination params');
} else {
  console.log('Invalid pagination params:', result.errors);
}
```

### Authentication Validation
```javascript
const { AuthValidators } = require('./libs/validators/auth/auth.validators');

const registrationData = {
  username: 'johndoe',
  email: 'john@example.com',
  password: 'MySecure123!',
  firstName: 'John',
  lastName: 'Doe'
};

const result = AuthValidators.validate(
  AuthValidators.registerSchema,
  registrationData
);

if (result.isValid) {
  console.log('Registration data is valid');
  const validData = result.data;
} else {
  console.log('Registration errors:', result.errors);
}
```

### File Upload Validation
```javascript
const fileData = {
  originalname: 'image.jpg',
  mimetype: 'image/jpeg',
  size: 2048000 // 2MB
};

const result = Validators.validateFileUpload(fileData);

if (result.isValid) {
  console.log('File upload is valid');
} else {
  console.log('File upload errors:', result.errors);
}
```

### Custom Schema Validation
```javascript
const Joi = require('joi');

const customSchema = Joi.object({
  name: Joi.string().required(),
  age: Joi.number().integer().min(0).max(150)
});

const result = Validators.validate(customSchema, {
  name: 'John',
  age: 30
});

if (result.isValid) {
  console.log('Custom validation passed');
} else {
  console.log('Custom validation failed:', result.errors);
}
```

### Multiple Schema Validation
```javascript
const { Validators } = require('./libs/validators/validators');

const schemas = {
  pagination: Validators.paginationSchema,
  search: Validators.searchSchema
};

const data = {
  page: 1,
  limit: 10,
  query: 'search term'
};

const result = Validators.validateMultiple(schemas, data);

if (result.allValid) {
  console.log('All validations passed');
} else {
  console.log('Some validations failed:', result.results);
}
```

### Error Format
Validation errors are returned in the following format:
```javascript
{
  isValid: false,
  errors: [
    {
      field: 'email',           // The field that failed validation
      message: 'Invalid email'  // The error message
    }
  ]
}
```

## Schema Customization
You can access predefined schemas using the `getSchema` method:

```javascript
const { Validators } = require('./libs/validators/validators');

const paginationSchema = Validators.getSchema('pagination');
const authSchemas = Validators.getSchema('auth');

// Use specific auth schema
const registerResult = Validators.validate(
  authSchemas.registerSchema,
  userData
);
```

## Error Handling
- Validation errors are collected and returned as an array
- Multiple validation errors are reported at once (abortEarly: false)
- Error messages are user-friendly and descriptive
- Invalid data is not transformed or processed further

## Performance Considerations
- Schemas are pre-compiled for better performance
- Validation is synchronous and fast
- Error collection is efficient and comprehensive