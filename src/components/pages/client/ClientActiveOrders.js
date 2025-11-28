import React, { useState, useContext } from 'react';
import { FileText, X, Clock, Calendar, Package } from 'lucide-react';
import { EmailContext } from '../../utils/EmailContext';
import { useActiveOrders } from '../../hooks/client/useActiveOrders';

const ClientActiveOrders = () => {
    const { email } = useContext(EmailContext);
    const { activeOrders, loading, error } = useActiveOrders(email);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [statusFilter, setStatusFilter] = useState('all');

    const handleOrderDetails = (order) => {
        setSelectedOrder(order);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedOrder(null);
    };

    const formatCurrency = (amount) => {
        const num = parseFloat(amount?.toString().replace(/[^\d.-]/g, "")) || 0;
        return new Intl.NumberFormat("en-PH", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(num);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-PH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Filter orders based on status
    const filteredOrders = activeOrders.filter(order => {
        if (statusFilter === 'all') return true;
        if (statusFilter === 'upcoming') return order.is_upcoming;
        return order.status.toLowerCase() === statusFilter.toLowerCase();
    });

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="text-center text-gray-600 py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                    Loading active orders...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="text-center text-red-600 py-4">
                    <div className="mb-2">⚠️</div>
                    Error: {error}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-700 flex items-center">
                    <Package className="mr-2 h-5 w-5 text-green-500" />
                    Active Orders
                    <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                        {filteredOrders.length} orders
                    </span>
                </h2>
                <div className="flex space-x-2">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="border rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                        <option value="all">All Active</option>
                        <option value="upcoming">Upcoming</option>
                        <option value="pending">Pending</option>
                        <option value="completed">Completed</option>
                    </select>
                </div>
            </div>

            {filteredOrders.length === 0 ? (
                <div className="text-center py-8">
                    <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-500 text-lg mb-2">No active orders found</p>
                    <p className="text-gray-400 text-sm">All your upcoming and pending orders will appear here.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredOrders.map(order => (
                        <div 
                            key={order.id} 
                            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => handleOrderDetails(order)}
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="font-semibold text-gray-800 text-lg">
                                            {order.service_name || 'Custom Order'}
                                        </h3>
                                        <div className="flex items-center space-x-2">
                                            <span className={`px-3 py-1 text-xs font-medium rounded-full 
                                                ${order.status_type === 'upcoming' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                                                  order.status_type === 'completed' ? 'bg-green-100 text-green-800' :
                                                  order.status_type === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                  'bg-gray-100 text-gray-800'}`}>
                                                {order.status_display}
                                            </span>
                                            <span className={`px-2 py-1 text-xs rounded-full 
                                                ${order.payment_status === 'paid' ? 'bg-green-100 text-green-800' : 
                                                  'bg-red-100 text-red-800'}`}>
                                                {order.payment_status?.toUpperCase() || 'UNPAID'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                                        <div className="flex items-center">
                                            <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                                            <span>Ordered: {formatDate(order.created_at)}</span>
                                        </div>
                                        <div className="flex items-center">
                                            <Clock className="h-4 w-4 mr-2 text-gray-400" />
                                            <span>Delivery: {formatDate(order.delivery_date_raw)}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="font-semibold text-gray-800">
                                                ₱{formatCurrency(order.total_amount)}
                                            </span>
                                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                                {order.payment_method?.toUpperCase() || 'PAYLATER'}
                                            </span>
                                        </div>
                                    </div>

                                    {order.items && order.items.length > 0 && (
                                        <div className="mt-3">
                                            <p className="text-sm text-gray-500 mb-1">Items included:</p>
                                            <div className="flex flex-wrap gap-1">
                                                {order.items.slice(0, 3).map((item, index) => (
                                                    <span 
                                                        key={item.id} 
                                                        className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
                                                    >
                                                        {item.item_name}
                                                    </span>
                                                ))}
                                                {order.items.length > 3 && (
                                                    <span className="bg-gray-100 text-gray-500 text-xs px-2 py-1 rounded">
                                                        +{order.items.length - 3} more
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Order Details Modal */}
            {isModalOpen && selectedOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold text-gray-800 flex items-center">
                                <Package className="mr-2 h-6 w-6 text-green-500" />
                                Order Details
                            </h3>
                            <button
                                onClick={closeModal}
                                className="text-gray-500 hover:text-gray-700 transition-colors"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="space-y-6">
                            {/* Order Summary */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h4 className="text-lg font-semibold text-gray-800 mb-4">Order Summary</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-500">Order ID</p>
                                        <p className="font-medium text-gray-800">#{selectedOrder.id}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Order Date</p>
                                        <p className="font-medium text-gray-800">{formatDate(selectedOrder.created_at)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Delivery Date</p>
                                        <p className="font-medium text-gray-800">{formatDate(selectedOrder.delivery_date_raw)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Total Amount</p>
                                        <p className="font-medium text-green-600 text-lg">₱{formatCurrency(selectedOrder.total_amount)}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Status & Payment */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="border rounded-lg p-4">
                                    <h4 className="text-lg font-semibold text-gray-800 mb-3">Order Status</h4>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Status:</span>
                                            <span className={`px-3 py-1 text-sm font-medium rounded-full 
                                                ${selectedOrder.status_type === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                                                  selectedOrder.status_type === 'completed' ? 'bg-green-100 text-green-800' :
                                                  selectedOrder.status_type === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                  'bg-gray-100 text-gray-800'}`}>
                                                {selectedOrder.status_display}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Delivery:</span>
                                            <span className={selectedOrder.is_upcoming ? 'text-blue-600 font-medium' : 'text-gray-600'}>
                                                {selectedOrder.is_upcoming ? 'Upcoming' : 'Past Delivery'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="border rounded-lg p-4">
                                    <h4 className="text-lg font-semibold text-gray-800 mb-3">Payment Information</h4>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Status:</span>
                                            <span className={`px-3 py-1 text-sm font-medium rounded-full 
                                                ${selectedOrder.payment_status === 'paid' ? 'bg-green-100 text-green-800' : 
                                                  'bg-red-100 text-red-800'}`}>
                                                {selectedOrder.payment_status?.toUpperCase() || 'UNPAID'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Method:</span>
                                            <span className="font-medium text-gray-800">
                                                {selectedOrder.payment_method?.toUpperCase() || 'Pay Later'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Delivery Address */}
                            <div className="border rounded-lg p-4">
                                <h4 className="text-lg font-semibold text-gray-800 mb-3">Delivery Address</h4>
                                <p className="text-gray-700">{selectedOrder.address}</p>
                            </div>

                            {/* Service Details */}
                            {selectedOrder.service_name && (
                                <div className="border rounded-lg p-4">
                                    <h4 className="text-lg font-semibold text-gray-800 mb-3">Service Package</h4>
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-sm text-gray-500">Package Name</p>
                                            <p className="font-medium text-gray-800">{selectedOrder.service_name}</p>
                                        </div>
                                        {selectedOrder.service_description && (
                                            <div>
                                                <p className="text-sm text-gray-500">Description</p>
                                                <p className="text-gray-700">{selectedOrder.service_description}</p>
                                            </div>
                                        )}
                                        {selectedOrder.service_inclusions && (
                                            <div>
                                                <p className="text-sm text-gray-500 mb-2">Inclusions</p>
                                                <ul className="list-disc list-inside space-y-1">
                                                    {JSON.parse(selectedOrder.service_inclusions).map((inclusion, index) => (
                                                        <li key={index} className="text-gray-700">{inclusion}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                        {selectedOrder.service_price_range && (
                                            <div>
                                                <p className="text-sm text-gray-500">Price Range</p>
                                                <p className="font-medium text-gray-800">₱{formatCurrency(selectedOrder.service_price_range)}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Order Items */}
                            {selectedOrder.items && selectedOrder.items.length > 0 && (
                                <div className="border rounded-lg p-4">
                                    <h4 className="text-lg font-semibold text-gray-800 mb-4">Order Items</h4>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {selectedOrder.items.map((item) => (
                                                    <tr key={item.id} className="hover:bg-gray-50">
                                                        <td className="px-4 py-3">
                                                            <div className="flex items-center">
                                                                {item.item_image && (
                                                                    <img 
                                                                        src={item.item_image} 
                                                                        alt={item.item_name}
                                                                        className="h-10 w-10 rounded object-cover mr-3"
                                                                    />
                                                                )}
                                                                <div>
                                                                    <p className="font-medium text-gray-900">{item.item_name}</p>
                                                                    {item.item_details && (
                                                                        <p className="text-xs text-gray-500 mt-1">{item.item_details}</p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-gray-900">
                                                            ₱{formatCurrency(item.item_price)}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-gray-900">
                                                            {item.quantity}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                                                            ₱{formatCurrency(item.quantity * item.item_price)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="mt-6 flex justify-end space-x-3">
                            <button
                                onClick={closeModal}
                                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClientActiveOrders;