import { useState, useEffect, useCallback } from 'react';

export const useAdmins = () => {
  const [admins, setAdmins] = useState([]);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_BASE_URL = 'http://localhost/apii/components/send_message.php';

  const fetchAdmins = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}?all_admins=true`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();

      if (data.status === 'success') {
        setAdmins(data.admins);
      } else {
        setError(`API error: ${data.message}`);
      }
    } catch (error) {
      console.error('Failed to fetch admins:', error);
      setError(`Failed to fetch admins: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

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