// libs/utils/redis/redis.utils.js
const Redis = require('redis');

class RedisUtils {
  constructor(config = {}) {
    this.client = null;
    this.config = {
      host: config.host || 'localhost',
      port: config.port || 6379,
      password: config.password || null,
      db: config.db || 0,
      ...config
    };
  }

  /**
   * Connect to Redis
   * @returns {Promise<void>}
   */
  async connect() {
    this.client = Redis.createClient({
      host: this.config.host,
      port: this.config.port,
      password: this.config.password,
      db: this.config.db
    });

    this.client.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });

    await this.client.connect();
  }

  /**
   * Set a key-value pair in Redis
   * @param {string} key - Key to set
   * @param {string|object} value - Value to set
   * @param {number} expiry - Expiration time in seconds (optional)
   * @returns {Promise<boolean>} True if successful
   */
  async set(key, value, expiry) {
    if (!this.client) {
      throw new Error('Redis client not connected');
    }

    // If value is an object, stringify it
    const stringValue = typeof value === 'object' ? JSON.stringify(value) : value;

    if (expiry) {
      return await this.client.set(key, stringValue, { EX: expiry });
    } else {
      return await this.client.set(key, stringValue);
    }
  }

  /**
   * Get value by key from Redis
   * @param {string} key - Key to get
   * @returns {Promise<any>} Value or null if key doesn't exist
   */
  async get(key) {
    if (!this.client) {
      throw new Error('Redis client not connected');
    }

    const value = await this.client.get(key);
    
    if (value === null) {
      return null;
    }

    // Try to parse as JSON, otherwise return as string
    try {
      return JSON.parse(value);
    } catch (e) {
      return value;
    }
  }

  /**
   * Delete a key from Redis
   * @param {string} key - Key to delete
   * @returns {Promise<boolean>} True if key was deleted
   */
  async delete(key) {
    if (!this.client) {
      throw new Error('Redis client not connected');
    }

    const result = await this.client.del(key);
    return result > 0;
  }

  /**
   * Check if a key exists in Redis
   * @param {string} key - Key to check
   * @returns {Promise<boolean>} True if key exists
   */
  async exists(key) {
    if (!this.client) {
      throw new Error('Redis client not connected');
    }

    const result = await this.client.exists(key);
    return result === 1;
  }

  /**
   * Set expiration for a key
   * @param {string} key - Key to set expiration for
   * @param {number} seconds - Expiration time in seconds
   * @returns {Promise<boolean>} True if successful
   */
  async expire(key, seconds) {
    if (!this.client) {
      throw new Error('Redis client not connected');
    }

    return await this.client.expire(key, seconds);
  }

  /**
   * Get expiration time for a key
   * @param {string} key - Key to get expiration for
   * @returns {Promise<number>} Expiration time in seconds, -1 if no expiration, -2 if key doesn't exist
   */
  async ttl(key) {
    if (!this.client) {
      throw new Error('Redis client not connected');
    }

    return await this.client.ttl(key);
  }

  /**
   * Add to a Redis set
   * @param {string} key - Set key
   * @param {...any} members - Members to add
   * @returns {Promise<number>} Number of members added
   */
  async addToSet(key, ...members) {
    if (!this.client) {
      throw new Error('Redis client not connected');
    }

    return await this.client.sAdd(key, members);
  }

  /**
   * Get all members of a Redis set
   * @param {string} key - Set key
   * @returns {Promise<array>} Array of set members
   */
  async getSetMembers(key) {
    if (!this.client) {
      throw new Error('Redis client not connected');
    }

    return await this.client.sMembers(key);
  }

  /**
   * Add to a Redis list (push to end)
   * @param {string} key - List key
   * @param {...any} elements - Elements to add
   * @returns {Promise<number>} New length of the list
   */
  async addToList(key, ...elements) {
    if (!this.client) {
      throw new Error('Redis client not connected');
    }

    return await this.client.rPush(key, elements);
  }

  /**
   * Get range of elements from a Redis list
   * @param {string} key - List key
   * @param {number} start - Start index
   * @param {number} stop - Stop index
   * @returns {Promise<array>} Array of list elements
   */
  async getListRange(key, start, stop) {
    if (!this.client) {
      throw new Error('Redis client not connected');
    }

    return await this.client.lRange(key, start, stop);
  }

  /**
   * Increment a counter in Redis
   * @param {string} key - Counter key
   * @param {number} increment - Amount to increment by
   * @returns {Promise<number>} New counter value
   */
  async incrementCounter(key, increment = 1) {
    if (!this.client) {
      throw new Error('Redis client not connected');
    }

    return await this.client.incrBy(key, increment);
  }

  /**
   * Get counter value
   * @param {string} key - Counter key
   * @returns {Promise<number>} Counter value
   */
  async getCounter(key) {
    if (!this.client) {
      throw new Error('Redis client not connected');
    }

    const value = await this.client.get(key);
    return value ? parseInt(value) : 0;
  }

  /**
   * Close Redis connection
   * @returns {Promise<void>}
   */
  async disconnect() {
    if (this.client) {
      await this.client.quit();
      this.client = null;
    }
  }

  /**
   * Get Redis client instance
   * @returns {RedisClient} Redis client instance
   */
  getClient() {
    return this.client;
  }
}

module.exports = RedisUtils;