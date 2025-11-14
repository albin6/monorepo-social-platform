// apps/web/src/utils/apiUtils.js
import axios from 'axios';
import environmentConfig from '../config/environment';
import { API_ENDPOINTS } from '../config/constants';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: environmentConfig.API_BASE_URL,
  timeout: environmentConfig.TIMEOUTS.API_REQUEST,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(environmentConfig.JWT_TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // If the error is due to unauthorized and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Attempt to refresh the token
        const refreshToken = localStorage.getItem(environmentConfig.REFRESH_TOKEN_KEY);
        
        if (refreshToken) {
          const response = await axios.post(
            `${environmentConfig.API_BASE_URL}${API_ENDPOINTS.AUTH.REFRESH}`,
            { refreshToken },
            { headers: { 'Content-Type': 'application/json' } }
          );

          const { token: newToken } = response.data;

          // Save the new token
          localStorage.setItem(environmentConfig.JWT_TOKEN_KEY, newToken);

          // Update the original request with the new token
          originalRequest.headers.Authorization = `Bearer ${newToken}`;

          // Retry the original request
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // If refresh fails, redirect to login
        localStorage.removeItem(environmentConfig.JWT_TOKEN_KEY);
        localStorage.removeItem(environmentConfig.REFRESH_TOKEN_KEY);
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// API utility functions
export const apiUtils = {
  // Authentication APIs
  auth: {
    login: (credentials) => apiClient.post(API_ENDPOINTS.AUTH.LOGIN, credentials),
    register: (userData) => apiClient.post(API_ENDPOINTS.AUTH.REGISTER, userData),
    logout: () => apiClient.post(API_ENDPOINTS.AUTH.LOGOUT),
    refreshToken: (refreshToken) => 
      axios.post(`${environmentConfig.API_BASE_URL}${API_ENDPOINTS.AUTH.REFRESH}`, { refreshToken }),
    forgotPassword: (email) => apiClient.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email }),
    resetPassword: (data) => apiClient.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, data),
    verifyEmail: (token) => apiClient.post(API_ENDPOINTS.AUTH.VERIFY_EMAIL, { token }),
    getProfile: () => apiClient.get(API_ENDPOINTS.AUTH.PROFILE),
    updateProfile: (profileData) => apiClient.put(API_ENDPOINTS.AUTH.PROFILE, profileData),
  },

  // User APIs
  users: {
    getProfile: (userId) => apiClient.get(API_ENDPOINTS.USERS.PROFILE(userId)),
    search: (query, options = {}) => {
      const params = new URLSearchParams();
      params.append('search', query);
      Object.keys(options).forEach(key => {
        if (options[key] !== undefined) params.append(key, options[key]);
      });
      return apiClient.get(`${API_ENDPOINTS.USERS.SEARCH}?${params.toString()}`);
    },
    getFollowers: (userId, options = {}) => {
      const params = new URLSearchParams();
      Object.keys(options).forEach(key => {
        if (options[key] !== undefined) params.append(key, options[key]);
      });
      return apiClient.get(`${API_ENDPOINTS.USERS.FOLLOWERS(userId)}?${params.toString()}`);
    },
    getFollowing: (userId, options = {}) => {
      const params = new URLSearchParams();
      Object.keys(options).forEach(key => {
        if (options[key] !== undefined) params.append(key, options[key]);
      });
      return apiClient.get(`${API_ENDPOINTS.USERS.FOLLOWING(userId)}?${params.toString()}`);
    },
  },

  // Media APIs
  media: {
    uploadAvatar: (file) => {
      const formData = new FormData();
      formData.append('avatar', file);
      return apiClient.post(API_ENDPOINTS.MEDIA.UPLOAD_AVATAR, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    },
    uploadCover: (file) => {
      const formData = new FormData();
      formData.append('cover', file);
      return apiClient.post(API_ENDPOINTS.MEDIA.UPLOAD_COVER, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    },
  },

  // Generic API call function
  call: (method, endpoint, data = null, options = {}) => {
    return apiClient({
      method,
      url: endpoint,
      data,
      ...options,
    });
  },
};

export default apiClient;