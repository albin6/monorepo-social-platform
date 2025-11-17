// apps/web/src/services/friendService.js
import axios from 'axios';
import { API_ENDPOINTS } from '../config/constants';

// Create axios instance for friend request service
const friendRequestServiceUrl = process.env.REACT_APP_FRIEND_REQUEST_SERVICE_URL || 'http://localhost:3005';

const friendApi = axios.create({
  baseURL: friendRequestServiceUrl + '/api/v1',
  timeout: 10000,
});

// Request interceptor to add token to requests
friendApi.interceptors.request.use(
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
friendApi.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Friend Request API Error:', error.response || error.message || error);
    return Promise.reject(error);
  }
);

// Service methods
const friendService = {
  // Get friend requests
  getFriendRequests: async (type = 'received') => {
    try {
      const response = await friendApi.get(`${API_ENDPOINTS.FRIENDS.REQUESTS}/requests`, {
        params: { type }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting friend requests:', error);
      throw error;
    }
  },

  // Send friend request
  sendFriendRequest: async (receiverId, message = '') => {
    try {
      const response = await friendApi.post(`${API_ENDPOINTS.FRIENDS.REQUESTS}/send`, {
        receiverId,
        message
      });
      return response.data;
    } catch (error) {
      console.error('Error sending friend request:', error);
      throw error;
    }
  },

  // Respond to friend request (accept/reject/cancel)
  respondToRequest: async (requestId, action) => {
    try {
      const response = await friendApi.post(`${API_ENDPOINTS.FRIENDS.REQUESTS}/respond`, {
        requestId,
        action
      });
      return response.data;
    } catch (error) {
      console.error('Error responding to friend request:', error);
      throw error;
    }
  },

  // Get friends list
  getFriends: async (page = 1, limit = 20) => {
    try {
      const response = await friendApi.get(`${API_ENDPOINTS.FRIENDS.FRIENDS_LIST}`, {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting friends list:', error);
      throw error;
    }
  },

  // Get pending friend requests count
  getPendingRequestsCount: async () => {
    try {
      const response = await friendApi.get(`${API_ENDPOINTS.FRIENDS.REQUESTS}/requests/count`);
      return response.data;
    } catch (error) {
      console.error('Error getting pending requests count:', error);
      throw error;
    }
  },

  // Unfriend someone
  removeFriend: async (userId) => {
    try {
      const response = await friendApi.delete(`${API_ENDPOINTS.FRIENDS.FRIENDS_LIST}/unfriend/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error removing friend:', error);
      throw error;
    }
  }
};

export default friendService;