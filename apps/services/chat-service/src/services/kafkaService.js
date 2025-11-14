// src/services/kafkaService.js
const { Kafka } = require('kafkajs');
require('dotenv').config();

class KafkaService {
  constructor() {
    this.kafka = new Kafka({
      clientId: 'chat-service',
      brokers: [process.env.KAFKA_BROKERS || 'localhost:9092']
    });
    
    this.producer = null;
    this.isConnected = false;
  }

  async connect() {
    if (this.isConnected) return;

    try {
      this.producer = this.kafka.producer();
      await this.producer.connect();
      this.isConnected = true;
      console.log('Kafka producer connected in Chat Service');
    } catch (error) {
      console.error('Error connecting Kafka producer:', error);
      throw error;
    }
  }

  async produceMessage(topic, messages) {
    if (!this.isConnected) {
      await this.connect();
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

  async disconnect() {
    if (this.producer) {
      await this.producer.disconnect();
      this.isConnected = false;
    }
  }
}

module.exports = new KafkaService();