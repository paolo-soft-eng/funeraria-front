import { useState, useEffect } from 'react';

export const useActiveOrders = (email) => {
    const [activeOrders, setActiveOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchActiveOrders = async () => {
            if (!email) return;

            try {
                setLoading(true);
                const response = await fetch('http://192.168.100.99:8000/components/active-orders.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email }),
                });

                const data = await response.json();

                if (data.error) {
                    setError(data.error);
                } else {
                    setActiveOrders(data.orders || []);
                }
            } catch (err) {
                setError('Failed to fetch active orders');
            } finally {
                setLoading(false);
            }
        };

        fetchActiveOrders();
    }, [email]);

    return { activeOrders, loading, error };
};