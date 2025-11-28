import { useState, useEffect, useRef } from 'react';

export const useWebSocket = (userId) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const processedMessageIds = useRef(new Set());
  const n = process.env.REACT_APP_API_URL;

  useEffect(() => {
  const ws = new WebSocket('ws://localhost:8080');

    ws.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      setSocket(ws);
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
      setSocket(null);
      setTimeout(() => {
        console.log('Attempting to reconnect...');
      }, 5000);
    };

    ws.onerror = (error) => {
      setTimeout(() => {
        console.log('Attempting to reconnect...');
      }, 5000);
    };

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, []);

  // Register user with WebSocket server when userId is available
  useEffect(() => {
    if (socket && isConnected && userId) {
      socket.send(JSON.stringify({
        type: 'register',
        userId: userId
      }));
    }
  }, [socket, isConnected, userId]);

  return { socket, isConnected, processedMessageIds: processedMessageIds.current };
};