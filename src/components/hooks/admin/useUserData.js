import { useState, useEffect } from 'react';
import axios from 'axios';

export const useUserData = (email, isValidatingAdmin) => {
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        const fetchUserData = async () => {
            if (!isValidatingAdmin && email) {
                try {
                    const response = await axios.post('http://192.168.100.99:8000/components/fetchAdminProfile.php', { email });
                    setUserData(response.data.data);
                } catch (error) {
                    console.error('Error fetching user data:', error);
                }
            }
        };

        fetchUserData();
    }, [email, isValidatingAdmin]);

    return {
        userData,
        setUserData
    };
};