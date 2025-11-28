import { useState, useEffect, useCallback } from 'react';

export const useAdmins = (userId) => {
  const [admins, setAdmins] = useState([]);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const n = process.env.REACT_APP_API_URL;

  const API_BASE_URL = `${n}/api/components/send_message.php`;

  const fetchAdmins = useCallback(async () => {
    try {
      // Pass client_id to get unread counts per admin
      const url = userId 
        ? `${API_BASE_URL}?all_admins=true&client_id=${userId}`
        : `${API_BASE_URL}?all_admins=true`;
        
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.status === 'success') {
        setAdmins(data.admins);
      }
    } catch (error) {
      console.error('Failed to fetch admins:', error);
    }
  }, [userId]);

  const markMessagesAsRead = useCallback(async (adminId, userId) => {
    if (!userId || !adminId) return;

    try {
      const response = await fetch(`${API_BASE_URL}?mark_as_read=true`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          admin_id: adminId,
          sender_id: userId
        })
      });

      if (response.ok) {
        setAdmins(prevAdmins =>
          prevAdmins.map(admin =>
            admin.id === adminId
              ? { ...admin, unreadCount: 0 }
              : admin
          )
        );
      }
    } catch (error) {
      console.error('Failed to mark messages as read:', error);
    }
  }, []);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  return {
    admins,
    selectedAdmin,
    loading,
    error,
    setSelectedAdmin,
    fetchAdmins,
    markMessagesAsRead
  };
};