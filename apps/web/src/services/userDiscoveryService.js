// apps/web/src/services/userDiscoveryService.js
import { userApi } from './api';

const userDiscoveryService = {
  // Search for users with various filters
  searchUsers: async (filters = {}) => {
    try {
      const response = await userApi.get('/search', {
        params: filters
      });
      return response.data;
    } catch (error) {
      console.error('Error searching users:', error);
      throw error;
    }
  },

  // Get users within a specific radius (for location-based discovery)
  getUsersWithinRadius: async (longitude, latitude, radius = 50, limit = 20) => {
    try {
      const response = await userApi.get('/within-radius', {
        params: {
          longitude,
          latitude,
          radius,
          limit
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting users within radius:', error);
      throw error;
    }
  },

  // Get a specific user profile by ID
  getUserProfile: async (userId) => {
    try {
      const response = await userApi.get(`/profiles/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }
  }
};

export default userDiscoveryService;