import React, { useContext, useRef, useEffect, useState } from 'react';
import { EmailContext } from '../../utils/EmailContext';
import toast, { Toaster } from 'react-hot-toast';
import { useMenuItems } from '../../hooks/client/useMenuItems';
import { useUser } from '../../hooks/client/useUser';
import { useQuantities } from '../../hooks/client/useQuantities';

const ClientCustomized = () => {
  const { email } = useContext(EmailContext);
  const customizationItemsRef = useRef([]);
  const otherProductsRef = useRef([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [loadingPackage, setLoadingPackage] = useState(false);
  const n = process.env.REACT_APP_API_URL;
  
  // Order form modal states
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderFormData, setOrderFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: ''
  });
  const [selectedOrderItem, setSelectedOrderItem] = useState(null);
  const [loadingUserData, setLoadingUserData] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  
  // Custom hooks
  const { items, loading, error, updateItemStock } = useMenuItems();
  const { userId, isLoggedIn } = useUser(email);
  const { quantities, handleQuantityChange } = useQuantities(items);

  // Filter items
  const customizationItems = items.filter(item => 
    !item.details?.toLowerCase().includes('item')
  );
  
  const otherProducts = items.filter(item => 
    item.details?.toLowerCase().includes('item')
  );

  // Phone validation function
  const validatePhoneNumber = (phone) => {
    const phoneRegex = /^9\d{9}$/;
    return phoneRegex.test(phone);
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    
    if (!orderFormData.fullName.trim()) {
      errors.fullName = 'Full name is required';
    }
    
    if (!orderFormData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(orderFormData.email)) {
      errors.email = 'Please enter a valid email';
    }
    
    if (!orderFormData.phoneNumber.trim()) {
      errors.phoneNumber = 'Phone number is required';
    } else if (!validatePhoneNumber(orderFormData.phoneNumber)) {
      errors.phoneNumber = 'Phone number must start with 9 and be 10 digits long';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Fetch user details and populate form
  // Replace the fetchUserDetails function in ClientCustomized.jsx with this updated version:

const fetchUserDetails = async () => {
  setLoadingUserData(true);
  try {
    const response = await fetch(`${n}/api/components/get_user_details.php?email=${email}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.success && data.user) {
      const firstName = data.user.first_name || '';
      const lastName = data.user.last_name || '';
      const username = data.user.username || '';
      
      // Construct full name from first_name and last_name, or fallback to username
      const fullName = firstName && lastName 
        ? `${firstName} ${lastName}` 
        : username || '';
      
      // Populate form with user data including telephone
      setOrderFormData({
        fullName: fullName,
        email: data.user.email || '',
        phoneNumber: data.user.telephone || '' // Populate phone from database
      });
    } else {
      toast.error('Failed to load user details');
    }
  } catch (err) {
    console.error('Error fetching user details:', err);
    toast.error('Failed to load user information');
  } finally {
    setLoadingUserData(false);
  }
};
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Handle order button click
  const onBuyClick = (itemId) => {
    if (!isLoggedIn) {
      toast.error('Please log in to make a purchase.');
      return;
    }

    const item = items.find(i => i.id === itemId);
    if (!item) return;

    setSelectedOrderItem({
      ...item,
      quantity: quantities[itemId] || 1
    });
    
    fetchUserDetails();
    setShowOrderModal(true);
  };

  // Handle form input changes
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setOrderFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Handle order submission
  const handleOrderSubmit = async () => {
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setPurchasing(true);

    try {
      const response = await fetch(`${n}/api/components/buyItems.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itemId: selectedOrderItem.id,
          quantity: selectedOrderItem.quantity,
          userId: userId,
          customerInfo: orderFormData
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Order placed successfully!', {
          duration: 2000,
          position: 'top-right',
        });
        updateItemStock(selectedOrderItem.id, selectedOrderItem.quantity);
        setShowOrderModal(false);
        setOrderFormData({ fullName: '', email: '', phoneNumber: '' });
        setFormErrors({});
      } else {
        toast.error('Order failed: ' + data.error);
      }
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('An error occurred while processing your order.');
    } finally {
      setPurchasing(false);
    }
  };

  // Map item ID to package ID
  const mapItemIdToPackageId = (itemId) => {
    return 12 - itemId;
  };

  // Fetch specific package
  const fetchPackageById = async (itemId) => {
    setLoadingPackage(true);
    try {
      const packageId = mapItemIdToPackageId(itemId);
      const response = await fetch(`${n}/api/components/fetchPackagesById.php?id=${packageId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data && !data.error) {
        setSelectedPackage(data);
      } else {
        toast.error(data.error || 'Package not found');
      }
    } catch (err) {
      console.error('Error fetching package:', err);
      toast.error(`Failed to load package details: ${err.message}`);
    } finally {
      setLoadingPackage(false);
    }
  };

  const handleViewDetails = (itemId) => {
    setShowModal(true);
    fetchPackageById(itemId);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleCloseOrderModal = () => {
    setShowOrderModal(false);
    setOrderFormData({ fullName: '', email: '', phoneNumber: '' });
    setFormErrors({});
  };

  // Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
          }
        });
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    [...customizationItemsRef.current, ...otherProductsRef.current].forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => {
      [...customizationItemsRef.current, ...otherProductsRef.current].forEach((ref) => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, [customizationItems, otherProducts]);

  // Render menu item card
  const renderMenuItemCard = (item, index, refArray, isCustomization) => (
    <div
      key={item.id}
      ref={el => refArray.current[index] = el}
      className="menu-card rounded-xl overflow-hidden"
    >
      <div className="relative">
        <img
          src={`${n}/api/components/${item.image_path}`}
          alt={item.name}
          className="w-full h-56 sm:h-64 object-cover"
        />
        {parseInt(item.stock) < 5 && parseInt(item.stock) > 0 && (
          <div className="stock-badge absolute top-3 right-3 text-white text-xs px-3 py-1.5 rounded-full">
            Low Stock
          </div>
        )}
        {parseInt(item.stock) <= 0 && (
          <div className="stock-badge absolute top-3 right-3 text-white text-xs px-3 py-1.5 rounded-full">
            Out of Stock
          </div>
        )}
      </div>
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-3 text-gray-800">{item.name}</h2>
        <div className="flex items-center justify-between mb-4">
          <p className="text-gray-900 font-bold text-xl">₱{formatCurrency(item.price)}</p>
          <p className={`text-sm ${parseInt(item.stock) < 5 ? 'text-red-600' : 'text-gray-500'}`}>
            Stock: {item.stock}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <label htmlFor={`quantity-${item.id}`} className="mr-2 text-gray-600 text-sm">Qty:</label>
            <input
              type="number"
              id={`quantity-${item.id}`}
              value={quantities[item.id] || 1}
              onChange={(event) => handleQuantityChange(item.id, event)}
              min="1"
              max={item.stock}
              className="w-16 p-1 rounded bg-white text-gray-900 border border-gray-300 focus:border-gray-400 focus:outline-none"
            />
          </div>
          <button
            onClick={() => onBuyClick(item.id)}
            disabled={!isLoggedIn || item.stock < 1 || purchasing}
            className={`bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200 ${
              !isLoggedIn || item.stock < 1 || purchasing
                ? 'opacity-50 cursor-not-allowed'
                : 'text-white'
            }`}
          >
            {purchasing ? 'Processing...' : item.stock < 1 ? 'Out of Stock' : 'Add to order'}
          </button>
          {isCustomization && (
            <button 
              onClick={() => handleViewDetails(item.id)}
              className='btn-view px-4 py-2 rounded-lg text-sm font-medium flex-grow text-white bg-gray-600 hover:bg-gray-700'
            >
              View Details
            </button>
          )}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center p-6 min-h-[70vh]">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center p-6 min-h-[70vh]">
        <div className="text-xl text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <style dangerouslySetInnerHTML={{
          __html: `
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }

            @keyframes slideUp {
              from { transform: translateY(30px); opacity: 0; }
              to { transform: translateY(0); opacity: 1; }
            }
            
            .menu-card {
              transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
              background: linear-gradient(145deg, #ffffff, #f3f4f6);
              border: 1px solid rgba(0, 0, 0, 0.1);
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
              opacity: 0;
              transform: translateY(30px);
            }
            
            .menu-card:hover {
              transform: translateY(-5px);
              box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
            }

            .btn-primary {
              transition: all 0.3s ease;
              background: linear-gradient(145deg, #4b5563, #374151);
              border: 1px solid rgba(0, 0, 0, 0.1);
            }
            
            .btn-primary:hover:not(:disabled) {
              background: linear-gradient(145deg, #374151, #1f2937);
              transform: translateY(-2px);
            }

            .btn-view {
              transition: all 0.3s ease;
              border: 1px solid rgba(0, 0, 0, 0.1);
            }

            .stock-badge {
              backdrop-filter: blur(4px);
              background: rgba(0, 0, 0, 0.6);
            }

            .modal-overlay {
              position: fixed;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: rgba(0, 0, 0, 0.5);
              display: flex;
              align-items: center;
              justify-content: center;
              z-index: 1000;
              animation: fadeIn 0.3s ease;
            }

            .modal-content {
              background: white;
              border-radius: 12px;
              max-width: 90%;
              max-height: 90vh;
              overflow-y: auto;
              box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
              animation: slideUp 0.3s ease;
            }

            .package-card {
              transition: all 0.3s ease;
              border: 2px solid #e5e7eb;
            }

            .form-input {
              width: 100%;
              padding: 12px 16px;
              border: 2px solid #e5e7eb;
              border-radius: 8px;
              font-size: 14px;
              transition: all 0.3s ease;
            }

            .form-input:focus {
              outline: none;
              border-color: #4b5563;
              box-shadow: 0 0 0 3px rgba(75, 85, 99, 0.1);
            }

            .form-input.error {
              border-color: #ef4444;
            }

            .form-input.error:focus {
              border-color: #ef4444;
              box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
            }

            .form-label {
              display: block;
              margin-bottom: 8px;
              font-weight: 600;
              color: #374151;
              font-size: 14px;
            }

            .error-message {
              color: #ef4444;
              font-size: 12px;
              margin-top: 4px;
            }
          `
        }} />

        <Toaster position="top-right" reverseOrder={false} />

        {!isLoggedIn && (
          <div className="bg-yellow-50 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-8 rounded-r-lg">
            <p className="font-medium">Please log in to make purchases.</p>
          </div>
        )}

        <div className="mb-16">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Gomez Package Customization</h1>
            <p className="text-gray-600">Customize your service package with our additional options</p>
          </div>

          {customizationItems.length === 0 ? (
            <div className="text-center p-8 bg-white rounded-xl shadow-inner border border-gray-200">
              <p className="text-lg text-gray-600">No customization options available at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {customizationItems.map((item, index) => renderMenuItemCard(item, index, customizationItemsRef, true))}
            </div>
          )}
        </div>

        <div className="mb-16">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Gomez Other Products</h1>
            <p className="text-gray-600">Select from our range of dignified menu items</p>
          </div>

          {otherProducts.length === 0 ? (
            <div className="text-center p-8 bg-white rounded-xl shadow-inner border border-gray-200">
              <p className="text-lg text-gray-600">No other products available at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {otherProducts.map((item, index) => renderMenuItemCard(item, index, otherProductsRef, false))}
            </div>
          )}
        </div>
      </div>

      {/* Order Form Modal */}
      {showOrderModal && selectedOrderItem && (
        <div className="modal-overlay" onClick={handleCloseOrderModal}>
          <div className="modal-content w-full sm:w-11/12 md:w-3/4 lg:w-1/2 xl:w-2/5" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 sm:p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Order Confirmation</h2>
                <button 
                  onClick={handleCloseOrderModal}
                  className="text-gray-500 hover:text-gray-700 text-3xl font-bold leading-none"
                >
                  ×
                </button>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-lg mb-2 text-gray-800">Order Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Item:</span>
                    <span className="font-medium text-gray-800">{selectedOrderItem.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Quantity:</span>
                    <span className="font-medium text-gray-800">{selectedOrderItem.quantity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Price per item:</span>
                    <span className="font-medium text-gray-800">₱{parseFloat(selectedOrderItem.price).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t-2 border-gray-200">
                    <span className="text-gray-800 font-semibold">Total:</span>
                    <span className="font-bold text-gray-900 text-lg">
                      ₱{(parseFloat(selectedOrderItem.price) * selectedOrderItem.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {loadingUserData ? (
                <div className="text-center py-8">
                  <div className="text-gray-600">Loading your information...</div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="fullName" className="form-label">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={orderFormData.fullName}
                      onChange={handleFormChange}
                      className={`form-input ${formErrors.fullName ? 'error' : ''}`}
                      placeholder="Enter your full name"
                    />
                    {formErrors.fullName && (
                      <div className="error-message">{formErrors.fullName}</div>
                    )}
                  </div>

                  <div>
                    <label htmlFor="email" className="form-label">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={orderFormData.email}
                      onChange={handleFormChange}
                      className={`form-input ${formErrors.email ? 'error' : ''}`}
                      placeholder="Enter your email address"
                    />
                    {formErrors.email && (
                      <div className="error-message">{formErrors.email}</div>
                    )}
                  </div>

                  <div>
                    <label htmlFor="phoneNumber" className="form-label">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      id="phoneNumber"
                      name="phoneNumber"
                      value={orderFormData.phoneNumber}
                      onChange={handleFormChange}
                      className={`form-input ${formErrors.phoneNumber ? 'error' : ''}`}
                      placeholder="e.g., 9123456789"
                    />
                    {formErrors.phoneNumber && (
                      <div className="error-message">{formErrors.phoneNumber}</div>
                    )}
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      type="button"
                      onClick={handleCloseOrderModal}
                      className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleOrderSubmit}
                      disabled={purchasing}
                      className={`flex-1 px-6 py-3 bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-lg font-medium hover:from-gray-800 hover:to-gray-900 transition-all ${
                        purchasing ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {purchasing ? 'Processing...' : 'Confirm Order'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Package Details Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content w-full sm:w-11/12 md:w-3/4 lg:w-2/3 xl:w-1/2" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 sm:p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Package Details</h2>
                <button 
                  onClick={handleCloseModal}
                  className="text-gray-500 hover:text-gray-700 text-3xl font-bold leading-none"
                >
                  ×
                </button>
              </div>

              {loadingPackage ? (
                <div className="text-center py-12">
                  <div className="text-xl text-gray-600">Loading package details...</div>
                </div>
              ) : !selectedPackage ? (
                <div className="text-center py-12">
                  <p className="text-lg text-gray-600">No package details available.</p>
                </div>
              ) : (
                <div className="package-card bg-gradient-to-br from-white to-gray-50 rounded-lg p-6 sm:p-8">
                  <h3 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3">{selectedPackage.name}</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">{selectedPackage.description}</p>
                  
                  <div className="mb-6">
                    <h4 className="font-semibold text-lg text-gray-700 mb-3">Package Inclusions:</h4>
                    <ul className="space-y-2 bg-white rounded-lg p-4 border border-gray-200">
                      {typeof selectedPackage.inclusions === 'string' 
                        ? JSON.parse(selectedPackage.inclusions).map((inclusion, idx) => (
                            <li key={idx} className="text-gray-700 flex items-start">
                              <span className="text-green-500 mr-3 mt-1">✓</span>
                              <span>{inclusion}</span>
                            </li>
                          ))
                        : selectedPackage.inclusions.map((inclusion, idx) => (
                            <li key={idx} className="text-gray-700 flex items-start">
                              <span className="text-green-500 mr-3 mt-1">✓</span>
                              <span>{inclusion}</span>
                            </li>
                          ))
                      }
                    </ul>
                  </div>

                  <div className="pt-6 border-t-2 border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 font-medium">Package Price:</span>
                      <p className="text-3xl sm:text-4xl font-bold text-gray-900">
                        ₱{parseFloat(selectedPackage.price_range).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientCustomized;