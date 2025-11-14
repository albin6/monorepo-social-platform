// src/services/kafkaService.js
const { Kafka } = require('kafkajs');

class KafkaService {
  constructor() {
    this.kafka = new Kafka({
      clientId: 'social-platform',
      brokers: [process.env.KAFKA_BROKERS || 'localhost:9092']
    });
    
    this.producer = null;
    this.consumer = null;
  }

  async connectProducer() {
    try {
      this.producer = this.kafka.producer();
      await this.producer.connect();
      console.log('Kafka producer connected');
    } catch (error) {
      console.error('Error connecting Kafka producer:', error);
      throw error;
    }
  }

  async connectConsumer(groupId) {
    try {
      this.consumer = this.kafka.consumer({ groupId });
      await this.consumer.connect();
      console.log(`Kafka consumer connected with group ID: ${groupId}`);
    } catch (error) {
      console.error('Error connecting Kafka consumer:', error);
      throw error;
    }
  }

  async produceMessage(topic, messages) {
    if (!this.producer) {
      throw new Error('Kafka producer not connected');
    }

    try {
      await this.producer.send({
        topic,
        messages: Array.isArray(messages) ? messages : [messages]
      });
    } catch (error) {
      console.error(`Error producing message to topic ${topic}:`, error);
      throw error;
    }
  }

  async consumeMessages(topic, onMessage) {
    if (!this.consumer) {
      throw new Error('Kafka consumer not connected');
    }

    try {
      await this.consumer.subscribe({ topic, fromBeginning: true });
      
      await this.consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          try {
            const parsedMessage = {
              value: JSON.parse(message.value.toString()),
              key: message.key?.toString(),
              timestamp: message.timestamp,
              partition
            };
            
            await onMessage(parsedMessage);
          } catch (error) {
            console.error('Error processing message:', error);
          }
        }
      });
    } catch (error) {
      console.error(`Error consuming messages from topic ${topic}:`, error);
      throw error;
    }
  }

  async disconnect() {
    if (this.producer) {
      await this.producer.disconnect();
    }
    if (this.consumer) {
      await this.consumer.disconnect();
    }
  }
}

module.exports = new KafkaService();