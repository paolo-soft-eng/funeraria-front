import { useState, useEffect } from 'react';

export const useUser = (email) => {
    const [userId, setUserId] = useState(null);
    const [username, setUsername] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!email) {
            setIsLoggedIn(false);
            setError('Please log in to access your dashboard');
            return;
        }

        const fetchUserId = async () => {
            try {
                const response = await fetch(`http://localhost/funeraria/api/components/getUserId.php?email=${encodeURIComponent(email)}`);
                const data = await response.json();

                if (data.userId) {
                    setUserId(data.userId);
                    setIsLoggedIn(true);
                } else {
                    setIsLoggedIn(false);
                    setError('Please log in to access your dashboard');
                }
            } catch (err) {
                console.error(err);
                setIsLoggedIn(false);
                setError('Failed to verify login status');
            }
        };

        fetchUserId();
    }, [email]);

    return { userId, username, setUsername, isLoggedIn, error };
};
