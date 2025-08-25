import React, { useState, useEffect, useContext } from 'react';
import { fetchServices, placeOrder, fetchCasketsByServiceId, fetchFlowersByServiceId, API_BASE_URL } from '../Api';
import { EmailContext } from '../EmailContext';

const ClientServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [notification, setNotification] = useState(null);
  const { email } = useContext(EmailContext);

  // Notification function
  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  useEffect(() => {
    if (email) {
      // Fetch user ID based on email
      fetch(`http://localhost/apii/components/getUserId.php?email=${encodeURIComponent(email)}`)
        .then(response => response.json())
        .then(data => {
          if (data.userId) {
            setUserId(data.userId);
            setIsLoggedIn(true);
          }
        })
        .catch(error => console.error('Error fetching user ID:', error));
    }
  }, [email]);

  const fetchServicesData = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await fetchServices();
      setServices(data || []); // Ensure we always have an array

    } catch (error) {
      console.error('Error fetching services:', error);
      setError(error.message);
      setServices([]); // Set empty array on error

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServicesData();
  }, []);

  const getInclusionIcon = (inclusionsCount) => {
    if (!inclusionsCount) return null;

    const colors = {
      low: 'bg-blue-50 text-blue-600',
      medium: 'bg-purple-50 text-purple-600',
      high: 'bg-indigo-50 text-indigo-600'
    };

    const colorClass = inclusionsCount <= 3 ? colors.low :
      inclusionsCount <= 6 ? colors.medium :
        colors.high;

    return (
      <div className="flex justify-center mb-4">
        <div className={`h-16 w-16 rounded-full flex items-center justify-center ${colorClass}`}>
          <span className="text-xl font-bold">{inclusionsCount}{inclusionsCount > 6 ? '+' : ''}</span>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg shadow-sm">
          <p className="text-lg">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      {/* Notification Component */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 animate-fade-in">
          <div className={`px-4 py-3 rounded-lg shadow-lg ${
            notification.type === 'success' ? 'bg-green-500 text-white' :
            notification.type === 'error' ? 'bg-red-500 text-white' :
            notification.type === 'warning' ? 'bg-yellow-500 text-white' :
            'bg-blue-500 text-white'
          }`}>
            <div className="flex items-center justify-between">
              <span>{notification.message}</span>
              <button 
                onClick={() => setNotification(null)}
                className="ml-4 text-white hover:text-gray-200"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
            Gomez Service Packages
          </h1>
          <p className="mt-4 text-xl text-gray-500">
            Choose from our carefully curated funeral service packages
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => {
            const inclusions = Array.isArray(service.inclusions) ? service.inclusions : [];

            return (
              <div
                key={service.id}
                className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer transform hover:-translate-y-1"
                onClick={() => setSelectedService(service)}
              >
                <div className="p-6">
                  {getInclusionIcon(inclusions.length)}
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">{service.name}</h2>
                  <p className="text-gray-600 mb-6 line-clamp-3">{service.description}</p>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center text-sm text-gray-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      {inclusions.length} inclusions
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-6 py-4">
                  {!isLoggedIn ? (
                    <div className="bg-yellow-50 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-r-lg">
                      <p className="font-medium">Please log in to view service details.</p>
                    </div>
                  ) : (
                    <button
                      className="w-full bg-gray-900 text-white py-2 px-4 rounded-lg hover:bg-gray-800 transition-colors duration-200"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedService(service);
                      }}
                    >
                      View Details
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedService && (
        <ServiceDetail
          service={selectedService}
          onClose={() => setSelectedService(null)}
          refetchServices={fetchServicesData}
          showNotification={showNotification}
        />
      )}
    </div>
  );
};

const ServiceDetail = ({ service, onClose, refetchServices, showNotification }) => {
  const [showOrderForm, setShowOrderForm] = useState(false);
  const { email } = useContext(EmailContext);
  const [formData, setFormData] = useState({
    service_id: service.id,
    customer_name: '',
    email: email,
    customer_phone: ''
  });
  const [orderStatus, setOrderStatus] = useState(null);
  const [caskets, setCaskets] = useState([]);
  const [flowers, setFlowers] = useState([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [selectedCaskets, setSelectedCaskets] = useState([]);
  const [selectedFlowers, setSelectedFlowers] = useState([]);
  const [userId, setUserId] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    if (email) {
      // Fetch user ID based on email
      fetch(`http://localhost/apii/components/getUserId.php?email=${encodeURIComponent(email)}`)
        .then(response => response.json())
        .then(data => {
          if (data.userId) {
            setUserId(data.userId);
            setIsLoggedIn(true);
          }
        })
        .catch(error => console.error('Error fetching user ID:', error));
    }
  }, [email]);

  useEffect(() => {
    const fetchServiceItems = async () => {
      setLoadingItems(true);
      try {
        const [casketData, flowerData] = await Promise.all([
          fetchCasketsByServiceId(service.id),
          fetchFlowersByServiceId(service.id)
        ]);
        setCaskets(casketData);
        setFlowers(flowerData);
      } catch (err) {
        console.error("Failed to load service items:", err);
        showNotification("Failed to load service items", "error");
      } finally {
        setLoadingItems(false);
      }
    };

    fetchServiceItems();
  }, [service.id, showNotification]);

  const handleCasketSelect = (casket) => {
    setSelectedCaskets(prev => {
      const isSelected = prev.some(c => c.id === casket.id);
      if (isSelected) {
        return prev.filter(c => c.id !== casket.id);
      } else {
        return [...prev, casket];
      }
    });
  };

  const handleFlowerSelect = (flower) => {
    setSelectedFlowers(prev => {
      const isSelected = prev.some(f => f.id === flower.id);
      if (isSelected) {
        return prev.filter(f => f.id !== flower.id);
      } else {
        return [...prev, flower];
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setOrderStatus({ type: 'loading', message: 'Processing your order...' });

    try {
      const orderData = {
        ...formData,
        selected_caskets: selectedCaskets.map(c => c.id),
        selected_flowers: selectedFlowers.map(f => f.id)
      };
      await placeOrder(orderData);
      setOrderStatus({ type: 'success', message: 'Order placed successfully!' });
      showNotification('Order placed successfully!', 'success');
      setFormData({
        ...formData,
        customer_name: '',
        email: email,
        customer_phone: ''
      });
      setSelectedCaskets([]);
      setSelectedFlowers([]);

      setTimeout(() => {
        refetchServices();
        setShowOrderForm(false);
        setOrderStatus(null);
        onClose();
      }, 3000);
    } catch (error) {
      setOrderStatus({ type: 'error', message: 'Failed to place order. Please try again.' });
      showNotification('Failed to place order. Please try again.', 'error');
    }
  };

  const inclusions = Array.isArray(service.inclusions) ? service.inclusions : [];

  return (
    <div
      className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 overflow-y-auto py-6"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-4xl relative mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors duration-200"
          onClick={onClose}
          type="button"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">{service.name}</h2>
          <p className="text-lg text-gray-600 mb-8">{service.description}</p>

          {!showOrderForm ? (
            <>
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Package Inclusions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {inclusions.map((inclusion, i) => (
                    <div key={i} className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">{inclusion}</span>
                    </div>
                  ))}
                </div>
              </div>

              {loadingItems ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
                </div>
              ) : (
                <>
                  {caskets.length > 0 && (
                    <div className="mb-8">
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Casket Options</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {caskets.map((casket) => (
                          <div
                            key={casket.id}
                            className={`bg-white rounded-xl shadow-sm overflow-hidden cursor-pointer transition-all duration-200 ${selectedCaskets.some(c => c.id === casket.id) ? 'ring-2 ring-gray-900' : 'hover:shadow-md'
                              }`}
                            onClick={() => service.name?.toLowerCase().includes('customized') && handleCasketSelect(casket)}
                          >
                            {casket.image && (
                              <div className="h-48 w-full">
                                <img
                                  src={`${API_BASE_URL}/apii/components/uploads/caskets/${casket.image}`}
                                  alt={casket.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = `${API_BASE_URL}/apii/components/uploads/default.jpg`;
                                  }}
                                />
                              </div>
                            )}
                            <div className="p-4">
                              <h4 className="font-semibold text-lg text-gray-900">{casket.name}</h4>
                              <p className="text-gray-600 mt-1">{casket.description}</p>
                              {service.name?.toLowerCase().includes('customized') && (
                                <>
                                  <p className="text-gray-900 font-semibold mt-2">₱{parseFloat(casket.price).toFixed(2)}</p>
                                  <div className="mt-2">
                                    <span className={`inline-block px-3 py-1 rounded-full text-sm ${selectedCaskets.some(c => c.id === casket.id)
                                        ? 'bg-gray-900 text-white'
                                        : 'bg-gray-100 text-gray-700'
                                      }`}>
                                      {selectedCaskets.some(c => c.id === casket.id) ? 'Selected' : 'Click to select'}
                                    </span>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {flowers.length > 0 && (
                    <div className="mb-8">
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Flower Options</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {flowers.map((flower) => (
                          <div
                            key={flower.id}
                            className={`bg-white rounded-xl shadow-sm overflow-hidden cursor-pointer transition-all duration-200 ${selectedFlowers.some(f => f.id === flower.id) ? 'ring-2 ring-gray-900' : 'hover:shadow-md'
                              }`}
                            onClick={() => service.name?.toLowerCase().includes('customized') && handleFlowerSelect(flower)}
                          >
                            {flower.image && (
                              <div className="h-48 w-full">
                                <img
                                  src={`${API_BASE_URL}/apii/components/uploads/flowers/${flower.image}`}
                                  alt={flower.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = `${API_BASE_URL}/apii/components/uploads/default.jpg`;
                                  }}
                                />
                              </div>
                            )}
                            <div className="p-4">
                              <h4 className="font-semibold text-lg text-gray-900">{flower.name}</h4>
                              <p className="text-gray-600 mt-1">{flower.description}</p>
                              {service.name?.toLowerCase().includes('customized') && (
                                <>
                                  <p className="text-gray-900 font-semibold mt-2">₱{parseFloat(flower.price).toFixed(2)}</p>
                                  <div className="mt-2">
                                    <span className={`inline-block px-3 py-1 rounded-full text-sm ${selectedFlowers.some(f => f.id === flower.id)
                                        ? 'bg-gray-900 text-white'
                                        : 'bg-gray-100 text-gray-700'
                                      }`}>
                                      {selectedFlowers.some(f => f.id === flower.id) ? 'Selected' : 'Click to select'}
                                    </span>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              <div className="border-t border-gray-200 pt-6 mt-6">
                <div className="flex justify-between items-center mb-6">
                  <p className="text-2xl font-bold text-gray-900">₱{service.price_range}</p>
                  {!isLoggedIn ? (
                    <div className="bg-yellow-50 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-r-lg">
                      <p className="font-medium">Please log in to place an order.</p>
                    </div>
                  ) : (
                    <button
                      className="bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors duration-200"
                      onClick={() => setShowOrderForm(true)}
                      type="button"
                    >
                      Order Now
                    </button>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Place Order for {service.name}</h3>
              
              {orderStatus && (
                <div className={`p-4 mb-6 rounded-lg ${orderStatus.type === 'success' ? 'bg-green-50 text-green-700' :
                    orderStatus.type === 'error' ? 'bg-red-50 text-red-700' :
                      'bg-blue-50 text-blue-700'
                  }`}>
                  {orderStatus.message}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    name="customer_name"
                    value={formData.customer_name}
                    onChange={(e) => setFormData({
                      ...formData,
                      customer_name: e.target.value
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={email}
                    onChange={(e) => setFormData({
                      ...formData,
                      email: e.target.value
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    required
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    name="customer_phone"
                    value={formData.customer_phone}
                    onChange={(e) => setFormData({
                      ...formData,
                      customer_phone: e.target.value
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    required
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-gray-900 text-white py-3 px-6 rounded-lg hover:bg-gray-800 transition-colors duration-200 disabled:opacity-50"
                    disabled={orderStatus?.type === 'loading'}
                  >
                    {orderStatus?.type === 'loading' ? 'Processing...' : 'Submit Order'}
                  </button>
                  <button
                    type="button"
                    className="flex-1 bg-gray-100 text-gray-900 py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                    onClick={() => setShowOrderForm(false)}
                    disabled={orderStatus?.type === 'loading'}
                  >
                    Back to Details
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientServices;