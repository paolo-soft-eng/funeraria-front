import { useState, useEffect } from 'react';

export const useUser = (email) => {
    const [userId, setUserId] = useState(null);
    const [username, setUsername] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const n = process.env.REACT_APP_API_URL;

    useEffect(() => {
        console.log('useUser hook - Email received:', email);
        console.log('useUser hook - API URL:', n);

        if (!email || email === '' || email === null || email === undefined) {
            console.log('useUser hook - No email provided');
            setIsLoggedIn(false);
            setLoading(false);
            setError('Please log in to access your dashboard');
            return;
        }

        const fetchUserId = async () => {
            try {
                setLoading(true);
                const url = `${n}/api/components/getUserId.php?email=${(email)}`;
                
                const response = await fetch(url);
                
                const data = await response.json();

                if (data.userId) {
                    setUserId(data.userId);
                    setUsername(data.userName || '');
                    setIsLoggedIn(true);
                    setError(null);
                } else if (data.error) {
                    setIsLoggedIn(false);
                    setError(data.error);
                } else {
                    setIsLoggedIn(false);
                    setError('Please log in to access your dashboard');
                }
            } catch (err) {
                console.error('useUser hook - Fetch error:', err);
                setIsLoggedIn(false);
                setError('Failed to verify login status: ' + err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchUserId();
    }, [email, n]);

    return { userId, username, setUsername, isLoggedIn, loading, error };
};