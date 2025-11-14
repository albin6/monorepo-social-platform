// libs/database/connectors/db.connector.js
const { Pool } = require('pg');
const mongoose = require('mongoose');

class DBConnector {
  constructor(config = {}) {
    this.config = config;
    this.pool = null;
    this.mongoConnection = null;
  }

  /**
   * Initialize PostgreSQL connection pool
   * @param {Object} pgConfig - PostgreSQL configuration
   * @returns {Pool} PostgreSQL connection pool
   */
  initPostgreSQL(pgConfig = {}) {
    const defaultPgConfig = {
      user: pgConfig.user || process.env.DB_USER,
      host: pgConfig.host || process.env.DB_HOST || 'localhost',
      database: pgConfig.database || process.env.DB_NAME,
      password: pgConfig.password || process.env.DB_PASSWORD,
      port: pgConfig.port || process.env.DB_PORT || 5432,
      max: pgConfig.max || 20,
      idleTimeoutMillis: pgConfig.idleTimeoutMillis || 30000,
      connectionTimeoutMillis: pgConfig.connectionTimeoutMillis || 2000,
      ...pgConfig
    };

    this.pool = new Pool(defaultPgConfig);

    // Handle connection errors
    this.pool.on('error', (err) => {
      console.error('Unexpected error on idle PostgreSQL client', err);
    });

    return this.pool;
  }

  /**
   * Get PostgreSQL pool
   * @returns {Pool} PostgreSQL connection pool
   */
  getPostgreSQLPool() {
    return this.pool;
  }

  /**
   * Execute a query using PostgreSQL
   * @param {string} query - SQL query
   * @param {Array} params - Query parameters
   * @returns {Promise<Object>} Query result
   */
  async query(query, params = []) {
    if (!this.pool) {
      throw new Error('PostgreSQL pool not initialized');
    }

    const start = Date.now();
    const res = await this.pool.query(query, params);
    const duration = Date.now() - start;

    console.log('Executed query', { query: query.slice(0, 50) + '...', duration: duration + 'ms' });
    return res;
  }

  /**
   * Initialize MongoDB connection
   * @param {string} mongoUri - MongoDB connection URI
   * @param {Object} options - Connection options
   * @returns {Promise<mongoose.Connection>} MongoDB connection
   */
  async initMongoDB(mongoUri, options = {}) {
    const defaultOptions = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      ...options
    };

    try {
      this.mongoConnection = await mongoose.connect(mongoUri, defaultOptions);
      console.log('MongoDB connected successfully');
      return this.mongoConnection;
    } catch (error) {
      console.error('MongoDB connection error:', error);
      throw error;
    }
  }

  /**
   * Get MongoDB connection
   * @returns {mongoose.Connection} MongoDB connection
   */
  getMongoDBConnection() {
    return this.mongoConnection;
  }

  /**
   * Execute a raw MongoDB query
   * @param {string} collectionName - Name of the collection
   * @param {Object} query - MongoDB query object
   * @returns {Promise<any>} Query result
   */
  async mongoQuery(collectionName, query) {
    if (!this.mongoConnection) {
      throw new Error('MongoDB connection not initialized');
    }

    const collection = this.mongoConnection.connection.collection(collectionName);
    return await collection.findOne(query);
  }

  /**
   * Execute a MongoDB find query
   * @param {string} collectionName - Name of the collection
   * @param {Object} query - MongoDB query object
   * @param {Object} options - Query options (limit, sort, etc.)
   * @returns {Promise<Array>} Query result
   */
  async mongoFind(collectionName, query = {}, options = {}) {
    if (!this.mongoConnection) {
      throw new Error('MongoDB connection not initialized');
    }

    const collection = this.mongoConnection.connection.collection(collectionName);
    const cursor = collection.find(query);

    if (options.limit) cursor.limit(options.limit);
    if (options.sort) cursor.sort(options.sort);
    if (options.skip) cursor.skip(options.skip);

    return await cursor.toArray();
  }

  /**
   * Insert a document in MongoDB
   * @param {string} collectionName - Name of the collection
   * @param {Object} document - Document to insert
   * @returns {Promise<Object>} Insert result
   */
  async mongoInsertOne(collectionName, document) {
    if (!this.mongoConnection) {
      throw new Error('MongoDB connection not initialized');
    }

    const collection = this.mongoConnection.connection.collection(collectionName);
    return await collection.insertOne(document);
  }

  /**
   * Update a document in MongoDB
   * @param {string} collectionName - Name of the collection
   * @param {Object} filter - Filter to match document
   * @param {Object} update - Update operations
   * @param {Object} options - Update options
   * @returns {Promise<Object>} Update result
   */
  async mongoUpdateOne(collectionName, filter, update, options = {}) {
    if (!this.mongoConnection) {
      throw new Error('MongoDB connection not initialized');
    }

    const collection = this.mongoConnection.connection.collection(collectionName);
    return await collection.updateOne(filter, update, options);
  }

  /**
   * Delete a document in MongoDB
   * @param {string} collectionName - Name of the collection
   * @param {Object} filter - Filter to match document
   * @returns {Promise<Object>} Delete result
   */
  async mongoDeleteOne(collectionName, filter) {
    if (!this.mongoConnection) {
      throw new Error('MongoDB connection not initialized');
    }

    const collection = this.mongoConnection.connection.collection(collectionName);
    return await collection.deleteOne(filter);
  }

  /**
   * Close all database connections
   * @returns {Promise<void>}
   */
  async closeConnections() {
    if (this.pool) {
      await this.pool.end();
    }

    if (this.mongoConnection) {
      await mongoose.connection.close();
    }
  }

  /**
   * Get database health status
   * @returns {Promise<Object>} Health status
   */
  async getHealth() {
    const status = {
      postgres: { connected: false, error: null },
      mongodb: { connected: false, error: null }
    };

    if (this.pool) {
      try {
        await this.query('SELECT 1');
        status.postgres.connected = true;
      } catch (error) {
        status.postgres.error = error.message;
      }
    }

    if (this.mongoConnection) {
      try {
        await this.mongoConnection.connection.db.admin().ping();
        status.mongodb.connected = true;
      } catch (error) {
        status.mongodb.error = error.message;
      }
    }

    return status;
  }
}

module.exports = DBConnector;