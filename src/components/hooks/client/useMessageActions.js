import { useState, useCallback } from 'react';

export const useMessageActions = (socket, isConnected, userId, processedMessageIds) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_BASE_URL = 'http://localhost/apii/components/send_message.php';

  const sendMessage = useCallback(async (message, selectedAdmin, addMessage, countMessages) => {
    if (!message.trim() || !selectedAdmin || !socket || !isConnected) {
      if (!selectedAdmin) setError('Please select an admin first');
      if (!socket || !isConnected) setError('Connection lost. Trying to reconnect...');
      return;
    }

    try {
      setError(null);
      const messageId = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      processedMessageIds.add(messageId);

      const newMessage = {
        id: messageId,
        text: message,
        sender: 'me',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        imageUrl: null
      };

      addMessage(newMessage);

      socket.send(JSON.stringify({
        type: 'message',
        messageId: messageId,
        senderId: userId,
        receiverId: selectedAdmin.id,
        message: message,
        isAdmin: false,
        imageUrl: null,
        isOwnMessage: true
      }));

      if (selectedAdmin && userId) {
        countMessages(selectedAdmin.id, userId);
      }

      return true;
    } catch (error) {
      console.error('Failed to send message:', error);
      setError(`Failed to send message: ${error.message}`);
      return false;
    }
  }, [socket, isConnected, userId, processedMessageIds]);

  const sendImageMessage = useCallback(async (message, selectedFile, selectedAdmin, addMessage, countMessages) => {
    if (!selectedFile || !selectedAdmin || !socket || !isConnected) {
      if (!selectedAdmin) setError('Please select an admin first');
      if (!socket || !isConnected) setError('Connection lost. Trying to reconnect...');
      return;
    }

    try {
      setError(null);
      setLoading(true);

      const formData = new FormData();
      formData.append('image', selectedFile);

      const uploadResponse = await fetch('http://localhost/apii/components/upload.php', {
        method: 'POST',
        body: formData
      });

      const uploadData = await uploadResponse.json();

      if (uploadData.status !== 'success') {
        throw new Error(uploadData.message || 'Failed to upload image');
      }

      const imageUrl = uploadData.imageUrl;
      const messageId = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      socket.send(JSON.stringify({
        type: 'message',
        messageId: messageId,
        senderId: userId,
        receiverId: selectedAdmin.id,
        message: message || 'Image message',
        isAdmin: false,
        imageUrl: imageUrl
      }));

      processedMessageIds.add(messageId);

      const newMessage = {
        id: messageId,
        text: message || 'Image message',
        sender: 'me',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        imageUrl: imageUrl
      };

      addMessage(newMessage);

      if (selectedAdmin && userId) {
        countMessages(selectedAdmin.id, userId);
      }

      return true;
    } catch (error) {
      console.error('Failed to send image message:', error);
      setError(`Failed to send image message: ${error.message}`);
      return false;
    } finally {
      setLoading(false);
    }
  }, [socket, isConnected, userId, processedMessageIds]);

  const unsendMessage = useCallback(async (messageId, removeMessage) => {
    try {
      const response = await fetch(API_BASE_URL, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message_id: messageId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      if (data.status === 'success') {
        removeMessage(messageId);
      } else {
        setError(`Error unsending message: ${data.message}`);
      }
    } catch (error) {
      console.error('Failed to unsend message:', error);
      setError(`Failed to unsend message: ${error.message}`);
    }
  }, []);

  const copyMessage = useCallback((text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Message copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy message: ', err);
    });
  }, []);

  return {
    loading,
    error,
    sendMessage,
    sendImageMessage,
    unsendMessage,
    copyMessage,
    setError
  };
};