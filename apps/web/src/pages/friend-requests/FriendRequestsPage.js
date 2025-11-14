import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useWebSocket } from '../../contexts/WebSocketContext';
import '../../styles/index.css';

const FriendRequestsPage = () => {
  const { user } = useAuth();
  const { socket, isConnected } = useWebSocket();
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [outgoingRequests, setOutgoingRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState('incoming'); // 'incoming' or 'outgoing'
  const [loading, setLoading] = useState(false);

  // Mock data fetching - in a real app, this would call the friend request service
  const fetchFriendRequests = async () => {
    setLoading(true);
    try {
      // Simulating API call to friend request service
      const mockIncoming = [
        {
          id: 'req_1',
          senderId: 'user_101',
          senderName: 'John Doe',
          senderAvatar: 'https://via.placeholder.com/50/0000FF/808080?Text=JD',
          message: 'Hey, I would like to add you as a friend!',
          timestamp: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
        },
        {
          id: 'req_2',
          senderId: 'user_202',
          senderName: 'Jane Smith',
          senderAvatar: 'https://via.placeholder.com/50/FF0000/FFFFFF?Text=JS',
          message: 'Long time no see! Add me back?',
          timestamp: new Date(Date.now() - 86400000).toISOString() // 1 day ago
        }
      ];
      
      const mockOutgoing = [
        {
          id: 'req_3',
          receiverId: 'user_303',
          receiverName: 'Bob Johnson',
          receiverAvatar: 'https://via.placeholder.com/50/00FF00/000000?Text=BJ',
          status: 'pending',
          timestamp: new Date(Date.now() - 1800000).toISOString() // 30 minutes ago
        }
      ];
      
      setIncomingRequests(mockIncoming);
      setOutgoingRequests(mockOutgoing);
    } catch (error) {
      console.error('Error fetching friend requests:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle accepting a friend request
  const handleAccept = async (requestId) => {
    try {
      // In a real app, this would call the friend request service
      // const response = await friendRequestService.respondToRequest(requestId, 'accept');
      
      // Update the UI to remove the request
      setIncomingRequests(prev => prev.filter(req => req.id !== requestId));
      
      // Show success notification
      setNotifications(prev => [...prev, {
        id: Date.now(),
        type: 'success',
        message: 'Friend request accepted!'
      }]);
      
      // In a real app, emit WebSocket event
      if (socket) {
        socket.emit('friend_request_action', {
          requestId,
          action: 'accept',
          userId: user.id
        });
      }
    } catch (error) {
      console.error('Error accepting friend request:', error);
      setNotifications(prev => [...prev, {
        id: Date.now(),
        type: 'error',
        message: 'Error accepting friend request'
      }]);
    }
  };

  // Handle rejecting a friend request
  const handleReject = async (requestId) => {
    try {
      // In a real app, this would call the friend request service
      // const response = await friendRequestService.respondToRequest(requestId, 'reject');
      
      // Update the UI to remove the request
      setIncomingRequests(prev => prev.filter(req => req.id !== requestId));
      
      // Show notification
      setNotifications(prev => [...prev, {
        id: Date.now(),
        type: 'info',
        message: 'Friend request rejected'
      }]);
      
      // In a real app, emit WebSocket event
      if (socket) {
        socket.emit('friend_request_action', {
          requestId,
          action: 'reject',
          userId: user.id
        });
      }
    } catch (error) {
      console.error('Error rejecting friend request:', error);
      setNotifications(prev => [...prev, {
        id: Date.now(),
        type: 'error',
        message: 'Error rejecting friend request'
      }]);
    }
  };

  // Handle cancelling a sent friend request
  const handleCancel = async (requestId) => {
    try {
      // In a real app, this would call the friend request service
      // const response = await friendRequestService.respondToRequest(requestId, 'cancel');
      
      // Update the UI to remove the request
      setOutgoingRequests(prev => prev.filter(req => req.id !== requestId));
      
      // Show notification
      setNotifications(prev => [...prev, {
        id: Date.now(),
        type: 'info',
        message: 'Friend request cancelled'
      }]);
    } catch (error) {
      console.error('Error cancelling friend request:', error);
      setNotifications(prev => [...prev, {
        id: Date.now(),
        type: 'error',
        message: 'Error cancelling friend request'
      }]);
    }
  };

  useEffect(() => {
    fetchFriendRequests();
    
    // Setup WebSocket listeners for real-time notifications
    if (socket) {
      socket.on('new_friend_request', (data) => {
        // Add new friend request to the list
        setIncomingRequests(prev => [data.request, ...prev]);
        
        // Show notification
        setNotifications(prev => [...prev, {
          id: Date.now(),
          type: 'info',
          message: `New friend request from ${data.senderName}`
        }]);
      });
      
      socket.on('friend_request_response', (data) => {
        // Handle response to sent request
        if (data.status === 'accepted') {
          setNotifications(prev => [...prev, {
            id: Date.now(),
            type: 'success',
            message: `${data.senderName} accepted your friend request!`
          }]);
        } else if (data.status === 'rejected') {
          setNotifications(prev => [...prev, {
            id: Date.now(),
            type: 'info',
            message: `${data.senderName} rejected your friend request`
          }]);
        }
      });
    }
    
    // Cleanup WebSocket listeners
    return () => {
      if (socket) {
        socket.off('new_friend_request');
        socket.off('friend_request_response');
      }
    };
  }, [socket]);

  // Clear notifications after 5 seconds
  useEffect(() => {
    if (notifications.length > 0) {
      const timer = setTimeout(() => {
        setNotifications([]);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [notifications]);

  return (
    <div className="container">
      <div className="card">
        <h2>Friend Requests</h2>
        
        {/* Real-time connection status */}
        <div style={{ 
          marginBottom: '15px', 
          padding: '8px', 
          borderRadius: '4px',
          backgroundColor: isConnected ? '#d4edda' : '#f8d7da',
          color: isConnected ? '#155724' : '#721c24'
        }}>
          WebSocket: {isConnected ? 'Connected' : 'Disconnected'} {isConnected ? '🟢' : '🔴'}
        </div>
        
        {/* Notifications */}
        {notifications.map(notification => (
          <div 
            key={notification.id}
            style={{ 
              marginBottom: '10px', 
              padding: '8px', 
              borderRadius: '4px',
              backgroundColor: 
                notification.type === 'success' ? '#d4edda' : 
                notification.type === 'error' ? '#f8d7da' : '#d1ecf1',
              color: 
                notification.type === 'success' ? '#155724' : 
                notification.type === 'error' ? '#721c24' : '#0c5460'
            }}
          >
            {notification.message}
          </div>
        ))}
        
        {/* Tab Navigation */}
        <div style={{ marginBottom: '20px', borderBottom: '1px solid #ddd' }}>
          <button
            className={`tab-button ${activeTab === 'incoming' ? 'active' : ''}`}
            onClick={() => setActiveTab('incoming')}
            style={{
              padding: '10px 20px',
              border: 'none',
              backgroundColor: activeTab === 'incoming' ? '#007bff' : '#f8f9fa',
              color: activeTab === 'incoming' ? 'white' : '#495057',
              cursor: 'pointer',
              borderBottom: activeTab === 'incoming' ? '3px solid #007bff' : '3px solid transparent'
            }}
          >
            Incoming Requests ({incomingRequests.length})
          </button>
          <button
            className={`tab-button ${activeTab === 'outgoing' ? 'active' : ''}`}
            onClick={() => setActiveTab('outgoing')}
            style={{
              padding: '10px 20px',
              border: 'none',
              backgroundColor: activeTab === 'outgoing' ? '#007bff' : '#f8f9fa',
              color: activeTab === 'outgoing' ? 'white' : '#495057',
              cursor: 'pointer',
              borderBottom: activeTab === 'outgoing' ? '3px solid #007bff' : '3px solid transparent'
            }}
          >
            Sent Requests ({outgoingRequests.length})
          </button>
        </div>
        
        {/* Loading indicator */}
        {loading && (
          <div className="loading">Loading friend requests...</div>
        )}
        
        {/* Incoming Requests Tab */}
        {activeTab === 'incoming' && !loading && (
          <div>
            {incomingRequests.length === 0 ? (
              <p>No incoming friend requests</p>
            ) : (
              <div>
                {incomingRequests.map(request => (
                  <div key={request.id} className="friend-request-item" style={{ 
                    border: '1px solid #eee', 
                    borderRadius: '8px', 
                    padding: '15px', 
                    marginBottom: '15px' 
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                      <img 
                        src={request.senderAvatar} 
                        alt={request.senderName} 
                        style={{ width: '50px', height: '50px', borderRadius: '50%', marginRight: '15px' }}
                      />
                      <div>
                        <h3 style={{ margin: '0 0 5px 0' }}>{request.senderName}</h3>
                        <p style={{ margin: '0', fontSize: '0.9em', color: '#666' }}>
                          {new Date(request.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    
                    {request.message && (
                      <p style={{ margin: '10px 0', fontStyle: 'italic', color: '#555' }}>
                        "{request.message}"
                      </p>
                    )}
                    
                    <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                      <button 
                        className="button button-primary"
                        onClick={() => handleAccept(request.id)}
                        style={{ flex: 1 }}
                      >
                        Accept
                      </button>
                      <button 
                        className="button button-secondary"
                        onClick={() => handleReject(request.id)}
                        style={{ flex: 1 }}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* Outgoing Requests Tab */}
        {activeTab === 'outgoing' && !loading && (
          <div>
            {outgoingRequests.length === 0 ? (
              <p>No outgoing friend requests</p>
            ) : (
              <div>
                {outgoingRequests.map(request => (
                  <div key={request.id} className="friend-request-item" style={{ 
                    border: '1px solid #eee', 
                    borderRadius: '8px', 
                    padding: '15px', 
                    marginBottom: '15px' 
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                      <img 
                        src={request.receiverAvatar} 
                        alt={request.receiverName} 
                        style={{ width: '50px', height: '50px', borderRadius: '50%', marginRight: '15px' }}
                      />
                      <div>
                        <h3 style={{ margin: '0 0 5px 0' }}>{request.receiverName}</h3>
                        <p style={{ margin: '0', fontSize: '0.9em', color: '#666' }}>
                          Request sent • {new Date(request.timestamp).toLocaleString()}
                        </p>
                        <span style={{ 
                          display: 'inline-block', 
                          padding: '2px 8px', 
                          borderRadius: '12px', 
                          backgroundColor: '#17a2b8', 
                          color: 'white', 
                          fontSize: '0.8em',
                          marginTop: '5px'
                        }}>
                          Pending
                        </span>
                      </div>
                    </div>
                    
                    <button 
                      className="button button-secondary"
                      onClick={() => handleCancel(request.id)}
                      style={{ marginTop: '10px' }}
                    >
                      Cancel Request
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FriendRequestsPage;