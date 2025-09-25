import { useState, useEffect, useCallback } from 'react';

export const useMessages = (userId, selectedAdmin) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [messageCount, setMessageCount] = useState(0);

  const API_BASE_URL = 'http://localhost/apii/components/send_message.php';

  const fetchMessages = useCallback(async () => {
    if (!userId || !selectedAdmin) return;

    try {
      setLoading(true);
      setError(null);

      const apiUrl = `${API_BASE_URL}?sender_id=${userId}&admin_id=${selectedAdmin.id}`;
      const response = await fetch(apiUrl);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.status === 'success') {
        const messagesWithIds = data.messages.map(msg => ({
          ...msg,
          id: msg.id || `db_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        }));
        setMessages(messagesWithIds);
      } else {
        setError(data.message || 'Failed to fetch messages');
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      setError(`Failed to fetch messages: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [userId, selectedAdmin]);

  const countMessages = useCallback(async (adminId, clientId) => {
    try {
      const response = await fetch(`${API_BASE_URL}?count_messages=true&admin_id=${adminId}&client_id=${clientId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      if (data.status === 'success') {
        setMessageCount(data.message_count);
      }
    } catch (error) {
      console.error('Failed to count messages:', error);
    }
  }, []);

  const addMessage = useCallback((message) => {
    setMessages(prev => {
      const exists = prev.some(msg => msg.id === message.id);
      if (exists) return prev;
      return [...prev, message];
    });
  }, []);

  const removeMessage = useCallback((messageId) => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId));
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  useEffect(() => {
    if (selectedAdmin && userId) {
      fetchMessages();
      countMessages(selectedAdmin.id, userId);
    }
  }, [selectedAdmin, userId, fetchMessages, countMessages]);

  return {
    messages,
    loading,
    error,
    messageCount,
    fetchMessages,
    countMessages,
    addMessage,
    removeMessage,
    clearMessages,
    setError
  };
};