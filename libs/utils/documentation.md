# Common Utilities Documentation

## Overview
The Common Utilities library provides a collection of general-purpose utility functions for the Social Platform. This library includes methods for password hashing, string manipulation, validation, and other common operations.

## Classes

### Utils
The main class that provides all utility functionality.

## Methods

### async hashPassword(password, saltRounds)
Hash a password using bcrypt.

**Parameters:**
- `password` (string): Password to hash
- `saltRounds` (number, optional): Number of salt rounds (default: 12)

**Returns:**
- `Promise<string>`: Hashed password

**Example:**
```javascript
const hashedPassword = await Utils.hashPassword('mySecurePassword');
```

### async comparePassword(password, hash)
Compare a password with a hash.

**Parameters:**
- `password` (string): Plain text password
- `hash` (string): Hashed password

**Returns:**
- `Promise<boolean>`: True if password matches hash

**Example:**
```javascript
const isValid = await Utils.comparePassword('password123', hashedPassword);
if (isValid) {
  console.log('Password is correct');
} else {
  console.log('Password is incorrect');
}
```

### generateRandomString(length, chars)
Generate a random string.

**Parameters:**
- `length` (number): Length of the string
- `chars` (string, optional): Characters to use (default: alphanumeric)

**Returns:**
- `string`: Random string

**Example:**
```javascript
// Generate a random 10-character alphanumeric string
const randomString = Utils.generateRandomString(10);

// Generate a random 8-character string with custom characters
const customString = Utils.generateRandomString(8, 'ABCDEF0123456789');
```

### generateToken(length)
Generate a random token.

**Parameters:**
- `length` (number, optional): Length of the token (default: 32)

**Returns:**
- `string`: Random token

**Example:**
```javascript
const token = Utils.generateToken(64); // 64-character hex token
```

### generateUUID()
Generate a UUID v4.

**Returns:**
- `string`: UUID string

**Example:**
```javascript
const uuid = Utils.generateUUID();
console.log(uuid); // 'a1b2c3d4-e5f6-7890-1234-567890abcdef'
```

### validateEmail(email)
Validate email format.

**Parameters:**
- `email` (string): Email to validate

**Returns:**
- `boolean`: True if email is valid

**Example:**
```javascript
const isValid = Utils.validateEmail('user@example.com');
```

### validatePhone(phone)
Validate phone number format.

**Parameters:**
- `phone` (string): Phone number to validate

**Returns:**
- `boolean`: True if phone number is valid

**Example:**
```javascript
const isValid = Utils.validatePhone('+1234567890');
```

### validateUrl(url)
Validate URL format.

**Parameters:**
- `url` (string): URL to validate

**Returns:**
- `boolean`: True if URL is valid

**Example:**
```javascript
const isValid = Utils.validateUrl('https://example.com');
```

### sanitizeInput(str)
Sanitize user input to prevent XSS.

**Parameters:**
- `str` (string): String to sanitize

**Returns:**
- `string`: Sanitized string

**Example:**
```javascript
const sanitized = Utils.sanitizeInput('<script>alert("xss")</script>');
console.log(sanitized); // '&lt;script&gt;alert("xss")&lt;/script&gt;'
```

### deepClone(obj)
Deep clone an object.

**Parameters:**
- `obj` (Object): Object to clone

**Returns:**
- `Object`: Cloned object

**Example:**
```javascript
const original = { a: 1, b: { c: 2 } };
const cloned = Utils.deepClone(original);
cloned.b.c = 3;
console.log(original.b.c); // 2 (not affected)
```

### formatBytes(bytes, decimals)
Format bytes to human readable format.

**Parameters:**
- `bytes` (number): Number of bytes
- `decimals` (number, optional): Number of decimal places (default: 2)

**Returns:**
- `string`: Formatted size

**Example:**
```javascript
const size = Utils.formatBytes(1024); // '1 KB'
const size2 = Utils.formatBytes(1048576); // '1 MB'
```

### timeDifference(date1, date2)
Calculate time difference between two dates.

**Parameters:**
- `date1` (Date): First date
- `date2` (Date): Second date

**Returns:**
- `Object`: Time difference object with hours, minutes, seconds

**Example:**
```javascript
const date1 = new Date('2023-01-01T10:00:00');
const date2 = new Date('2023-01-01T12:30:45');
const diff = Utils.timeDifference(date1, date2);
console.log(diff); // { hours: 2, minutes: 30, seconds: 45 }
```

### isValidJSON(str)
Check if a string is valid JSON.

**Parameters:**
- `str` (string): String to check

**Returns:**
- `boolean`: True if string is valid JSON

