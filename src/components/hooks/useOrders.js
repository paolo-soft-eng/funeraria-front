import { useState, useEffect, useContext } from 'react';
import { EmailContext } from '../utils/EmailContext';
import useNotifications from './useNotifications';

const useOrders = () => {
    const [orders, setOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(true);
    const { error, setError, success, setSuccess, clear } = useNotifications();
    const [successMessage, setSuccessMessage] = useState(null);
    const [processingOrderId, setProcessingOrderId] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [orderToDelete, setOrderToDelete] = useState(null);
    const [showArchived, setShowArchived] = useState(false);
    const { email } = useContext(EmailContext);
    const n = process.env.REACT_APP_API_URL;

    // 1. Fetch orders on mount and whenever email or showArchived changes
    useEffect(() => {
        if (email) {
            fetchOrders();
        }
    }, [email, showArchived]);


    const fetchOrders = async () => {
        if (!email) return;

        setOrdersLoading(true);
        try {
            // Include show_archived parameter in the API call
            const response = await fetch(
                `${n}/api/components/fetchOrders.php?customer_email=${encodeURIComponent(email)}&show_archived=${showArchived ? 'true' : 'false'}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (!response.ok) {
                throw new Error('Failed to fetch orders');
            }

            const result = await response.json();

            const ordersWithServiceId = (result.data || []).map(order => ({
                ...order,
                service_id: order.service_id || order.serviceId,
                serviceId: order.service_id || order.serviceId
            }));

            setOrders(ordersWithServiceId);
        } catch (error) {
            console.error('Error fetching orders:', error);
            setError('Error loading memorial services: ' + error.message);
            setOrders([]);
        } finally {
            setOrdersLoading(false);
        }
    };

    // 2. Generic function to handle both archiving and unarchiving
    const handleArchiveAction = async (orderId, action) => {
        setProcessingOrderId(orderId);
        clear(); // Clear previous notifications
        try {
            const response = await fetch(`${n}/api/components/archiveOrder.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    orderId: orderId,
                    userEmail: email,
                    action: action // 'archive' or 'unarchive'
                }),
            });

            if (!response.ok) {
                let errorMsg = `Failed to ${action} service`;
                try {
                    const errorData = await response.json();
                    errorMsg = errorData.message || errorMsg;
                } catch (e) {
                    // Fallback to text if JSON parse fails
                    errorMsg = await response.text();
                }
                throw new Error(errorMsg);
            }

            const result = await response.json();

            if (result.success) {
                setSuccessMessage(result.message || `Order successfully ${action}d`);
                // Optimistically update the local state, then trigger a full fetch
                setOrders(prevOrders => prevOrders.map(order => 
                    order.id === orderId ? { ...order, is_archived: action === 'archive' ? '1' : '0' } : order
                ));
                fetchOrders(); // Full refresh to ensure consistency and correct filtering
            } else {
                throw new Error(result.message || `${action} failed`);
            }
        } catch (error) {
            console.error(`${action} error:`, error);
            const cleanError = error.message.replace(/<[^>]*>?/gm, '');
            setError(cleanError || `Failed to ${action} memorial service`);
        } finally {
            setProcessingOrderId(null);
        }
    };
    
    // Exportable archive/unarchive wrappers
    const handleArchiveOrder = (orderId) => handleArchiveAction(orderId, 'archive');
    const handleUnarchiveOrder = (orderId) => handleArchiveAction(orderId, 'unarchive');


    // 3. Delete functionality (Cancel Order)
    const handleDeleteOrder = (orderId) => {
        setOrderToDelete(orderId);
        setShowDeleteConfirm(true);
    };

    const confirmDeleteOrder = async () => {
        if (!orderToDelete) return;

        try {
            const response = await fetch(`${n}/api/components/deleteOrder.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    orderId: orderToDelete,
                    userEmail: email
                }),
            });

            if (!response.ok) {
                let errorMsg = 'Failed to cancel service';
                try {
                    const errorData = await response.json();
                    errorMsg = errorData.message || errorMsg;
                } catch (e) {
                    const text = await response.text();
                    errorMsg = text || errorMsg;
                }
                throw new Error(errorMsg);
            }

            const result = await response.json();

            if (result.success) {
                setOrders(orders.filter(order => order.id !== orderToDelete));
                setSuccessMessage(result.message || 'Memorial service cancelled successfully');
            } else {
                throw new Error(result.message || 'Cancellation failed');
            }
        } catch (error) {
            console.error('Delete error:', error);
            const cleanError = error.message.replace(/<[^>]*>?/gm, '');
            setError(cleanError || 'Failed to cancel memorial service');
        } finally {
            setShowDeleteConfirm(false);
            setOrderToDelete(null);
        }
    };

    const cancelDeleteOrder = () => {
        setShowDeleteConfirm(false);
        setOrderToDelete(null);
    };

    // 4. Helper Functions
    const formatDate = (dateString) => {
        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const getServiceId = (order) => {
        return order.service_id || order.serviceId;
    };

    const getExpirationTimeRemaining = (expirationDateString, orderStatus = 'active') => {
        // If order is already marked as expired in database
        if (orderStatus === 'expired') {
            return { text: 'Expired', isExpired: true };
        }
        
        if (!expirationDateString) return 'N/A';

        const expirationTime = new Date(expirationDateString).getTime();
        const now = new Date().getTime();
        const difference = expirationTime - now;

        if (difference <= 0) {
            return { text: 'Expired', isExpired: true };
        }

        const hours = Math.floor(difference / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

        if (hours > 0) {
            return { text: `${hours}h ${minutes}m`, isExpired: false };
        }
        
        return { text: `${minutes} min`, isExpired: false };
    };

    // 5. Auto-Expire Logic
    const checkAndRefreshExpiredOrders = async () => {
        const expiredOrders = orders.filter(order => {
            const expiresIn = getExpirationTimeRemaining(order.expiration_date);
            return expiresIn.isExpired && order.status !== 'expired';
        });

        if (expiredOrders.length > 0) {
            // Process each expired order
            for (const order of expiredOrders) {
                await handleAutoExpireOrder(order.id);
            }

            // Refresh orders list
            fetchOrders();
        }
    };

    const handleAutoExpireOrder = async (orderId) => {
        try {
            const response = await fetch(`${n}/api/components/expireOrder.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    orderId: orderId,
                    userEmail: email
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`Failed to auto-expire order ${orderId}:`, errorText);
                return;
            }

            const result = await response.json();
            if (result.success) {
                console.log(`Order ${orderId} automatically expired and stock restored.`);
            }
        } catch (error) {
            console.error('Error auto-expiring order:', error);
        }
    };

    // Set up interval to check for expired orders frequently
    useEffect(() => {
        if (orders.length > 0) {
            // Check immediately on load
            checkAndRefreshExpiredOrders();

            // Set up interval to check every 10 seconds
            const interval = setInterval(() => {
                checkAndRefreshExpiredOrders();
            }, 10000); // Check every 10 seconds

            return () => clearInterval(interval);
        }
    }, [orders]);
    
    // 6. Return Values
    return {
        orders,
        setOrders,
        ordersLoading,
        error,
        setError,
        successMessage,
        setSuccessMessage,
        processingOrderId,
        setProcessingOrderId,
        showDeleteConfirm,
        setShowDeleteConfirm,
        orderToDelete,
        email,
        fetchOrders,
        handleDeleteOrder,
        confirmDeleteOrder,
        cancelDeleteOrder,
        formatDate,
        getServiceId,
        getExpirationTimeRemaining,
        clear,
        handleArchiveOrder,
        handleUnarchiveOrder,
        showArchived,
        setShowArchived 
    };
};

export default useOrders;