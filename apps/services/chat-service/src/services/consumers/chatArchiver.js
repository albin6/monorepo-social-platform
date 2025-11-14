// src/services/consumers/chatArchiver.js
const { Kafka } = require('kafkajs');
require('dotenv').config();

class ChatArchiver {
  constructor() {
    this.kafka = new Kafka({
      clientId: 'chat-archiver',
      brokers: [process.env.KAFKA_BROKERS || 'localhost:9092']
    });
    
    this.consumer = null;
  }

  async connect() {
    try {
      this.consumer = this.kafka.consumer({ groupId: 'chat-archiver-group' });
      await this.consumer.connect();
      console.log('Chat Archiver consumer connected');
    } catch (error) {
      console.error('Error connecting Chat Archiver consumer:', error);
      throw error;
    }
  }

  async startConsuming() {
    if (!this.consumer) {
      await this.connect();
    }

    try {
      await this.consumer.subscribe({ topic: 'chat_messages', fromBeginning: false });

      await this.consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          try {
            const parsedMessage = JSON.parse(message.value.toString());
            
            // Process the message for archiving
            await this.archiveMessage(parsedMessage);
            
            console.log(`Archived message: ${parsedMessage.messageId}`);
          } catch (error) {
            console.error('Error processing chat message for archiving:', error);
          }
        }
      });
    } catch (error) {
      console.error('Error running Chat Archiver consumer:', error);
      throw error;
    }
  }

  async archiveMessage(messageData) {
    // In a real implementation, this would archive the message to a database,
    // data lake, or other long-term storage system
    console.log('Archiving message to long-term storage:', messageData);
    
    // Example: Save to archive database, S3, or other storage
    // This is a placeholder implementation
    try {
      // Simulate archiving to external system
      // In real implementation: 
      // await archiveDatabase.insert(messageData);
      // await s3Client.putObject(...);
      
      return { success: true, archivedAt: new Date() };
    } catch (error) {
      console.error('Error archiving message:', error);
      throw error;
    }
  }

  async stop() {
    if (this.consumer) {
      await this.consumer.disconnect();
    }
  }
}

module.exports = ChatArchiver;