// apps/web/pages/friend-requests/FriendRequestsPage.js
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  fetchFriendRequests, 
  respondToFriendRequest, 
  removeFriendRequest 
} from '../../store/slices/friendSlice';

const FriendRequestsPage = () => {
  const dispatch = useDispatch();
  const { friendRequests, loading, error } = useSelector(state => state.friends);
  const { received: receivedRequests = [] } = friendRequests;

  useEffect(() => {
    dispatch(fetchFriendRequests());
  }, [dispatch]);

  const handleAccept = async (requestId) => {
    try {
      await dispatch(respondToFriendRequest({ requestId, action: 'accept' })).unwrap();
      // The request will be removed from the list automatically in the reducer
    } catch (error) {
      console.error('Failed to accept friend request:', error);
    }
  };

  const handleReject = async (requestId) => {
    try {
      await dispatch(respondToFriendRequest({ requestId, action: 'reject' })).unwrap();
      // The request will be removed from the list automatically in the reducer
    } catch (error) {
      console.error('Failed to reject friend request:', error);
    }
  };

  if (loading.requests) {
    return (
      <div className="loading">
        <p>Loading friend requests...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="alert alert-danger">
          Error loading friend requests: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>Friend Requests</h1>
      
      {receivedRequests.length === 0 ? (
        <div className="card">
          <p>No friend requests at the moment.</p>
        </div>
      ) : (
        <div className="friend-requests-list">
          {receivedRequests.map((request) => (
            <div key={request.id} className="card" style={{ marginBottom: '15px', padding: '15px' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <img 
                  src={request.sender?.avatar || '/images/default-avatar.png'} 
                  alt={request.sender?.username}
                  style={{ width: '50px', height: '50px', borderRadius: '50%', marginRight: '15px' }}
                />
                <div style={{ flex: 1 }}>
                  <h4>{request.sender?.firstName} {request.sender?.lastName}</h4>
                  <p style={{ color: '#666', marginBottom: '10px' }}>
                    {request.message || 'Wants to be your friend'}
                  </p>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                      className="button button-primary"
                      onClick={() => handleAccept(request.id)}
                      style={{ padding: '5px 15px' }}
                    >
                      Accept
                    </button>
                    <button 
                      className="button button-secondary"
                      onClick={() => handleReject(request.id)}
                      style={{ padding: '5px 15px' }}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: '30px' }}>
        <h2>Sent Requests</h2>
        {friendRequests.sent && friendRequests.sent.length > 0 ? (
          <div className="sent-requests-list">
            {friendRequests.sent.map((request) => (
              <div key={request.id} className="card" style={{ marginBottom: '15px', padding: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <img 
                    src={request.receiver?.avatar || '/images/default-avatar.png'} 
                    alt={request.receiver?.username}
                    style={{ width: '50px', height: '50px', borderRadius: '50%', marginRight: '15px' }}
                  />
                  <div style={{ flex: 1 }}>
                    <h4>{request.receiver?.firstName} {request.receiver?.lastName}</h4>
                    <p style={{ color: '#666' }}>Request sent</p>
                    <p style={{ fontSize: '0.9em', color: '#999' }}>
                      {new Date(request.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button 
                    className="button button-secondary"
                    onClick={() => dispatch(removeFriendRequest({ requestId: request.id, type: 'sent' }))}
                    style={{ padding: '5px 15px' }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No sent requests at the moment.</p>
        )}
      </div>
    </div>
  );
};

export default FriendRequestsPage;