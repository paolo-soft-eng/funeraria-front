import { useState, useEffect } from 'react';

export const useQuantities = (items) => {
    const [quantities, setQuantities] = useState({});

    useEffect(() => {
        if (items.length > 0) {
            const initialQuantities = items.reduce((acc, item) => {
                acc[item.id] = 1;
                return acc;
            }, {});
            setQuantities(initialQuantities);
        }
    }, [items]);

    const handleQuantityChange = (itemId, event) => {
        const newQuantity = parseInt(event.target.value, 10);
        setQuantities(prev => ({ ...prev, [itemId]: newQuantity }));
    };

    return { quantities, handleQuantityChange };
};