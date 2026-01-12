import { useState, useEffect } from 'react';

export const useOrderHistory = (email) => {
    const [orderHistory, setOrderHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrderHistory = async () => {
            if (!email) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);
                
                const apiUrl = process.env.REACT_APP_API_URL;
                const response = await fetch(`${apiUrl}/api/components/order-history.php`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email }),
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();

                if (data.error) {
                    setError(data.error);
                    setOrderHistory([]);
                } else {
                    setOrderHistory(data.orders || []);
                }
            } catch (err) {
                console.error('Error fetching order history:', err);
                setError(err.message || 'Failed to fetch order history');
                setOrderHistory([]);
            } finally {
                setLoading(false);
            }
        };

        fetchOrderHistory();
    }, [email]);

    return { orderHistory, loading, error };
};