import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export const useLogout = (showNotification) => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        const userConfirmed = window.confirm("Are you sure you want to log out?");

        if (userConfirmed) {
            try {
                showNotification('Logging out...', 'info');
                await axios.post('http://localhost/apii/config/logout.php');
                localStorage.removeItem('userEmail');
                localStorage.removeItem('userRole');
                showNotification('Successfully logged out!', 'success');
                setTimeout(() => {
                    navigate('/auth');
                }, 1000);
            } catch (error) {
                console.error('Error logging out:', error);
                showNotification('Failed to log out. Please try again.', 'error');
            }
        }
    };

    return {
        handleLogout
    };
};