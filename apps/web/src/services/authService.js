// Auth service for authentication-related API calls
import { authApi } from './api';

export const authService = {
  // Login user
  login: async (credentials) => {
    try {
      const response = await authApi.post('/auth/login', credentials);
      return response.data;
    } catch (error) {
      if (error.response) {
        // Server responded with error status
        throw new Error(error.response.data.message || 'Login failed');
      } else if (error.request) {
        // Request was made but no response received
        throw new Error('Network error: Unable to reach the server');
      } else {
        // Something else happened
        throw new Error(error.message || 'An error occurred during login');
      }
    }
  },

  // Register user
  register: async (userData) => {
    try {
      const response = await authApi.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      if (error.response) {
        // Server responded with error status
        throw new Error(error.response.data.message || 'Registration failed');
      } else if (error.request) {
        // Request was made but no response received
        throw new Error('Network error: Unable to reach the server');
      } else {
        // Something else happened
        throw new Error(error.message || 'An error occurred during registration');
      }
    }
  },

  // Logout user
  logout: async (refreshToken) => {
    try {
      const response = await authApi.post('/auth/logout', { refreshToken });
      return response.data;
    } catch (error) {
      if (error.response) {
        console.warn('Logout request failed:', error.response.data.message);
        // Don't throw error for logout since we'll still clear local data
        return { success: true };
      } else {
        console.warn('Network error during logout:', error.message);
        // Don't throw error for logout since we'll still clear local data
        return { success: true };
      }
    }
  },

  // Refresh token
  refreshToken: async (refreshToken) => {
    try {
      const response = await authApi.post('/auth/refresh', { refreshToken });
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data.message || 'Token refresh failed');
      } else {
        throw new Error(error.message || 'Network error during token refresh');
      }
    }
  },

  // Verify email
  verifyEmail: async (token) => {
    try {
      const response = await authApi.post('/auth/verify-email', { token });
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data.message || 'Email verification failed');
      } else {
        throw new Error(error.message || 'Network error during email verification');
      }
    }
  },

  // Forgot password
  forgotPassword: async (email) => {
    try {
      const response = await authApi.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data.message || 'Password reset request failed');
      } else {
        throw new Error(error.message || 'Network error during password reset request');
      }
    }
  },

  // Reset password
  resetPassword: async (token, newPassword) => {
    try {
      const response = await authApi.post('/auth/reset-password', { 
        resetToken: token, 
        newPassword 
      });
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data.message || 'Password reset failed');
      } else {
        throw new Error(error.message || 'Network error during password reset');
      }
    }
  },

  // Validate token by fetching user profile
  validateToken: async (token) => {
    try {
      // We'll make a request to get the user profile to validate the token
      // In a real app, we would verify the JWT token directly or have a dedicated endpoint
      // For now, we'll temporarily set the token in the header and try to get profile
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };

      const response = await authApi.get('/auth/profile', config);
      return { valid: true, user: response.data.user };
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data.message || 'Token validation failed');
      } else {
        throw new Error(error.message || 'Network error during token validation');
      }
    }
  }
};