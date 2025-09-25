import React from 'react';

const FuneralOrders = ({
    orders,
    ordersLoading,
    processingOrderId,
    onOrderPayment,
    onDeleteOrder,
    formatDate
    
}) => {
    if (ordersLoading) {
        return (
            <div className="flex justify-center items-center p-6">
                <div className="text-xl text-gray-600">Loading your orders...</div>
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4">
                <p>You haven't placed any orders yet.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {orders.map((order) => (
                <div key={order.id} className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="p-4 border-b">
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">{order.service_name}</h2>
                                <p className="text-gray-600 text-sm">{order.service_description}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className="bg-slate-400 text-gray-50 text-xs px-2 py-1 rounded">
                                    Order #{order.id}
                                </span>
                                {!processingOrderId && (
                                    <button
                                        onClick={() => onDeleteOrder(order.id)}
                                        className="text-red-500 hover:text-red-700"
                                        title="Delete Order"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <h3 className="font-medium text-gray-900">Customer Details</h3>
                                <p className="text-sm text-gray-600">{order.customer_name}</p>
                                <p className="text-sm text-gray-600">{order.customer_email}</p>
                                <p className="text-sm text-gray-600">{order.customer_phone}</p>
                            </div>

                            <div>
                                <h3 className="font-medium text-gray-900">Order Information</h3>
                                <p className="text-sm text-gray-600">
                                    <span className="font-medium text-gray-900">Order Date:</span> {formatDate(order.order_date)}
                                </p>
                                <p className="text-sm text-gray-600">
                                    <span className="font-medium text-gray-900">Price Range:</span> {order.service_price_range}
                                </p>
                            </div>
                        </div>

                        {order.service_inclusions && (
                            <div className="mt-4">
                                <h3 className="font-medium text-gray-900">Service Inclusions</h3>
                                <ul className="list-disc pl-5 text-sm text-gray-600">
                                    {JSON.parse(order.service_inclusions).map((inclusion, index) => (
                                        <li key={index}>{inclusion}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Add Caskets Section */}
                        {order.caskets && order.caskets.length > 0 && (
                            <div className="mt-4">
                                <h3 className="font-medium text-gray-900">Selected Caskets</h3>
                                <div className="mt-2 space-y-2">
                                    {order.caskets.map((casket, index) => (
                                        <div key={index} className="flex justify-between items-center text-sm">
                                            <span className="text-gray-600">{casket.name}</span>
                                            <span className="font-medium text-gray-900">₱{parseFloat(casket.price).toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Calculate and Display Total */}
                        {order.caskets && order.flowers && (
                            <div className="mt-4 pt-4 border-t">
                                <div className="flex justify-between items-center">
                                    <span className="font-medium text-gray-900">Total Amount:</span>
                                    <span className="font-bold text-lg text-gray-900">
                                        ₱{(parseFloat(order.service_price_range || 0)).toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        )}

                        <div className="mt-4 flex justify-end">
                            <button
                                className={`bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded ${processingOrderId === order.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                                onClick={() => onOrderPayment(order.id)}
                                disabled={processingOrderId === order.id}
                            >
                                {processingOrderId === order.id ? 'Processing...' : 'Pay Now'}
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default FuneralOrders;