import { useState, useEffect } from 'react';

export const useAuth = (email) => {
  const [userId, setUserId] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL = 'http://localhost/apii/components/send_message.php';

  const getUserId = async () => {
    if (!email) {
      setError('Email is missing from context');
      setLoading(false);
      return null;
    }

    try {
      const userIdResponse = await fetch(`${API_BASE_URL}?email=${encodeURIComponent(email)}`);
      if (!userIdResponse.ok) {
        throw new Error('Failed to retrieve user ID');
      }
      const userIdData = await userIdResponse.json();
      
      if (userIdData.status !== 'success') {
        throw new Error('Failed to retrieve user ID');
      }

      setUserId(userIdData.user_id);
      return userIdData.user_id;
    } catch (error) {
      console.error('Failed to get user ID:', error);
      setError(`Failed to get user ID: ${error.message}`);
      return null;
    }
  };

  useEffect(() => {
    if (email) {
      fetch(`http://localhost/apii/components/getUserId.php?email=${encodeURIComponent(email)}`)
        .then(response => response.json())
        .then(data => {
          if (data.userId) {
            setUserId(data.userId);
            setIsLoggedIn(true);
          } else {
            setIsLoggedIn(false);
            setError('Please log in to access messages');
          }
        })
        .catch(error => {
          console.error('Error fetching user ID:', error);
          setIsLoggedIn(false);
          setError('Failed to verify login status');
        })
        .finally(() => setLoading(false));
    } else {
      setIsLoggedIn(false);
      setError('Please log in to access messages');
      setLoading(false);
    }
  }, [email]);

  return { userId, isLoggedIn, loading, error, getUserId, setError };
};