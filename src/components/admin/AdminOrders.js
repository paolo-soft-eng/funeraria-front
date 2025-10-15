import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import { FaTable, FaThLarge, FaCheck, FaTrash, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

// Import custom hooks
import { useAuth } from '../hooks/admin/useAuth';
import { useOrders } from '../hooks/admin/useOrders';
import { useOrderActions } from '../hooks/admin/useOrderActions';
import { usePagination } from '../hooks/admin/usePagination';
import { useOrderView } from '../hooks/admin/useOrderView';
import { useStatusMessage } from '../hooks/admin/useStatusMessage';

const AdminOrders = () => {
  // Use custom hooks
  const { userId, userName } = useAuth();
  const { statusMessage, showSuccess, showError, clearMessage } = useStatusMessage();
  
  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage, setOrdersPerPage] = useState(10);

  // Initialize orders hook
  const {
    orders,
    totalOrders,
    isLoading,
    error,
    fetchOrders,
    setOrders
  } = useOrders();

  // Use your existing pagination hook
  const {
    totalPages,
    handlePageChange,
    handleItemsPerPageChange,
    getVisiblePageNumbers,
  } = usePagination(totalOrders, ordersPerPage, currentPage, setCurrentPage, setOrdersPerPage);

  const {
    handleAcceptOrder,
    handleDeleteOrder
  } = useOrderActions(userId, userName);

  const {
    viewMode,
    setViewMode,
    getStatusColor,
    getPaymentStatusColor,
    formatDate,
    formatDateTime
  } = useOrderView('table');

  // Fetch orders when pagination changes
  useEffect(() => {
    fetchOrders(currentPage, ordersPerPage);
  }, [currentPage, ordersPerPage]);

  // Enhanced order actions with status messages
  const handleAcceptOrderWithFeedback = async (orderId) => {
    try {
      const result = await handleAcceptOrder(orderId);
      if (result.success) {
        setOrders(orders.map(order =>
          order.id === orderId
            ? { ...order, status: 'completed', payment_status: 'paid' }
            : order
        ));
        showSuccess('Order accepted successfully');
      }
    } catch (error) {
      console.error('Error updating order:', error);
      showError('Failed to accept order. Please try again.');
    }
  };

  const handleDeleteOrderWithFeedback = async (orderId) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        const result = await handleDeleteOrder(orderId);
        if (result.success) {
          showSuccess('Order deleted successfully');
          fetchOrders(currentPage, ordersPerPage); // Refresh orders after deletion
        }
      } catch (error) {
        console.error('Error deleting order:', error);
        showError('Failed to delete order. Please try again.');
      }
    }
  };

  // Calculate display range
  const getDisplayRange = () => {
    if (totalOrders === 0) {
      return { start: 0, end: 0 };
    }
    const start = (currentPage - 1) * ordersPerPage + 1;
    const end = Math.min(currentPage * ordersPerPage, totalOrders);
    return { start, end };
  };

  const { start, end } = getDisplayRange();

  return (
    <AdminLayout currentPage="orders">
      <div className="flex-grow p-3">
        <div className="max-w-7xl mx-auto bg-white p-6 rounded-lg shadow-md">
          <div className="container mx-auto px-4 py-3">
            {/* Status Message Display */}
            {statusMessage.message && (
              <div className={`mb-4 p-3 rounded-lg ${
                statusMessage.type === 'success' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {statusMessage.message}
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                <div className="flex items-center">
                  <span className="text-red-700">{error}</span>
                </div>
              </div>
            )}

            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Client Orders</h1>
              <div className="flex space-x-2">
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-2 rounded-md ${viewMode === 'table' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
                    }`}
                >
                  <FaTable className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('card')}
                  className={`p-2 rounded-md ${viewMode === 'card' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
                    }`}
                >
                  <FaThLarge className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Orders per page selector */}
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <label htmlFor="ordersPerPage" className="text-sm text-gray-600">
                  Orders per page:
                </label>
                <select
                  id="ordersPerPage"
                  value={ordersPerPage}
                  onChange={handleItemsPerPageChange}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>
              
              {/* Orders count display */}
              <div className="text-sm text-gray-600">
                Showing {start} to {end} of {totalOrders} orders
              </div>
            </div>

            {isLoading && <p className="text-gray-500 py-4">Loading orders...</p>}
            
            {!isLoading && viewMode === 'table' ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User ID</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delivery Date</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {Array.isArray(orders) && orders.map(order => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.username || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.user_id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₱{order.total_amount}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="space-y-1">
                            <span className="block text-gray-500">{order.payment_method}</span>
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPaymentStatusColor(order.payment_status)}`}>
                              {order.payment_status}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.order_items || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.service_name || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.address}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(order.delivery_date)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDateTime(order.created_at)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex space-x-2">
                            {order.status !== 'completed' && (
                              <button
                                onClick={() => handleAcceptOrderWithFeedback(order.id)}
                                className="text-green-600 hover:text-green-900"
                                title="Accept Order"
                              >
                                <FaCheck className="w-5 h-5" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteOrderWithFeedback(order.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Delete Order"
                            >
                              <FaTrash className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              !isLoading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.isArray(orders) && orders.map(order => (
                    <div key={order.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">Order #{order.id}</h3>
                          <p className="text-sm text-gray-500">Username: {order.username || 'N/A'}</p>
                          <p className="text-sm text-gray-500">User ID: {order.user_id}</p>
                        </div>
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Amount:</span>
                          <span className="font-semibold">₱{order.total_amount}</span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-gray-600">Payment Method:</span>
                          <span>{order.payment_method}</span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-gray-600">Payment Status:</span>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(order.payment_status)}`}>
                            {order.payment_status}
                          </span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-gray-600">Delivery Date:</span>
                          <span>{formatDate(order.delivery_date)}</span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-gray-600">Created At:</span>
                          <span>{formatDateTime(order.created_at)}</span>
                        </div>

                        {order.address && (
                          <div className="mt-3 pt-3 border-t">
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Address:</span> {order.address}
                            </p>
                          </div>
                        )}

                        {order.order_items && (
                          <div className="mt-3 pt-3 border-t">
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Items:</span> {order.order_items}
                            </p>
                          </div>
                        )}

                        {order.service_name && (
                          <div className="mt-3 pt-3 border-t">
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Service:</span> {order.service_name}
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="mt-4 flex justify-end space-x-2">
                        {order.status !== 'completed' && (
                          <button
                            onClick={() => handleAcceptOrderWithFeedback(order.id)}
                            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                          >
                            Accept
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteOrderWithFeedback(order.id)}
                          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}

            {/* Empty state */}
            {!isLoading && (!Array.isArray(orders) || orders.length === 0) && (
              <div className="text-center py-10">
                <p className="text-gray-500">No orders found</p>
              </div>
            )}

            {/* Pagination Controls */}
            {!isLoading && totalPages > 1 && (
              <div className="mt-6 px-4 py-3 bg-gray-50 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  {/* Previous button */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                      <FaChevronLeft className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Page numbers */}
                  <div className="flex items-center space-x-1">
                    {getVisiblePageNumbers().map((pageNum, index) => (
                      <React.Fragment key={index}>
                        {pageNum === '...' ? (
                          <span className="px-3 py-2 text-sm text-gray-500">
                            ...
                          </span>
                        ) : (
                          <button
                            onClick={() => handlePageChange(pageNum)}
                            className={`px-3 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 ${
                              currentPage === pageNum
                                ? 'bg-gray-600 text-white'
                                : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        )}
                      </React.Fragment>
                    ))}
                  </div>

                  {/* Next button */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                      <FaChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Page info */}
                <div className="mt-2 text-center text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminOrders;