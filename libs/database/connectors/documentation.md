# Database Connector Documentation

## Overview
The Database Connector library provides a unified interface for connecting to and interacting with both PostgreSQL and MongoDB databases in the Social Platform. This library abstracts the complexity of database connections and provides utility methods for common database operations.

## Classes

### DBConnector
The main class that provides database connection and query functionality.

## Constructor

### DBConnector(config)
Create a new database connector instance.

**Parameters:**
- `config` (Object, optional): Configuration object

## PostgreSQL Methods

### initPostgreSQL(pgConfig)
Initialize PostgreSQL connection pool.

**Parameters:**
- `pgConfig` (Object, optional): PostgreSQL configuration with the following properties:
  - `user` (string, optional): Database user (default: DB_USER env var)
  - `host` (string, optional): Database host (default: DB_HOST env var or 'localhost')
  - `database` (string, optional): Database name (default: DB_NAME env var)
  - `password` (string, optional): Database password (default: DB_PASSWORD env var)
  - `port` (number, optional): Database port (default: DB_PORT env var or 5432)
  - `max` (number, optional): Maximum number of clients in pool (default: 20)
  - `idleTimeoutMillis` (number, optional): Milliseconds before an idle client is closed (default: 30000)
  - `connectionTimeoutMillis` (number, optional): Milliseconds before a connection attempt is closed (default: 2000)

**Returns:**
- `Pool`: PostgreSQL connection pool

### getPostgreSQLPool()
Get the PostgreSQL connection pool.

**Returns:**
- `Pool`: PostgreSQL connection pool

### async query(query, params)
Execute a PostgreSQL query.

**Parameters:**
- `query` (string): SQL query string
- `params` (Array, optional): Query parameters

**Returns:**
- `Promise<Object>`: Query result

**Example:**
```javascript
const result = await dbConnector.query(
  'SELECT * FROM users WHERE id = $1',
  ['user123']
);
```

## MongoDB Methods

### async initMongoDB(mongoUri, options)
Initialize MongoDB connection.

**Parameters:**
- `mongoUri` (string): MongoDB connection URI
- `options` (Object, optional): Connection options

**Returns:**
- `Promise<mongoose.Connection>`: MongoDB connection

### getMongoDBConnection()
Get the MongoDB connection.

**Returns:**
- `mongoose.Connection`: MongoDB connection

### async mongoQuery(collectionName, query)
Execute a raw MongoDB query.

**Parameters:**
- `collectionName` (string): Name of the collection
- `query` (Object): MongoDB query object

**Returns:**
- `Promise<any>`: Query result

### async mongoFind(collectionName, query, options)
Execute a MongoDB find query.

**Parameters:**
- `collectionName` (string): Name of the collection
- `query` (Object, optional): MongoDB query object
- `options` (Object, optional): Query options with properties:
  - `limit` (number, optional): Limit results
  - `sort` (Object, optional): Sort options
  - `skip` (number, optional): Skip results

**Returns:**
- `Promise<Array>`: Query result array

### async mongoInsertOne(collectionName, document)
Insert a document in MongoDB.

**Parameters:**
- `collectionName` (string): Name of the collection
- `document` (Object): Document to insert

**Returns:**
- `Promise<Object>`: Insert result

### async mongoUpdateOne(collectionName, filter, update, options)
Update a document in MongoDB.

**Parameters:**
- `collectionName` (string): Name of the collection
- `filter` (Object): Filter to match document
- `update` (Object): Update operations
- `options` (Object, optional): Update options

**Returns:**
- `Promise<Object>`: Update result

### async mongoDeleteOne(collectionName, filter)
Delete a document in MongoDB.

**Parameters:**
- `collectionName` (string): Name of the collection
- `filter` (Object): Filter to match document

**Returns:**
- `Promise<Object>`: Delete result

## General Methods

### async closeConnections()
Close all database connections.

**Returns:**
- `Promise<void>`

### async getHealth()
Get database health status.

**Returns:**
- `Promise<Object>`: Health status object with postgres and mongodb status

## Usage Examples

### Basic PostgreSQL Usage
```javascript
const DBConnector = require('./libs/database/connectors/db.connector');

const dbConnector = new DBConnector();

// Initialize PostgreSQL
await dbConnector.initPostgreSQL({
  user: 'social_user',
  host: 'localhost',
  database: 'social_platform',
  password: 'password',
  port: 5432,
});

// Execute a query
const result = await dbConnector.query(
  'SELECT id, username, email FROM users WHERE active = true LIMIT $1',
  [10]
);

console.log(result.rows);

// Close connections
await dbConnector.closeConnections();
```

### Basic MongoDB Usage
```javascript
const DBConnector = require('./libs/database/connectors/db.connector');

const dbConnector = new DBConnector();

// Initialize MongoDB
await dbConnector.initMongoDB('mongodb://localhost:27017/social_platform');

// Find documents
const users = await dbConnector.mongoFind('users', 
  { active: true }, 
  { limit: 10, sort: { createdAt: -1 } }
);

console.log(users);

// Insert a document
const result = await dbConnector.mongoInsertOne('users', {
  name: 'John Doe',
  email: 'john@example.com',
  createdAt: new Date()
});

console.log(result);

// Close connections
await dbConnector.closeConnections();
```

### Mixed Database Usage
```javascript
const DBConnector = require('./libs/database/connectors/db.connector');

const dbConnector = new DBConnector();

// Initialize both databases
await Promise.all([
  dbConnector.initPostgreSQL({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  }),
  dbConnector.initMongoDB(process.env.MONGODB_URI)
]);

// Use both databases
const postgresResult = await dbConnector.query('SELECT * FROM user_profiles WHERE user_id = $1', ['123']);
const mongoResult = await dbConnector.mongoFind('user_activities', { userId: '123' });

// Check health
const health = await dbConnector.getHealth();
console.log('PostgreSQL connected:', health.postgres.connected);
console.log('MongoDB connected:', health.mongodb.connected);

// Close connections when done
await dbConnector.closeConnections();
```

## Configuration

### PostgreSQL Configuration
The PostgreSQL connection supports the following configuration options:

- `user`: Database username
- `host`: Database hostname
- `database`: Database name
- `password`: Database password
- `port`: Database port
- `max`: Maximum number of clients in the pool
- `idleTimeoutMillis`: Timeout for idle clients
- `connectionTimeoutMillis`: Timeout for connection attempts

### MongoDB Configuration
The MongoDB connection supports standard Mongoose options:

- `useNewUrlParser`: Use new URL parser
- `useUnifiedTopology`: Use unified topology engine
- `maxPoolSize`: Maximum connection pool size
- `serverSelectionTimeoutMS`: Server selection timeout
- `socketTimeoutMS`: Socket timeout

## Error Handling

The database connector handles errors gracefully:

- Connection failures are properly caught and logged
- Query errors are propagated to the caller for handling
- Health checks provide detailed status information
- Connection timeouts are handled with proper error messages
- Both databases operate independently for better fault isolation

## Performance Considerations

- PostgreSQL uses connection pooling for efficient connection reuse
- MongoDB connections are properly managed with connection limits
- Query execution times are logged for performance monitoring
- Both databases support connection health checks