**Example:**
```javascript
const isValid = Utils.isValidJSON('{"name": "John"}');
console.log(isValid); // true
```

### async sleep(ms)
Sleep for a given number of milliseconds.

**Parameters:**
- `ms` (number): Number of milliseconds to sleep

**Returns:**
- `Promise<void>`

**Example:**
```javascript
console.log('Before sleep');
await Utils.sleep(1000); // Sleep for 1 second
console.log('After sleep');
```

### async retry(fn, retries, delay)
Retry a function with exponential backoff.

**Parameters:**
- `fn` (Function): Function to retry
- `retries` (number, optional): Number of retries (default: 3)
- `delay` (number, optional): Initial delay in ms (default: 1000)

**Returns:**
- `Promise<any>`: Result of the function

**Example:**
```javascript
const result = await Utils.retry(async () => {
  // Function that might fail
  return await someUnreliableOperation();
}, 5, 2000); // Retry 5 times with 2s initial delay
```

### debounce(func, wait)
Debounce a function.

**Parameters:**
- `func` (Function): Function to debounce
- `wait` (number): Wait time in ms

**Returns:**
- `Function`: Debounced function

**Example:**
```javascript
const debouncedSearch = Utils.debounce((query) => {
  console.log('Searching for:', query);
}, 300);

// This will only call the function after 300ms of no more calls
debouncedSearch('a');
debouncedSearch('ab');
debouncedSearch('abc'); // This is the call that will execute
```

### throttle(func, limit)
Throttle a function.

**Parameters:**
- `func` (Function): Function to throttle
- `limit` (number): Time limit in ms

**Returns:**
- `Function`: Throttled function

**Example:**
```javascript
const throttledFunction = Utils.throttle(() => {
  console.log('Function called');
}, 1000);

// This will only execute once per second
throttledFunction(); // Executed
throttledFunction(); // Ignored
throttledFunction(); // Ignored
```

## Usage Examples

### Password Operations
```javascript
const Utils = require('./libs/utils/utils');

// Hash a password
const hashedPassword = await Utils.hashPassword('mySecurePassword');

// Verify a password
const isValid = await Utils.comparePassword('mySecurePassword', hashedPassword);
console.log(isValid); // true
```

### Random Generation
```javascript
// Generate random string for invitation code
const invitationCode = Utils.generateRandomString(8, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789');

// Generate secure token for password reset
const resetToken = Utils.generateToken(64);

// Generate UUID for new entity
const uuid = Utils.generateUUID();
```

### Validation
```javascript
const email = 'user@example.com';
const phone = '+1234567890';
const url = 'https://example.com';

if (Utils.validateEmail(email)) {
  console.log('Valid email');
}

if (Utils.validatePhone(phone)) {
  console.log('Valid phone number');
}

if (Utils.validateUrl(url)) {
  console.log('Valid URL');
}
```

### String Sanitization
```javascript
const userInput = '<script>alert("xss")</script>Hello World';
const sanitized = Utils.sanitizeInput(userInput);
console.log(sanitized); // '&lt;script&gt;alert("xss")&lt;/script&gt;Hello World'
```

### Utility Functions
```javascript
// Format file sizes
const fileSize = Utils.formatBytes(1048576); // '1 MB'

// Deep clone objects
const original = { user: { name: 'John', settings: { theme: 'dark' } } };
const cloned = Utils.deepClone(original);

// Time difference
const now = new Date();
const past = new Date(Date.now() - 3600000); // 1 hour ago
const diff = Utils.timeDifference(now, past);
console.log(diff); // { hours: 1, minutes: 0, seconds: 0 }

// JSON validation
const jsonString = '{"valid": "json"}';
if (Utils.isValidJSON(jsonString)) {
  console.log('Valid JSON');
}
```

### Retry Pattern
```javascript
// Retry API call with exponential backoff
const apiResult = await Utils.retry(async () => {
  const response = await fetch('https://api.example.com/data');
  if (!response.ok) {
    throw new Error(`API call failed with status ${response.status}`);
  }
  return await response.json();
}, 3, 1000); // Retry 3 times with 1s initial delay
```

## Error Handling

The utility functions handle errors gracefully:

- Invalid inputs are handled with appropriate defaults or errors
- Asynchronous operations are properly awaited
- Password operations use secure hashing algorithms
- Validation functions return boolean values instead of throwing errors
- Sanitization functions safely handle malicious input

## Security Considerations

- Password hashing uses bcrypt with appropriate salt rounds
- Input sanitization helps prevent XSS attacks
- UUID generation provides cryptographically secure values
- Token generation uses crypto module for security