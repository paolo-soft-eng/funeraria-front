import React, { useState, useContext } from 'react';
import { FileText, X, Calendar, Clock, Package, ShoppingCart, CheckCircle, XCircle, Grid, List, ChevronLeft, ChevronRight } from 'lucide-react';
import { EmailContext } from '../../utils/EmailContext';
import { useOrderHistory } from '../../hooks/client/useOrderHistory';

// Pagination Hook
const usePagination = (totalItems, itemsPerPage, currentPage, setCurrentPage, setItemsPerPage) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const getVisiblePageNumbers = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    if (totalPages === 0) return [];
    if (totalPages === 1) return [1];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    rangeWithDots.push(1);

    if (currentPage - delta > 2) {
      rangeWithDots.push('...');
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...');
    }

    if (totalPages > 1 && !rangeWithDots.includes(totalPages)) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots.filter((value, index, self) => 
      self.indexOf(value) === index
    );
  };

  return {
    totalPages,
    handlePageChange,
    handleItemsPerPageChange,
    getVisiblePageNumbers,
  };
};

const ClientOrderHistory = () => {
    const { email } = useContext(EmailContext);
    const { orderHistory, loading, error } = useOrderHistory(email);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [statusFilter, setStatusFilter] = useState('all');
    const [viewMode, setViewMode] = useState('card');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);

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

    const getStatusIcon = (status) => {
        switch (status.toLowerCase()) {
            case 'completed':
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'cancelled':
                return <XCircle className="h-4 w-4 text-red-500" />;
            default:
                return <Clock className="h-4 w-4 text-yellow-500" />;
        }
    };

    const getOrderTypeIcon = (orderType) => {
        switch (orderType) {
            case 'service':
                return <Package className="h-4 w-4 text-blue-500" />;
            case 'items':
                return <ShoppingCart className="h-4 w-4 text-green-500" />;
            default:
                return <FileText className="h-4 w-4 text-gray-500" />;
        }
    };

    const filteredOrders = orderHistory.filter(order => {
        if (statusFilter === 'all') return true;
        return order.status.toLowerCase() === statusFilter.toLowerCase();
    });

    const {
        totalPages,
        handlePageChange,
        handleItemsPerPageChange,
        getVisiblePageNumbers
    } = usePagination(filteredOrders.length, itemsPerPage, currentPage, setCurrentPage, setItemsPerPage);

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="text-center text-gray-600 py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                    Loading order history...
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
        <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 space-y-4 md:space-y-0">
                <h2 className="text-xl font-semibold text-gray-700 flex items-center">
                    <FileText className="mr-2 h-5 w-5 text-blue-500" />
                    Order History
                    <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                        {filteredOrders.length} orders
                    </span>
                </h2>
                <div className="flex flex-wrap items-center gap-2">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="border rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">All Orders</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="pending">Pending</option>
                    </select>
                    <div className="flex border rounded">
                        <button
                            onClick={() => setViewMode('card')}
                            className={`p-2 ${viewMode === 'card' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600'} rounded-l hover:bg-blue-400 hover:text-white transition-colors`}
                        >
                            <Grid className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('table')}
                            className={`p-2 ${viewMode === 'table' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600'} rounded-r hover:bg-blue-400 hover:text-white transition-colors`}
                        >
                            <List className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>

            {filteredOrders.length === 0 ? (
                <div className="text-center py-12">
                    <FileText className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                    <p className="text-gray-500 text-lg mb-2">No order history found</p>
                    <p className="text-gray-400 text-sm">Your completed and past orders will appear here.</p>
                </div>
            ) : (
                <>
                    {viewMode === 'card' && (
                        <div className="space-y-4">
                            {paginatedOrders.map(order => (
                                <div 
                                    key={order.id} 
                                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                                    onClick={() => handleOrderDetails(order)}
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center space-x-3">
                                                    {getOrderTypeIcon(order.order_type)}
                                                    <div>
                                                        <h3 className="font-semibold text-gray-800 text-lg">
                                                            {order.service_name || 'Custom Order'}
                                                        </h3>
                                                        <p className="text-sm text-gray-500 flex items-center mt-1">
                                                            {order.order_type_display}
                                                            {order.total_items > 0 && (
                                                                <span className="ml-2 bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                                                                    {order.total_items} items
                                                                </span>
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <span className={`px-3 py-1 text-xs font-medium rounded-full flex items-center space-x-1
                                                        ${order.status === 'Completed' ? 'bg-green-100 text-green-800 border border-green-200' :
                                                          order.status === 'Cancelled' ? 'bg-red-100 text-red-800 border border-red-200' :
                                                          'bg-yellow-100 text-yellow-800 border border-yellow-200'}`}>
                                                        {getStatusIcon(order.status)}
                                                        <span>{order.status}</span>
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
                                                <div className="flex items-center">
                                                    <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                                                    <span>Ordered: {order.created_at_formatted}</span>
                                                </div>
                                                <div className="flex items-center">
                                                    <Clock className="h-4 w-4 mr-2 text-gray-400" />
                                                    <span>Delivered: {order.delivery_date_formatted}</span>
                                                </div>
                                                <div className="flex items-center">
                                                    <span className="font-semibold text-gray-800">
                                                        ₱{formatCurrency(order.total_amount)}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className={`px-2 py-1 text-xs rounded-full 
                                                        ${order.payment_status === 'paid' ? 'bg-green-100 text-green-800' : 
                                                          'bg-red-100 text-red-800'}`}>
                                                        {order.payment_status?.toUpperCase() || 'UNPAID'}
                                                    </span>
                                                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                                        {order.payment_method?.toUpperCase() || 'COD'}
                                                    </span>
                                                </div>
                                            </div>

                                            {order.items && order.items.length > 0 && (
                                                <div className="mt-3 pt-3 border-t border-gray-100">
                                                    <p className="text-sm text-gray-500 mb-2">Items included:</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {order.items.slice(0, 4).map((item) => (
                                                            <div key={item.id} className="flex items-center space-x-2 bg-gray-50 rounded-lg px-3 py-2">
                                                                {item.item_image && (
                                                                    <img 
                                                                        src={item.item_image} 
                                                                        alt={item.item_name}
                                                                        className="h-6 w-6 rounded object-cover"
                                                                    />
                                                                )}
                                                                <span className="text-sm text-gray-700">
                                                                    {item.item_name} 
                                                                    <span className="text-gray-500 text-xs ml-1">
                                                                        (x{item.quantity})
                                                                    </span>
                                                                </span>
                                                            </div>
                                                        ))}
                                                        {order.items.length > 4 && (
                                                            <span className="bg-gray-100 text-gray-500 text-xs px-3 py-2 rounded-lg">
                                                                +{order.items.length - 4} more items
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

                    {viewMode === 'table' && (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {paginatedOrders.map(order => (
                                        <tr 
                                            key={order.id} 
                                            className="hover:bg-gray-50 cursor-pointer"
                                            onClick={() => handleOrderDetails(order)}
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    {getOrderTypeIcon(order.order_type)}
                                                    <div className="ml-3">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {order.service_name || 'Custom Order'}
                                                        </div>
                                                        <div className="text-sm text-gray-500">{order.order_type_display}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{order.created_at_formatted}</div>
                                                <div className="text-sm text-gray-500">{order.delivery_date_formatted}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    order.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                                    order.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                                                    'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                ₱{formatCurrency(order.total_amount)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{order.payment_method?.toUpperCase()}</div>
                                                <span className={`text-xs ${order.payment_status === 'paid' ? 'text-green-600' : 'text-red-600'}`}>
                                                    {order.payment_status?.toUpperCase()}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination Controls */}
                    <div className="mt-6 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-700">Show</span>
                            <select
                                value={itemsPerPage}
                                onChange={handleItemsPerPageChange}
                                className="border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value={5}>5</option>
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={50}>50</option>
                            </select>
                            <span className="text-sm text-gray-700">
                                entries (showing {startIndex + 1}-{Math.min(endIndex, filteredOrders.length)} of {filteredOrders.length})
                            </span>
                        </div>

                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="p-2 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>

                            {getVisiblePageNumbers().map((page, index) => (
                                page === '...' ? (
                                    <span key={`ellipsis-${index}`} className="px-3 py-2 text-gray-500">...</span>
                                ) : (
                                    <button
                                        key={page}
                                        onClick={() => handlePageChange(page)}
                                        className={`px-3 py-2 border rounded ${
                                            currentPage === page
                                                ? 'bg-blue-500 text-white border-blue-500'
                                                : 'hover:bg-gray-100'
                                        }`}
                                    >
                                        {page}
                                    </button>
                                )
                            ))}

                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="p-2 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </>
            )}

            {/* Order Details Modal */}
            {isModalOpen && selectedOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold text-gray-800 flex items-center">
                                <FileText className="mr-2 h-6 w-6 text-blue-500" />
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
                            <div className="bg-gray-50 rounded-lg p-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="text-lg font-semibold text-gray-800">
                                            {selectedOrder.service_name || 'Custom Order'}
                                        </h4>
                                        <p className="text-gray-600">{selectedOrder.order_type_display}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-green-600">
                                            ₱{formatCurrency(selectedOrder.total_amount)}
                                        </p>
                                        <p className="text-sm text-gray-500">Total Amount</p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="text-center">
                                    <div className="bg-blue-100 text-blue-800 rounded-full p-3 inline-block">
                                        <Calendar className="h-6 w-6" />
                                    </div>
                                    <p className="text-sm text-gray-500 mt-2">Order Date</p>
                                    <p className="font-medium text-gray-800">{selectedOrder.created_at_formatted}</p>
                                </div>
                                <div className="text-center">
                                    <div className="bg-green-100 text-green-800 rounded-full p-3 inline-block">
                                        <Clock className="h-6 w-6" />
                                    </div>
                                    <p className="text-sm text-gray-500 mt-2">Delivery Date</p>
                                    <p className="font-medium text-gray-800">{selectedOrder.delivery_date_formatted}</p>
                                </div>
                                <div className="text-center">
                                    <div className={`rounded-full p-3 inline-block ${
                                        selectedOrder.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                        selectedOrder.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                                        'bg-yellow-100 text-yellow-800'
                                    }`}>
                                        {getStatusIcon(selectedOrder.status)}
                                    </div>
                                    <p className="text-sm text-gray-500 mt-2">Status</p>
                                    <p className="font-medium text-gray-800">{selectedOrder.status}</p>
                                </div>
                            </div>

                            <div className="border rounded-lg p-4">
                                <h4 className="text-lg font-semibold text-gray-800 mb-3">Payment Information</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-500">Payment Status</p>
                                        <p className={`px-3 py-1 inline-flex items-center space-x-1 rounded-full text-sm font-medium ${
                                            selectedOrder.payment_status === 'paid' ? 'bg-green-100 text-green-800' : 
                                            'bg-red-100 text-red-800'
                                        }`}>
                                            {selectedOrder.payment_status === 'paid' ? 
                                                <CheckCircle className="h-4 w-4" /> : 
                                                <XCircle className="h-4 w-4" />
                                            }
                                            <span>{selectedOrder.payment_status?.toUpperCase() || 'UNPAID'}</span>
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Payment Method</p>
                                        <p className="font-medium text-gray-800">
                                            {selectedOrder.payment_method?.toUpperCase() || 'Cash on Delivery'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="border rounded-lg p-4">
                                <h4 className="text-lg font-semibold text-gray-800 mb-3">Delivery Address</h4>
                                <p className="text-gray-700">{selectedOrder.address}</p>
                            </div>

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
                                    </div>
                                </div>
                            )}

                            {selectedOrder.items && selectedOrder.items.length > 0 && (
                                <div className="border rounded-lg p-4">
                                    <h4 className="text-lg font-semibold text-gray-800 mb-4">Order Items</h4>
                                    <div className="space-y-3">
                                        {selectedOrder.items.map((item) => (
                                            <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                <div className="flex items-center space-x-3">
                                                    {item.item_image && (
                                                        <img 
                                                            src={item.item_image} 
                                                            alt={item.item_name}
                                                            className="h-12 w-12 rounded object-cover"
                                                        />
                                                    )}
                                                    <div>
                                                        <p className="font-medium text-gray-800">{item.item_name}</p>
                                                        {item.item_details && (
                                                            <p className="text-sm text-gray-500">{item.item_details}</p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-medium text-gray-800">
                                                        ₱{formatCurrency(item.item_price)} × {item.quantity}
                                                    </p>
                                                    <p className="text-lg font-semibold text-green-600">
                                                        ₱{formatCurrency(item.quantity * item.item_price)}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="mt-6 flex justify-end">
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

export default ClientOrderHistory;