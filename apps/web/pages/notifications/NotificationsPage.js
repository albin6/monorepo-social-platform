// apps/web/pages/notifications/NotificationsPage.js
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  fetchNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead, 
  deleteNotification,
  resetUnreadCount
} from '../../store/slices/notificationSlice';
import { formatDistanceToNow } from 'date-fns';

const NotificationsPage = () => {
  const dispatch = useDispatch();
  const { items: notifications, unreadCount, loading, error, hasMore } = useSelector(state => state.notifications);

  useEffect(() => {
    dispatch(fetchNotifications({ page: 1, limit: 20 }));
    
    // Reset unread count when viewing notifications
    dispatch(resetUnreadCount());
  }, [dispatch]);

  const handleMarkAsRead = async (notificationId) => {
    try {
      await dispatch(markNotificationAsRead(notificationId)).unwrap();
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await dispatch(markAllNotificationsAsRead()).unwrap();
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      await dispatch(deleteNotification(notificationId)).unwrap();
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const handleLoadMore = () => {
    if (hasMore) {
      const nextPage = Math.floor(notifications.length / 20) + 1;
      dispatch(fetchNotifications({ page: nextPage, limit: 20 }));
    }
  };

  if (loading.notifications && notifications.length === 0) {
    return (
      <div className="loading">
        <p>Loading notifications...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="alert alert-danger">
          Error loading notifications: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="flex-between" style={{ marginBottom: '20px' }}>
        <h1>Notifications {unreadCount > 0 && `(${unreadCount})`}</h1>
        {notifications.length > 0 && (
          <button 
            className="button button-secondary"
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0}
          >
            Mark All as Read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="card">
          <p>No notifications yet.</p>
        </div>
      ) : (
        <div>
          {notifications.map((notification) => (
            <div 
              key={notification.id} 
              className={`card notification-item ${!notification.isRead ? 'unread' : ''}`}
              style={{ 
                marginBottom: '10px', 
                padding: '15px',
                borderLeft: !notification.isRead ? '4px solid #007bff' : '4px solid transparent'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <h4 style={{ margin: '0 0 5px 0' }}>
                    {notification.title || getNotificationTitle(notification.type)}
                  </h4>
                  <p style={{ margin: '0 0 10px 0', color: '#666' }}>
                    {notification.message}
                  </p>
                  <small style={{ color: '#999' }}>
                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                  </small>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                  {!notification.isRead && (
                    <button 
                      className="button button-primary"
                      onClick={() => handleMarkAsRead(notification.id)}
                      style={{ padding: '4px 8px', fontSize: '12px', marginBottom: '5px' }}
                    >
                      Mark as Read
                    </button>
                  )}
                  <button 
                    className="button button-secondary"
                    onClick={() => handleDelete(notification.id)}
                    style={{ padding: '4px 8px', fontSize: '12px' }}
                  >
                    Delete
                  </button>
                </div>
              </div>
              
              {notification.data && Object.keys(notification.data).length > 0 && (
                <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #eee' }}>
                  <details>
                    <summary style={{ cursor: 'pointer', color: '#007bff' }}>View Details</summary>
                    <pre style={{ 
                      background: '#f8f9fa', 
                      padding: '10px', 
                      borderRadius: '4px',
                      overflow: 'auto',
                      fontSize: '12px',
                      margin: '10px 0 0 0'
                    }}>
                      {JSON.stringify(notification.data, null, 2)}
                    </pre>
                  </details>
                </div>
              )}
            </div>
          ))}

          {hasMore && (
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <button 
                className="button button-primary"
                onClick={handleLoadMore}
                disabled={loading.notifications}
              >
                {loading.notifications ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Helper function to generate notification titles based on type
const getNotificationTitle = (type) => {
  const titles = {
    'friend_request': 'Friend Request',
    'friend_request_accepted': 'Friend Request Accepted',
    'message': 'New Message',
    'comment': 'New Comment',
    'like': 'New Like',
    'mention': 'Mentioned You',
    'system': 'System Notification',
    'marketing': 'Marketing',
  };
  
  return titles[type] || type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
};

export default NotificationsPage;