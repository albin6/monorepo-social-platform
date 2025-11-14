// tests/load/k6/auth-load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';
import { randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

// Options for the test
export let options = {
  stages: [
    { duration: '2m', target: 10 },    // Ramp up to 10 users over 2 minutes
    { duration: '5m', target: 10 },    // Stay at 10 users for 5 minutes
    { duration: '2m', target: 0 },     // Ramp down to 0 users over 2 minutes
  ],
  thresholds: {
    http_req_duration: ['p(95)<1500'], // 95% of requests must complete within 1.5s
    http_req_failed: ['rate<0.01'],    // Error rate must be less than 1%
  },
};

// Test data
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3001';
const USERS = [
  { email: 'user1@example.com', password: 'SecurePassword123!' },
  { email: 'user2@example.com', password: 'SecurePassword123!' },
  { email: 'user3@example.com', password: 'SecurePassword123!' },
  { email: 'user4@example.com', password: 'SecurePassword123!' },
  { email: 'user5@example.com', password: 'SecurePassword123!' },
];

export default function () {
  // Randomly select a user for this iteration
  const user = USERS[randomIntBetween(0, USERS.length - 1)];
  
  // Login request
  const loginRes = http.post(`${BASE_URL}/auth/login`, {
    email: user.email,
    password: user.password,
  });

  check(loginRes, {
    'login status is 200': (r) => r.status === 200,
    'login has token': (r) => r.json().token !== undefined,
  });

  if (loginRes.status === 200) {
    const token = loginRes.json().token;

    // Get profile with auth token
    const profileRes = http.get(`${BASE_URL}/auth/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    check(profileRes, {
      'profile status is 200': (r) => r.status === 200,
      'profile has user data': (r) => r.json().user !== undefined,
    });

    // Simulate some activity - update profile
    const updateRes = http.put(
      `${BASE_URL}/auth/profile`,
      JSON.stringify({
        bio: `Updated by load test at ${new Date().toISOString()}`,
      }),
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    check(updateRes, {
      'update profile status is 200': (r) => r.status === 200,
    });
  }

  // Random sleep to simulate user think time
  sleep(randomIntBetween(1, 3));
}