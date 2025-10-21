import { useState } from 'react';
import toast from 'react-hot-toast';

export const usePurchase = (isLoggedIn, userId, updateItemStock) => {
    const [purchasing, setPurchasing] = useState(false);

    const handleBuy = async (itemId, quantity) => {
        // Check if user is logged in
        if (!isLoggedIn) {
            toast.error('Please log in to make a purchase.');
            return;
        }

        if (purchasing) return; // Prevent multiple simultaneous purchases
        
        setPurchasing(true);

        try {
            const response = await fetch('http://localhost/funeraria/api/components/buyItems.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    itemId,
                    quantity,
                    userId
                }),
            });

            const data = await response.json();

            if (data.success) {
                toast.success('Item added to cart successfully', {
                    duration: 2000,
                    position: 'top-right',
                });
                updateItemStock(itemId, quantity);
            } else {
                toast.error('Purchase failed: ' + data.error);
            }
        } catch (error) {
            console.error('Error buying item:', error);
            toast.error('An error occurred while processing your purchase.');
        } finally {
            setPurchasing(false);
        }
    };

    return { handleBuy, purchasing };
};