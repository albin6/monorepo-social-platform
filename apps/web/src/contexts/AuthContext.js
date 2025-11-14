import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

// Create the Auth Context
const AuthContext = createContext();

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check if user is logged in on initial load
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Validate the token with the backend
          const response = await authService.validateToken(token);
          if (response.valid && response.user) {
            setUser(response.user);
          } else {
            // Token is invalid, clear it
            localStorage.removeItem('token');
          }
        } catch (error) {
          console.error('Token validation failed:', error.message);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials);

      if (response.token && response.user) {
        localStorage.setItem('token', response.token);
        setUser(response.user);
        navigate('/');
        return { success: true, user: response.user };
      } else {
        return { success: false, error: 'Invalid response from server' };
      }
    } catch (error) {
      console.error('Login error:', error.message);
      return { success: false, error: error.message };
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      const response = await authService.register(userData);

      if (response.success) {
        return { success: true, user: response.user };
      } else {
        return { success: false, error: response.message || 'Registration failed' };
      }
    } catch (error) {
      console.error('Registration error:', error.message);
      return { success: false, error: error.message };
    }
  };

  // Logout function
  const logout = async () => {
    const refreshToken = localStorage.getItem('refreshToken');

    // Attempt to notify the backend about logout (optional)
    if (refreshToken) {
      try {
        await authService.logout(refreshToken);
      } catch (error) {
        console.error('Logout API call failed:', error.message);
        // Continue with local logout even if API call fails
      }
    }

    // Clear local storage and state
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setUser(null);
    navigate('/login');
  };

  // Forgot password function
  const forgotPassword = async (email) => {
    try {
      const response = await authService.forgotPassword(email);
      return { success: true, message: response.message || 'Password reset email sent' };
    } catch (error) {
      console.error('Forgot password error:', error.message);
      return { success: false, error: error.message };
    }
  };

  // Reset password function
  const resetPassword = async (token, newPassword) => {
    try {
      const response = await authService.resetPassword(token, newPassword);
      return { success: true, message: response.message || 'Password reset successful' };
    } catch (error) {
      console.error('Reset password error:', error.message);
      return { success: false, error: error.message };
    }
  };

  // Verify email function
  const verifyEmail = async (token) => {
    try {
      const response = await authService.verifyEmail(token);
      return { success: true, message: response.message || 'Email verified successfully' };
    } catch (error) {
      console.error('Email verification error:', error.message);
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    verifyEmail
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use the Auth Context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};