// apps/web/src/router/AppRouter.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { WebSocketProvider } from '../contexts/WebSocketContext';

// Core pages
import HomePage from '../pages/HomePage';
import NotFoundPage from '../pages/NotFoundPage';

// Auth pages
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '../pages/auth/ResetPasswordPage';
import VerifyEmailPage from '../pages/auth/VerifyEmailPage';

// Profile pages
import ProfilePage from '../pages/profile/ProfilePage';
import EditProfilePage from '../pages/profile/EditProfilePage';
import SettingsPage from '../pages/profile/SettingsPage';

// Chat pages
import ChatPage from '../pages/chat/ChatPage';
import ChatListPage from '../pages/chat/ChatListPage';
import GroupChatPage from '../pages/chat/GroupChatPage';

// Friend request pages
import FriendRequestsPage from '../pages/friend-requests/FriendRequestsPage';
import FriendsListPage from '../pages/friend-requests/FriendsListPage';

// Video call pages
import VideoCallPage from '../pages/video-call/VideoCallPage';
import VideoCallRoomPage from '../pages/video-call/VideoCallRoomPage';

// Notification pages
import NotificationsPage from '../pages/notifications/NotificationsPage';

// Discovery pages
import DiscoveryPage from '../pages/discovery/DiscoveryPage';
import UserSearchPage from '../pages/discovery/UserSearchPage';

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // Or a loading spinner component
  }

  return user ? children : <Navigate to="/login" />;
};

// Public route component (redirects if already logged in)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // Or a loading spinner component
  }

  return !user ? children : <Navigate to="/" />;
};

// Main App Router component
const AppRouter = () => {
  return (
    <Router>
      <AuthProvider>
        <WebSocketProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            } />
            <Route path="/register" element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            } />
            <Route path="/forgot-password" element={
              <PublicRoute>
                <ForgotPasswordPage />
              </PublicRoute>
            } />
            <Route path="/reset-password/:token" element={
              <PublicRoute>
                <ResetPasswordPage />
              </PublicRoute>
            } />
            <Route path="/verify-email" element={
              <PublicRoute>
                <VerifyEmailPage />
              </PublicRoute>
            } />

            {/* Protected Routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            } />

            {/* Profile Routes */}
            <Route path="/profile" element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } />
            <Route path="/profile/edit" element={
              <ProtectedRoute>
                <EditProfilePage />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            } />

            {/* Chat Routes */}
            <Route path="/chat" element={
              <ProtectedRoute>
                <ChatListPage />
              </ProtectedRoute>
            } />
            <Route path="/chat/:chatId" element={
              <ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>
            } />
            <Route path="/chat/group/:groupId" element={
              <ProtectedRoute>
                <GroupChatPage />
              </ProtectedRoute>
            } />

            {/* Friend Request Routes */}
            <Route path="/friend-requests" element={
              <ProtectedRoute>
                <FriendRequestsPage />
              </ProtectedRoute>
            } />
            <Route path="/friends" element={
              <ProtectedRoute>
                <FriendsListPage />
              </ProtectedRoute>
            } />

            {/* Video Call Routes */}
            <Route path="/video-call" element={
              <ProtectedRoute>
                <VideoCallPage />
              </ProtectedRoute>
            } />
            <Route path="/video-call/:callId" element={
              <ProtectedRoute>
                <VideoCallRoomPage />
              </ProtectedRoute>
            } />

            {/* Notification Routes */}
            <Route path="/notifications" element={
              <ProtectedRoute>
                <NotificationsPage />
              </ProtectedRoute>
            } />

            {/* Discovery Routes */}
            <Route path="/discovery" element={
              <ProtectedRoute>
                <DiscoveryPage />
              </ProtectedRoute>
            } />
            <Route path="/search" element={
              <ProtectedRoute>
                <UserSearchPage />
              </ProtectedRoute>
            } />

            {/* 404 Route */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </WebSocketProvider>
      </AuthProvider>
    </Router>
  );
};

export default AppRouter;
