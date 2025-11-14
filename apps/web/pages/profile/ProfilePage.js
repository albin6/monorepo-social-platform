// apps/web/pages/profile/ProfilePage.js
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { fetchCurrentUser } from '../../store/slices/userSlice';
import { fetchFriends } from '../../store/slices/friendSlice';

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { profile, loading, error } = useSelector(state => state.user);
  const { friends } = useSelector(state => state.friends);
  const { userId } = useParams(); // If viewing another user's profile

  useEffect(() => {
    // Fetch current user profile if not already loaded
    if (!profile) {
      dispatch(fetchCurrentUser());
    }
    
    // Fetch friends list
    dispatch(fetchFriends());
  }, [dispatch, profile]);

  if (loading) {
    return (
      <div className="loading">
        <p>Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="alert alert-danger">
          Error loading profile: {error}
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container">
        <p>Profile not found</p>
      </div>
    );
  }

  // If viewing another user's profile, we would fetch their data here
  const userProfile = profile; // This would come from URL params in real implementation

  return (
    <div className="container">
      <div className="profile-header">
        <div className="profile-cover">
          <img 
            src={userProfile.coverImage || '/images/default-cover.jpg'} 
            alt="Cover" 
            style={{ width: '100%', height: '200px', objectFit: 'cover' }}
          />
        </div>
        
        <div className="profile-info" style={{ padding: '0 20px' }}>
          <div className="profile-avatar" style={{ marginTop: '-50px', position: 'relative', zIndex: 1 }}>
            <img 
              src={userProfile.avatar || '/images/default-avatar.png'} 
              alt={userProfile.username}
              style={{ 
                width: '100px', 
                height: '100px', 
                borderRadius: '50%', 
                border: '3px solid white',
                objectFit: 'cover'
              }}
            />
          </div>
          
          <div className="profile-details" style={{ marginTop: '20px' }}>
            <h1>{userProfile.firstName} {userProfile.lastName}</h1>
            <p style={{ color: '#666' }}>@{userProfile.username}</p>
            {userProfile.bio && <p>{userProfile.bio}</p>}
          </div>
        </div>
      </div>

      <div className="profile-content" style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '20px', marginTop: '20px' }}>
        <div className="main-content">
          <div className="card" style={{ marginBottom: '20px' }}>
            <h3>About</h3>
            {userProfile.bio && <p>{userProfile.bio}</p>}
            {userProfile.location && <p><strong>Location:</strong> {userProfile.location}</p>}
            {userProfile.website && (
              <p>
                <strong>Website:</strong> <a href={userProfile.website} target="_blank" rel="noopener noreferrer">
                  {userProfile.website}
                </a>
              </p>
            )}
            <p><strong>Member since:</strong> {new Date(userProfile.createdAt).toLocaleDateString()}</p>
          </div>

          <div className="card">
            <h3>Recent Activity</h3>
            <p>No recent activity to display.</p>
          </div>
        </div>

        <div className="sidebar">
          <div className="card" style={{ marginBottom: '20px' }}>
            <h3>Friends ({friends.length})</h3>
            {friends.length > 0 ? (
              <div>
                {friends.slice(0, 5).map(friend => (
                  <div key={friend.id} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                    <img 
                      src={friend.avatar || '/images/default-avatar.png'} 
                      alt={friend.username}
                      style={{ width: '30px', height: '30px', borderRadius: '50%', marginRight: '10px' }}
                    />
                    <span>{friend.firstName} {friend.lastName}</span>
                  </div>
                ))}
                {friends.length > 5 && (
                  <p style={{ marginTop: '10px' }}><a href="/friends">View all friends</a></p>
                )}
              </div>
            ) : (
              <p>No friends yet.</p>
            )}
          </div>

          <div className="card">
            <h3>Quick Actions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button className="button button-primary">Edit Profile</button>
              <button className="button button-secondary">Send Message</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;