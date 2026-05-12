import React, { useState, useContext, useEffect } from 'react';
import { API_BASE_URL } from '../../service/Api';
import { EmailContext } from '../../utils/EmailContext';
import { useServiceItems } from '../../hooks/client/useServiceItems';
import { useOrder } from '../../hooks/client/useOrder';

const ServiceDetail = ({ 
  service, 
  onClose, 
  refetchServices, 
  showNotification, 
  userId, 
  isLoggedIn, 
  openDirectlyToForm = false,
  preSelectedChapels = [],
  isOutOfStock=null
}) => {
  const [showOrderForm, setShowOrderForm] = useState(openDirectlyToForm);
  const [selectedCaskets, setSelectedCaskets] = useState([]);
  const [selectedChapels, setSelectedChapels] = useState(preSelectedChapels);
  const [validationErrors, setValidationErrors] = useState({});
  const [formTouched, setFormTouched] = useState(false);
  const [quantity, setQuantity] = useState(1);
  
  // NEW: Date range state
  const [chapelStartDate, setChapelStartDate] = useState('');
  const [chapelEndDate, setChapelEndDate] = useState('');
  const [durationDays, setDurationDays] = useState(5);
  
  const { email } = useContext(EmailContext);

  const { chapels, loadingItems, refetchItems } = useServiceItems(service.id, showNotification);
  const { orderStatus, submitOrder, setOrderStatus } = useOrder(email, userId, showNotification);

  const [formData, setFormData] = useState({
    service_id: service.id,
    customer_name: '',
    email: email,
    customer_phone: '',
    quantity: 1
  });

  // Initialize default dates (start: tomorrow, end: 5 days from tomorrow)
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0); // Default start time 9 AM
    
    const defaultEndDate = new Date(tomorrow);
    defaultEndDate.setDate(defaultEndDate.getDate() + 5);
    
    setChapelStartDate(formatDateTimeLocal(tomorrow));
    setChapelEndDate(formatDateTimeLocal(defaultEndDate));
  }, []);

  // Calculate duration whenever dates change
  useEffect(() => {
    if (chapelStartDate && chapelEndDate) {
      const start = new Date(chapelStartDate);
      const end = new Date(chapelEndDate);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setDurationDays(diffDays);
    }
  }, [chapelStartDate, chapelEndDate]);

  useEffect(() => {
    setShowOrderForm(openDirectlyToForm);
    if (openDirectlyToForm && isLoggedIn) {
      fetchUserDetails();
    }
    if (preSelectedChapels && preSelectedChapels.length > 0) {
      setSelectedChapels(preSelectedChapels);
    }
    refetchItems();
  }, [openDirectlyToForm, isLoggedIn, preSelectedChapels]);

  const formatDateTimeLocal = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const validationRules = {
    customer_name: {
      required: true,
      minLength: 4,
      maxLength: 100,
      pattern: /^[a-zA-ZñÑ\s.'-]+$/,
      message: 'Please enter a valid name (letters, enye, spaces, apostrophes, hyphens, and periods only)'
    },
    email: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: 'Please enter a valid email address'
    },
    customer_phone: {
      required: true,
      pattern: /^9\d{9}$/,
      message: 'Phone number must start with 9 and be 10 digits long'
    },
    quantity: {
      required: true,
      min: 1,
      max: 10,
      message: 'Quantity must be between 1 and 10'
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const validateField = (name, value) => {
    const rules = validationRules[name];
    if (!rules) return '';

    if (rules.required && !value && value !== 0) {
      return 'This field is required';
    }

    if (name === 'quantity') {
      const numValue = parseInt(value);
      if (isNaN(numValue) || numValue < rules.min) {
        return `Quantity must be at least ${rules.min}`;
      }
      if (numValue > rules.max) {
        return `Quantity cannot exceed ${rules.max}`;
      }
      return '';
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

  const validateDates = () => {
    const errors = {};
    const now = new Date();
    const start = new Date(chapelStartDate);
    const end = new Date(chapelEndDate);

    if (!chapelStartDate) {
      errors.chapelStartDate = 'Start date is required';
    } else if (start < now) {
      errors.chapelStartDate = 'Start date cannot be in the past';
    }

    if (!chapelEndDate) {
      errors.chapelEndDate = 'End date is required';
    } else if (end <= start) {
      errors.chapelEndDate = 'End date must be after start date';
    } else if (durationDays > 30) {
      errors.chapelEndDate = 'Chapel occupancy cannot exceed 30 days';
    }

    return errors;
  };

  const validateForm = (data = formData) => {
    const errors = {};

    Object.keys(validationRules).forEach(field => {
      const error = validateField(field, data[field]);
      if (error) {
        errors[field] = error;
      }
    });

    // Add date validation
    const dateErrors = validateDates();
    Object.assign(errors, dateErrors);

    return errors;
  };

  const fetchUserDetails = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/components/get_user_details.php?email=${email}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.user) {
        const firstName = data.user.first_name || '';
        const lastName = data.user.last_name || '';
        const username = data.user.username || '';

        const fullName = firstName && lastName
          ? `${firstName} ${lastName}`
          : username || '';

        setFormData(prev => ({
          ...prev,
          customer_name: fullName,
          customer_phone: data.user.telephone || ''
        }));
      }
    } catch (err) {
      console.error('Error fetching user details:', err);
      showNotification?.('Failed to load user information', 'error');
    }
  };

  const isFormValid = () => {
    const errors = validateForm();
    return Object.keys(errors).length === 0;
  };

  useEffect(() => {
    if (formTouched) {
      const errors = validateForm();
      setValidationErrors(errors);
    }
  }, [formData, selectedChapels, quantity, chapelStartDate, chapelEndDate, formTouched]);

  const handleChapelSelect = (chapel) => {
    if (isOutOfStock) {
      showNotification?.(`This service is currently out of stock. Chapel selection is not available.`, 'error');
      return;
    }

    if (chapel.is_occupied === '1' || chapel.is_occupied === 1 || chapel.is_occupied === true) {
      showNotification?.(`This chapel is currently occupied. Please select another chapel.`, 'warning');
      return;
    }

    setSelectedChapels(prev => {
      const isSelected = prev.some(c => c.id === chapel.id);
      if (isSelected) {
        return prev.filter(c => c.id !== chapel.id);
      } else {
        return [...prev, chapel];
      }
    });

    if (validationErrors.chapels) {
      setValidationErrors(prev => ({
        ...prev,
        chapels: ''
      }));
    }
  };

  const handleQuantityChange = (newQuantity) => {
    const qty = Math.max(1, Math.min(10, parseInt(newQuantity) || 1));
    setQuantity(qty);
    setFormData(prev => ({
      ...prev,
      quantity: qty
    }));
    setFormTouched(true);
  };

  const handleInputChange = (field, value) => {
    setFormTouched(true);
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

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

  const handleDateChange = (field, value) => {
    setFormTouched(true);
    if (field === 'start') {
      setChapelStartDate(value);
      
      // Auto-adjust end date to maintain 5-day default if end is not set or is before new start
      const newStart = new Date(value);
      const currentEnd = new Date(chapelEndDate);
      
      if (!chapelEndDate || currentEnd <= newStart) {
        const newEnd = new Date(newStart);
        newEnd.setDate(newEnd.getDate() + 5);
        setChapelEndDate(formatDateTimeLocal(newEnd));
      }
    } else {
      setChapelEndDate(value);
    }

    if (validationErrors.chapelStartDate || validationErrors.chapelEndDate) {
      setValidationErrors(prev => ({
        ...prev,
        chapelStartDate: '',
        chapelEndDate: ''
      }));
    }
  };

  const calculateTotal = () => {
    const basePrice = parseFloat(service.price_range) * quantity;
    return basePrice;
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

    const chapelIds = selectedChapels.map(chapel => chapel.id);

    const orderDataWithQuantity = {
      ...formData,
      quantity: quantity,
      selected_chapels: chapelIds,
      chapel_start_date: chapelStartDate,
      chapel_end_date: chapelEndDate
    };

    await submitOrder(orderDataWithQuantity, selectedCaskets, selectedChapels, () => {
      setFormData({
        service_id: service.id,
        customer_name: '',
        email: email,
        customer_phone: '',
        quantity: 1
      });
      setQuantity(1);
      setSelectedCaskets([]);
      setSelectedChapels([]);
      setValidationErrors({});
      setFormTouched(false);

      // Reset dates to default
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(9, 0, 0, 0);
      const defaultEndDate = new Date(tomorrow);
      defaultEndDate.setDate(defaultEndDate.getDate() + 5);
      setChapelStartDate(formatDateTimeLocal(tomorrow));
      setChapelEndDate(formatDateTimeLocal(defaultEndDate));

      setTimeout(() => {
        refetchServices();
        refetchItems?.();
        setShowOrderForm(false);
        setOrderStatus(null);
        onClose();
      }, 3000);
    });
  };

  const handleShowOrderForm = () => {
    if (isOutOfStock) {
      showNotification?.('This service is currently out of stock', 'error');
      return;
    }
    setFormTouched(false);
    setValidationErrors({});
    setShowOrderForm(true);
    fetchUserDetails();
  };

  const handleBackToDetails = () => {
    setFormTouched(false);
    setValidationErrors({});
    setShowOrderForm(false);
  };

  const inclusions = Array.isArray(service.inclusions) ? service.inclusions : [];

  return (
    <div
      className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-2xl relative flex flex-col"
        style={{ maxHeight: '90vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors duration-200 z-10"
          onClick={onClose}
          type="button"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="overflow-y-auto flex-1 p-8">
          {!showOrderForm && (
            <>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">{service.name}</h2>
              <p className="text-lg text-gray-600 mb-8">{service.description}</p>
              
              {isOutOfStock && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-r-lg">
                  <p className="font-medium">This service is currently out of stock.</p>
                </div>
              )}
            </>
          )}

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

              {/* <div className="border-t border-gray-200 pt-6 mt-6">
                <div className="flex justify-between items-center mb-6">
                  <p className="text-2xl font-bold text-gray-900">₱{formatCurrency(parseFloat(service.price_range))}</p>
                  {!isLoggedIn ? (
                    <div className="bg-yellow-50 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-r-lg">
                      <p className="font-medium">Please log in to place an order.</p>
                    </div>
                  ) : (
                    <button
                      className={`px-6 py-3 rounded-lg transition-colors duration-200 ${
                        isOutOfStock
                          ? 'bg-gray-400 cursor-not-allowed text-white'
                          : 'bg-gray-900 text-white hover:bg-gray-800'
                      }`}
                      onClick={handleShowOrderForm}
                      type="button"
                      disabled={isOutOfStock}
                    >
                      {isOutOfStock ? 'Out of Stock' : 'Add to order'}
                    </button>
                  )}
                </div>
              </div> */}
            </>
          ) : (
            <div className="max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h3>

              {orderStatus && (
                <div className={`p-4 mb-6 rounded-lg ${orderStatus.type === 'success' ? 'bg-green-50 text-green-700' :
                  orderStatus.type === 'error' ? 'bg-red-50 text-red-700' :
                    'bg-blue-50 text-blue-700'
                  }`}>
                  {orderStatus.message}
                </div>
              )}

              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Order Details</h4>

                {/* Chapel Occupancy Date Range */}
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <h5 className="text-sm font-semibold text-gray-700 mb-3">Chapel Occupancy Period</h5>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Start Date & Time *
                      </label>
                      <input
                        type="datetime-local"
                        value={chapelStartDate}
                        onChange={(e) => handleDateChange('start', e.target.value)}
                        min={formatDateTimeLocal(new Date())}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent ${
                          validationErrors.chapelStartDate ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {validationErrors.chapelStartDate && (
                        <p className="mt-1 text-sm text-red-600">{validationErrors.chapelStartDate}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        End Date & Time *
                      </label>
                      <input
                        type="datetime-local"
                        value={chapelEndDate}
                        onChange={(e) => handleDateChange('end', e.target.value)}
                        min={chapelStartDate}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent ${
                          validationErrors.chapelEndDate ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {validationErrors.chapelEndDate && (
                        <p className="mt-1 text-sm text-red-600">{validationErrors.chapelEndDate}</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm text-blue-700 font-medium">
                        Duration: {`${durationDays+1} days`}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mb-4 pb-4 border-b border-gray-200">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity
                  </label>
                  <div className="flex items-center space-x-3">
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(quantity - 1)}
                      className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                      disabled={quantity <= 1}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                      </svg>
                    </button>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={quantity}
                      onChange={(e) => handleQuantityChange(e.target.value)}
                      onBlur={(e) => handleBlur('quantity', e.target.value)}
                      className={`w-20 text-center px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent ${validationErrors.quantity ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(quantity + 1)}
                      className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                      disabled={quantity >= 10}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>
                  {validationErrors.quantity && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.quantity}</p>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">{service.name}</p>
                      <p className="text-sm text-gray-600">Base package × {quantity}</p>
                    </div>
                    <p className="font-semibold text-gray-900">₱{formatCurrency(parseFloat(service.price_range) * quantity)}</p>
                  </div>

                  {selectedChapels.length > 0 && (
                    <div className="border-t border-gray-200 pt-3 mt-3">
                      <p className="text-sm font-medium text-gray-700 mb-2">Selected Chapels:</p>
                      <div className="bg-white rounded-lg p-3">
                        {selectedChapels.map(chapel => (
                          <div key={chapel.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                            <div className="flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              <span className="text-sm text-gray-700 font-medium">{chapel.name}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleChapelSelect(chapel)}
                              className="text-red-500 hover:text-red-700 transition-colors"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="border-t border-gray-300 pt-3 mt-3">
                    <div className="flex justify-between items-center">
                      <p className="text-lg font-bold text-gray-900">Total Amount</p>
                      <p className="text-2xl font-bold text-gray-900">
                        ₱{formatCurrency(calculateTotal())}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

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
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent ${validationErrors.customer_name
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300'
                      }`}
                    required
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    disabled
                  />
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
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent ${validationErrors.customer_phone
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300'
                      }`}
                    required
                    placeholder="e.g., 9123456789"
                  />
                  {validationErrors.customer_phone && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.customer_phone}</p>
                  )}
                </div>


                {validationErrors.chapels && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="font-semibold text-red-800 mb-2">Service Selection Required</h4>
                    <ul className="list-disc list-inside text-red-700 text-sm space-y-1">
                      <li>{validationErrors.chapels}</li>
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
                  {!openDirectlyToForm && (
                    <button
                      type="button"
                      className="flex-1 bg-gray-100 text-gray-900 py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                      onClick={handleBackToDetails}
                      disabled={orderStatus?.type === 'loading'}
                    >
                      Back to Details
                    </button>
                  )}
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