import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import AdminLayout from './AdminLayout';
import { FaTable, FaThLarge, FaCheck, FaTrash, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { EmailContext } from '../utils/EmailContext';
import { useNavigate } from 'react-router-dom';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'card'
  const { email } = useContext(EmailContext);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage, setOrdersPerPage] = useState(10);
  const [totalOrders, setTotalOrders] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (email) {
      fetch(
        `http://localhost/apii/components/getUserId.php?email=${encodeURIComponent(
          email
        )}`
      )
        .then((response) => response.json())
        .then((data) => {
          if (data.userId) {
            setUserId(data.userId);
            setUserName(data.userName || 'Admin');
            setIsLoggedIn(true);
          } else {
            setIsLoggedIn(false);
            navigate("/auth");
          }
        })
        .catch((error) => {
          console.error("Error fetching user ID:", error);
          setIsLoggedIn(false);
          navigate("/auth");
        });
    } else {
      setIsLoggedIn(false);
      navigate("/auth");
    }
  }, [email, navigate]);

  useEffect(() => {
    fetchOrders();
  }, [currentPage, ordersPerPage]);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `http://localhost/apii/components/adminOrders.php?page=${currentPage}&limit=${ordersPerPage}`
      );
      
      const data = response.data;
      console.log(data);
      
      if (data.orders) {
        setOrders(data.orders);
        setTotalOrders(data.total);
      } else if (Array.isArray(data)) {
        // Fallback for non-paginated response
        setOrders(data);
        setTotalOrders(data.length);
      } else {
        console.error('Unexpected response format:', data);
        setOrders([]);
        setTotalOrders(0);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
      setTotalOrders(0);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status) => {
    return status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const handleAcceptOrder = async (orderId) => {
    try {
      const response = await axios.post('http://localhost/apii/components/updateClientOrderStatus.php', {
        orderId: orderId,
        status: 'completed',
        payment_status: 'paid',
        user_id: userId,
        user_name: userName
      });

      if (response.data.success) {
        setOrders(orders.map(order =>
          order.id === orderId
            ? { ...order, status: 'completed', payment_status: 'paid' }
            : order
        ));
      } else {
        console.error('Failed to update order:', response.data.message);
      }
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        const response = await axios.post('http://localhost/apii/components/deleteClientOrder.php', {
          orderId: orderId,
          user_id: userId,
          user_name: userName
        });

        if (response.data.success) {
          // Refresh orders after deletion
          fetchOrders();
        } else {
          console.error('Failed to delete order:', response.data.message);
        }
      } catch (error) {
        console.error('Error deleting order:', error);
      }
    }
  };

  // Pagination functions
  const totalPages = Math.ceil(totalOrders / ordersPerPage);
  
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleOrdersPerPageChange = (e) => {
    setOrdersPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  const getVisiblePageNumbers = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  return (
    <AdminLayout currentPage="orders">
      <div className="flex-grow p-4 md:p-6">
        <div className="max-w-7xl mx-auto bg-white p-6 rounded-lg shadow-md">
          <div className="container mx-auto px-4 py-6">
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
                  onChange={handleOrdersPerPageChange}
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
                Showing {orders.length === 0 ? 0 : (currentPage - 1) * ordersPerPage + 1} to{' '}
                {Math.min(currentPage * ordersPerPage, totalOrders)} of {totalOrders} orders
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.order_items}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.service_name || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.address}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(order.delivery_date).toLocaleDateString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(order.created_at).toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex space-x-2">
                            {order.status !== 'completed' && (
                              <button
                                onClick={() => handleAcceptOrder(order.id)}
                                className="text-green-600 hover:text-green-900"
                                title="Accept Order"
                              >
                                <FaCheck className="w-5 h-5" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteOrder(order.id)}
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
                          <span>{new Date(order.delivery_date).toLocaleDateString()}</span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-gray-600">Created At:</span>
                          <span>{new Date(order.created_at).toLocaleString()}</span>
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
                            onClick={() => handleAcceptOrder(order.id)}
                            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                          >
                            Accept
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteOrder(order.id)}
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