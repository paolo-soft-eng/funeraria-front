import React, { useState, useContext, useEffect } from 'react';
import { API_BASE_URL } from '../../service/Api';
import { EmailContext } from '../../utils/EmailContext';
import { useServiceItems } from '../../hooks/client/useServiceItems';
import { useOrder } from '../../hooks/client/useOrder';

const ServiceDetail = ({ service, onClose, refetchServices, showNotification, userId, isLoggedIn }) => {
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [selectedCaskets, setSelectedCaskets] = useState([]);
  const [selectedChapels, setSelectedChapels] = useState([]);
  const [validationErrors, setValidationErrors] = useState({});
  const [formTouched, setFormTouched] = useState(false);
  const { email } = useContext(EmailContext);
  
  // Use custom hooks - only fetch chapels now since caskets are displayed in main component
  const { chapels, loadingItems } = useServiceItems(service.id, showNotification);
  const { orderStatus, submitOrder, setOrderStatus } = useOrder(email, userId, showNotification);

  const [formData, setFormData] = useState({
    service_id: service.id,
    customer_name: '',
    email: email,
    customer_phone: ''
  });

  // Validation rules
  const validationRules = {
    customer_name: {
      required: true,
      minLength: 2,
      maxLength: 100,
      pattern: /^[a-zA-Z\s.'-]+$/,
      message: 'Please enter a valid name (letters, spaces, apostrophes, hyphens, and periods only)'
    },
    email: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: 'Please enter a valid email address'
    },
    customer_phone: {
      required: true,
      pattern: /^\+?[\d\s-()]{11,}$/,
      message: 'Please enter a valid phone number (at least 11 digits)'
    }
  };

  // Helper function to format numbers with commas and no decimals
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Validate individual field
  const validateField = (name, value) => {
    const rules = validationRules[name];
    if (!rules) return '';

    if (rules.required && !value.trim()) {
      return 'This field is required';
    }

    if (rules.minLength && value.length < rules.minLength) {
      return `Must be at least ${rules.minLength} characters`;
    }

    if (rules.maxLength && value.length > rules.maxLength) {
      return `Must be less than ${rules.maxLength} characters`;
    }

    if (rules.pattern && !rules.pattern.test(value)) {
      return rules.message;
    }

    return '';
  };

  // Validate entire form
  const validateForm = (data = formData) => {
    const errors = {};
    
    Object.keys(validationRules).forEach(field => {
      const error = validateField(field, data[field]);
      if (error) {
        errors[field] = error;
      }
    });

    // Validate service selections based on service type
    if (service.name?.toLowerCase().includes('customized')) {
      if (selectedChapels.length === 0) {
        errors.chapels = 'Please select at least one chapel for customized service';
      }
    }

    return errors;
  };

  // Check if form is valid
  const isFormValid = () => {
    const errors = validateForm();
    return Object.keys(errors).length === 0;
  };

  // Update validation errors when form data changes
  useEffect(() => {
    if (formTouched) {
      const errors = validateForm();
      setValidationErrors(errors);
    }
  }, [formData, selectedChapels, formTouched]);

  const handleChapelSelect = (chapel) => {
    setSelectedChapels(prev => {
      const isSelected = prev.some(c => c.id === chapel.id);
      if (isSelected) {
        return prev.filter(c => c.id !== chapel.id);
      } else {
        return [...prev, chapel];
      }
    });
    
    // Clear chapel validation error when user makes a selection
    if (validationErrors.chapels) {
      setValidationErrors(prev => ({
        ...prev,
        chapels: ''
      }));
    }
  };

  const handleInputChange = (field, value) => {
    setFormTouched(true);
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear individual field error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleBlur = (field, value) => {
    const error = validateField(field, value);
    setValidationErrors(prev => ({
      ...prev,
      [field]: error
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setFormTouched(true);
    const errors = validateForm();

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      showNotification?.('Please fix the validation errors before submitting', 'error');
      return;
    }

    await submitOrder(formData, selectedCaskets, selectedChapels, () => {
      // Success callback
      setFormData({
        service_id: service.id,
        customer_name: '',
        email: email,
        customer_phone: ''
      });
      setSelectedCaskets([]);
      setSelectedChapels([]);
      setValidationErrors({});
      setFormTouched(false);

      setTimeout(() => {
        refetchServices();
        setShowOrderForm(false);
        setOrderStatus(null);
        onClose();
      }, 3000);
    });
  };

  const handleShowOrderForm = () => {
    setFormTouched(false);
    setValidationErrors({});
    setShowOrderForm(true);
  };

  const handleBackToDetails = () => {
    setFormTouched(false);
    setValidationErrors({});
    setShowOrderForm(false);
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
                  {chapels.length > 0 && (
                    <div className="mb-8">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-semibold text-gray-900">Available Chapels</h3>
                        {validationErrors.chapels && (
                          <span className="text-red-600 text-sm font-medium">{validationErrors.chapels}</span>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {chapels.map((chapel) => (
                          <div
                            key={chapel.id}
                            className={`bg-white rounded-xl shadow-sm overflow-hidden cursor-pointer transition-all duration-200 ${
                              selectedChapels.some(c => c.id === chapel.id) 
                                ? 'ring-2 ring-gray-900' 
                                : 'hover:shadow-md'
                            } ${validationErrors.chapels ? 'border border-red-300' : ''}`}
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
                                  <p className="text-gray-900 font-semibold mt-2">₱{formatCurrency(parseFloat(chapel.price))}</p>
                                  <div className="mt-2">
                                    <span className={`inline-block px-3 py-1 rounded-full text-sm ${
                                      selectedChapels.some(c => c.id === chapel.id)
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
                  <p className="text-2xl font-bold text-gray-900">₱{formatCurrency(parseFloat(service.price_range))}</p>
                  {!isLoggedIn ? (
                    <div className="bg-yellow-50 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-r-lg">
                      <p className="font-medium">Please log in to place an order.</p>
                    </div>
                  ) : (
                    <button
                      className="bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors duration-200"
                      onClick={handleShowOrderForm}
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
                <div className={`p-4 mb-6 rounded-lg ${
                  orderStatus.type === 'success' ? 'bg-green-50 text-green-700' :
                  orderStatus.type === 'error' ? 'bg-red-50 text-red-700' :
                  'bg-blue-50 text-blue-700'
                }`}>
                  {orderStatus.message}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="customer_name"
                    value={formData.customer_name}
                    onChange={(e) => handleInputChange('customer_name', e.target.value)}
                    onBlur={(e) => handleBlur('customer_name', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent ${
                      validationErrors.customer_name 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-300'
                    }`}
                    required
                    minLength="2"
                    maxLength="100"
                  />
                  {validationErrors.customer_name && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.customer_name}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    onBlur={(e) => handleBlur('email', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent ${
                      validationErrors.email 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-300'
                    }`}
                    required
                    disabled
                  />
                  {validationErrors.email && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="customer_phone"
                    value={formData.customer_phone}
                    onChange={(e) => handleInputChange('customer_phone', e.target.value)}
                    onBlur={(e) => handleBlur('customer_phone', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent ${
                      validationErrors.customer_phone 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-300'
                    }`}
                    required
                    placeholder="e.g., +63 912 345 6789 or 0912-345-6789"
                  />
                  {validationErrors.customer_phone && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.customer_phone}</p>
                  )}
                </div>

                {/* Service selection validation summary */}
                {validationErrors.chapels && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="font-semibold text-red-800 mb-2">Service Selection Required</h4>
                    <ul className="list-disc list-inside text-red-700 text-sm space-y-1">
                      {validationErrors.chapels && <li>{validationErrors.chapels}</li>}
                    </ul>
                  </div>
                )}

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-gray-900 text-white py-3 px-6 rounded-lg hover:bg-gray-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={orderStatus?.type === 'loading' || (formTouched && !isFormValid())}
                  >
                    {orderStatus?.type === 'loading' ? 'Processing...' : 'Submit Order'}
                  </button>
                  <button
                    type="button"
                    className="flex-1 bg-gray-100 text-gray-900 py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                    onClick={handleBackToDetails}
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