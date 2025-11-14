import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import '../styles/index.css'; // Import global styles

const HomePage = () => {
  const { user, logout } = useAuth();

  return (
    <div className="container">
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1>Welcome to the Social Platform</h1>
          {user && (
            <button className="button button-secondary" onClick={logout}>
              Logout
            </button>
          )}
        </div>

        <p>Hello {user ? user.username : 'Guest'}!</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginTop: '30px' }}>
          <Link to="/chat" className="feature-card" style={{
            display: 'block',
            padding: '20px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            textDecoration: 'none',
            color: 'inherit',
            border: '1px solid #dee2e6',
            transition: 'transform 0.2s, box-shadow 0.2s'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-5px)';
            e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#007bff' }}>💬 Real-time Chat</h3>
            <p style={{ margin: 0 }}>Connect and chat with friends instantly</p>
          </Link>

          <Link to="/friend-requests" className="feature-card" style={{
            display: 'block',
            padding: '20px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            textDecoration: 'none',
            color: 'inherit',
            border: '1px solid #dee2e6',
            transition: 'transform 0.2s, box-shadow 0.2s'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-5px)';
            e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#28a745' }}>👥 Friend Requests</h3>
            <p style={{ margin: 0 }}>Connect with new friends on the platform</p>
          </Link>

          <Link to="/video-call" className="feature-card" style={{
            display: 'block',
            padding: '20px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            textDecoration: 'none',
            color: 'inherit',
            border: '1px solid #dee2e6',
            transition: 'transform 0.2s, box-shadow 0.2s'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-5px)';
            e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#fd7e14' }}>📹 Video Calling</h3>
            <p style={{ margin: 0 }}>Make video calls with your connections</p>
          </Link>

          <Link to="/discovery" className="feature-card" style={{
            display: 'block',
            padding: '20px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            textDecoration: 'none',
            color: 'inherit',
            border: '1px solid #dee2e6',
            transition: 'transform 0.2s, box-shadow 0.2s'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-5px)';
            e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#6f42c1' }}>🔍 Discover New People</h3>
            <p style={{ margin: 0 }}>Find and connect with people nearby</p>
          </Link>

          <Link to="/notifications" className="feature-card" style={{
            display: 'block',
            padding: '20px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            textDecoration: 'none',
            color: 'inherit',
            border: '1px solid #dee2e6',
            transition: 'transform 0.2s, box-shadow 0.2s'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-5px)';
            e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#dc3545' }}>🔔 Notifications</h3>
            <p style={{ margin: 0 }}>Stay updated with latest notifications</p>
          </Link>

          <Link to="/profile" className="feature-card" style={{
            display: 'block',
            padding: '20px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            textDecoration: 'none',
            color: 'inherit',
            border: '1px solid #dee2e6',
            transition: 'transform 0.2s, box-shadow 0.2s'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-5px)';
            e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#17a2b8' }}>👤 Profile Management</h3>
            <p style={{ margin: 0 }}>Manage your profile and settings</p>
          </Link>
        </div>

        <div style={{ marginTop: '30px', textAlign: 'center' }}>
          <p style={{ color: '#6c757d', fontStyle: 'italic' }}>
            Your social experience starts here. Explore the features and connect with friends!
          </p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;