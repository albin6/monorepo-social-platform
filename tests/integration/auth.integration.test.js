// tests/integration/auth.integration.test.js
const { testUsers } = require('./testData');
const request = require('supertest');
const app = require('../../apps/services/auth-service/src/app'); // Adjust path as needed

describe('Authentication Integration Tests', () => {
  let testUser = testUsers[0];

  beforeAll(async () => {
    // Setup test environment if needed
  });

  afterAll(async () => {
    // Cleanup test environment if needed
  });

  describe('User Registration', () => {
    test('should successfully register a new user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'newtestuser',
          email: 'newtestuser@example.com',
          password: 'SecurePassword123!',
          firstName: 'New',
          lastName: 'Test User'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe('newtestuser@example.com');
      expect(response.body).toHaveProperty('token');
    });

    test('should fail to register with existing email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'anotheruser',
          email: testUser.email, // Use existing email
          password: 'SecurePassword123!',
          firstName: 'Another',
          lastName: 'User'
        });

      expect(response.status).toBe(409); // Conflict
    });

    test('should fail to register with weak password', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'weakpassworduser',
          email: 'weakpassword@example.com',
          password: '123', // Weak password
          firstName: 'Weak',
          lastName: 'Password'
        });

      expect(response.status).toBe(400);
    });
  });

  describe('User Login', () => {
    test('should successfully login with valid credentials', async () => {
      // First register a test user
      await request(app)
        .post('/api/auth/register')
        .send({
          username: 'logintestuser',
          email: 'logintest@example.com',
          password: 'SecurePassword123!',
          firstName: 'Login',
          lastName: 'Test'
        });

      // Then try to login
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'logintest@example.com',
          password: 'SecurePassword123!'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
    });

    test('should fail to login with invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
    });
  });

  describe('Token Management', () => {
    test('should refresh a valid token', async () => {
      // First get a token
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });

      expect(loginResponse.status).toBe(200);
      const token = loginResponse.body.token;

      // Then try to refresh it
      const response = await request(app)
        .post('/api/auth/refresh')
        .set('Authorization', `Bearer ${token}`)
        .send({
          refreshToken: loginResponse.body.refreshToken
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
    });
  });

  describe('User Profile Management', () => {
    let authToken;

    beforeAll(async () => {
      // Get auth token for tests
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });
      
      if (loginResponse.status === 200) {
        authToken = loginResponse.body.token;
      }
    });

    test('should get current user profile', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.id).toBe(testUser.id);
    });

    test('should update user profile', async () => {
      const updateData = {
        bio: 'Updated bio during integration test',
        location: 'Updated Location, US',
        website: 'https://updated-website.com'
      };

      const response = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.bio).toBe(updateData.bio);
      expect(response.body.user.location).toBe(updateData.location);
    });
  });
});