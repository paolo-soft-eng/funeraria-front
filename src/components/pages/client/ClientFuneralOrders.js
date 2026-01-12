import React from 'react';

const FuneralOrders = ({ 
    orders, 
    ordersLoading, 
    processingOrderId, 
    onOrderPayment, 
    onDeleteOrder, 
    formatDate, 
    getServiceId,
    selectedOrders = [],
    onSelectOrder
}) => {
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 2
        }).format(amount);
    };

    const calculateOrderTotal = (order) => {
        let amount = 0;
        if (order.service_price_range) {
            amount = parseFloat(order.service_price_range);
        }
        if (order.total_amount && order.total_amount > 0) {
            amount = parseFloat(order.total_amount);
        }
        const quantity = parseInt(order.quantity) || 1;
        return amount * quantity;
    };

    if (ordersLoading) {
        return (
            <div className="flex justify-center items-center p-6">
                <div className="text-xl text-gray-600">Loading orders...</div>
            </div>
        );
    }

    if (!orders || orders.length === 0) {
        return (
            <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-4">
                <p>No funeral package orders found. Visit our services to create a memorial service package.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-4">Your Memorial Services</h2>
            
            {/* Desktop View */}
            <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            {onSelectOrder && (
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                    Select
                                </th>
                            )}
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                Order ID
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                Service Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                Customer
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                Quantity
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                Total Amount
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                Order Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {orders.map(order => (
                            <tr 
                                key={order.id}
                                className={selectedOrders.includes(order.id) ? 'bg-green-50' : ''}
                            >
                                {onSelectOrder && (
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <input
                                            type="checkbox"
                                            checked={selectedOrders.includes(order.id)}
                                            onChange={() => onSelectOrder(order.id)}
                                            className="h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300 rounded cursor-pointer"
                                        />
                                    </td>
                                )}
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">#{order.id}</div>
                                    <div className="text-xs text-gray-500">Service ID: {getServiceId(order)}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm font-medium text-gray-900">
                                        {order.service_name || `Memorial Service #${order.id}`}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm text-gray-900">{order.customer_name}</div>
                                    <div className="text-xs text-gray-500">{order.customer_email}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-semibold text-blue-600">
                                        {order.quantity || 1}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-bold text-green-600">
                                        {formatCurrency(calculateOrderTotal(order))}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">
                                        {formatDate(order.order_date)}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => onOrderPayment(order.id)}
                                            disabled={processingOrderId === order.id}
                                            className={`px-3 py-1 rounded transition-colors ${
                                                processingOrderId === order.id
                                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                    : 'bg-green-600 text-white hover:bg-green-700'
                                            }`}
                                        >
                                            {processingOrderId === order.id ? 'Processing...' : 'Pay Now'}
                                        </button>
                                        <button
                                            onClick={() => onDeleteOrder(order.id)}
                                            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile View */}
            <div className="md:hidden space-y-4">
                {orders.map(order => (
                    <div 
                        key={order.id} 
                        className={`bg-white rounded-lg shadow-md p-4 ${
                            selectedOrders.includes(order.id) ? 'ring-2 ring-green-500 bg-green-50' : ''
                        }`}
                    >
                        {onSelectOrder && (
                            <div className="flex items-center mb-3 pb-3 border-b">
                                <input
                                    type="checkbox"
                                    checked={selectedOrders.includes(order.id)}
                                    onChange={() => onSelectOrder(order.id)}
                                    className="h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300 rounded cursor-pointer mr-3"
                                />
                                <span className="text-sm font-medium text-gray-700">Select for payment</span>
                            </div>
                        )}
                        
                        <div className="mb-3">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-medium text-gray-500">ORDER ID</span>
                                <span className="text-sm font-bold text-gray-900">#{order.id}</span>
                            </div>
                        </div>

                        <div className="space-y-2 mb-4">
                            <div>
                                <p className="text-xs text-gray-500">Package Name Name</p>
                                <p className="text-sm font-semibold text-gray-900">
                                    {order.service_name || `Memorial Service #${order.id}`}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs text-gray-500">Customer</p>
                                <p className="text-sm text-gray-900">{order.customer_name}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <p className="text-xs text-gray-500">Quantity</p>
                                    <p className="text-sm font-semibold text-blue-600">
                                        {order.quantity || 1}
                                    </p>
                                </div>
                            </div>

                            <div className="pt-2 border-t">
                                <p className="text-xs text-gray-500">Total Amount</p>
                                <p className="text-lg font-bold text-green-600">
                                    {formatCurrency(calculateOrderTotal(order))}
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-2 pt-3 border-t">
                            <button
                                onClick={() => onOrderPayment(order.id)}
                                disabled={processingOrderId === order.id}
                                className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-colors ${
                                    processingOrderId === order.id
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        : 'bg-green-600 text-white hover:bg-green-700'
                                }`}
                            >
                                {processingOrderId === order.id ? 'Processing...' : 'Pay Now'}
                            </button>
                            <button
                                onClick={() => onDeleteOrder(order.id)}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FuneralOrders;