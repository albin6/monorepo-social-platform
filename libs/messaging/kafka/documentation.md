# Kafka Utilities Documentation

## Overview
The Kafka Utilities library provides a comprehensive interface for producing and consuming messages in Apache Kafka for the Social Platform. This library includes methods for sending messages, subscribing to topics, and managing Kafka connections.

## Classes

### KafkaUtils
The main class that provides all Kafka-related functionality.

## Constructor

### KafkaUtils(config)
Create a new Kafka utilities instance.

**Parameters:**
- `config` (Object, optional): Configuration object with the following properties:
  - `clientId` (string, optional): Client ID for Kafka (default: 'social-platform-client')
  - `brokers` (Array, optional): Array of Kafka broker addresses (default: [process.env.KAFKA_BROKERS || 'localhost:9092'])
  - `connectionTimeout` (number, optional): Connection timeout in ms
  - `authenticationTimeout` (number, optional): Authentication timeout in ms
  - Other KafkaJS configuration options

**Example:**
```javascript
const kafkaUtils = new KafkaUtils({
  clientId: 'social-platform-producer',
  brokers: ['kafka1.example.com:9092', 'kafka2.example.com:9092']
});
```

## Methods

### async initProducer()
Initialize Kafka producer.

**Returns:**
- `Promise<void>`

### async initConsumer(groupId)
Initialize Kafka consumer.

**Parameters:**
- `groupId` (string): Consumer group ID

**Returns:**
- `Promise<void>`

### async sendMessage(topic, message, key, headers)
Send a message to a Kafka topic.

**Parameters:**
- `topic` (string): Topic name
- `message` (any): Message to send (objects will be JSON stringified)
- `key` (string, optional): Message key
- `headers` (Object, optional): Message headers

**Returns:**
- `Promise<void>`

**Example:**
```javascript
await kafkaUtils.sendMessage('user-events', {
  userId: '123',
  action: 'login',
  timestamp: new Date().toISOString()
}, 'user-123');
```

### async sendMessages(topic, messages)
Send multiple messages to a Kafka topic.

**Parameters:**
- `topic` (string): Topic name
- `messages` (Array): Array of messages to send, each with properties:
  - `key` (string, optional): Message key
  - `value` (any): Message value
  - `headers` (Object, optional): Message headers

**Returns:**
- `Promise<void>`

### async subscribeToTopic(topic, processFunction, options)
Subscribe to a Kafka topic and process messages.

**Parameters:**
- `topic` (string): Topic name to subscribe to
- `processFunction` (Function): Function to process each message
- `options` (Object, optional): Consumer options

**Returns:**
- `Promise<void>`

**Example:**
```javascript
await kafkaUtils.subscribeToTopic('user-events', async (message) => {
  console.log('Received message:', message.value);
  // Process the message
  await processUserEvent(message.value);
});
```

### async subscribeToTopics(topics, processFunction)
Subscribe to multiple Kafka topics and process messages.

**Parameters:**
- `topics` (Array): Array of topic names to subscribe to
- `processFunction` (Function): Function to process each message

**Returns:**
- `Promise<void>`

### async disconnect()
Disconnect Kafka producer and consumer.

**Returns:**
- `Promise<void>`

### async createTopic(topicConfig)
Create a Kafka topic (requires admin privileges).

**Parameters:**
- `topicConfig` (Object): Topic configuration with properties:
  - `topic` (string): Topic name
  - `numPartitions` (number, optional): Number of partitions (default: 1)
  - `replicationFactor` (number, optional): Replication factor (default: 1)

**Returns:**
- `Promise<void>`

### async getMetadata()
Get Kafka cluster metadata.

**Returns:**
- `Promise<Object>`: Cluster metadata

### getProducer()
Get Kafka producer instance.

**Returns:**
- `Object`: Kafka producer instance

### getConsumer()
Get Kafka consumer instance.

**Returns:**
- `Object`: Kafka consumer instance

## Usage Examples

