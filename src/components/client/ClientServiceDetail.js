import React, { useState, useContext } from 'react';
import { API_BASE_URL } from '../Api';
import { EmailContext } from '../utils/EmailContext';
import { useServiceItems } from '../hooks/client/useServiceItems';
import { useOrder } from '../hooks/client/useOrder';

const ServiceDetail = ({ service, onClose, refetchServices, showNotification, userId, isLoggedIn }) => {
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [selectedCaskets, setSelectedCaskets] = useState([]);
  const [selectedChapels, setSelectedChapels] = useState([]);
  const { email } = useContext(EmailContext);
  
  // Use custom hooks
  const { caskets, chapels, loadingItems } = useServiceItems(service.id, showNotification);
  const { orderStatus, submitOrder, setOrderStatus } = useOrder(email, userId, showNotification);

  const [formData, setFormData] = useState({
    service_id: service.id,
    customer_name: '',
    email: email,
    customer_phone: ''
  });

  // Helper function to format numbers with commas and no decimals
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

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

  const handleChapelSelect = (chapel) => {
    setSelectedChapels(prev => {
      const isSelected = prev.some(c => c.id === chapel.id);
      if (isSelected) {
        return prev.filter(c => c.id !== chapel.id);
      } else {
        return [...prev, chapel];
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    await submitOrder(formData, selectedCaskets, selectedChapels, () => {
      // Success callback
      setFormData({
        ...formData,
        customer_name: '',
        email: email,
        customer_phone: ''
      });
      setSelectedCaskets([]);
      setSelectedChapels([]);

      setTimeout(() => {
        refetchServices();
        setShowOrderForm(false);
        setOrderStatus(null);
        onClose();
      }, 3000);
    });
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
                            onClick={() => service.name?.toLowerCase().includes('bubbles') && handleCasketSelect(casket)}
                          >
                            {casket.image && (
                              <div className="h-48 w-full">
                                <img
                                  src={`${API_BASE_URL}/api/components/uploads/caskets/${casket.image}`}
                                  alt={casket.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = `${API_BASE_URL}/api/components/uploads/default.jpg`;
                                  }}
                                />
                              </div>
                            )}
                            <div className="p-4">
                              <h4 className="font-semibold text-lg text-gray-900">{casket.name}</h4>
                              <p className="text-gray-600 mt-1">{casket.description}</p>
                              {service.name?.toLowerCase().includes('customized') && (
                                <>
                                  {/* UPDATED: Removed decimal points */}
                                  <p className="text-gray-900 font-semibold mt-2">₱{formatCurrency(parseFloat(casket.price))}</p>
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

                  {chapels.length > 0 && (
                    <div className="mb-8">
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Chapels Options</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {chapels.map((chapel) => (
                          <div
                            key={chapel.id}
                            className={`bg-white rounded-xl shadow-sm overflow-hidden cursor-pointer transition-all duration-200 ${selectedChapels.some(c => c.id === chapel.id) ? 'ring-2 ring-gray-900' : 'hover:shadow-md'
                              }`}
                            onClick={() => service.name?.toLowerCase().includes('customized') && handleChapelSelect(chapel)}
                          >
                            {chapel.image && (
                              <div className="h-48 w-full">
                                <img
                                  src={`${API_BASE_URL}/api/components/uploads/chapels/${chapel.image}`}
                                  alt={chapel.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = `${API_BASE_URL}/api/components/uploads/default.jpg`;
                                  }}
                                />
                              </div>
                            )}
                            <div className="p-4">
                              <h4 className="font-semibold text-lg text-gray-900">{chapel.name}</h4>
                              <p className="text-gray-600 mt-1">{chapel.description}</p>
                              {service.name?.toLowerCase().includes('customized') && (
                                <>
                                  {/* UPDATED: Removed decimal points */}
                                  <p className="text-gray-900 font-semibold mt-2">₱{formatCurrency(parseFloat(chapel.price))}</p>
                                  <div className="mt-2">
                                    <span className={`inline-block px-3 py-1 rounded-full text-sm ${selectedChapels.some(c => c.id === chapel.id)
                                        ? 'bg-gray-900 text-white'
                                        : 'bg-gray-100 text-gray-700'
                                      }`}>
                                      {selectedChapels.some(c => c.id === chapel.id) ? 'Selected' : 'Click to select'}
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
                  {/* UPDATED: Service price range without decimals */}
                  <p className="text-2xl font-bold text-gray-900">₱{formatCurrency(parseFloat(service.price_range))}</p>
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

export default ServiceDetail;