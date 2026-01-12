import React, { useState, useEffect, useContext } from 'react';
import { EmailContext } from '../../utils/EmailContext';
import { Archive } from 'lucide-react';

const ClientArchiveOrder = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [processingOrderId, setProcessingOrderId] = useState(null);
    const { email } = useContext(EmailContext);
    const n = process.env.REACT_APP_API_URL;

    // Fetch archived orders
    useEffect(() => {
        if (email) {
            fetchArchivedOrders();
        }
    }, [email]);

    const fetchArchivedOrders = async () => {
        if (!email) return;

        setLoading(true);
        setError(null);
        try {
            // Only fetch archived orders
            const response = await fetch(
                `${n}/api/components/fetchOrders.php?customer_email=${encodeURIComponent(email)}&show_archived=true`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (!response.ok) {
                throw new Error('Failed to fetch archived orders');
            }

            const result = await response.json();

            // Filter to only show archived orders
            const archivedOrders = (result.data || []).filter(order => 
                order.is_archived == 1 || order.is_archived === '1'
            );

            setOrders(archivedOrders);
        } catch (error) {
            console.error('Error fetching archived orders:', error);
            setError('Error loading archived services: ' + error.message);
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    // Handle unarchive order
    const handleUnarchiveOrder = async (orderId) => {
        setProcessingOrderId(orderId);
        setError(null);
        setSuccessMessage(null);
        
        try {
            const response = await fetch(`${n}/api/components/archiveOrder.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    orderId: orderId,
                    userEmail: email,
                    action: 'unarchive'
                }),
            });

            if (!response.ok) {
                let errorMsg = 'Failed to unarchive service';
                try {
                    const errorData = await response.json();
                    errorMsg = errorData.message || errorMsg;
                } catch (e) {
                    errorMsg = await response.text();
                }
                throw new Error(errorMsg);
            }

            const result = await response.json();

            if (result.success) {
                setSuccessMessage(result.message || 'Order successfully restored');
                // Remove the order from the list
                setOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
            } else {
                throw new Error(result.message || 'Unarchive failed');
            }
        } catch (error) {
            console.error('Unarchive error:', error);
            const cleanError = error.message.replace(/<[^>]*>?/gm, '');
            setError(cleanError || 'Failed to restore memorial service');
        } finally {
            setProcessingOrderId(null);
        }
    };

    // Format date utility
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

    // Get expiration time remaining
    const getExpirationTimeRemaining = (expirationDateString, orderStatus = 'active') => {
        if (orderStatus === 'expired') {
            return { text: 'Expired', isExpired: true };
        }
        
        if (!expirationDateString) return { text: 'N/A', isExpired: false };

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

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 2
        }).format(amount);
    };

    // Calculate total amount
    const calculateTotalAmount = (order) => {
        const quantity = parseInt(order.quantity) || 1;
        let basePrice = parseFloat(order.service_price_range) || 0;
        
        if (order.total_amount && order.total_amount > 0) {
            const totalAmount = parseFloat(order.total_amount);
            if (basePrice > 0 && Math.abs(totalAmount - (basePrice * quantity)) < 0.01) {
                return totalAmount;
            } else if (basePrice === 0) {
                return totalAmount;
            }
        }
        return basePrice * quantity;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="text-lg text-gray-600">Loading archived services...</div>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="m-6">
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
                    <p className="font-semibold mb-1">Error Loading Orders</p>
                    <p className="text-sm">{error}</p>
                </div>
            </div>
        );
    }

    const renderArchivedRow = (order) => {
        const quantity = parseInt(order.quantity) || 1;
        const rowTotal = calculateTotalAmount(order);
        const isProcessing = processingOrderId === order.id;

        const expiresIn = getExpirationTimeRemaining(order.expiration_date, order.status);
        const isExpired = expiresIn.isExpired || order.status === 'expired';

        return (
            <div
                key={order.id}
                className={`grid grid-cols-1 md:grid-cols-12 gap-4 p-4 border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors ${isExpired ? 'opacity-60' : ''}`}
            >
                {/* Service Details */}
                <div className="md:col-span-6 flex items-start gap-3">
                    <Archive className="h-5 w-5 text-black mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                            {order.service_name || `Service #${order.id}`}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            Ordered: {formatDate(order.order_date)}
                        </p>
                    </div>
                </div>

                {/* Quantity */}
                <div className="md:col-span-2 flex md:items-center">
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 md:hidden">Quantity:</span>
                        <span className="text-sm font-medium text-gray-900">{quantity}</span>
                    </div>
                </div>
                
                {/* Total */}
                <div className="md:col-span-2 flex md:items-center md:justify-end">
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 md:hidden">Total:</span>
                        <span className="text-sm font-bold text-gray-900">{formatCurrency(rowTotal)}</span>
                    </div>
                </div>

                {/* Restore Button */}
                <div className="md:col-span-2 flex md:items-center md:justify-end">
                    <button
                        onClick={() => handleUnarchiveOrder(order.id)}
                        disabled={isProcessing}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${
                            isProcessing
                                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                        }`}
                    >
                        {isProcessing ? (
                            <>
                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Restoring...
                            </>
                        ) : (
                            <>
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Restore
                            </>
                        )}
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center gap-3 mb-2">
                        <Archive className="h-7 w-7 text-black" />
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                            Archived Services
                        </h1>
                    </div>
                    <p className="text-sm text-gray-600 ml-10">
                        View archived funeral service orders. You can restore them to your cart.
                    </p>
                </div>

                {/* Success Message */}
                {successMessage && (
                    <div className="mb-6 bg-green-50 border border-green-200 text-green-800 p-4 rounded-lg flex items-start gap-3">
                        <svg className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <p className="text-sm font-medium">{successMessage}</p>
                    </div>
                )}
                
                {/* Empty State */}
                {orders.length === 0 && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                        <Archive className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h2 className="text-lg font-semibold text-gray-900 mb-2">
                            No Archived Orders
                        </h2>
                        <p className="text-sm text-gray-600 max-w-md mx-auto">
                            Any services you archive from your main cart will appear here. You can restore them anytime.
                        </p>
                    </div>
                )}

                {/* Archived Orders List */}
                {orders.length > 0 && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        {/* Desktop Header */}
                        <div className="hidden md:grid md:grid-cols-12 gap-4 px-4 py-3 bg-gray-50 border-b border-gray-200">
                            <div className="md:col-span-6 text-xs font-semibold text-gray-700 uppercase tracking-wide">
                                Service Details
                            </div>
                            <div className="md:col-span-2 text-xs font-semibold text-gray-700 uppercase tracking-wide">
                                Quantity
                            </div>
                            <div className="md:col-span-2 text-xs font-semibold text-gray-700 uppercase tracking-wide text-right">
                                Total
                            </div>
                            <div className="md:col-span-2 text-xs font-semibold text-gray-700 uppercase tracking-wide text-right">
                                Action
                            </div>
                        </div>

                        {/* Item Rows */}
                        <div>
                            {orders.map(order => renderArchivedRow(order))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ClientArchiveOrder;