### Basic Producer Usage
```javascript
const KafkaUtils = require('./libs/messaging/kafka/kafka.utils');

const kafkaUtils = new KafkaUtils({
  clientId: 'social-platform-producer',
  brokers: [process.env.KAFKA_BROKERS]
});

// Initialize producer
await kafkaUtils.initProducer();

// Send a simple message
await kafkaUtils.sendMessage('user-actions', {
  userId: '123',
  action: 'created_post',
  postId: '456',
  timestamp: new Date().toISOString()
}, 'user-123');

// Send multiple messages
await kafkaUtils.sendMessages('user-events', [
  {
    key: 'user-123',
    value: { event: 'login', userId: '123' }
  },
  {
    key: 'user-456',
    value: { event: 'signup', userId: '456' }
  }
]);

// Disconnect
await kafkaUtils.disconnect();
```

### Basic Consumer Usage
```javascript
const KafkaUtils = require('./libs/messaging/kafka/kafka.utils');

const kafkaUtils = new KafkaUtils({
  clientId: 'social-platform-consumer',
  brokers: [process.env.KAFKA_BROKERS]
});

// Initialize consumer
await kafkaUtils.initConsumer('social-platform-consumer-group');

// Subscribe to a topic
await kafkaUtils.subscribeToTopic('user-events', async (message) => {
  console.log(`Received message from topic ${message.topic}:`, message.value);
  
  // Process the message based on its content
  switch (message.value.event) {
    case 'login':
      await handleUserLogin(message.value);
      break;
    case 'signup':
      await handleUserSignup(message.value);
      break;
    default:
      console.log('Unknown event:', message.value.event);
  }
});

// Subscribe to multiple topics
await kafkaUtils.subscribeToTopics(['user-events', 'chat-messages'], async (message) => {
  console.log(`Received message from topic ${message.topic}:`, message.value);
  // Process message...
});

// Disconnect consumer when done
// Note: In a real application, the consumer typically runs indefinitely
// await kafkaUtils.disconnect();
```

### Advanced Usage with Error Handling
```javascript
const KafkaUtils = require('./libs/messaging/kafka/kafka.utils');

class MessageProcessor {
  constructor() {
    this.kafkaUtils = new KafkaUtils({
      clientId: 'social-platform-processor',
      brokers: [process.env.KAFKA_BROKERS]
    });
  }

  async start() {
    try {
      // Initialize both producer and consumer
      await this.kafkaUtils.initProducer();
      await this.kafkaUtils.initConsumer('message-processor-group');

      // Subscribe to topics
      await this.kafkaUtils.subscribeToTopic('user-events', this.processUserEvent.bind(this));
      await this.kafkaUtils.subscribeToTopic('notifications', this.processNotification.bind(this));
    } catch (error) {
      console.error('Error initializing Kafka:', error);
      throw error;
    }
  }

  async processUserEvent(message) {
    try {
      console.log('Processing user event:', message.value);
      
      // Process the event
      await this.handleEvent(message.value);
      
      // Send a response message if needed
      await this.kafkaUtils.sendMessage('event-responses', {
        eventId: message.value.eventId,
        status: 'processed',
        processedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error processing user event:', error);
      // In a real application, you might want to send this to a dead letter queue
    }
  }

  async processNotification(message) {
    try {
      console.log('Processing notification:', message.value);
      await this.handleNotification(message.value);
    } catch (error) {
      console.error('Error processing notification:', error);
    }
  }

  async handleEvent(event) {
    // Implementation for handling events
  }

  async handleNotification(notification) {
    // Implementation for handling notifications
  }

  async stop() {
    await this.kafkaUtils.disconnect();
  }
}

// Usage
const processor = new MessageProcessor();
await processor.start();
```

## Configuration

The Kafka utilities support various configuration options through the config parameter:

- `clientId`: Unique identifier for the Kafka client
- `brokers`: List of Kafka broker addresses
- `connectionTimeout`: Timeout for connection attempts
- `authenticationTimeout`: Timeout for authentication
- `retry`: Retry configuration for failed operations
- `requestTimeout`: Timeout for Kafka requests

## Error Handling

The Kafka utilities handle errors gracefully:

- Connection failures are caught and logged
- Message processing errors are handled individually
- Failed message sends are properly caught and rethrown
- Consumer errors are logged but don't stop the entire consumer
- Proper cleanup occurs during disconnection

## Performance Considerations

- Use batching (`sendMessages`) for better performance when sending multiple messages
- Configure appropriate consumer group IDs to enable parallel processing
- Monitor consumer lag to ensure messages are being processed in a timely manner
- Use message keys for partitioning to ensure ordering when needed
- Implement proper error handling and dead letter queues for failed messages