import { useState, useEffect } from 'react';
import axios from 'axios';

export const useRecentActivities = (email, isValidatingAdmin) => {
    const [recentActivities, setRecentActivities] = useState([]);
    const [activitiesLoading, setActivitiesLoading] = useState(false);

    const fetchRecentActivities = async () => {
        if (!isValidatingAdmin && email) {
            try {
                setActivitiesLoading(true);
                const response = await axios.get(
                    'http://192.168.100.99:8000/components/fetchRecentActivities.php?limit=7'
                );

                if (response.data.success) {
                    setRecentActivities(response.data.data);
                } else {
                    console.error('Failed to fetch recent activities:', response.data.error);
                }
            } catch (error) {
                console.error('Error fetching recent activities:', error);
            } finally {
                setActivitiesLoading(false);
            }
        }
    };

    useEffect(() => {
        if (!isValidatingAdmin && email) {
            fetchRecentActivities();
            const intervalId = setInterval(fetchRecentActivities, 30 * 1000);
            return () => clearInterval(intervalId);
        }
    }, [email, isValidatingAdmin]);

    return {
        recentActivities,
        activitiesLoading,
        fetchRecentActivities
    };
};