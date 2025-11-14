// API service for making HTTP requests to backend services
import axios from 'axios';

// Base URLs for different services
const AUTH_SERVICE_URL = process.env.REACT_APP_AUTH_SERVICE_URL || 'http://localhost:3001';
const USER_SERVICE_URL = process.env.REACT_APP_USER_SERVICE_URL || 'http://localhost:3002';

// Create axios instances for different services
const authApi = axios.create({
  baseURL: AUTH_SERVICE_URL,
  timeout: 10000,
});

const userApi = axios.create({
  baseURL: USER_SERVICE_URL,
  timeout: 10000,
});

// Request interceptor to add token to requests (except auth endpoints)
authApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

userApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
[authApi, userApi].forEach(api => {
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      console.error('API Error:', error.response || error.message || error);
      return Promise.reject(error);
    }
  );
});

export { authApi, userApi };