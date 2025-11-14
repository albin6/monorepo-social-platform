// apps/services/auth-service/src/__tests__/auth.test.js
const request = require('supertest');
const app = require('../server');
const User = require('../models/User');

describe('Auth Service API', () => {
  beforeAll(async () => {
    // Initialize database connection for tests
    await User.deleteMany({});
  });

  afterAll(async () => {
    // Clean up
    await User.deleteMany({});
  });

  describe('POST /auth/register', () => {
    it('should register a new user', async () => {
      const userInfo = {
        email: 'test@example.com',
        password: 'password123',
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User'
      };

      const response = await request(app)
        .post('/auth/register')
        .send(userInfo)
        .expect(201);

      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(userInfo.email);
      expect(response.body.user.username).toBe(userInfo.username);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('refreshToken');
    });

    it('should return 400 when required fields are missing', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          email: 'test@example.com'
          // Missing password and username
        })
        .expect(400);

      expect(response.body.message).toContain('required');
    });

    it('should return 409 when user already exists', async () => {
      // First registration
      await request(app)
        .post('/auth/register')
        .send({
          email: 'existing@example.com',
          password: 'password123',
          username: 'existinguser'
        })
        .expect(201);

      // Second registration attempt
      const response = await request(app)
        .post('/auth/register')
        .send({
          email: 'existing@example.com',
          password: 'password123',
          username: 'differentuser'
        })
        .expect(409);

      expect(response.body.message).toContain('already exists');
    });
  });

  describe('POST /auth/login', () => {
    beforeAll(async () => {
      // Create a user for login test
      await request(app)
        .post('/auth/register')
        .send({
          email: 'login@example.com',
          password: 'password123',
          username: 'loginuser'
        });
    });

    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'login@example.com',
          password: 'password123'
        })
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('refreshToken');
    });

    it('should return 401 with invalid credentials', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'login@example.com',
          password: 'wrongpassword'
        })
        .expect(401);

      expect(response.body.message).toContain('Invalid email or password');
    });

    it('should return 401 when user does not exist', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        })
        .expect(401);

      expect(response.body.message).toContain('Invalid email or password');
    });
  });

  describe('GET /auth/profile', () => {
    let token;

    beforeAll(async () => {
      // Register and login to get a token
      const registerResponse = await request(app)
        .post('/auth/register')
        .send({
          email: 'profile@example.com',
          password: 'password123',
          username: 'profileuser'
        });

      token = registerResponse.body.token;
    });

    it('should return user profile when authenticated', async () => {
      const response = await request(app)
        .get('/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.user).toHaveProperty('email', 'profile@example.com');
      expect(response.body.user).toHaveProperty('username', 'profileuser');
    });

    it('should return 401 without valid token', async () => {
      await request(app)
        .get('/auth/profile')
        .expect(401);
    });
  });
});