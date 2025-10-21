import { useState, useEffect, useContext } from 'react';
import { EmailContext } from '../utils/EmailContext';

const useCart = () => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cartLoading, setCartLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [userId, setUserId] = useState(null);
    const [editingItemId, setEditingItemId] = useState(null);
    const [editingQuantity, setEditingQuantity] = useState(1);
    const [isOrderCart, setIsOrderCart] = useState(false);
    const { email } = useContext(EmailContext);

    useEffect(() => {
        if (email) {
            fetchUserId(email);
        } else {
            setLoading(false);
            setError('Please log in to view your services and memorial orders');
        }
    }, [email]);

    useEffect(() => {
        if (userId) {
            const interval = setInterval(() => {
                fetchCartItems(userId);
            }, 30000);

            return () => clearInterval(interval);
        }
    }, [userId]);

    const fetchUserId = async (userEmail) => {
        try {
            const response = await fetch(
                `http://localhost/funeraria/api/components/getUserId.php?email=${encodeURIComponent(userEmail)}`
            );
            if (!response.ok) {
                throw new Error('Failed to fetch user ID');
            }
            const data = await response.json();
            if (data.userId) {
                setUserId(parseInt(data.userId));
                fetchCartItems(parseInt(data.userId));
            } else {
                throw new Error('User ID not found');
            }
        } catch (error) {
            setError('Error: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchCartItems = async (userId) => {
        setIsOrderCart(false);
        setCartLoading(true);
        try {
            const response = await fetch(`http://localhost/funeraria/api/components/fetchCart.php?userId=${userId}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            setCartItems(data || []);
        } catch (error) {
            setError('Error fetching selected services: ' + error.message);
        } finally {
            setCartLoading(false);
            setLoading(false);
        }
    };


    const handleEditClick = (itemId, currentQuantity) => {
        setEditingItemId(itemId);
        setEditingQuantity(parseInt(currentQuantity) || 1);
    };

    const handleUpdateQuantity = async (itemId) => {
        if (!userId || userId <= 0) {
            setError('Error: Invalid or missing user ID');
            setEditingItemId(null);
            return;
        }

        const payload = {
            userId: parseInt(userId),
            itemId: parseInt(itemId),
            quantity: parseInt(editingQuantity)
        };

        try {
            const response = await fetch('http://localhost/funeraria/api/components/updatedCartItem.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(payload),
                credentials: 'include'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            if (data.success) {
                fetchCartItems(userId);
                setEditingItemId(null);
                setSuccessMessage('Service quantity updated successfully!');
            } else {
                throw new Error(data.error || 'Update failed');
            }
        } catch (error) {
            setError('Error updating service: ' + error.message);
            setEditingItemId(null);
        }
    };

    const handleDeleteClick = async (itemId) => {
        if (!window.confirm('Are you sure you want to remove this service from your cart?')) {
            return;
        }

        const payload = {
            userId: parseInt(userId),
            itemId: parseInt(itemId)
        };

        try {
            const response = await fetch('http://localhost/funeraria/api/components/deleteCartItem.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            if (data.success) {
                setCartItems(cartItems.filter(item => item.id !== itemId));
                setSuccessMessage('Item menu removed successfully!');
            } else {
                setError('Error removing service: ' + (data.error || 'Unknown error'));
            }
        } catch (error) {
            setError('Error removing service: ' + error.message);
        }
    };

    const calculateTotal = () => {
        return cartItems.reduce((total, item) => {
            return total + (parseFloat(item.price) * parseInt(item.quantity));
        }, 0).toFixed(2);
    };

    const clearMessages = () => {
        setError(null);
        setSuccessMessage(null);
    };

    return {
        cartItems,
        setCartItems,
        loading,
        cartLoading,
        error,
        setError,
        successMessage,
        setSuccessMessage,
        userId,
        editingItemId,
        setEditingItemId,
        editingQuantity,
        setEditingQuantity,
        isOrderCart,
        setIsOrderCart,
        email,
        fetchCartItems,
        handleEditClick,
        handleUpdateQuantity,
        handleDeleteClick,
        calculateTotal,
        clearMessages
    };
};

export default useCart;