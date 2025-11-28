import { useState, useEffect } from 'react';

export const useOrderHistory = (email) => {
    const [orderHistory, setOrderHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrderHistory = async () => {
            if (!email) return;

            try {
                setLoading(true);
                const response = await fetch('http://localhost/funeraria/api/components/order-history.php', {
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
                    setOrderHistory(data.orders || []);
                }
            } catch (err) {
                setError('Failed to fetch order history');
            } finally {
                setLoading(false);
            }
        };

        fetchOrderHistory();
    }, [email]);

    return { orderHistory, loading, error };
};