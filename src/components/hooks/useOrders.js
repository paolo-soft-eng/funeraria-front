import { useState, useEffect, useContext } from 'react';
import { EmailContext } from '../utils/EmailContext';
import useNotifications from './useNotifications';

const useOrders = () => {
    const [orders, setOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(true);
    const { error, setError, success, setSuccess, clear } = useNotifications();
    const [successMessage, setSuccessMessage] = useState(null);
    const [processingOrderId, setProcessingOrderId] = useState(null);
    const { email } = useContext(EmailContext);

    useEffect(() => {
        if (email) {
            fetchOrders();
        }
    }, [email]);

    const fetchOrders = async () => {
        if (!email) return;

        setOrdersLoading(true);
        try {
            const response = await fetch(
                `http://localhost/apii/components/fetchOrders.php?customer_email=${encodeURIComponent(email)}`,
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

    const handleDeleteOrder = async (orderId) => {
        if (!window.confirm('Are you sure you want to cancel this memorial service?')) {
            return;
        }

        try {
            const response = await fetch('http://localhost/apii/components/deleteOrder.php', {
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
                setOrders(orders.filter(order => order.id !== orderId));
                setSuccessMessage(result.message || 'Memorial service cancelled successfully');
            } else {
                throw new Error(result.message || 'Cancellation failed');
            }
        } catch (error) {
            console.error('Delete error:', error);
            const cleanError = error.message.replace(/<[^>]*>?/gm, '');
            setError(cleanError || 'Failed to cancel memorial service');
        }
    };

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
        email,
        fetchOrders,
        handleDeleteOrder,
        formatDate,
        getServiceId,
        clear
    };
};

export default useOrders;