import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const WebSocketContext = createContext();

export const WebSocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionAttempts, setConnectionAttempts] = useState(0);

  useEffect(() => {
    // Use the WebSocket server URL from environment variables
    const socketUrl = process.env.REACT_APP_WEBSOCKET_URL || 'http://localhost:3003';

    if (!socketUrl) {
      console.warn('WebSocket URL is not defined. WebSocket functionality will be disabled.');
      return;
    }

    let newSocket;

    try {
      newSocket = io(socketUrl, {
        transports: ['websocket', 'polling'], // Fallback transports
        timeout: 10000, // 10 second timeout
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
        withCredentials: false // Adjust based on your server settings
      });

      newSocket.on('connect', () => {
        setIsConnected(true);
        setConnectionAttempts(0); // Reset attempts on successful connection
        console.log('Connected to WebSocket server');
      });

      newSocket.on('disconnect', (reason) => {
        setIsConnected(false);
        console.log('Disconnected from WebSocket server:', reason);

        // If the disconnection reason is a server disconnect, try to reconnect
        if (reason === 'io server disconnect') {
          setTimeout(() => {
            newSocket.connect();
          }, 1000);
        }
      });

      newSocket.on('connect_error', (error) => {
        setIsConnected(false);
        setConnectionAttempts(prev => prev + 1);
        console.error('WebSocket connection error:', error);

        // Only log to console if not a network error (to avoid spam when server is down)
        if (error.message.includes('xhr poll error') || error.message.includes('websocket error')) {
          // Network error occurred, we'll rely on the reconnection logic
        } else {
          console.error('Specific WebSocket error:', error.message);
        }
      });

      setSocket(newSocket);
    } catch (error) {
      console.error('Failed to initialize WebSocket:', error);
    }

    // Cleanup function to disconnect when component unmounts
    return () => {
      if (newSocket) {
        newSocket.close();
      }
    };
  }, []);

  const value = {
    socket,
    isConnected,
    connectionAttempts,
    // Add any WebSocket-related functions you need here
    sendMessage: (event, data) => {
      if (socket && isConnected) {
        socket.emit(event, data);
      } else {
        console.warn(`Cannot send message: ${event}. Socket not connected.`);
      }
    }
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};