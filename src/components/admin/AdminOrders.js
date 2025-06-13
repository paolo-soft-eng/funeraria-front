import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AdminLayout from './AdminLayout';
import { FaTable, FaThLarge, FaCheck, FaTrash } from 'react-icons/fa';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'card'
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Add mobile detection
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setViewMode('card');
      }
    };

    // Initial check
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    axios.get('http://localhost/apii/components/adminOrders.php')
      .then(response => {
        const data = response.data;
        console.log(data);
        let parsedData;
        try {
          parsedData = JSON.parse(data);
        } catch (e) {
          parsedData = data;
        }
        if (Array.isArray(parsedData)) {
          setOrders(parsedData);
        } else {
          console.error('Expected an array but received:', parsedData);
        }
      })
      .catch(error => {
        console.error('Error fetching orders:', error);
      });
  }, []);

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
        payment_status: 'paid'
      });

      if (response.data.success) {
        // Update the orders list with the new status
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
          orderId: orderId
        });
  
        if (response.data.success) {
          // Remove the deleted order from the list
          setOrders(orders.filter(order => order.id !== orderId));
        } else {
          console.error('Failed to delete order:', response.data.message);
        }
      } catch (error) {
        console.error('Error deleting order:', error);
      }
    }
  };

  return (
    <AdminLayout currentPage="orders">
      <div className="flex-grow p-4 md:p-6">
        <div className="max-w-7xl mx-auto bg-white p-6 rounded-lg shadow-md">
          <div className="container mx-auto px-4 py-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Client Orders</h1>
              {!isMobile && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => setViewMode('table')}
                    className={`p-2 rounded-md ${viewMode === 'table' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'}`}
                  >
                    <FaTable className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('card')}
                    className={`p-2 rounded-md ${viewMode === 'card' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'}`}
                  >
                    <FaThLarge className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>

            {viewMode === 'table' ? (
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
            )}

            {/* Empty state */}
            {(!Array.isArray(orders) || orders.length === 0) && (
              <div className="text-center py-10">
                <p className="text-gray-500">No orders found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminOrders;