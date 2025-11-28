import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { EmailContext } from '../../utils/EmailContext';

export const useAdminAuth = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userId, setUserId] = useState(null);
    const [isValidatingAdmin, setIsValidatingAdmin] = useState(true);
    const { email } = useContext(EmailContext);
    const navigate = useNavigate();

    const validateAdminAccess = async () => {
        if (!email) {
            setTimeout(() => navigate('/gomez/auth'), 1500);
            return false;
        }

        try {
            const response = await axios.post('http://192.168.100.99:8000/components/getUserId.php', {
                email: email
            });

            if (response.data.success && response.data.isAdmin) {
                setIsValidatingAdmin(false);
                return true;
            } else {
                setTimeout(() => navigate('/gomez/auth'), 1500);
                return false;
            }
        } catch (error) {
            console.error('Error validating admin access:', error);
            setTimeout(() => navigate('/gomez/auth'), 1500);
            return false;
        }
    };

    useEffect(() => {
        validateAdminAccess();
    }, [email, navigate]);

    useEffect(() => {
        if (!isValidatingAdmin && email) {
            fetch(`http://192.168.100.99:8000/components/getUserId.php?email=${encodeURIComponent(email)}`)
                .then(response => response.json())
                .then(data => {
                    if (data.userId) {
                        setUserId(data.userId);
                        setIsLoggedIn(true);
                    } else {
                        setIsLoggedIn(false);
                        navigate('/gomez/auth');
                    }
                })
                .catch(error => {
                    console.error('Error fetching user ID:', error);
                    setIsLoggedIn(false);
                    navigate('/gomez/auth');
                });
        } else if (!isValidatingAdmin && !email) {
            setIsLoggedIn(false);
            navigate('/gomez/auth');
        }
    }, [email, navigate, isValidatingAdmin]);

    return {
        isLoggedIn,
        userId,
        isValidatingAdmin,
        email
    };
};