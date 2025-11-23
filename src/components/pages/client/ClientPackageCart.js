import React, { useState, useEffect } from 'react';
import useOrders from '../../hooks/useOrders';
import FuneralOrders from './ClientFuneralOrders';
import PaymentForm from './ClientPaymentForm';

const ClientPackageCart = () => {
    const {
        orders,
        setOrders,
        ordersLoading,
        error: ordersError,
        setError: setOrdersError,
        successMessage: ordersSuccessMessage,
        setSuccessMessage: setOrdersSuccessMessage,
        processingOrderId,
        setProcessingOrderId,
        fetchOrders,
        handleDeleteOrder,
        formatDate,
        getServiceId,
        clearMessages: clearOrdersMessages
    } = useOrders();

    const [showCheckout, setShowCheckout] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [packageCartItems, setPackageCartItems] = useState([]);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [serviceDate, setServiceDate] = useState(''); // New state for service date

    const error = ordersError;
    const successMessage = ordersSuccessMessage;

    useEffect(() => {
        fetchOrders();
    }, []);

    // Function to format date for datetime-local input
    const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString().slice(0, 16);
    };

    // Function to get default service date (next available date)
    const getDefaultServiceDate = () => {
        const now = new Date();
        // Set default to tomorrow at 9:00 AM
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(9, 0, 0, 0);
        return formatDateForInput(tomorrow);
    };

    const handleOrderPayment = (orderId) => {
        setProcessingOrderId(orderId);

        const order = orders.find(order => order.id === orderId);
        if (!order) {
            setOrdersError(`Could not find memorial service #${orderId}`);
            return;
        }

        console.log('=== DEBUGGING ORDER USER ID ===');
        console.log('Full Order Object:', order);
        console.log('Available Keys:', Object.keys(order));
        let orderUserId = order.user_id ||
            order.userId ||
            order.customer_id ||
            order.customerId ||
            order.client_id ||
            order.clientId;

        // Convert to number and check if it's valid (not 0)
        orderUserId = orderUserId ? parseInt(orderUserId) : null;
        if (orderUserId === 0) orderUserId = null;

        console.log('Found userId:', orderUserId);

        // If still no user ID, try to get from session/local storage
        if (!orderUserId) {
            const sessionUserId = sessionStorage.getItem('userId') ||
                localStorage.getItem('userId') ||
                sessionStorage.getItem('user_id') ||
                localStorage.getItem('user_id');

            if (sessionUserId) {
                console.log('Using userId from session:', sessionUserId);
                orderUserId = parseInt(sessionUserId);
            }
        }

        // If STILL no user ID, show detailed error
        if (!orderUserId) {
            console.error('Cannot find user_id. Order structure:', {
                orderId: order.id,
                availableFields: Object.keys(order),
                orderSample: order
            });

            setOrdersError(
                `User ID not found for memorial service #${orderId}. ` +
                `Available fields: ${Object.keys(order).join(', ')}. ` +
                `Please check the API response structure.`
            );
            return;
        }

        setCurrentUserId(orderUserId);

        // Set default service date when opening payment
        setServiceDate(getDefaultServiceDate());
        console.log('Successfully set userId for payment:', orderUserId);

        // Get the service ID from the order
        const serviceId = getServiceId(order);

        let totalAmount = 0;
        if (order.service_price_range) {
            totalAmount = parseFloat(order.service_price_range);
        }

        if (order.total_amount && order.total_amount > 0) {
            totalAmount = parseFloat(order.total_amount);
        }

        if (totalAmount <= 0) {
            totalAmount = 100;
        }

        const orderItems = [{
            id: parseInt(order.id),
            product_id: parseInt(order.id),
            service_id: serviceId,
            serviceId: serviceId,
            name: order.service_name || `Memorial Service #${orderId}`,
            price: totalAmount,
            quantity: 1,
            image_path: "uploads/default.jpg",
            customer_name: order.customer_name,
            customer_email: order.customer_email,
            customer_phone: order.customer_phone,
            order_date: order.order_date,
            service_description: order.service_description,
            service_inclusions: order.service_inclusions,
            caskets: order.caskets || [],
            flowers: order.flowers || [],
            user_id: orderUserId
        }];

        setPackageCartItems(orderItems);
        setSelectedOrder(order);
        setShowCheckout(true);
        setOrdersSuccessMessage(`Ready to process payment for Memorial Service #${orderId} (Service ID: ${serviceId})`);
    };

    const handleCheckoutSuccess = (result) => {
        setProcessingOrderId(null);

        let message, orderId, isFuneralService, deletedFuneralOrder;

        if (typeof result === 'string') {
            message = result;
            isFuneralService = false;
        } else {
            message = result.message;
            orderId = result.orderId;
            isFuneralService = result.isFuneralService;
            deletedFuneralOrder = result.deletedFuneralOrder;
        }

        setOrdersSuccessMessage(message);

        if (isFuneralService && deletedFuneralOrder) {
            setOrders(prevOrders => prevOrders.filter(order => order.id !== deletedFuneralOrder));
        }

        fetchOrders();
        setShowCheckout(false);
        setSelectedOrder(null);
        setPackageCartItems([]);
        setCurrentUserId(null);
        setServiceDate(''); // Reset service date
    };

    const handleCheckoutError = (errorMessage) => {
        setOrdersError('Payment error: ' + errorMessage);
    };

    const handleToggleCheckout = () => {
        setShowCheckout(!showCheckout);
        if (showCheckout) {
            setProcessingOrderId(null);
            setSelectedOrder(null);
            setPackageCartItems([]);
            setCurrentUserId(null);
            setServiceDate(''); // Reset service date
        }
    };

    const handleServiceDateChange = (e) => {
        setServiceDate(e.target.value);
    };

    const calculateTotal = () => {
        if (packageCartItems.length === 0) return '0.00';
        const total = packageCartItems.reduce((sum, item) => {
            return sum + (parseFloat(item.price) * parseInt(item.quantity));
        }, 0);
        return total.toFixed(2);
    };

    if (ordersLoading) {
        return (
            <div className="flex justify-center items-center p-6 min-h-[70vh]">
                <div className="text-xl text-gray-600">Loading your funeral package services...</div>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen">
            <div className="container mx-auto p-4 flex-grow">
                <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl sm:tracking-tight lg:text-5xl text-center mb-6">
                    Funeral Package Services
                </h1>

                {error && (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded shadow">
                        <p className="whitespace-pre-wrap">{error}</p>
                    </div>
                )}
                {successMessage && (
                    <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4 rounded shadow">
                        <p>{successMessage}</p>
                    </div>
                )}

                {!showCheckout && (
                    <FuneralOrders
                        orders={orders}
                        ordersLoading={ordersLoading}
                        processingOrderId={processingOrderId}
                        onOrderPayment={handleOrderPayment}
                        onDeleteOrder={handleDeleteOrder}
                        formatDate={formatDate}
                        getServiceId={getServiceId}
                    />
                )}

                {showCheckout && packageCartItems.length > 0 && currentUserId && (
                    <div className="mt-6">
                        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-2xl font-bold">
                                    Payment for Order #{packageCartItems[0]?.product_id || packageCartItems[0]?.id}
                                    {packageCartItems[0]?.service_id && ` (Service ID: ${packageCartItems[0].service_id})`}
                                </h2>
                                <button
                                    onClick={handleToggleCheckout}
                                    className="text-gray-600 hover:text-gray-800"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* Service Date Selection - ADDED THIS SECTION */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                                <h3 className="text-lg font-semibold text-blue-800 mb-3">Service Date & Time</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-blue-700 mb-2">
                                            Preferred Service Date & Time *
                                        </label>
                                        <input
                                            type="datetime-local"
                                            value={serviceDate}
                                            onChange={handleServiceDateChange}
                                            className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            min={new Date().toISOString().slice(0, 16)}
                                            required
                                        />
                                        <p className="text-xs text-blue-600 mt-1">
                                            Select when you'd like the funeral service to take place
                                        </p>
                                    </div>
                                    <div className="flex items-center">
                                        <div className="bg-white p-3 rounded-lg border border-blue-200">
                                            <p className="text-sm text-blue-800 font-semibold">
                                                Selected: {serviceDate ? formatDate(new Date(serviceDate)) : 'Not set'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t pt-4 mb-6">
                                <h3 className="text-lg font-semibold mb-3">Order Details</h3>
                                {packageCartItems.map(item => (
                                    <div key={item.id} className="bg-gray-50 p-4 rounded-lg mb-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm text-gray-600">Service Name</p>
                                                <p className="font-semibold">{item.name}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">Customer Name</p>
                                                <p className="font-semibold">{item.customer_name}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">Email</p>
                                                <p className="font-semibold">{item.customer_email}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">Phone</p>
                                                <p className="font-semibold">{item.customer_phone}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">Order Date</p>
                                                <p className="font-semibold">{formatDate(item.order_date)}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">Service ID</p>
                                                <p className="font-semibold">{item.service_id}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">User ID</p>
                                                <p className="font-semibold">{currentUserId}</p>
                                            </div>
                                            {/* Display selected service date */}
                                            <div>
                                                <p className="text-sm text-gray-600">Service Date</p>
                                                <p className="font-semibold text-green-600">
                                                    {serviceDate ? formatDate(new Date(serviceDate)) : 'Not selected'}
                                                </p>
                                            </div>
                                        </div>

                                        {item.service_description && (
                                            <div className="mt-4">
                                                <p className="text-sm text-gray-600">Description</p>
                                                <p className="text-gray-800">{item.service_description}</p>
                                            </div>
                                        )}

                                        {item.service_inclusions && (
                                            <div className="mt-4">
                                                <p className="text-sm text-gray-600">Inclusions</p>

                                                {(() => {
                                                    let inclusions = item.service_inclusions;

                                                    // Convert string → array
                                                    if (typeof inclusions === "string") {
                                                        try {
                                                            inclusions = JSON.parse(inclusions);
                                                        } catch {
                                                            // fallback if parsing fails
                                                            inclusions = [inclusions];
                                                        }
                                                    }

                                                    // Render as bullet list
                                                    return (
                                                        <ul className="list-disc ml-6 text-gray-800">
                                                            {inclusions.map((inc, index) => (
                                                                <li key={index}>{inc}</li>
                                                            ))}
                                                        </ul>
                                                    );
                                                })()}
                                            </div>
                                        )}


                                        <div className="mt-4 pt-4 border-t flex justify-between items-center">
                                            <span className="text-lg font-semibold">Total Amount:</span>
                                            <span className="text-2xl font-bold text-green-600">₱{parseFloat(item.price).toFixed(2)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t pt-6">
                                <h3 className="text-xl font-bold mb-4">Payment Information</h3>
                                <PaymentForm
                                    totalAmount={parseFloat(calculateTotal())}
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
                                    serviceDate={serviceDate} // Pass service date to PaymentForm
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