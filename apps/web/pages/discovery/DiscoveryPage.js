// apps/web/pages/discovery/DiscoveryPage.js
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { sendFriendRequest } from '../../store/slices/friendSlice';
import { apiUtils } from '../../utils/apiUtils';

const DiscoveryPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { profile: currentUser } = useSelector(state => state.user);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    location: '',
    ageRange: '',
    interests: '',
  });
  const [activeTab, setActiveTab] = useState('discover'); // discover, trending, suggested
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Fetch users based on active tab
  useEffect(() => {
    fetchUsers();
  }, [activeTab, searchQuery, filters, page]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // In a real app, this would call the actual API
      // For now, we'll simulate with mock data
      const mockUsers = [
        {
          id: '1',
          username: 'john_doe',
          firstName: 'John',
          lastName: 'Doe',
          avatar: '/images/default-avatar.png',
          bio: 'Software Engineer',
          location: 'San Francisco, CA',
          isOnline: true,
          lastSeen: new Date().toISOString(),
          mutualFriends: 5,
          commonInterests: ['technology', 'coding', 'react'],
        },
        {
          id: '2',
          username: 'jane_smith',
          firstName: 'Jane',
          lastName: 'Smith',
          avatar: '/images/default-avatar.png',
          bio: 'Product Designer',
          location: 'New York, NY',
          isOnline: false,
          lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
          mutualFriends: 3,
          commonInterests: ['design', 'ux', 'art'],
        },
        {
          id: '3',
          username: 'mike_johnson',
          firstName: 'Mike',
          lastName: 'Johnson',
          avatar: '/images/default-avatar.png',
          bio: 'Data Scientist',
          location: 'Austin, TX',
          isOnline: true,
          lastSeen: new Date().toISOString(),
          mutualFriends: 8,
          commonInterests: ['data', 'machine learning', 'python'],
        },
      ];

      setUsers(prev => page === 1 ? mockUsers : [...prev, ...mockUsers]);
      setHasMore(page < 3); // Simulate pagination
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendFriendRequest = async (userId) => {
    try {
      await dispatch(sendFriendRequest(userId)).unwrap();
      // Update the user in the list to reflect the sent request
      setUsers(prev => prev.map(user => 
        user.id === userId 
          ? { ...user, friendRequestSent: true } 
          : user
      ));
    } catch (error) {
      console.error('Error sending friend request:', error);
    }
  };

  const handleViewProfile = (userId) => {
    navigate(`/profile/${userId}`);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1); // Reset to first page when searching
    fetchUsers();
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilters({
      location: '',
      ageRange: '',
      interests: '',
    });
    setPage(1);
  };

  return (
    <div className="container">
      <h1>Discover People</h1>
      
      {/* Tabs */}
      <div className="tabs" style={{ display: 'flex', borderBottom: '1px solid #ddd', marginBottom: '20px' }}>
        <button
          className={`tab ${activeTab === 'discover' ? 'active' : ''}`}
          onClick={() => setActiveTab('discover')}
          style={{
            padding: '10px 20px',
            border: 'none',
            backgroundColor: activeTab === 'discover' ? '#007bff' : '#f8f9fa',
            color: activeTab === 'discover' ? 'white' : '#333',
            cursor: 'pointer',
            borderBottom: activeTab === 'discover' ? '3px solid #007bff' : 'none',
          }}
        >
          Discover
        </button>
        <button
          className={`tab ${activeTab === 'trending' ? 'active' : ''}`}
          onClick={() => setActiveTab('trending')}
          style={{
            padding: '10px 20px',
            border: 'none',
            backgroundColor: activeTab === 'trending' ? '#007bff' : '#f8f9fa',
            color: activeTab === 'trending' ? 'white' : '#333',
            cursor: 'pointer',
            borderBottom: activeTab === 'trending' ? '3px solid #007bff' : 'none',
          }}
        >
          Trending
        </button>
        <button
          className={`tab ${activeTab === 'suggested' ? 'active' : ''}`}
          onClick={() => setActiveTab('suggested')}
          style={{
            padding: '10px 20px',
            border: 'none',
            backgroundColor: activeTab === 'suggested' ? '#007bff' : '#f8f9fa',
            color: activeTab === 'suggested' ? 'white' : '#333',
            cursor: 'pointer',
            borderBottom: activeTab === 'suggested' ? '3px solid #007bff' : 'none',
          }}
        >
          Suggested
        </button>
      </div>

      {/* Search and Filters */}
      <form onSubmit={handleSearch} style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for people..."
            style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: '4px', flex: 1 }}
          />
          
          <select
            value={filters.location}
            onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
            style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: '4px' }}
          >
            <option value="">All Locations</option>
            <option value="san-francisco">San Francisco</option>
            <option value="new-york">New York</option>
            <option value="austin">Austin</option>
          </select>
          
          <select
            value={filters.ageRange}
            onChange={(e) => setFilters(prev => ({ ...prev, ageRange: e.target.value }))}
            style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: '4px' }}
          >
            <option value="">All Ages</option>
            <option value="18-25">18-25</option>
            <option value="26-35">26-35</option>
            <option value="36-45">36-45</option>
          </select>
          
          <button type="submit" className="button button-primary">Search</button>
          <button type="button" onClick={clearFilters} className="button button-secondary">Clear</button>
        </div>
      </form>

      {/* Users List */}
      {loading && page === 1 ? (
        <div className="loading">
          <p>Loading users...</p>
        </div>
      ) : (
        <div>
          {users.length === 0 ? (
            <div className="card">
              <p>No users found. Try adjusting your search criteria.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
              {users.map((user) => (
                <div key={user.id} className="card" style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                    <img
                      src={user.avatar}
                      alt={`${user.firstName} ${user.lastName}`}
                      style={{ width: '60px', height: '60px', borderRadius: '50%', marginRight: '15px' }}
                    />
                    <div>
                      <h3 style={{ margin: '0 0 5px 0' }}>{user.firstName} {user.lastName}</h3>
                      <p style={{ margin: '0', color: '#666' }}>@{user.username}</p>
                      <div style={{ display: 'flex', alignItems: 'center', marginTop: '5px' }}>
                        <span style={{ 
                          width: '8px', 
                          height: '8px', 
                          borderRadius: '50%', 
                          backgroundColor: user.isOnline ? '#28a745' : '#6c757d',
                          marginRight: '5px'
                        }}></span>
                        <span style={{ fontSize: '0.8em', color: '#666' }}>
                          {user.isOnline ? 'Online' : `Last seen ${new Date(user.lastSeen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {user.bio && (
                    <p style={{ marginBottom: '10px' }}>{user.bio}</p>
                  )}
                  
                  {user.location && (
                    <p style={{ marginBottom: '10px', display: 'flex', alignItems: 'center' }}>
                      <span style={{ marginRight: '5px' }}>📍</span>
                      {user.location}
                    </p>
                  )}
                  
                  <div style={{ marginBottom: '15px' }}>
                    <p style={{ margin: '5px 0', fontSize: '0.9em', color: '#666' }}>
                      {user.mutualFriends} mutual friends
                    </p>
                    {user.commonInterests && user.commonInterests.length > 0 && (
                      <div style={{ marginTop: '5px' }}>
                        <strong>Common interests:</strong> {user.commonInterests.join(', ')}
                      </div>
                    )}
                  </div>
                  
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      className="button button-primary"
                      onClick={() => handleViewProfile(user.id)}
                      style={{ flex: 1 }}
                    >
                      View Profile
                    </button>
                    {!user.friendRequestSent && user.id !== currentUser?.id ? (
                      <button
                        className="button button-secondary"
                        onClick={() => handleSendFriendRequest(user.id)}
                        disabled={loading}
                      >
                        {loading ? 'Sending...' : 'Add Friend'}
                      </button>
                    ) : user.friendRequestSent ? (
                      <button className="button button-secondary" disabled>
                        Request Sent
                      </button>
                    ) : (
                      <button className="button button-secondary" disabled>
                        Your Profile
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {hasMore && (
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <button 
                className="button button-primary"
                onClick={loadMore}
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DiscoveryPage;