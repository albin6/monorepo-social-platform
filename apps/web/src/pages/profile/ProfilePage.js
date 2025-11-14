import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

const ProfilePage = () => {
  const { user } = useAuth();

  return (
    <div>
      <h1>User Profile</h1>
      {user && (
        <div>
          <h2>{user.username}</h2>
          <p>Email: {user.email || 'Not provided'}</p>
          <p>Member since: {user.createdAt || 'Unknown'}</p>
        </div>
      )}
      <div>
        <h3>About</h3>
        <p>This is where user's profile details would be displayed.</p>
      </div>
    </div>
  );
};

export default ProfilePage;