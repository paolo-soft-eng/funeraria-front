import { useState, useCallback } from 'react';

export const useMessageActions = (socket, isConnected, userId, processedMessageIds) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_BASE_URL = 'http://localhost/apii/components/send_message.php';

  const sendMessage = useCallback(async (message, selectedAdmin, addMessage, countMessages, replyContext = null) => {
    if (!message.trim() || !selectedAdmin || !socket || !isConnected) {
      if (!selectedAdmin) setError('Please select an admin first');
      if (!socket || !isConnected) setError('Connection lost. Trying to reconnect...');
      return false;
    }

    try {
      setError(null);
      const messageId = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      processedMessageIds.add(messageId);

      // Extract the actual message ID (not the full object)
      const replyToId = replyContext?.id || null;
      
      console.log('Sending message with reply_to_id:', replyToId);
      console.log('Full reply context:', replyContext);

      const newMessage = {
        id: messageId,
        text: message,
        sender: 'me',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        imageUrl: null,
        replyToId: replyToId,
        replyTo: replyContext ? {
          id: replyContext.id,
          text: replyContext.text,
          sender: replyContext.sender,
          senderName: replyContext.sender === 'me' ? 'You' : (replyContext.senderName || 'Admin')
        } : null
      };

      addMessage(newMessage);

      // Send via WebSocket with proper replyToId
      socket.send(JSON.stringify({
        type: 'message',
        messageId: messageId,
        senderId: userId,
        receiverId: selectedAdmin.id,
        message: message,
        isAdmin: false,
        imageUrl: null,
        isOwnMessage: true,
        replyToId: replyToId // Send as integer, not object
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

  const sendImageMessage = useCallback(async (message, selectedFile, selectedAdmin, addMessage, countMessages, replyContext = null) => {
    if (!selectedFile || !selectedAdmin || !socket || !isConnected) {
      if (!selectedAdmin) setError('Please select an admin first');
      if (!socket || !isConnected) setError('Connection lost. Trying to reconnect...');
      return false;
    }

    try {
      setError(null);
      setLoading(true);

      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('sender_id', userId);
      formData.append('receiver_id', selectedAdmin.id);
      formData.append('message', message || 'Image message');
      formData.append('is_admin_message', '0');
      
      // Add reply_to_id if exists
      if (replyContext?.id) {
        formData.append('reply_to_id', replyContext.id);
      }

      const uploadResponse = await fetch('http://localhost/apii/components/send_message.php', {
        method: 'POST',
        body: formData
      });

      const uploadData = await uploadResponse.json();

      if (uploadData.status !== 'success') {
        throw new Error(uploadData.message || 'Failed to upload image');
      }

      const imageUrl = uploadData.image_url;
      const messageId = uploadData.message_id;

      processedMessageIds.add(messageId);

      const newMessage = {
        id: messageId,
        text: message || 'Image message',
        sender: 'me',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        imageUrl: imageUrl,
        replyToId: replyContext?.id || null,
        replyTo: replyContext ? {
          id: replyContext.id,
          text: replyContext.text,
          sender: replyContext.sender,
          senderName: replyContext.sender === 'me' ? 'You' : (replyContext.senderName || 'Admin')
        } : null
      };

      addMessage(newMessage);

      // Also send via WebSocket to notify admin in real-time
      socket.send(JSON.stringify({
        type: 'message',
        messageId: messageId,
        senderId: userId,
        receiverId: selectedAdmin.id,
        message: message || 'Image message',
        isAdmin: false,
        imageUrl: imageUrl,
        replyToId: replyContext?.id || null
      }));

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