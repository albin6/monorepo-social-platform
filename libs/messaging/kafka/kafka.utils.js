// libs/messaging/kafka/kafka.utils.js
const { Kafka } = require('kafkajs');

class KafkaUtils {
  constructor(config = {}) {
    this.config = {
      clientId: config.clientId || 'social-platform-client',
      brokers: config.brokers || [process.env.KAFKA_BROKERS || 'localhost:9092'],
      ...config
    };

    this.kafka = new Kafka(this.config);
    this.producer = null;
    this.consumer = null;
  }

  /**
   * Initialize Kafka producer
   * @returns {Promise<void>}
   */
  async initProducer() {
    this.producer = this.kafka.producer();
    await this.producer.connect();
    console.log('Kafka producer connected');
  }

  /**
   * Initialize Kafka consumer
   * @param {string} groupId - Consumer group ID
   * @returns {Promise<void>}
   */
  async initConsumer(groupId) {
    this.consumer = this.kafka.consumer({ groupId });
    await this.consumer.connect();
    console.log(`Kafka consumer connected with group: ${groupId}`);
  }

  /**
   * Send a message to a Kafka topic
   * @param {string} topic - Topic name
   * @param {any} message - Message to send
   * @param {string} key - Message key (optional)
   * @param {Object} headers - Message headers (optional)
   * @returns {Promise<void>}
   */
  async sendMessage(topic, message, key = null, headers = {}) {
    if (!this.producer) {
      throw new Error('Kafka producer not initialized');
    }

    // If message is an object, stringify it
    const value = typeof message === 'object' ? JSON.stringify(message) : String(message);

    const record = {
      topic,
      messages: [{
        value,
        key: key ? String(key) : undefined,
        headers: Object.keys(headers).length > 0 ? headers : undefined
      }]
    };

    try {
      const result = await this.producer.send(record);
      console.log(`Message sent to topic ${topic}`, result);
    } catch (error) {
      console.error(`Error sending message to topic ${topic}:`, error);
      throw error;
    }
  }

  /**
   * Send multiple messages to a Kafka topic
   * @param {string} topic - Topic name
   * @param {Array} messages - Array of messages to send
   * @returns {Promise<void>}
   */
  async sendMessages(topic, messages) {
    if (!this.producer) {
      throw new Error('Kafka producer not initialized');
    }

    const messageRecords = messages.map(msg => {
      const { key, value, headers } = msg;
      // If value is an object, stringify it
      const processedValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
      
      return {
        value: processedValue,
        key: key ? String(key) : undefined,
        headers: headers || undefined
      };
    });

    const record = {
      topic,
      messages: messageRecords
    };

    try {
      const result = await this.producer.send(record);
      console.log(`Messages sent to topic ${topic}`, result);
    } catch (error) {
      console.error(`Error sending messages to topic ${topic}:`, error);
      throw error;
    }
  }

  /**
   * Subscribe to a Kafka topic and process messages
   * @param {string} topic - Topic name to subscribe to
   * @param {Function} processFunction - Function to process each message
   * @param {Object} options - Consumer options
   * @returns {Promise<void>}
   */
  async subscribeToTopic(topic, processFunction, options = {}) {
    if (!this.consumer) {
      throw new Error('Kafka consumer not initialized');
    }

    await this.consumer.subscribe({ topic, ...options });

    await this.consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          // Parse the message value if it's JSON
          let parsedValue;
          try {
            parsedValue = JSON.parse(message.value.toString());
          } catch (e) {
            // If it's not JSON, keep it as a string
            parsedValue = message.value.toString();
          }

          const processedMessage = {
            value: parsedValue,
            key: message.key?.toString(),
            headers: message.headers,
            topic,
            partition,
            offset: message.offset
          };

          await processFunction(processedMessage);
        } catch (error) {
          console.error(`Error processing message from topic ${topic}:`, error);
          // In a real application, you might want to send this to a dead letter queue
        }
      }
    });

    console.log(`Subscribed to topic: ${topic}`);
  }

  /**
   * Subscribe to multiple Kafka topics and process messages
   * @param {Array} topics - Array of topic names to subscribe to
   * @param {Function} processFunction - Function to process each message
   * @returns {Promise<void>}
   */
  async subscribeToTopics(topics, processFunction) {
    if (!this.consumer) {
      throw new Error('Kafka consumer not initialized');
    }

    // Subscribe to all topics
    for (const topic of topics) {
      await this.consumer.subscribe({ topic });
    }

    await this.consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          // Parse the message value if it's JSON
          let parsedValue;
          try {
            parsedValue = JSON.parse(message.value.toString());
          } catch (e) {
            // If it's not JSON, keep it as a string
            parsedValue = message.value.toString();
          }

          const processedMessage = {
            value: parsedValue,
            key: message.key?.toString(),
            headers: message.headers,
            topic,
            partition,
            offset: message.offset
          };

          await processFunction(processedMessage);
        } catch (error) {
          console.error(`Error processing message from topic ${topic}:`, error);
        }
      }
    });

    console.log(`Subscribed to topics: ${topics.join(', ')}`);
  }

  /**
   * Disconnect Kafka producer and consumer
   * @returns {Promise<void>}
   */
  async disconnect() {
    if (this.producer) {
      await this.producer.disconnect();
      console.log('Kafka producer disconnected');
    }

    if (this.consumer) {
      await this.consumer.disconnect();
      console.log('Kafka consumer disconnected');
    }
  }

  /**
   * Create a topic (requires admin client)
   * @param {Object} topicConfig - Topic configuration
   * @returns {Promise<void>}
   */
  async createTopic(topicConfig) {
    const admin = this.kafka.admin();
    await admin.connect();
    
    try {
      await admin.createTopics({
        topics: [topicConfig]
      });
      console.log(`Topic ${topicConfig.topic} created successfully`);
    } catch (error) {
      console.error(`Error creating topic:`, error);
      throw error;
    } finally {
      await admin.disconnect();
    }
  }

  /**
   * Get Kafka cluster metadata
   * @returns {Promise<Object>} Cluster metadata
   */
  async getMetadata() {
    const admin = this.kafka.admin();
    await admin.connect();
    
    try {
      const metadata = await admin.fetchTopicMetadata();
      return metadata;
    } catch (error) {
      console.error('Error fetching metadata:', error);
      throw error;
    } finally {
      await admin.disconnect();
    }
  }

  /**
   * Get producer instance
   * @returns {Object} Kafka producer instance
   */
  getProducer() {
    return this.producer;
  }

  /**
   * Get consumer instance
   * @returns {Object} Kafka consumer instance
   */
  getConsumer() {
    return this.consumer;
  }
}

module.exports = KafkaUtils;