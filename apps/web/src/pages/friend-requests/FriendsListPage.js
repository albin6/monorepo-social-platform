import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import friendService from '../../services/friendService';
import '../../styles/index.css';

const FriendsListPage = () => {
  const { user } = useAuth();
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchFriends = async () => {
    setLoading(true);
    try {
      const response = await friendService.getFriends();
      setFriends(response.friends || []);
    } catch (error) {
      console.error('Error fetching friends:', error);
      setError('Failed to load friends list. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFriends();
  }, []);

  return (
    <div className="container">
      <div className="card">
        <h2>Friends List</h2>

        {loading && <div className="loading">Loading friends...</div>}

        {error && (
          <div className="error-message" style={{
            padding: '10px',
            backgroundColor: '#f8d7da',
            color: '#721c24',
            border: '1px solid #f5c6cb',
            borderRadius: '4px',
            marginBottom: '15px'
          }}>
            {error}
          </div>
        )}

        {!loading && !error && friends.length === 0 && (
          <div>
            <p>You don't have any friends yet.</p>
            <p>Send or accept friend requests to start building your network!</p>
          </div>
        )}

        {!loading && !error && friends.length > 0 && (
          <div>
            <p>You have {friends.length} friend{friends.length !== 1 ? 's' : ''}</p>
            <div className="friends-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
              gap: '15px',
              marginTop: '20px'
            }}>
              {friends.map(friend => (
                <div key={friend._id || friend.id} className="friend-card" style={{
                  border: '1px solid #eee',
                  borderRadius: '8px',
                  padding: '15px',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <img
                    src={friend.profilePicture || friend.avatar || 'https://via.placeholder.com/50/0000FF/808080?Text=F'}
                    alt={friend.username || friend.name}
                    style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '50%',
                      marginRight: '15px'
                    }}
                  />
                  <div>
                    <h3 style={{ margin: '0 0 5px 0' }}>{friend.username || friend.name}</h3>
                    <p style={{ margin: 0, fontSize: '0.9em', color: '#666' }}>
                      {friend.onlineStatus === 'online' ? (
                        <span style={{ color: '#28a745' }}>🟢 Online</span>
                      ) : (
                        <span style={{ color: '#6c757d' }}>⚫ Offline</span>
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FriendsListPage;