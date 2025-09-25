import React, { useState, useEffect } from 'react';
import useCart from '../hooks/useCart';
import useOrders from '../hooks/useOrders';
import CartItem from '../client/CartItem';
import FuneralOrders from '../client/FuneralOrders';
import PaymentForm from '../client/PaymentForm';

const ClientCart = () => {
    const {
        cartItems,
        setCartItems,
        loading,
        cartLoading,
        error: cartError,
        setError: setCartError,
        successMessage: cartSuccessMessage,
        setSuccessMessage: setCartSuccessMessage,
        userId,
        editingItemId,
        setEditingItemId,
        editingQuantity,
        setEditingQuantity,
        isOrderCart,
        setIsOrderCart,
        fetchCartItems,
        handleEditClick,
        handleUpdateQuantity,
        handleDeleteClick,
        calculateTotal,
        clearMessages: clearCartMessages
    } = useCart();

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
    const [activeTab, setActiveTab] = useState('cart');
    const [isProcessingFuneralPayment, setIsProcessingFuneralPayment] = useState(false);

    // Combine messages from both hooks
    const error = cartError || ordersError;
    const successMessage = cartSuccessMessage || ordersSuccessMessage;
    const setError = (msg) => {
        setCartError(msg);
        setOrdersError(null);
    };
    const setSuccessMessage = (msg) => {
        setCartSuccessMessage(msg);
        setOrdersSuccessMessage(null);
    };

    const handleOrderPayment = (orderId) => {
        setProcessingOrderId(orderId);
        setActiveTab('cart');
        setIsProcessingFuneralPayment(true);
        setIsOrderCart(true);
        setShowCheckout(false);

        const order = orders.find(order => order.id === orderId);
        if (!order) {
            setError(`Could not find memorial service #${orderId}`);
            return;
        }

        // Get the service ID from the order
        const serviceId = getServiceId(order);
        console.log(serviceId);
        

        let totalAmount = 0;
        if (order.service_price_range) {
            totalAmount = parseFloat(order.service_price_range);
        }

        // If there's a total_amount calculated (for non-customized packages), use that instead
        if (order.total_amount && order.total_amount > 0) {
            totalAmount = parseFloat(order.total_amount);
        }

        if (totalAmount <= 0) {
            totalAmount = 100; // Minimum amount
        }

        const orderItems = [{
            id: parseInt(order.id),
            product_id: parseInt(order.id),
            service_id: serviceId, // Include service ID
            serviceId: serviceId,
            name: order.service_name || `Memorial Service #${orderId}`,
            price: totalAmount,
            quantity: 1,
            image_path: "uploads/default.jpg",
            // Include additional order details for reference
            customer_name: order.customer_name,
            customer_email: order.customer_email,
            customer_phone: order.customer_phone,
            order_date: order.order_date,
            service_description: order.service_description,
            service_inclusions: order.service_inclusions,
            caskets: order.caskets || [],
            flowers: order.flowers || []
        }];

        setCartItems(orderItems);

        setShowCheckout(true);
        setSuccessMessage(`Ready to process payment for Memorial Service #${orderId} (Service ID: ${serviceId})`);
    };

    const handleCheckoutSuccess = (result) => {
        setProcessingOrderId(null);
        setIsProcessingFuneralPayment(false);
        
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

        setSuccessMessage(message);

        if (isFuneralService && deletedFuneralOrder) {
            setOrders(prevOrders => prevOrders.filter(order => order.id !== deletedFuneralOrder));
        } else if (!isFuneralService) {
            setCartItems([]);
        }

        fetchCartItems(userId);
        fetchOrders();
        setShowCheckout(false);
    };

    const handleCheckoutError = (errorMessage) => {
        setError('Payment error: ' + errorMessage);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center p-6 min-h-[70vh]">
                <div className="text-xl text-gray-600">Loading your memorial services...</div>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen">
            <div className="container mx-auto p-4 flex-grow">
                <h1 className="text-3xl font-bold text-center mb-6 text-white-300">Funeraria Gomez Payment</h1>

                {error && (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded shadow">
                        <p>{error}</p>
                    </div>
                )}
                {successMessage && (
                    <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4 rounded shadow">
                        <p>{successMessage}</p>
                    </div>
                )}

                <div className="flex border-b mb-6">
                    <button
                        className={`py-2 px-4 font-medium ${activeTab === 'cart' ? 'text-black border-b-2 border-black' : 'text-black'}`}
                        onClick={() => setActiveTab('cart')}
                    >
                        Item Menu ({cartItems?.length || 0})
                    </button>
                    <button
                        className={`py-2 px-4 font-medium ${activeTab === 'orders' ? 'text-black border-b-2 border-black' : 'text-black'}`}
                        onClick={() => setActiveTab('orders')}
                    >
                        Funeral Package Services ({orders?.length || 0})
                    </button>
                </div>

                {activeTab === 'cart' ? (
                    <>
                        <h1 className="text-2xl font-bold mb-4">Menu Orders</h1>
                        {cartItems?.length === 0 ? (
                            <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-4">
                                <p>Your cart is empty. Go to the menu to add items to your cart!</p>
                            </div>
                        ) : (
                            <>
                                <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
                                    {/* Desktop version */}
                                    <div className="hidden md:block">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Item</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Price</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Quantity</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Total</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Expires In</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {cartItems.map(item => (
                                                    <CartItem
                                                        key={item.id}
                                                        item={item}
                                                        editingItemId={editingItemId}
                                                        editingQuantity={editingQuantity}
                                                        setEditingQuantity={setEditingQuantity}
                                                        onEditClick={handleEditClick}
                                                        onUpdateQuantity={handleUpdateQuantity}
                                                        onDeleteClick={handleDeleteClick}
                                                        isOrderCart={isOrderCart}
                                                        isProcessingFuneralPayment={isProcessingFuneralPayment}
                                                    />
                                                ))}
                                            </tbody>
                                            <tfoot>
                                                <tr className="bg-gray-50">
                                                    <td colSpan="3" className="px-6 py-4 text-right font-semibold">Total:</td>
                                                    <td className="px-6 py-4 font-bold">₱{calculateTotal()}</td>
                                                    <td colSpan="2"></td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>

                                    {/* Mobile version */}
                                    <div className="md:hidden">
                                        {cartItems.map(item => (
                                            <div key={item.id} className="border-b border-gray-200 p-4">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 h-10 w-10 mr-3">
                                                            <img
                                                                className="h-10 w-10 rounded-full object-cover"
                                                                src={`http://localhost/apii/components/${item.image_path}`}
                                                                alt={item.name}
                                                            />
                                                        </div>
                                                        <div className="text-sm font-medium text-gray-900">{item.name}</div>
                                                    </div>
                                                    {!isProcessingFuneralPayment && (
                                                        <button
                                                            className="text-red-600 hover:text-red-900"
                                                            onClick={() => handleDeleteClick(item.id)}
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                                            </svg>
                                                        </button>
                                                    )}
                                                </div>
                                                <div className="grid grid-cols-2 gap-2 text-sm">
                                                    <div className="font-medium text-gray-700">Price:</div>
                                                    <div className="text-gray-700">₱{parseFloat(item.price).toFixed(2)}</div>
                                                    <div className="font-medium text-gray-700">Quantity:</div>
                                                    <div className="text-gray-700">{item.quantity}</div>
                                                    <div className="font-medium text-gray-700">Total:</div>
                                                    <div className="text-gray-700">₱{(parseFloat(item.price) * parseInt(item.quantity)).toFixed(2)}</div>
                                                    {item.service_id && (
                                                        <>
                                                            <div className="font-medium text-gray-700">Service ID:</div>
                                                            <div className="text-gray-700">{item.service_id}</div>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                        <div className="bg-gray-50 px-4 py-3 text-right">
                                            <span className="font-semibold mr-2">Total:</span>
                                            <span className="font-bold">₱{calculateTotal()}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end mb-6">
                                    <button
                                        className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded"
                                        onClick={() => setShowCheckout(!showCheckout)}
                                    >
                                        {showCheckout ? 'Hide Checkout' : 'Proceed to Checkout'}
                                    </button>
                                </div>

                                {showCheckout && cartItems.length > 0 && (
                                    <div className="mt-6 border-t pt-6">
                                        <h2 className="text-xl font-bold mb-4">
                                            {isOrderCart ? 
                                                `Pay for Order #${cartItems[0]?.product_id || cartItems[0]?.id}${cartItems[0]?.service_id ? ` (Service ID: ${cartItems[0].service_id})` : ''}` : 
                                                "Payment Information"
                                            }
                                        </h2>

                                        <PaymentForm
                                            totalAmount={parseFloat(calculateTotal())}
                                            cartItems={cartItems}
                                            userId={userId}
                                            onSuccess={handleCheckoutSuccess}
                                            onError={handleCheckoutError}
                                            orderId={isOrderCart ? cartItems[0]?.product_id || cartItems[0]?.id : null}
                                            serviceId={isOrderCart ? cartItems[0]?.service_id : null}
                                        />
                                    </div>
                                )}
                            </>
                        )}
                    </>
                ) : (
                    <>
                        <h1 className="text-2xl font-bold mb-6">Package Services</h1>
                        <FuneralOrders
                            orders={orders}
                            ordersLoading={ordersLoading}
                            processingOrderId={processingOrderId}
                            onOrderPayment={handleOrderPayment}
                            onDeleteOrder={handleDeleteOrder}
                            formatDate={formatDate}
                            getServiceId={getServiceId}
                        />
                    </>
                )}
            </div>
        </div>
    );
};

export default ClientCart;