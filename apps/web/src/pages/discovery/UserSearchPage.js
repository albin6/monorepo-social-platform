import React, { useState } from 'react';

const UserSearchPage = () => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div>
      <h1>Search Users</h1>
      <div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for users..."
        />
        <button>Search</button>
      </div>
      <div>
        <p>Search results would appear here.</p>
      </div>
    </div>
  );
};

export default UserSearchPage;