import { useEffect } from 'react';
import axios from 'axios';

export const useProfileImage = (email, setUsername) => {
    useEffect(() => {
        if (!email) return;

        const fetchProfile = async () => {
            try {
                const response = await axios.get(`http://localhost/funeraria/api/components/client_picture.php?email=${email}`);
                if (response.data?.success && response.data.username) {
                    setUsername(response.data.username);
                }
            } catch (err) {
                console.error('Error fetching profile image:', err);
            }
        };

        fetchProfile();
    }, [email, setUsername]); 
};