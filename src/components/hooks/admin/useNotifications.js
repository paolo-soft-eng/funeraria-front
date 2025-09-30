import { useState } from 'react';

export const useNotification = () => {
    const [notification, setNotification] = useState(null);

    const showNotification = (message, type = 'info') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const clearNotification = () => {
        setNotification(null);
    };

    return {
        notification,
        showNotification,
        clearNotification
    };
};