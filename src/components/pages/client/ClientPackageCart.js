import React, { useState, useEffect } from 'react';
import useOrders from '../../hooks/useOrders';
import PaymentForm from './ClientPaymentForm';

const ClientPackageCart = () => {
    const {
        orders,
        ordersLoading,
        error: ordersError,
        setError: setOrdersError,
        successMessage: ordersSuccessMessage,
        setSuccessMessage: setOrdersSuccessMessage,
        showDeleteConfirm,
        fetchOrders,
        handleDeleteOrder,
        confirmDeleteOrder,
        cancelDeleteOrder,
        formatDate,
        getServiceId,
        getExpirationTimeRemaining,
        handleArchiveOrder,
        handleUnarchiveOrder,
        showArchived,
        setShowArchived,
        processingOrderId
    } = useOrders();

    const [showCheckout, setShowCheckout] = useState(false);
    const [packageCartItems, setPackageCartItems] = useState([]);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [serviceDate, setServiceDate] = useState('');
    const [selectedOrders, setSelectedOrders] = useState([]);
    const [customerName, setCustomerName] = useState('');

    const API_URL = process.env.REACT_APP_API_URL;

    const error = ordersError;
    const successMessage = ordersSuccessMessage;
    const setError = setOrdersError;
    const setSuccessMessage = setOrdersSuccessMessage;

    useEffect(() => {
        // Only fetch orders here; the dependency array in useOrders handles refetching on showArchived change
        fetchOrders();
        fetchCustomerName();
    }, []);

    useEffect(() => {
        if (orders && orders.length > 0) {
            const nonExpiredAndNonArchivedOrderIds = orders
                .filter(order => {
                    const expiresIn = getExpirationTimeRemaining(order.expiration_date, order.status);
                    // Filter: not expired AND not archived (is_archived !== '1')
                    return !expiresIn.isExpired && order.status !== 'expired' && order.is_archived !== '1';
                })
                .map(order => order.id);

            setSelectedOrders(nonExpiredAndNonArchivedOrderIds);
        } else {
            setSelectedOrders([]);
        }
    }, [orders, showArchived]);

    const fetchCustomerName = async () => {
        try {
            const userEmail = sessionStorage.getItem('userEmail') ||
                localStorage.getItem('userEmail') ||
                sessionStorage.getItem('email') ||
                localStorage.getItem('email');

            if (!userEmail) {
                return;
            }

            const response = await fetch(
                `${API_URL}/api/components/get_user_details.php?email=${encodeURIComponent(userEmail)}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include'
                }
            );


            if (response.ok) {
                const data = await response.json();
                if (data.success && data.user) {
                    const name = data.user.username
                        ? data.user.username
                        : `${data.user.first_name || ''} ${data.user.last_name || ''}`.trim();

                    setCustomerName(name || 'Customer');
                }
            }
        } catch (error) {
            console.error('Error fetching customer name:', error);
            setCustomerName('Customer');
        }
    };

    const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString().slice(0, 16);
    };

    const getDefaultServiceDate = () => {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(9, 0, 0, 0);
        return formatDateForInput(tomorrow);
    };

    const handleSelectOrder = (orderId) => {
        setSelectedOrders(prev => {
            if (prev.includes(orderId)) {
                return prev.filter(id => id !== orderId);
            } else {
                return [...prev, orderId];
            }
        });
    };

    const handleSelectAllOrders = () => {
        const selectableOrders = orders.filter(order => {
            const expiresIn = getExpirationTimeRemaining(order.expiration_date);
            // Only select items that are active AND not archived
            return !(expiresIn.isExpired || order.status === 'expired' || order.is_archived === '1');
        });

        if (selectedOrders.length === selectableOrders.length) {
            setSelectedOrders([]);
        } else {
            setSelectedOrders(selectableOrders.map(order => order.id));
        }
    };

    const getSelectedOrders = () => {
        return orders.filter(order => selectedOrders.includes(order.id));
    };

    // --- NEW: Filter visible orders based on archive status ---
    const getVisibleOrders = () => {
        return orders.filter(order => showArchived ? order.is_archived === '1' : order.is_archived !== '1');
    };

    const calculateTotalAmount = (order) => {
        const quantity = parseInt(order.quantity) || 1;

        // Use service_price_range as the base price (price per unit)
        let basePrice = 0;
        if (order.service_price_range) {
            basePrice = parseFloat(order.service_price_range);
        }

        if (order.total_amount && order.total_amount > 0) {
            const totalAmount = parseFloat(order.total_amount);
            if (basePrice > 0 && Math.abs(totalAmount - (basePrice * quantity)) < 0.01) {
                return totalAmount;
            } else if (basePrice === 0) {
                return totalAmount;
            }
        }

        // Standard case: multiply base price by quantity
        return basePrice * quantity;
    }


    const calculateSelectedTotal = () => {
        const selected = getSelectedOrders();
        const total = selected.reduce((sum, order) => sum + calculateTotalAmount(order), 0);
        return total.toFixed(2);
    };

    const calculateTotal = () => {
        const total = orders.reduce((sum, order) => sum + calculateTotalAmount(order), 0);
        return total.toFixed(2);
    };

    const handleBulkPayment = () => {
        if (selectedOrders.length === 0) {
            setError('Please select at least one order to proceed with payment.');
            return;
        }

        const selected = getSelectedOrders();

        let userId = null;
        if (selected[0]) {
            userId = selected[0].user_id || selected[0].userId || selected[0].customer_id || selected[0].customerId;
            userId = userId ? parseInt(userId) : null;
        }

        if (!userId) {
            const sessionUserId = sessionStorage.getItem('userId') ||
                localStorage.getItem('userId') ||
                sessionStorage.getItem('user_id') ||
                localStorage.getItem('user_id');

            if (sessionUserId) {
                userId = parseInt(sessionUserId);
            }
        }

        if (!userId) {
            setError('User ID not found. Please try logging in again.');
            return;
        }

        setCurrentUserId(userId);
        setServiceDate(getDefaultServiceDate());
        setOrdersError(null);

        const items = selected.map(order => {
            const serviceId = getServiceId(order);
            const orderQuantity = parseInt(order.quantity) || 1;

            // ALWAYS use service_price_range as the base price per unit
            let basePrice = 0;
            if (order.service_price_range) {
                basePrice = parseFloat(order.service_price_range);
            }

            // Fallback: if no service_price_range, try to derive from total_amount
            if (basePrice <= 0 && order.total_amount && order.total_amount > 0) {
                basePrice = parseFloat(order.total_amount) / orderQuantity;
            }

            if (basePrice <= 0) {
                basePrice = 100; // Default fallback price
            }

            return {
                id: parseInt(order.id),
                product_id: parseInt(order.id),
                service_id: serviceId,
                serviceId: serviceId,
                name: order.service_name || `Memorial Service #${order.id}`,
                price: basePrice, // Store ONLY the base price per unit
                quantity: orderQuantity,
                image_path: "uploads/default.jpg",
                customer_name: order.customer_name,
                customer_email: order.customer_email,
                customer_phone: order.customer_phone,
                order_date: order.order_date,
                service_description: order.service_description,
                service_inclusions: order.service_inclusions,
                caskets: order.caskets || [],
                chapels: order.chapels || [],
                user_id: userId
            };
        });

        setPackageCartItems(items);
        setShowCheckout(true);
        setSuccessMessage(
            `Ready to process payment for ${selectedOrders.length} memorial service${selectedOrders.length > 1 ? 's' : ''}`
        );
    };

    const handleCheckoutSuccess = (result) => {
        let message;

        if (typeof result === 'string') {
            message = result;
        } else {
            message = result.message;
        }

        setOrdersSuccessMessage(message);

        fetchOrders();
        setShowCheckout(false);
        setPackageCartItems([]);
        setCurrentUserId(null);
        setServiceDate('');
        setSelectedOrders([]);
    };

    const handleCheckoutError = (errorMessage) => {
        setOrdersError('Payment error: ' + errorMessage);
    };

    const handleToggleCheckout = () => {
        if (!showCheckout && selectedOrders.length === 0) {
            setError('Please select at least one service to checkout.');
            return;
        }

        if (!showCheckout) {
            handleBulkPayment();
        } else {
            setShowCheckout(false);
            setPackageCartItems([]);
            setCurrentUserId(null);
            setServiceDate('');
        }
    };

    const calculateCheckoutTotal = () => {
        if (packageCartItems.length === 0) return '0.00';
        const total = packageCartItems.reduce((sum, item) => {
            return sum + (parseFloat(item.price) * parseInt(item.quantity));
        }, 0);
        return total.toFixed(2);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 2
        }).format(amount);
    };

    const getServiceImage = (order) => {
        let filename = '';

        if (order.caskets && order.caskets.length > 0 && order.caskets[0].image) {
            filename = order.caskets[0].image;
        }
        else if (order.image_path) {
            filename = order.image_path;
        }

        if (!filename) {
            return `${API_URL}/api/components/uploads/caskets/ordinary.jpg`;
        }
        return `${API_URL}/api/components/uploads/caskets/${filename}`;
    };

    const handleDeleteClick = (orderId) => {
        handleDeleteOrder(orderId);
    };

    // --- UPDATED RENDER ROW FUNCTION ---
    const renderOrderRow = (order) => {
        const quantity = parseInt(order.quantity) || 1;
        const rowTotal = calculateTotalAmount(order);
        const rowUnitPrice = rowTotal / (quantity || 1);
        const expiresIn = getExpirationTimeRemaining(order.expiration_date, order.status);
        const isExpired = expiresIn.isExpired || order.status === 'expired';
        const isArchived = order.is_archived === '1';
        const isProcessing = processingOrderId === order.id;

        const isSelected = selectedOrders.includes(order.id) && !isExpired && !isArchived;

        const isSelectable = !isExpired && !isArchived && !isProcessing;

        return (
            <div
                key={order.id}
                className={`flex flex-wrap items-center py-4 border-b border-gray-100 last:border-b-0 
                    ${isSelected ? 'bg-green-50' : 'hover:bg-gray-50'} 
                    ${isExpired ? 'bg-red-50 opacity-70' : ''}
                    ${isArchived ? 'bg-gray-100 opacity-80' : ''}
                `}
            >
                {/* Checkbox - Disabled for expired/archived/processing items */}
                <div className="w-[8%] md:w-[4%] flex justify-center order-1">
                    <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => isSelectable && handleSelectOrder(order.id)}
                        disabled={!isSelectable}
                        className={`h-5 w-5 focus:ring-2 border-gray-300 rounded cursor-pointer 
                            ${isSelectable ? 'text-green-600 focus:ring-green-500' : 'cursor-not-allowed opacity-50'}
                        `}
                    />
                </div>

                {/* ITEM DETAILS */}
                <div className="w-[92%] md:w-[45%] flex items-center pr-2 mb-2 md:mb-0 order-2 md:order-2">
                    {/* Image */}
                    <div className="flex-shrink-0 h-16 w-16 mr-4">
                        <img
                            className="h-16 w-16 object-cover border border-gray-200 rounded-md"
                            src={getServiceImage(order)}
                            alt={order.service_name || `Service #${order.id}`}
                        />
                    </div>
                    {/* Service Name */}
                    <div className="text-sm text-gray-900 font-medium truncate max-w-[calc(100%-80px)]">
                        {order.service_name || `Service #${order.id}`}
                        {isArchived && <span className="text-xs text-gray-500 ml-2">(Archived)</span>}
                    </div>
                </div>

                {/* Mobile: Row for Price, Quantity, Total, Expires In, Actions */}
                <div className="flex w-full md:hidden text-xs text-gray-700 ml-[8%] mt-2 space-y-1 flex-col order-3">
                    <div className='flex justify-between'>
                        <span className='font-semibold'>Price:</span> <span>{formatCurrency(rowUnitPrice)}</span>
                    </div>
                    <div className='flex justify-between'>
                        <span className='font-semibold'>Quantity:</span>
                        <span>{quantity}</span>
                    </div>
                    <div className='flex justify-between'>
                        <span className='font-semibold'>Total:</span> <span className="text-sm font-bold text-gray-900">{formatCurrency(rowTotal)}</span>
                    </div>
                    <div className='flex justify-between'>
                        <span className={`${isExpired ? 'text-red-600 font-bold' : 'text-gray-700'}`}>
                            <span className='font-semibold'>Expires:</span> {expiresIn.text}
                        </span>
                    </div>

                    {/* MOBILE ACTIONS */}
                    <div className='flex justify-end pt-2 space-x-3'>
                        {isProcessing ? (
                            <span className="text-blue-500 font-medium">Processing...</span>
                        ) : isArchived ? (
                            <button
                                className="text-blue-600 hover:text-blue-900 font-medium"
                                onClick={() => handleUnarchiveOrder(order.id)}
                            >
                                Restore
                            </button>
                        ) : (
                            <>
                                <button
                                    className="text-gray-600 hover:text-gray-900 font-medium"
                                    onClick={() => handleArchiveOrder(order.id)}
                                >
                                    Archive
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* PRICE (w-12%) - DESKTOP (Order 3) */}
                <div className="hidden md:block md:w-[12%] text-sm text-gray-700 font-medium whitespace-nowrap order-3">
                    {formatCurrency(rowUnitPrice)}
                </div>

                {/* QUANTITY (w-8%) - DESKTOP (Order 4) */}
                <div className="hidden md:block md:w-[8%] text-sm text-gray-700 flex justify-center order-4">
                    <span className="text-gray-700 mr-2">{quantity}</span>
                </div>

                {/* TOTAL (w-12%) - DESKTOP (Order 5) */}
                <div className="hidden md:block md:w-[12%] text-sm text-gray-900 font-bold whitespace-nowrap order-5">
                    {formatCurrency(rowTotal)}
                </div>

                {/* EXPIRES IN (w-10%) - DESKTOP (Order 6) */}
                <div className="hidden md:block md:w-[10%] text-sm order-6">
                    <span className={`font-medium ${isExpired ? 'text-red-600' : 'text-gray-500'}`}>
                        {expiresIn.text}
                    </span>
                    {isExpired && (
                        <div className="text-xs text-red-500 mt-1">Expired</div>
                    )}
                </div>

                {/* ACTIONS (w-9%) - DESKTOP (Order 7) */}
                <div className="hidden md:block md:w-[9%] text-sm flex justify-end pr-4 order-7 space-x-2">
                    {isProcessing ? (
                        <span className="text-blue-500 text-sm font-medium">Processing...</span>
                    ) : isArchived ? (
                        <button
                            className="text-blue-600 hover:text-blue-900 font-medium"
                            onClick={() => handleUnarchiveOrder(order.id)}
                        >
                            Restore
                        </button>
                    ) : ( // Applies to all non-archived, non-processing orders (active AND expired)
                        <>
                            <button
                                className="text-gray-600 hover:text-gray-900 font-medium mr-2"
                                onClick={() => handleArchiveOrder(order.id)}
                            >
                                Archive
                            </button>
                        </>
                    )}
                </div>
            </div>
        );
    };

    const renderCheckoutItemCard = (item) => {
        const itemTotal = parseFloat(item.price) * item.quantity;
        return (
            <div key={item.id} className="bg-white p-4 rounded-lg mb-4 border border-gray-200 shadow-sm">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-gray-50 px-3 py-2 rounded-t-lg -mx-4 -mt-4 mb-4 border-b border-gray-200">
                    <h4 className="font-semibold text-gray-900 text-base">Service: {item.name}</h4>
                    <span className="text-sm font-medium text-gray-600 mt-1 sm:mt-0">Qty: {item.quantity}</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className='col-span-2 sm:col-span-1'>
                        <p className="text-xs font-medium text-gray-600">Customer Name</p>
                        <p className="font-semibold text-gray-800">{item.customer_name || customerName || 'N/A'}</p>
                    </div>
                    <div>
                        <p className="text-xs font-medium text-gray-600">Order ID</p>
                        <p className="font-semibold text-gray-800">#{item.id}</p>
                    </div>
                    <div>
                        <p className="text-xs font-medium text-gray-600">Order Date</p>
                        <p className="font-semibold text-gray-800">{formatDate(item.order_date)}</p>
                    </div>
                    <div>
                        <p className="text-xs font-medium text-gray-600">Price per Unit</p>
                        <p className="font-semibold text-green-700">{formatCurrency(parseFloat(item.price))}</p>
                    </div>
                </div>

                <div className="mt-4 pt-4 border-t">
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold text-gray-700">Subtotal for this service:</span>
                        <span className="text-lg font-bold text-green-600">
                            {formatCurrency(itemTotal)}
                        </span>
                    </div>
                </div>
            </div>
        );
    };

    if (ordersLoading) {
        return (
            <div className="flex justify-center items-center p-6 min-h-[70vh]">
                <div className="text-xl text-gray-600">Loading your funeral package services...</div>
            </div>
        );
    }

    // Determine counts for header display
    const activeOrders = orders.filter(o => o.is_archived !== '1');
    const archivedOrders = orders.filter(o => o.is_archived === '1');
    const selectableOrdersCount = activeOrders.filter(order => {
        const expiresIn = getExpirationTimeRemaining(order.expiration_date);
        return !(expiresIn.isExpired || order.status === 'expired');
    }).length;


    return (
        <div className="flex flex-col min-h-screen bg-gray-50">

            {/* H1 Title */}
            <div className="text-center p-4">
                <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl sm:tracking-tight lg:text-5xl text-center mb-6">
                    Full Package Order
                </h1>
            </div>

            <div className="container mx-auto px-4 md:p-4 flex-grow">
                {/* Notification messages (Error/Success) */}
                {error && (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded shadow">
                        <div className="flex items-start">
                            <svg className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            <div className="flex-1">
                                <p>{error}</p>
                            </div>
                        </div>
                    </div>
                )}
                {successMessage && (
                    <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4 rounded shadow">
                        <p>{successMessage}</p>
                    </div>
                )}

                {!showCheckout && (
                    <>
                        {/* Main Cart Content Container */}
                        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                            {/* Header Section */}
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-gray-100 border-b border-gray-200">
                                <div className="text-sm font-medium text-gray-700 mb-1 sm:mb-0">
                                    <span className="font-bold">
                                        {showArchived
                                            ? `${getVisibleOrders().length} Archived item(s) found`
                                            : `${selectedOrders.length} of ${selectableOrdersCount} item(s) selected`
                                        }
                                    </span>
                                    {activeOrders.length > 0 && !showArchived && (
                                        <> | Customer: <span className="text-blue-600">{customerName || 'Customer'}</span></>
                                    )}
                                </div>

                                <div className="flex space-x-4">
                                    {/* NEW: Toggle Button for Archived Orders */}
                                    {archivedOrders.length > 0 && (
                                        <button
                                            onClick={() => setShowArchived(prev => !prev)}
                                            className="text-sm text-purple-600 hover:text-purple-800 font-medium flex items-center"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                            </svg>
                                            {showArchived ? 'Show Active Orders' : `View Archived Orders (${archivedOrders.length})`}
                                        </button>
                                    )}

                                    {/* Select All Button (Only visible for Active view) */}
                                    {!showArchived && selectableOrdersCount > 0 && (
                                        <button
                                            onClick={handleSelectAllOrders}
                                            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                                        >
                                            {selectedOrders.length === selectableOrdersCount ? 'Deselect All' : 'Select All'}
                                        </button>
                                    )}
                                </div>
                            </div>

                            {getVisibleOrders()?.length === 0 && !showArchived ? (
                                <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4">
                                    <p>No active funeral package services found. Your booked packages will appear here.</p>
                                </div>
                            ) : getVisibleOrders()?.length === 0 && showArchived ? (
                                <div className="bg-gray-100 border-l-4 border-gray-500 text-gray-700 p-4">
                                    <p>No archived services found.</p>
                                </div>
                            ) : (
                                <>
                                    {/* Table Header (Hidden on Mobile) */}
                                    <div className="hidden md:flex items-center py-2 px-4 bg-gray-50 border-b border-gray-200 text-xs font-semibold uppercase text-gray-600 tracking-wider">
                                        <div className="w-[4%] flex justify-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div className="w-[45%]">ITEM DETAILS</div>
                                        <div className="w-[12%]">PRICE</div>
                                        <div className="w-[8%] text-center">QUANTITY</div>
                                        <div className="w-[12%]">TOTAL</div>
                                        <div className="w-[10%]">
                                            {showArchived ? 'ARCHIVED' : 'EXPIRES IN'}
                                        </div>
                                        <div className="w-[9%] text-right pr-4">ACTIONS</div>
                                    </div>

                                    {/* Item Rows */}
                                    <div className="divide-y divide-gray-100 px-2 md:px-4">
                                        {getVisibleOrders().map(order => renderOrderRow(order))}
                                    </div>

                                    {/* Totals Section - Only show for Active view */}
                                    {!showArchived && (
                                        <div className="flex flex-col items-end p-4 text-sm bg-gray-50 border-t border-gray-200">
                                            <div className="flex flex-col w-full md:flex-row md:items-end md:justify-end">

                                                {/* Spacer for Checkbox, Item Details, Price, Quantity */}
                                                <div className="hidden md:block md:w-[69%]"></div>

                                                {/* Container for Totals (aligns with Total, Expires In, Actions columns) */}
                                                <div className="w-full md:w-[31%]">
                                                    <div className="flex justify-between py-1 px-4 md:px-0 md:pr-4">
                                                        <span className="font-semibold text-gray-700 whitespace-nowrap">Selected Total ({selectedOrders.length} items):</span>
                                                        <span className="font-bold text-green-600 w-[38.7%] text-right whitespace-nowrap">
                                                            {formatCurrency(parseFloat(calculateSelectedTotal()))}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between py-1 px-4 md:px-0 md:pr-4">
                                                        <span className="font-semibold text-gray-700 whitespace-nowrap">Cart Total ({activeOrders.length} items):</span>
                                                        <span className="font-bold text-gray-900 w-[38.7%] text-right whitespace-nowrap">
                                                            {/* Calculate total based on active orders only */}
                                                            {formatCurrency(activeOrders.reduce((sum, order) => sum + calculateTotalAmount(order), 0).toFixed(2))}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Proceed to Checkout Button - Only show for Active view */}
                                    {!showArchived && (
                                        <div className="p-4 bg-gray-100">
                                            <button
                                                onClick={handleToggleCheckout}
                                                disabled={selectedOrders.length === 0}
                                                className={`w-full md:w-auto px-6 py-3 rounded-lg font-semibold text-white transition-colors flex items-center justify-center ${selectedOrders.length === 0
                                                    ? 'bg-gray-400 cursor-not-allowed'
                                                    : 'bg-green-600 hover:bg-green-700'
                                                    }`}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                                </svg>
                                                Proceed to Checkout ({selectedOrders.length} items)
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </>
                )}


                {/* Payment Checkout Form */}
                {showCheckout && packageCartItems.length > 0 && currentUserId && (
                    <div className="mt-6 max-w-4xl mx-auto">
                        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-6">
                            <div className="flex justify-between items-center mb-4 border-b pb-4">
                                <h2 className="text-xl sm:text-2xl font-bold">
                                    Payment for {packageCartItems.length} Service{packageCartItems.length > 1 ? 's' : ''} 💳
                                </h2>
                                <button
                                    onClick={handleToggleCheckout}
                                    className="text-gray-600 hover:text-gray-800 p-1"
                                    aria-label="Back to Cart"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="pt-4 mb-6">
                                <h3 className="text-lg font-semibold mb-3">Order Details</h3>

                                {packageCartItems.map((item) => renderCheckoutItemCard(item))}

                                {/* Grand Total */}
                                <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 mt-6">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xl font-bold text-green-800">Grand Total:</span>
                                        <span className="text-2xl sm:text-3xl font-bold text-green-600">
                                            {formatCurrency(parseFloat(calculateCheckoutTotal()))}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t pt-6">
                                <h3 className="text-xl font-bold mb-4">Payment Information</h3>
                                <PaymentForm
                                    totalAmount={parseFloat(calculateCheckoutTotal())}
                                    cartItems={packageCartItems}
                                    userId={currentUserId}
                                    onSuccess={handleCheckoutSuccess}
                                    onError={handleCheckoutError}
                                    orderId={packageCartItems[0]?.product_id || packageCartItems[0]?.id}
                                    serviceId={packageCartItems[0]?.service_id}
                                    isFuneralPackage={true}
                                    customerInfo={{
                                        name: packageCartItems[0]?.customer_name,
                                        email: packageCartItems[0]?.customer_email,
                                        phone: packageCartItems[0]?.customer_phone
                                    }}
                                    serviceDate={serviceDate}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ClientPackageCart;