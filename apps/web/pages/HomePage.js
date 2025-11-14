// apps/web/pages/HomePage.js
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCurrentUser } from '../store/slices/userSlice';

const HomePage = () => {
  const dispatch = useDispatch();
  const { profile, loading, error } = useSelector(state => state.user);

  useEffect(() => {
    if (!profile) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch, profile]);

  return (
    <div className="container">
      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <h1>Welcome to Social Platform{profile ? `, ${profile.firstName}` : ''}!</h1>
        <p style={{ fontSize: '1.2em', color: '#666', marginBottom: '30px' }}>
          Connect with friends, share moments, and discover new connections.
        </p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginTop: '30px' }}>
          <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
            <h3>Chat with Friends</h3>
            <p>Stay connected with your friends through instant messaging</p>
            <button 
              className="button button-primary"
              onClick={() => window.location.href = '/chat'}
            >
              Go to Chats
            </button>
          </div>
          
          <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
            <h3>Discover People</h3>
            <p>Find new friends with similar interests</p>
            <button 
              className="button button-primary"
              onClick={() => window.location.href = '/discovery'}
            >
              Discover Now
            </button>
          </div>
          
          <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
            <h3>Share Moments</h3>
            <p>Create posts and share your experiences</p>
            <button 
              className="button button-primary"
              onClick={() => alert('Create Post feature coming soon!')}
            >
              Share Something
            </button>
          </div>
        </div>
        
        <div style={{ marginTop: '40px' }}>
          <h2>Quick Stats</h2>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', flexWrap: 'wrap' }}>
            <div className="card" style={{ padding: '15px 30px', minWidth: '150px' }}>
              <h3>0</h3>
              <p>Friends</p>
            </div>
            <div className="card" style={{ padding: '15px 30px', minWidth: '150px' }}>
              <h3>0</h3>
              <p>Unread Messages</p>
            </div>
            <div className="card" style={{ padding: '15px 30px', minWidth: '150px' }}>
              <h3>0</h3>
              <p>New Notifications</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;