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
            setTimeout(() => navigate('/auth'), 1500);
            return false;
        }

        try {
            const response = await axios.post('http://localhost/funeraria/api/components/getUserId.php', {
                email: email
            });

            if (response.data.success && response.data.isAdmin) {
                setIsValidatingAdmin(false);
                return true;
            } else {
                setTimeout(() => navigate('/auth'), 1500);
                return false;
            }
        } catch (error) {
            console.error('Error validating admin access:', error);
            setTimeout(() => navigate('/auth'), 1500);
            return false;
        }
    };

    useEffect(() => {
        validateAdminAccess();
    }, [email, navigate]);

    useEffect(() => {
        if (!isValidatingAdmin && email) {
            fetch(`http://localhost/funeraria/api/components/getUserId.php?email=${encodeURIComponent(email)}`)
                .then(response => response.json())
                .then(data => {
                    if (data.userId) {
                        setUserId(data.userId);
                        setIsLoggedIn(true);
                    } else {
                        setIsLoggedIn(false);
                        navigate('/auth');
                    }
                })
                .catch(error => {
                    console.error('Error fetching user ID:', error);
                    setIsLoggedIn(false);
                    navigate('/auth');
                });
        } else if (!isValidatingAdmin && !email) {
            setIsLoggedIn(false);
            navigate('/auth');
        }
    }, [email, navigate, isValidatingAdmin]);

    return {
        isLoggedIn,
        userId,
        isValidatingAdmin,
        email
    };
};