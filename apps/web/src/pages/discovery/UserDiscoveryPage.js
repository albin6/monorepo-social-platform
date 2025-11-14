import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import '../styles/index.css';

const UserDiscoveryPage = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    q: '',
    gender: '',
    minAge: '',
    maxAge: '',
    page: 1,
    limit: 20
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  // Fetch users based on filters
  const fetchUsers = async () => {
    setLoading(true);
    try {
      // In a real app, this would call the user profile service
      // const response = await api.get('/user-profile/search', { params: filters });
      // For now, using mock data
      const mockUsers = Array.from({ length: 20 }, (_, i) => ({
        id: `user_${i + 1}`,
        username: `user${i + 1}`,
        firstName: `First${i + 1}`,
        lastName: `Last${i + 1}`,
        bio: `This is a sample bio for user ${i + 1}`,
        age: 20 + (i % 30),
        gender: ['male', 'female', 'other'][i % 3],
        profilePicture: `https://via.placeholder.com/100/0000FF/808080?Text=Avatar${i + 1}`,
        lastSeen: new Date(Date.now() - (i * 3600000)).toISOString(),
        distance: (i * 2.5).toFixed(1)
      }));
      
      setUsers(mockUsers);
      setPagination({
        page: filters.page,
        limit: filters.limit,
        total: 200, // Mock total
        pages: 10   // Mock pages
      });
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
      page: 1 // Reset to first page when filters change
    }));
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      setFilters(prev => ({
        ...prev,
        page: newPage
      }));
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters(prev => ({
      ...prev,
      page: 1
    }));
  };

  return (
    <div className="container">
      <div className="card">
        <h2>User Discovery</h2>
        
        {/* Filters Section */}
        <form onSubmit={handleSearch} className="filter-section" style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{ flex: '1', minWidth: '200px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Search</label>
              <input
                type="text"
                name="q"
                value={filters.q}
                onChange={handleFilterChange}
                placeholder="Search by name, bio..."
                className="input-field"
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
              />
            </div>
            
            <div style={{ flex: '0 0 auto' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Gender</label>
              <select
                name="gender"
                value={filters.gender}
                onChange={handleFilterChange}
                className="input-field"
                style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
              >
                <option value="">All</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div style={{ flex: '0 0 auto' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Min Age</label>
              <input
                type="number"
                name="minAge"
                value={filters.minAge}
                onChange={handleFilterChange}
                min="13"
                max="120"
                className="input-field"
                style={{ width: '80px', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
              />
            </div>
            
            <div style={{ flex: '0 0 auto' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Max Age</label>
              <input
                type="number"
                name="maxAge"
                value={filters.maxAge}
                onChange={handleFilterChange}
                min="13"
                max="120"
                className="input-field"
                style={{ width: '80px', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
              />
            </div>
            
            <div style={{ flex: '0 0 auto', alignSelf: 'flex-end' }}>
              <button type="submit" className="button button-primary">
                Search
              </button>
            </div>
          </div>
        </form>

        {/* Results Section */}
        {loading ? (
          <div className="loading">Loading users...</div>
        ) : (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
              {users.map((u) => (
                <div key={u.id} className="user-card" style={{ border: '1px solid #eee', borderRadius: '8px', padding: '15px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                    <img 
                      src={u.profilePicture} 
                      alt={`${u.username}'s profile`} 
                      style={{ width: '60px', height: '60px', borderRadius: '50%', marginRight: '15px' }}
                    />
                    <div>
                      <h3 style={{ margin: '0 0 5px 0' }}>{u.firstName} {u.lastName} <span style={{ fontSize: '0.8em', color: '#888' }}>({u.age})</span></h3>
                      <p style={{ margin: '0', color: '#666' }}>@{u.username}</p>
                      <p style={{ margin: '5px 0 0 0', fontSize: '0.9em' }}>
                        <i className="distance-indicator">📍 {u.distance} km away</i>
                      </p>
                    </div>
                  </div>
                  
                  {u.bio && (
                    <p style={{ margin: '10px 0', fontStyle: 'italic' }}>"{u.bio}"</p>
                  )}
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '15px' }}>
                    <button className="button button-secondary" style={{ padding: '5px 10px', fontSize: '0.9em' }}>
                      View Profile
                    </button>
                    <button className="button button-primary" style={{ padding: '5px 10px', fontSize: '0.9em' }}>
                      Send Friend Request
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="pagination" style={{ marginTop: '20px', textAlign: 'center' }}>
                <button 
                  onClick={() => handlePageChange(pagination.page - 1)} 
                  disabled={pagination.page === 1}
                  className="button"
                  style={{ margin: '0 5px' }}
                >
                  Previous
                </button>
                
                <span style={{ margin: '0 10px' }}>
                  Page {pagination.page} of {pagination.pages} ({pagination.total} total)
                </span>
                
                <button 
                  onClick={() => handlePageChange(pagination.page + 1)} 
                  disabled={pagination.page === pagination.pages}
                  className="button"
                  style={{ margin: '0 5px' }}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDiscoveryPage;