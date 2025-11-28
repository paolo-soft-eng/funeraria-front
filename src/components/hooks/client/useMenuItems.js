import { useState, useEffect } from 'react';

export const useMenuItems = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchItems = async () => {
            try {
                const response = await fetch('http://192.168.100.99:8000/components/fetchItems.php');
                const data = await response.json();
                setItems(data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching data:', err);
                setError(err.message);
                setLoading(false);
            }
        };

        fetchItems();
    }, []);

    const updateItemStock = (itemId, quantityPurchased) => {
        setItems(prevItems =>
            prevItems.map(item =>
                item.id === itemId ? { ...item, stock: item.stock - quantityPurchased } : item
            )
        );
    };

    return { items, loading, error, updateItemStock };
};