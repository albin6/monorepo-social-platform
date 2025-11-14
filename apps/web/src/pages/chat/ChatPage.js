import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useWebSocket } from '../../contexts/WebSocketContext';
import '../../styles/index.css';

const ChatPage = () => {
  const { user } = useAuth();
  const { socket, isConnected } = useWebSocket();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatPartner, setChatPartner] = useState({
    id: 'user_101',
    name: 'John Doe',
    avatar: 'https://via.placeholder.com/50/0000FF/808080?Text=JD',
    isOnline: true,
    lastSeen: new Date(Date.now() - 300000).toISOString() // 5 minutes ago
  });
  const [isTyping, setIsTyping] = useState(false);
  const [messageStatus, setMessageStatus] = useState({}); // Track delivery/read status
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Mock data - in a real app, this would come from the chat service
  useEffect(() => {
    const mockMessages = [
      {
        id: 'msg_1',
        senderId: 'user_101',
        senderName: 'John Doe',
        content: 'Hey there! How are you doing?',
        timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        status: 'read' // 'sent', 'delivered', 'read'
      },
      {
        id: 'msg_2',
        senderId: user.id,
        senderName: user.username,
        content: 'I\'m doing great! Just working on some new features.',
        timestamp: new Date(Date.now() - 3500000).toISOString(), // 58 minutes ago
        status: 'read'
      },
      {
        id: 'msg_3',
        senderId: 'user_101',
        senderName: 'John Doe',
        content: 'That sounds interesting! What kind of features?',
        timestamp: new Date(Date.now() - 3400000).toISOString(), // 57 minutes ago
        status: 'read'
      },
      {
        id: 'msg_4',
        senderId: user.id,
        senderName: user.username,
        content: 'Real-time chat capabilities with typing indicators and delivery receipts.',
        timestamp: new Date(Date.now() - 3300000).toISOString(), // 55 minutes ago
        status: 'read'
      }
    ];
    
    setMessages(mockMessages);
  }, [user.id, user.username]);

  // Handle sending a message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;
    
    const messageData = {
      id: `msg_${Date.now()}`,
      chatId: 'chat_123', // In a real app, this would be the actual chat ID
      senderId: user.id,
      senderName: user.username,
      content: newMessage,
      timestamp: new Date().toISOString(),
      status: 'sending' // Initial status
    };
    
    // Add message to UI immediately
    setMessages(prev => [...prev, messageData]);
    setNewMessage('');
    
    try {
      // In a real app, this would send via WebSocket or API
      // const response = await chatService.sendMessage(messageData);
      
      // In a real app, emit WebSocket event
      if (socket) {
        socket.emit('send_message', {
          recipientId: chatPartner.id,
          message: messageData.content,
          chatId: 'chat_123',
          messageId: messageData.id
        });
      }
      
      // Update status to sent
      setMessageStatus(prev => ({
        ...prev,
        [messageData.id]: 'sent'
      }));
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Update status to error
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageData.id ? { ...msg, status: 'error' } : msg
        )
      );
    }
  };

  // Handle key down for message input
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  // Handle typing indicator
  const handleTyping = () => {
    if (newMessage.trim()) {
      // If not already typing, send typing start event
      if (!isTyping) {
        setIsTyping(true);
        
        if (socket) {
          socket.emit('typing_start', {
            chatId: 'chat_123',
            userId: user.id
          });
        }
        
        // Send typing stop after delay
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        
        typingTimeoutRef.current = setTimeout(() => {
          setIsTyping(false);
          
          if (socket) {
            socket.emit('typing_stop', {
              chatId: 'chat_123',
              userId: user.id
            });
          }
        }, 1000);
      }
    }
  };

  // Setup WebSocket event listeners
  useEffect(() => {
    if (socket) {
      socket.on('new_message', (data) => {
        setMessages(prev => [...prev, {
          id: data.messageId || `msg_${Date.now()}`,
          senderId: data.senderId,
          senderName: data.senderName || 'Unknown',
          content: data.message || data.content,
          timestamp: data.timestamp || new Date().toISOString(),
          status: 'delivered'
        }]);
      });
      
      socket.on('message_delivered', (data) => {
        setMessageStatus(prev => ({
          ...prev,
          [data.messageId]: 'delivered'
        }));
      });
      
      socket.on('message_read_receipt', (data) => {
        setMessageStatus(prev => ({
          ...prev,
          [data.messageId]: 'read'
        }));
      });
      
      socket.on('user_typing', (data) => {
        if (data.userId !== user.id) {
          setIsTyping(true);
          
          // Clear typing indicator after some time
          setTimeout(() => {
            setIsTyping(false);
          }, 3000);
        }
      });
      
      socket.on('user_stopped_typing', (data) => {
        if (data.userId !== user.id) {
          setIsTyping(false);
        }
      });
    }
    
    // Cleanup
    return () => {
      if (socket) {
        socket.off('new_message');
        socket.off('message_delivered');
        socket.off('message_read_receipt');
        socket.off('user_typing');
        socket.off('user_stopped_typing');
      }
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [socket, user.id]);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Format timestamp for display
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="chat-container" style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '80vh', 
      border: '1px solid #ddd',
      borderRadius: '8px',
      overflow: 'hidden'
    }}>
      {/* Chat Header */}
      <div className="chat-header" style={{ 
        padding: '15px', 
        backgroundColor: '#f8f9fa', 
        borderBottom: '1px solid #dee2e6',
        display: 'flex',
        alignItems: 'center'
      }}>
        <img 
          src={chatPartner.avatar} 
          alt={chatPartner.name} 
          style={{ width: '40px', height: '40px', borderRadius: '50%', marginRight: '15px' }}
        />
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: 0, fontSize: '1.1em' }}>{chatPartner.name}</h3>
          <div style={{ fontSize: '0.85em', color: '#6c757d' }}>
            {chatPartner.isOnline ? (
              <span style={{ color: '#28a745' }}>🟢 Online</span>
            ) : (
              <span>🔴 Offline (last seen {new Date(chatPartner.lastSeen).toLocaleTimeString()})</span>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="button button-secondary" style={{ padding: '5px 10px', fontSize: '0.9em' }}>
            Video Call
          </button>
          <button className="button button-secondary" style={{ padding: '5px 10px', fontSize: '0.9em' }}>
            Voice Call
          </button>
        </div>
      </div>
      
      {/* Connection Status */}
      <div style={{ 
        padding: '5px 15px', 
        fontSize: '0.8em',
        backgroundColor: isConnected ? '#d4edda' : '#f8d7da',
        color: isConnected ? '#155724' : '#721c24',
        textAlign: 'center'
      }}>
        Connection: {isConnected ? 'Connected' : 'Disconnected'} {isConnected ? '🟢' : '🔴'}
      </div>
      
      {/* Messages Area */}
      <div className="messages-area" style={{ 
        flex: 1, 
        padding: '15px', 
        overflowY: 'auto',
        backgroundColor: '#f1f3f5'
      }}>
        {messages.map((message) => (
          <div 
            key={message.id}
            className={`message ${message.senderId === user.id ? 'sent' : 'received'}`}
            style={{
              display: 'flex',
              justifyContent: message.senderId === user.id ? 'flex-end' : 'flex-start',
              marginBottom: '15px'
            }}
          >
            <div 
              style={{
                maxWidth: '70%',
                padding: '10px 15px',
                borderRadius: '18px',
                backgroundColor: message.senderId === user.id ? '#007bff' : '#fff',
                color: message.senderId === user.id ? 'white' : '#333',
                boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
              }}
            >
              {message.senderId !== user.id && (
                <div style={{ fontSize: '0.8em', fontWeight: 'bold', marginBottom: '2px' }}>
                  {message.senderName}
                </div>
              )}
              <div>{message.content}</div>
              <div style={{ 
                fontSize: '0.7em', 
                textAlign: 'right', 
                marginTop: '3px',
                opacity: 0.8
              }}>
                {formatTime(message.timestamp)}
                {message.senderId === user.id && (
                  <>
                    {message.status === 'sending' && '⏳'}
                    {message.status === 'sent' && '✓'}
                    {message.status === 'delivered' && '✓✓'}
                    {message.status === 'read' && <span style={{ color: '#aaffaa' }}>✓✓</span>}
                    {message.status === 'error' && <span style={{ color: 'red' }}>❌</span>}
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {/* Typing Indicator */}
        {isTyping && (
          <div style={{
            display: 'flex',
            justifyContent: 'flex-start',
            marginBottom: '15px'
          }}>
            <div style={{
              padding: '10px 15px',
              borderRadius: '18px',
              backgroundColor: '#fff',
              boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
            }}>
              <div style={{ fontSize: '0.8em', color: '#888' }}>
                {chatPartner.name} is typing...
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Message Input Area */}
      <div className="message-input-area" style={{ 
        padding: '15px', 
        backgroundColor: '#fff', 
        borderTop: '1px solid #dee2e6' 
      }}>
        <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '10px' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <textarea
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                handleTyping();
              }}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              style={{
                width: '100%',
                padding: '10px 15px',
                borderRadius: '20px',
                border: '1px solid #ddd',
                resize: 'none',
                minHeight: '50px',
                maxHeight: '100px'
              }}
            />
            <div style={{ 
              fontSize: '0.8em', 
              color: '#888', 
              textAlign: 'right', 
              marginTop: '5px' 
            }}>
              Press Enter to send, Shift+Enter for new line
            </div>
          </div>
          <button 
            type="submit" 
            className="button button-primary"
            disabled={!newMessage.trim()}
            style={{ 
              alignSelf: 'flex-end',
              padding: '10px 20px',
              borderRadius: '20px'
            }}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatPage;