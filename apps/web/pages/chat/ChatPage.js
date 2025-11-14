// apps/web/pages/chat/ChatPage.js
import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { fetchMessages, sendMessage, addMessage, updateMessageStatus } from '../../store/slices/chatSlice';
import { SOCKET_EVENTS } from '../../config/constants';
import io from 'socket.io-client';
import environmentConfig from '../../config/environment';

const ChatPage = () => {
  const dispatch = useDispatch();
  const { conversationId } = useParams();
  const { messages, currentConversation, loading, error } = useSelector(state => state.chat);
  const { profile: currentUser } = useSelector(state => state.user);
  const [messageInput, setMessageInput] = useState('');
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);

  // Connect to WebSocket on component mount
  useEffect(() => {
    const newSocket = io(environmentConfig.WEBSOCKET_URL, {
      auth: {
        token: localStorage.getItem(environmentConfig.JWT_TOKEN_KEY),
      },
    });

    setSocket(newSocket);

    // Listen for new messages
    newSocket.on(SOCKET_EVENTS.MESSAGE, (messageData) => {
      if (messageData.conversationId === conversationId) {
        dispatch(addMessage({ conversationId, message: messageData }));
        dispatch(updateMessageStatus({ 
          conversationId, 
          messageId: messageData.id, 
          status: 'delivered' 
        }));
      }
    });

    // Listen for typing events
    newSocket.on(SOCKET_EVENTS.TYPING_START, (data) => {
      if (data.conversationId === conversationId) {
        console.log(`${data.user} is typing...`);
      }
    });

    newSocket.on(SOCKET_EVENTS.TYPING_STOP, (data) => {
      if (data.conversationId === conversationId) {
        console.log(`${data.user} stopped typing`);
      }
    });

    // Join the conversation room
    newSocket.emit(SOCKET_EVENTS.JOIN_ROOM, conversationId);

    return () => {
      newSocket.emit(SOCKET_EVENTS.LEAVE_ROOM, conversationId);
      newSocket.close();
    };
  }, [conversationId, dispatch]);

  // Fetch messages when component mounts
  useEffect(() => {
    if (conversationId) {
      dispatch(fetchMessages({ conversationId, page: 1, limit: 50 }));
    }
  }, [conversationId, dispatch]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages[conversationId]]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!messageInput.trim() || !socket) return;

    const messageData = {
      conversationId,
      content: messageInput,
      type: 'text',
      senderId: currentUser.id,
      timestamp: new Date().toISOString(),
    };

    // Optimistically update UI
    dispatch(addMessage({ conversationId, message: messageData }));

    try {
      // Send message via WebSocket
      socket.emit(SOCKET_EVENTS.MESSAGE, messageData);
      
      // Also send via API for persistence
      await dispatch(sendMessage({ conversationId, content: messageInput, type: 'text' }));
      
      setMessageInput('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleTypingStart = () => {
    if (socket && messageInput.trim()) {
      socket.emit(SOCKET_EVENTS.TYPING_START, { conversationId, user: currentUser });
    }
  };

  const handleTypingStop = () => {
    if (socket) {
      socket.emit(SOCKET_EVENTS.TYPING_STOP, { conversationId, user: currentUser });
    }
  };

  const messagesList = messages[conversationId] || [];

  return (
    <div className="chat-container" style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <div className="chat-header" style={{ padding: '10px 20px', borderBottom: '1px solid #eee', backgroundColor: '#f8f9fa' }}>
        <h3>{currentConversation ? currentConversation.name || currentConversation.participants?.map(p => p.name).join(', ') : 'Loading...'}</h3>
      </div>

      <div className="chat-messages" style={{ flex: 1, overflowY: 'auto', padding: '20px', backgroundColor: '#f1f3f4' }}>
        {loading.messages[conversationId] ? (
          <div className="loading">Loading messages...</div>
        ) : error ? (
          <div className="alert alert-danger">{error}</div>
        ) : (
          <>
            {messagesList.map((message) => (
              <div
                key={message.id}
                className={`message ${message.senderId === currentUser?.id ? 'sent' : 'received'}`}
                style={{
                  display: 'flex',
                  justifyContent: message.senderId === currentUser?.id ? 'flex-end' : 'flex-start',
                  marginBottom: '10px',
                }}
              >
                <div
                  style={{
                    maxWidth: '70%',
                    padding: '10px 15px',
                    borderRadius: '18px',
                    backgroundColor: message.senderId === currentUser?.id ? '#007bff' : '#fff',
                    color: message.senderId === currentUser?.id ? '#fff' : '#333',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                  }}
                >
                  <div>{message.content}</div>
                  <div
                    style={{
                      fontSize: '0.7em',
                      marginTop: '5px',
                      opacity: 0.7,
                      textAlign: 'right',
                    }}
                  >
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <div className="chat-input" style={{ padding: '10px', borderTop: '1px solid #eee', backgroundColor: '#fff' }}>
        <form onSubmit={handleSendMessage} style={{ display: 'flex' }}>
          <input
            type="text"
            value={messageInput}
            onChange={(e) => {
              setMessageInput(e.target.value);
              handleTypingStart();
            }}
            onBlur={handleTypingStop}
            placeholder="Type a message..."
            style={{ flex: 1, padding: '10px', border: '1px solid #ddd', borderRadius: '20px' }}
          />
          <button
            type="submit"
            disabled={!messageInput.trim()}
            className="button button-primary"
            style={{ marginLeft: '10px' }}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatPage;