import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/index.css'; // Import global styles

const NotFoundPage = () => {
  return (
    <div className="container flex-center" style={{ minHeight: '100vh' }}>
      <div className="card text-center">
        <h1>404 - Page Not Found</h1>
        <p>The page you're looking for doesn't exist.</p>
        <Link to="/" className="button button-primary">Go back to home</Link>
      </div>
    </div>
  );
};

export default NotFoundPage;