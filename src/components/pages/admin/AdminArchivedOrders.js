import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import { FaTable, FaThLarge, FaUndo, FaTrash, FaChevronLeft, FaChevronRight, FaExclamationTriangle } from 'react-icons/fa';

// Import custom hooks
import { useAuth } from '../../hooks/admin/useAuth';
import { useOrderView } from '../../hooks/admin/useOrderView';
import { useStatusMessage } from '../../hooks/admin/useStatusMessage';
import axios from 'axios';

const n = process.env.REACT_APP_API_URL;

const AdminArchivedOrders = () => {
  const { userId, userName } = useAuth();
  const { statusMessage, showSuccess, showError } = useStatusMessage();
  const {
    viewMode,
    setViewMode,
    getStatusColor,
    getPaymentStatusColor,
    formatDate,
    formatDateTime
  } = useOrderView('table');

  const [orders, setOrders] = useState([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage, setOrdersPerPage] = useState(10);
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    orderId: null,
    type: 'restore' // 'restore' or 'delete'
  });

  // Helper function to format currency
  const formatCurrency = (amount) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-PH', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(numAmount);
  };

  // Fetch archived orders
  const fetchArchivedOrders = async (page, limit) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `${n}/api/components/archivedOrders.php?page=${page}&limit=${limit}`
      );
      
      const data = response.data;
      
      if (data.orders) {
        setOrders(data.orders);
        setTotalOrders(data.total);
      } else if (Array.isArray(data)) {
        setOrders(data);
        setTotalOrders(data.length);
      } else {
        console.error('Unexpected response format:', data);
        setOrders([]);
        setTotalOrders(0);
      }
    } catch (error) {
      console.error('Error fetching archived orders:', error);
      setError(error.message);
      setOrders([]);
      setTotalOrders(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchArchivedOrders(currentPage, ordersPerPage);
  }, [currentPage, ordersPerPage]);

  // Restore order
  const handleRestoreOrder = async (orderId) => {
    const order = orders.find(o => o.id === orderId);
    const orderInfo = order ? `Order #${order.id} for ${order.username || 'N/A'} (₱${formatCurrency(order.total_amount)})` : 'this order';
    
    showConfirmation(
      'Restore Order',
      `Are you sure you want to restore ${orderInfo}? It will be moved back to active orders.`,
      async (id) => {
        try {
          const response = await axios.post(`${n}/api/components/restoreClientOrder.php`, {
            orderId: id,
            user_id: userId,
            user_name: userName
          });

          if (response.data.success) {
            showSuccess('Order restored successfully');
            fetchArchivedOrders(currentPage, ordersPerPage);
          } else {
            throw new Error(response.data.message || 'Failed to restore order');
          }
        } catch (error) {
          console.error('Error restoring order:', error);
          showError('Failed to restore order. Please try again.');
        }
      },
      orderId,
      'restore'
    );
  };

  // Permanently delete order
  const handlePermanentDelete = async (orderId) => {
    const order = orders.find(o => o.id === orderId);
    const orderInfo = order ? `Order #${order.id} for ${order.username || 'N/A'} (₱${formatCurrency(order.total_amount)})` : 'this order';
    
    showConfirmation(
      'Permanently Delete Order',
      `Are you sure you want to PERMANENTLY delete ${orderInfo}? This action cannot be undone and all related data will be removed.`,
      async (id) => {
        try {
          const response = await axios.post(`${n}/api/components/permanentDeleteOrder.php`, {
            orderId: id,
            user_id: userId,
            user_name: userName
          });

          if (response.data.success) {
            showSuccess('Order permanently deleted');
            fetchArchivedOrders(currentPage, ordersPerPage);
          } else {
            throw new Error(response.data.message || 'Failed to delete order');
          }
        } catch (error) {
          console.error('Error deleting order:', error);
          showError('Failed to delete order. Please try again.');
        }
      },
      orderId,
      'delete'
    );
  };

  // Show confirmation modal
  const showConfirmation = (title, message, onConfirm, orderId, type) => {
    setConfirmationModal({
      isOpen: true,
      title,
      message,
      onConfirm,
      orderId,
      type
    });
  };

  // Close confirmation modal
  const closeConfirmation = () => {
    setConfirmationModal({
      isOpen: false,
      title: '',
      message: '',
      onConfirm: null,
      orderId: null,
      type: 'restore'
    });
  };

  // Handle confirmation
  const handleConfirm = async () => {
    if (confirmationModal.onConfirm) {
      await confirmationModal.onConfirm(confirmationModal.orderId);
    }
    closeConfirmation();
  };

  // Pagination
  const totalPages = Math.ceil(totalOrders / ordersPerPage);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleItemsPerPageChange = (e) => {
    setOrdersPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const getVisiblePageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
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
    <AdminLayout currentPage="archived-orders">
      <div className="flex-grow p-3">
        <div className='bg-white rounded-lg shadow-md p-4 md:p-6 mb-6'>
          <div className="container mx-auto px-4 py-3">
            {/* Status Message Display */}
            {statusMessage.message && (
              <div className={`mb-4 p-3 rounded-lg ${statusMessage.type === 'success'
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
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Archived Orders</h1>
                <p className='text-gray-600 text-sm mb-0'>view and manage archived customer orders</p>
              </div>

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

              <div className="text-sm text-gray-600">
                Showing {start} to {end} of {totalOrders} orders
              </div>
            </div>

            {isLoading && <p className="text-gray-500 py-4">Loading archived orders...</p>}

            {!isLoading && viewMode === 'table' ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Archived At</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {Array.isArray(orders) && orders.map(order => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.username || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₱{formatCurrency(order.total_amount)}</td>
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDateTime(order.archived_at)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleRestoreOrder(order.id)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Restore Order"
                            >
                              <FaUndo className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handlePermanentDelete(order.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Permanently Delete"
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
                        </div>
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Amount:</span>
                          <span className="font-semibold">₱{formatCurrency(order.total_amount)}</span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-gray-600">Payment Status:</span>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(order.payment_status)}`}>
                            {order.payment_status || "Pending"}
                          </span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-gray-600">Archived At:</span>
                          <span>{formatDateTime(order.archived_at)}</span>
                        </div>

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
                        <button
                          onClick={() => handleRestoreOrder(order.id)}
                          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          Restore
                        </button>
                        <button
                          onClick={() => handlePermanentDelete(order.id)}
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
                <p className="text-gray-500">No archived orders found</p>
              </div>
            )}

            {/* Pagination Controls */}
            {!isLoading && totalPages > 1 && (
              <div className="mt-6 px-4 py-3 bg-gray-50 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FaChevronLeft className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center space-x-1">
                    {getVisiblePageNumbers().map((pageNum, index) => (
                      <React.Fragment key={index}>
                        {pageNum === '...' ? (
                          <span className="px-3 py-2 text-sm text-gray-500">...</span>
                        ) : (
                          <button
                            onClick={() => handlePageChange(pageNum)}
                            className={`px-3 py-2 text-sm font-medium rounded-md ${
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

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FaChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-2 text-center text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Custom Confirmation Modal */}
        {confirmationModal.isOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex items-start mb-4">
                <div className={`flex-shrink-0 mr-3 ${confirmationModal.type === 'delete' ? 'text-red-500' : 'text-blue-500'}`}>
                  <FaExclamationTriangle className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    {confirmationModal.title}
                  </h3>
                  <p className="text-gray-600">
                    {confirmationModal.message}
                  </p>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={closeConfirmation}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    confirmationModal.type === 'delete'
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {confirmationModal.type === 'delete' ? 'Delete Permanently' : 'Restore Order'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminArchivedOrders;