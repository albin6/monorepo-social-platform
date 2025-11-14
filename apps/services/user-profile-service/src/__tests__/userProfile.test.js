// apps/services/user-profile-service/src/__tests__/userProfile.test.js
const request = require('supertest');
const app = require('../server');
const UserProfile = require('../models/UserProfile');

describe('User Profile Service API', () => {
  let authToken;

  beforeAll(async () => {
    // Create a user and get auth token
    const registerResponse = await request(process.env.AUTH_SERVICE_URL || 'http://localhost:3001')
      .post('/auth/register')
      .send({
        email: 'profile-test@example.com',
        password: 'password123',
        username: 'profiletestuser'
      });

    authToken = registerResponse.body.token;
  });

  beforeEach(async () => {
    // Clean up user profiles for this test
    await UserProfile.deleteMany({ email: 'profile-test@example.com' });
  });

  afterEach(async () => {
    // Clean up after each test
    await UserProfile.deleteMany({ email: 'profile-test@example.com' });
  });

  describe('GET /api/v1/profile', () => {
    it('should return user profile when authenticated', async () => {
      if (!authToken) {
        // Skip test if auth service is not available
        return;
      }

      const response = await request(app)
        .get('/api/v1/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('email');
      expect(response.body.user).toHaveProperty('username');
    });

    it('should return 401 without valid token', async () => {
      await request(app)
        .get('/api/v1/profile')
        .expect(401);
    });
  });

  describe('PUT /api/v1/profile', () => {
    it('should update user profile when authenticated', async () => {
      if (!authToken) {
        // Skip test if auth service is not available
        return;
      }

      const updates = {
        firstName: 'Updated',
        lastName: 'Name',
        bio: 'Updated bio'
      };

      const response = await request(app)
        .put('/api/v1/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updates)
        .expect(200);

      expect(response.body.user).toHaveProperty('firstName', 'Updated');
      expect(response.body.user).toHaveProperty('lastName', 'Name');
      expect(response.body.user).toHaveProperty('bio', 'Updated bio');
    });

    it('should return 401 without valid token', async () => {
      await request(app)
        .put('/api/v1/profile')
        .send({ firstName: 'Test' })
        .expect(401);
    });
  });

  describe('GET /api/v1/search', () => {
    it('should return users matching search criteria', async () => {
      if (!authToken) {
        // Skip test if auth service is not available
        return;
      }

      // First create a profile
      await request(app)
        .put('/api/v1/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          firstName: 'Test',
          lastName: 'User',
          bio: 'Software developer'
        });

      const response = await request(app)
        .get('/api/v1/search?q=Test')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('users');
      expect(Array.isArray(response.body.users)).toBe(true);
    });

    it('should return 401 without valid token', async () => {
      await request(app)
        .get('/api/v1/search?q=test')
        .expect(401);
    });
  });
});