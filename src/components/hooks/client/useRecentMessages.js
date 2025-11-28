// hooks/client/useRecentMessages.js
import { useState, useEffect } from 'react';
import axios from 'axios';

export const useRecentMessages = (email) => {
    const [recentMessages, setRecentMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const n = process.env.REACT_APP_API_URL;

    const fetchRecentMessages = async () => {
        if (!email) return;

        setLoading(true);
        setError(null);
        
        try {
            const response = await axios.post(
                `${n}/api/components/fetchRecentMessages.php`,
                { email }
            );

            if (response.data.success) {
                setRecentMessages(response.data.messages || []);
            } else {
                setError(response.data.error || 'Failed to fetch messages');
            }
        } catch (err) {
            console.error('Error fetching recent messages:', err);
            setError('Unable to load messages. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (messageId) => {
        try {
            const response = await axios.post(
                `${n}/api/components/markMessageAsRead.php`,
                { message_id: messageId, email }
            );

            if (response.data.success) {
                // Update the message in local state
                setRecentMessages(prev => 
                    prev.map(msg => 
                        msg.id === messageId 
                            ? { ...msg, is_read: 1 }
                            : msg
                    )
                );
                return true;
            }
            return false;
        } catch (err) {
            console.error('Error marking message as read:', err);
            return false;
        }
    };

    useEffect(() => {
        fetchRecentMessages();
        
        // Refresh messages every 30 seconds
        const interval = setInterval(fetchRecentMessages, 30000);
        return () => clearInterval(interval);
    }, [email]);

    return {
        recentMessages,
        loading,
        error,
        fetchRecentMessages,
        markAsRead
    };
};