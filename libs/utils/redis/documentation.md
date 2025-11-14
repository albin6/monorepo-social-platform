# Redis Utilities Documentation

## Overview
The Redis Utilities library provides a comprehensive interface for interacting with Redis in the Social Platform. This library includes methods for common Redis operations like key-value storage, sets, lists, and counters.

## Classes

### RedisUtils
The main class that provides all Redis-related functionality.

## Constructor

### RedisUtils(config)
Create a new Redis utilities instance.

**Parameters:**
- `config` (Object, optional): Configuration object with the following properties:
  - `host` (string, optional): Redis server host (default: 'localhost')
  - `port` (number, optional): Redis server port (default: 6379)
  - `password` (string, optional): Redis server password (default: null)
  - `db` (number, optional): Redis database number (default: 0)

**Example:**
```javascript
const redisUtils = new RedisUtils({
  host: 'redis.example.com',
  port: 6379,
  password: 'your-redis-password',
  db: 0
});
```

## Methods

### async connect()
Connect to the Redis server.

**Returns:**
- `Promise<void>`

### async set(key, value, expiry)
Set a key-value pair in Redis.

**Parameters:**
- `key` (string): Key to set
- `value` (string|object): Value to set (objects will be JSON stringified)
- `expiry` (number, optional): Expiration time in seconds

**Returns:**
- `Promise<boolean>`: True if successful

**Example:**
```javascript
// Set a simple string
await redisUtils.set('user:123', 'John Doe');

// Set an object (will be JSON stringified)
await redisUtils.set('user:123:profile', { name: 'John', age: 30 });

// Set with expiration (300 seconds = 5 minutes)
await redisUtils.set('temp:data', 'value', 300);
```

### async get(key)
Get value by key from Redis.

**Parameters:**
- `key` (string): Key to get

**Returns:**
- `Promise<any>`: Value or null if key doesn't exist

**Example:**
```javascript
const value = await redisUtils.get('user:123');
console.log(value); // 'John Doe'

const profile = await redisUtils.get('user:123:profile');
console.log(profile); // { name: 'John', age: 30 }
```

### async delete(key)
Delete a key from Redis.

**Parameters:**
- `key` (string): Key to delete

**Returns:**
- `Promise<boolean>`: True if key was deleted

### async exists(key)
Check if a key exists in Redis.

**Parameters:**
- `key` (string): Key to check

**Returns:**
- `Promise<boolean>`: True if key exists

### async expire(key, seconds)
Set expiration for a key.

**Parameters:**
- `key` (string): Key to set expiration for
- `seconds` (number): Expiration time in seconds

**Returns:**
- `Promise<boolean>`: True if successful

### async ttl(key)
Get expiration time for a key.

**Parameters:**
- `key` (string): Key to get expiration for

**Returns:**
- `Promise<number>`: Expiration time in seconds, -1 if no expiration, -2 if key doesn't exist

### async addToSet(key, ...members)
Add members to a Redis set.

**Parameters:**
- `key` (string): Set key
- `...members` (any): Members to add

**Returns:**
- `Promise<number>`: Number of members added

### async getSetMembers(key)
Get all members of a Redis set.

**Parameters:**
- `key` (string): Set key

**Returns:**
- `Promise<array>`: Array of set members

### async addToList(key, ...elements)
Add elements to a Redis list (push to end).

**Parameters:**
- `key` (string): List key
- `...elements` (any): Elements to add

**Returns:**
- `Promise<number>`: New length of the list

### async getListRange(key, start, stop)
Get range of elements from a Redis list.

**Parameters:**
- `key` (string): List key
- `start` (number): Start index
- `stop` (number): Stop index

**Returns:**
- `Promise<array>`: Array of list elements

### async incrementCounter(key, increment)
Increment a counter in Redis.

**Parameters:**
- `key` (string): Counter key
- `increment` (number, optional): Amount to increment by (default: 1)

**Returns:**
- `Promise<number>`: New counter value

### async getCounter(key)
Get counter value.

**Parameters:**
- `key` (string): Counter key

**Returns:**
- `Promise<number>`: Counter value

### async disconnect()
Close Redis connection.

**Returns:**
- `Promise<void>`

### getClient()
Get Redis client instance.

**Returns:**
- `RedisClient`: Redis client instance

## Usage Examples

### Basic Usage
```javascript
const RedisUtils = require('./libs/utils/redis/redis.utils');

// Initialize Redis utilities
const redisUtils = new RedisUtils({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD
});

// Connect to Redis
await redisUtils.connect();

// Set a user profile
await redisUtils.set('user:123', {
  name: 'John Doe',
  email: 'john@example.com',
  lastLogin: new Date().toISOString()
});

// Get the user profile
const user = await redisUtils.get('user:123');
console.log(user);

// Disconnect from Redis
await redisUtils.disconnect();
```

### Working with Sets
```javascript
// Add user's friends to a set
await redisUtils.addToSet('user:123:friends', 'user:456', 'user:789');

// Get all friends
const friends = await redisUtils.getSetMembers('user:123:friends');
console.log(friends); // ['user:456', 'user:789']
```

### Working with Counters
```javascript
// Increment login counter
const newCount = await redisUtils.incrementCounter('user:123:login_count');
console.log(`User has logged in ${newCount} times`);
```

### Working with Lists
```javascript
// Add to user's recent activity
await redisUtils.addToList('user:123:recent_activity', 'Logged in', 'Updated profile');

// Get last 5 activities
const recentActivities = await redisUtils.getListRange('user:123:recent_activity', -5, -1);
console.log(recentActivities);
```

## Configuration

The Redis utilities support various configuration options:

- `host`: Redis server hostname
- `port`: Redis server port
- `password`: Redis server password (if authentication is enabled)
- `db`: Database number (0-15 for Redis)
- `options`: Additional Redis client options

## Error Handling

The Redis utilities handle errors gracefully:
- Connection errors are properly caught and logged
- Missing keys return null values instead of errors
- Operation failures are returned as rejected promises
- Proper cleanup occurs during disconnection