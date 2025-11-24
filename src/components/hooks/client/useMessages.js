import { useState, useEffect, useCallback } from 'react';

export const useMessages = (userId, selectedAdmin, processedMessageIds) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [messageCount, setMessageCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);

  const API_BASE_URL = 'http://localhost/funeraria/api/components/send_message.php';

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
        const messagesWithIds = data.messages.map(msg => {
          // Add DB IDs to processedMessageIds immediately upon fetch
          if (processedMessageIds) {
            processedMessageIds.add(msg.id);
          }

          return {
            ...msg,
            id: msg.id || `db_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            // Ensure reply information is included
            replyTo: msg.replyTo || null
          };
        });

        setMessages(messagesWithIds);

        // Count unread messages from this admin
        const unread = messagesWithIds.filter(msg =>
          msg.sender === 'admin' && !msg.isRead
        ).length;
        setUnreadCount(unread);
      } else {
        setError(data.message || 'Failed to fetch messages');
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      setError(`Failed to fetch messages: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [userId, selectedAdmin, processedMessageIds]);

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
      // Ensure we are not duplicating messages already in the global set
      if (processedMessageIds?.has(message.id)) {
        return prev;
      }
      // If the message came from the server (not an optimistic update), add it to the set
      if (typeof message.id === 'number' || message.id.startsWith('db_')) {
        processedMessageIds?.add(message.id);
      }

      // Check if message already exists by ID in current state (secondary check)
      const exists = prev.some(msg => msg.id === message.id);
      if (exists) {
        return prev;
      }

      // If it's an incoming message from admin, increment unread count
      if (message.sender === 'admin' && !message.isRead) {
        setUnreadCount(prevCount => prevCount + 1);
      }

      return [...prev, message];
    });
  }, [processedMessageIds]);

  const removeMessage = useCallback((messageId) => {
    setMessages(prev => {
      const messageToRemove = prev.find(msg => msg.id === messageId);

      // If removing an unread admin message, decrement unread count
      if (messageToRemove?.sender === 'admin' && !messageToRemove.isRead) {
        setUnreadCount(prevCount => Math.max(0, prevCount - 1));
      }

      return prev.filter(msg => msg.id !== messageId);
    });
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setUnreadCount(0);
  }, []);

  const markAsRead = useCallback(() => {
    // Mark all messages as read locally
    setMessages(prev => prev.map(msg => ({ ...msg, isRead: true })));
    setUnreadCount(0);
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
    unreadCount,
    fetchMessages,
    countMessages,
    addMessage,
    removeMessage,
    clearMessages,
    markAsRead,
    setError
  };
}