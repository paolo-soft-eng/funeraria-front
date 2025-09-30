import { useState, useEffect } from 'react';
import axios from 'axios';

export const useDashboardStats = (email, isValidatingAdmin) => {
    const [dashboardStats, setDashboardStats] = useState({
        totalOrders: 0,
        totalClients: 0,
        totalRevenue: 0,
        newMessages: 0,
        current_month_orders: 0,
        current_month_clients: 0,
        current_month_revenue: 0,
        recent_messages: [],
        upcoming_orders: [],
        upcoming_appointments: []
    });
    const [isLoading, setIsLoading] = useState(false);

    const fetchDashboardStats = async () => {
        if (!isValidatingAdmin && email) {
            setIsLoading(true);
            try {
                const response = await axios.post(
                    'http://localhost/apii/components/fetchDashboardStats.php',
                    { email }
                );
                if (response.data.success) {
                    setDashboardStats({
                        totalOrders: response.data.data.total_orders || 0,
                        totalClients: response.data.data.total_clients || 0,
                        totalRevenue: response.data.data.total_revenue || 0,
                        newMessages: response.data.data.new_messages || 0,
                        current_month_orders: response.data.data.current_month_orders || 0,
                        current_month_clients: response.data.data.current_month_clients || 0,
                        current_month_revenue: response.data.data.current_month_revenue || 0,
                        current_month_name: response.data.data.current_month_name || 'Current Month',
                        upcoming_orders: response.data.data.upcoming_orders || [],
                        upcoming_appointments: response.data.data.upcoming_appointments || [],
                        recent_messages: response.data.data.recent_messages || []
                    });
                } else {
                    console.error('Failed to fetch dashboard stats:', response.data.error);
                }
            } catch (error) {
                console.error('Error fetching dashboard stats:', error);
            } finally {
                setIsLoading(false);
            }
        }
    };

    useEffect(() => {
        fetchDashboardStats();
        const intervalId = setInterval(fetchDashboardStats, 5 * 60 * 1000);
        return () => clearInterval(intervalId);
    }, [email, isValidatingAdmin]);

    return {
        dashboardStats,
        isLoading,
        fetchDashboardStats
    };
};