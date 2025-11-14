// tests/load/k6/chat-load-test.js
import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

export let options = {
  stages: [
    { duration: '2m', target: 50 },    // Ramp up to 50 users over 2 minutes
    { duration: '10m', target: 50 },   // Stay at 50 users for 10 minutes
    { duration: '2m', target: 0 },     // Ramp down to 0 users over 2 minutes
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% of requests must complete within 2s
    http_req_failed: ['rate<0.02'],    // Error rate must be less than 2%
  },
};

// Test data
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3004'; // Chat service
const WS_URL = __ENV.WS_URL || 'ws://localhost:3003'; // WebSocket service

// Simulated user sessions
const USERS = Array.from({ length: 100 }, (_, i) => ({
  id: `user_${i}`,
  email: `user${i}@example.com`,
  username: `user${i}`,
  token: `mock_token_${i}`, // In real test, you'd authenticate first
}));

export default function () {
  // Randomly select users for this iteration
  const sender = USERS[randomIntBetween(0, USERS.length - 1)];
  const receiver = USERS[randomIntBetween(0, USERS.length - 1)];
  
  // Ensure different users for sender/receiver
  if (sender.id === receiver.id) {
    return; // Skip this iteration
  }

  group('Chat Operations', function() {
    // Send a message
    const messageData = {
      content: `Hello from ${sender.username} at ${new Date().toISOString()}`,
      type: 'text',
      receiverId: receiver.id,
    };

    const sendRes = http.post(
      `${BASE_URL}/messages`,
      JSON.stringify(messageData),
      {
        headers: {
          'Authorization': `Bearer ${sender.token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    check(sendRes, {
      'send message status is 200': (r) => r.status === 200 || r.status === 201,
      'send message returns id': (r) => r.json().id !== undefined,
    });

    if (sendRes.status === 200 || sendRes.status === 201) {
      const messageId = sendRes.json().id;

      // Get message history
      const historyRes = http.get(
        `${BASE_URL}/conversations/${receiver.id}/messages`,
        {
          headers: {
            'Authorization': `Bearer ${receiver.token}`,
          },
        }
      );

      check(historyRes, {
        'get messages status is 200': (r) => r.status === 200,
        'get messages returns array': (r) => Array.isArray(r.json().messages),
      });

      // Mark message as read
      const readRes = http.put(
        `${BASE_URL}/messages/${messageId}/read`,
        null,
        {
          headers: {
            'Authorization': `Bearer ${receiver.token}`,
          },
        }
      );

      check(readRes, {
        'mark as read status is 200': (r) => r.status === 200,
      });
    }
  });

  // Random sleep to simulate realistic chat usage
  sleep(randomIntBetween(0.5, 2));
}