import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export const useLogout = (showNotification) => {
    const navigate = useNavigate();
    const n = process.env.REACT_APP_API_URL;

    const handleLogout = async () => {
        try {
            showNotification('Logout Successfully', 'success');
            await axios.post(`${n}/api/config/logout.php`);
            localStorage.removeItem('userEmail');
            localStorage.removeItem('userRole');

            // Delay navigation to show success message
            setTimeout(() => {
                navigate('/gomez/auth');
            }, 1000);
        } catch (error) {
            console.error('Error logging out:', error);
            showNotification('Failed to log out. Please try again.', 'error');
        }
    };

    return {
        handleLogout
    };
};