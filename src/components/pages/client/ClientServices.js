import React, { useState, useContext, useRef, useEffect } from 'react';
import { EmailContext } from '../../utils/EmailContext';
import toast, { Toaster } from 'react-hot-toast';
import { useServices } from '../../hooks/client/useServices';
import { useItems } from '../../hooks/client/useItems';
import { useUser } from '../../hooks/client/useUser';
import { useServiceItems } from '../../hooks/client/useServiceItems';
import ServiceDetail from './ClientServiceDetail';
import { API_BASE_URL } from '../../service/Api';

const ClientServices = () => {
  const [selectedService, setSelectedService] = useState(null);
  const [openDirectlyToForm, setOpenDirectlyToForm] = useState(false);
  const [showChapelModal, setShowChapelModal] = useState(false);
  const [selectedServiceForChapel, setSelectedServiceForChapel] = useState(null);
  const { email } = useContext(EmailContext);
  const servicesRef = useRef([]);
  const n = process.env.REACT_APP_API_URL;

  const { services, loading: servicesLoading, error: servicesError, refetch: refetchServices } = useServices();
  const { items, loading: itemsLoading, error: itemsError, getStockByItemId, refetch: refetchItems } = useItems();
  const { userId, isLoggedIn } = useUser(email);

  useEffect(() => {
    if (services.length > 0 && items.length > 0) {
      console.log('Services:', services);
      console.log('Items:', items);
      console.log('Service-Item mapping:');
      services.forEach(service => {
        const stock = getStockByItemId(service.item_id);
        console.log(`Service: ${service.name}, item_id: ${service.item_id}, Stock: ${stock}`);
      });
    }
  }, [services, items]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStockStatus = (stock) => {
    if (stock === null || stock === undefined) return { text: 'N/A', color: 'gray' };
    if (stock === 0) return { text: 'Out of Stock', color: 'red' };
    if (stock <= 5) return { text: `Low Stock (${stock})`, color: 'yellow' };
    return { text: `In Stock (${stock})`, color: 'green' };
  };

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

    servicesRef.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => {
      servicesRef.current.forEach((ref) => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, [services]);

  const showNotification = (message, type = 'info') => {
    if (type === 'success') {
      toast.success(message);
    } else if (type === 'error') {
      toast.error(message);
    } else if (type === 'warning') {
      toast(message, { icon: '⚠️' });
    } else {
      toast(message);
    }
  };

  const handleOrderNow = (service) => {
    const stock = getStockByItemId(service.item_id);
    if (stock === 0) {
      showNotification('This service is currently out of stock', 'error');
      return;
    }
    
    // Show chapel selection modal first
    setSelectedServiceForChapel(service);
    setShowChapelModal(true);
  };

  const [preSelectedChapels, setPreSelectedChapels] = useState([]);

  const handleChapelSelectionComplete = (selectedChapels) => {
    setShowChapelModal(false);
    setPreSelectedChapels(selectedChapels);
    setSelectedService(selectedServiceForChapel);
    setOpenDirectlyToForm(true);
    setSelectedServiceForChapel(null);
  };

  const handleViewDetails = (service) => {
    setSelectedService(service);
    setOpenDirectlyToForm(false);
  };

  const handleCloseModal = () => {
    setSelectedService(null);
    setOpenDirectlyToForm(false);
  };

  const handleCloseChapelModal = () => {
    setShowChapelModal(false);
    setSelectedServiceForChapel(null);
  };

  const getServiceImage = (service) => {
    if (service.casket_image) {
      return `${n}/api/components/uploads/caskets/${service.casket_image}`;
    }

    if (service.cover_image) {
      return `${n}/api/components/uploads/caskets/${service.cover_image}`;
    }

    if (service.caskets && Array.isArray(service.caskets) && service.caskets.length > 0 && service.caskets[0].image) {
      return `${n}/api/components/uploads/caskets/${service.caskets[0].image}`;
    }

    return `${n}/api/components/uploads/caskets/${service.cover_image}`;
  };

  const loading = servicesLoading || itemsLoading;
  const error = servicesError || itemsError;

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

            .animate-section {
              animation: fadeIn 1.2s ease forwards, slideUp 1s ease 0.3s both;
            }
            
            .service-card {
              transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
              background: linear-gradient(145deg, #ffffff, #f3f4f6);
              border: 1px solid rgba(0, 0, 0, 0.1);
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
              opacity: 0;
              transform: translateY(30px);
            }
            
            .service-card:hover {
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
            
            .btn-primary:active:not(:disabled) {
              transform: translateY(1px);
            }

            .stock-badge {
              display: inline-flex;
              align-items: center;
              padding: 0.25rem 0.75rem;
              border-radius: 9999px;
              font-size: 0.75rem;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.025em;
            }

            .stock-green {
              background-color: #d1fae5;
              color: #065f46;
            }

            .stock-yellow {
              background-color: #fef3c7;
              color: #92400e;
            }

            .stock-red {
              background-color: #fee2e2;
              color: #991b1b;
            }

            .stock-gray {
              background-color: #f3f4f6;
              color: #6b7280;
            }
          `
        }} />

        <Toaster
          position="top-right"
          reverseOrder={false}
          gutter={8}
          toastOptions={{
            className: '',
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
              fontSize: '14px',
              borderRadius: '8px',
              padding: '12px 16px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            },
            success: {
              duration: 4000,
              style: {
                background: '#10b981',
                color: '#ffffff',
              },
            },
            error: {
              duration: 4000,
              style: {
                background: '#ef4444',
                color: '#ffffff',
              },
            },
          }}
        />

        <div className="mb-16">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Gomez Service Packages</h1>
            <p className="text-gray-600">Choose from our carefully curated funeral service packages</p>
          </div>

          {!isLoggedIn && (
            <div className="bg-yellow-50 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6 rounded-r-lg">
              <p className="font-medium">Please log in to view service details and make purchases.</p>
            </div>
          )}

          {services.length === 0 ? (
            <div className="text-center p-8 bg-white rounded-xl shadow-inner border border-gray-200">
              <p className="text-lg text-gray-600">No service packages available at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service, index) => {
                const inclusions = Array.isArray(service.inclusions) ? service.inclusions : [];
                const serviceImage = getServiceImage(service);
                const stock = getStockByItemId(service.item_id);
                const stockStatus = getStockStatus(stock);
                const isOutOfStock = stock === 0;

                return (
                  <div
                    key={service.id}
                    ref={el => servicesRef.current[index] = el}
                    className={`service-card rounded-xl overflow-hidden cursor-pointer ${isOutOfStock ? 'opacity-75' : ''}`}
                    onClick={() => isLoggedIn && !isOutOfStock && handleViewDetails(service)}
                  >
                    <div className="relative h-48 w-full overflow-hidden">
                      <img
                        src={serviceImage}
                        alt={service.name}
                        className={`w-full h-full object-cover ${isOutOfStock ? 'grayscale' : ''}`}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                      
                      <div className="absolute top-3 right-3">
                        <span className={`stock-badge stock-${stockStatus.color}`}>
                          {stockStatus.text}
                        </span>
                      </div>
                    </div>
                    <div className="p-6">
                      <h2 className="text-2xl font-bold text-gray-900 mb-3">{service.name}</h2>
                      <div className="mb-4">
                        <p className="text-2xl font-bold text-gray-900">₱{formatCurrency(parseFloat(service.price_range))}</p>
                      </div>

                      <div className="flex items-center text-sm text-gray-500 mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        {inclusions.length} inclusions
                      </div>

                      {isLoggedIn && (
                        <div className="flex gap-2">
                          <button
                            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors duration-200 ${
                              isOutOfStock 
                                ? 'bg-gray-400 cursor-not-allowed text-white' 
                                : 'bg-green-600 hover:bg-green-700 text-white'
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOrderNow(service);
                            }}
                            disabled={isOutOfStock}
                          >
                            {isOutOfStock ? 'Out of Stock' : 'Add to order'}
                          </button>
                          <button
                            className="flex-1 btn-primary text-white py-2 px-4 rounded-lg font-medium"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewDetails(service);
                            }}
                          >
                            View Details
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Chapel Selection Modal */}
      {showChapelModal && selectedServiceForChapel && (
        <ChapelSelectionModal
          service={selectedServiceForChapel}
          onClose={handleCloseChapelModal}
          onComplete={handleChapelSelectionComplete}
          showNotification={showNotification}
        />
      )}

      {selectedService && (
        <ServiceDetail
          service={selectedService}
          onClose={handleCloseModal}
          refetchServices={refetchServices}
          refetchItems={refetchItems}
          showNotification={showNotification}
          userId={userId}
          isLoggedIn={isLoggedIn}
          openDirectlyToForm={openDirectlyToForm}
          preSelectedChapels={preSelectedChapels}
          isOutOfStock={getStockByItemId(selectedService.item_id) === 0}
        />
      )}
    </div>
  );
};

// Chapel Selection Modal Component
const ChapelSelectionModal = ({ service, onClose, onComplete, showNotification }) => {
  const [selectedChapels, setSelectedChapels] = useState([]);
  const { chapels, loadingItems, refetchItems } = useServiceItems(service.id, showNotification);

  useEffect(() => {
    refetchItems();
  }, []);

  const handleChapelSelect = (chapel) => {
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
  };

  const handleContinue = () => {
    onComplete(selectedChapels);
  };

  const formatDateTime = (date) => {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeUntilAvailable = (occupiedUntil) => {
    if (!occupiedUntil) return null;
    const until = new Date(occupiedUntil);
    const now = new Date();
    const timeDiff = until.getTime() - now.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    const hoursDiff = Math.ceil(timeDiff / (1000 * 60 * 60));

    if (daysDiff > 1) return `${daysDiff} days`;
    if (daysDiff === 1) return '1 day';
    if (hoursDiff > 1) return `${hoursDiff} hours`;
    if (hoursDiff === 1) return '1 hour';
    return 'Less than an hour';
  };

  const isAvailableNow = (chapel) => {
    if (!chapel.is_occupied) return true;
    if (!chapel.occupied_until) return true;
    const until = new Date(chapel.occupied_until);
    return new Date() >= until;
  };

  const getStatusInfo = (chapel) => {
    if (!chapel.is_occupied || isAvailableNow(chapel)) {
      return {
        text: 'Available Now',
        color: 'bg-green-100 text-green-800',
        borderColor: 'border-green-300'
      };
    }

    const timeUntilAvailable = getTimeUntilAvailable(chapel.occupied_until);
    return {
      text: `Available in ${timeUntilAvailable}`,
      color: 'bg-yellow-100 text-yellow-800',
      borderColor: 'border-yellow-300'
    };
  };

  return (
    <div
      className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-4xl relative flex flex-col"
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
          <h2 className="text-3xl font-bold text-gray-900 mb-2">{service.name}</h2>
          <p className="text-lg text-gray-600 mb-8">Select available chapels for your service</p>

          {loadingItems ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
            </div>
          ) : chapels.length === 0 ? (
            <div className="text-center p-8 bg-gray-50 rounded-xl">
              <p className="text-lg text-gray-600">No chapels available for this service.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              {chapels.map((chapel) => {
                const isOccupied = chapel.is_occupied;
                const isSelected = selectedChapels.some(c => c.id === chapel.id);
                const statusInfo = getStatusInfo(chapel);
                const available = isAvailableNow(chapel);

                return (
                  <div
                    key={chapel.id}
                    className={`bg-white rounded-xl shadow-sm overflow-hidden transition-all duration-200 relative ${
                      isOccupied && !available
                        ? 'opacity-70 cursor-not-allowed'
                        : isSelected
                          ? 'ring-2 ring-gray-900 cursor-pointer'
                          : 'hover:shadow-md cursor-pointer'
                    } ${statusInfo.borderColor} border-2`}
                    onClick={() => {
                      if (isOccupied && !available) {
                        showNotification?.('This chapel is currently occupied and cannot be selected', 'warning');
                      } else {
                        handleChapelSelect(chapel);
                      }
                    }}
                  >
                    {isOccupied && !available && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold z-10 shadow-lg flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        OCCUPIED
                      </div>
                    )}

                    {isSelected && (
                      <div className="absolute top-2 left-2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold z-10 shadow-lg flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        SELECTED
                      </div>
                    )}

                    {chapel.image && (
                      <div className="h-48 w-full relative">
                        <img
                          src={`${API_BASE_URL}/components/uploads/chapels/${chapel.image}`}
                          alt={chapel.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = `${API_BASE_URL}/components/uploads/default.jpg`;
                          }}
                        />
                        {isOccupied && !available && (
                          <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                            <div className="text-center text-white p-4">
                              <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                              </svg>
                              <p className="font-bold text-lg">Currently Occupied</p>
                              <p className="text-sm mt-1">Available on:</p>
                              <p className="font-semibold">{formatDateTime(chapel.occupied_until)}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-lg text-gray-900">{chapel.name}</h4>
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${statusInfo.color}`}>
                          {statusInfo.text}
                        </span>
                      </div>

                      {isOccupied && !available ? (
                        <div className="space-y-2 bg-gray-50 p-3 rounded-lg">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Occupied since:</span>
                            <span className="text-sm font-medium">{formatDateTime(chapel.occupied_at)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Available from:</span>
                            <span className="text-sm font-medium text-green-600">{formatDateTime(chapel.occupied_until)}</span>
                          </div>
                          <div className="text-center mt-2">
                            <p className="text-xs text-gray-500">
                              {getTimeUntilAvailable(chapel.occupied_until)} until available
                            </p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-600">Click to select this chapel</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="border-t border-gray-200 pt-6 mt-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="text-sm text-gray-600">Selected Chapels: {selectedChapels.length}</p>
                {selectedChapels.length > 0 && (
                  <div className="mt-2">
                    {selectedChapels.map(chapel => (
                      <span key={chapel.id} className="inline-block bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm mr-2 mb-2">
                        {chapel.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-4">
              <button
                className="flex-1 bg-gray-100 text-gray-900 py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                onClick={onClose}
                type="button"
              >
                Cancel
              </button>
              <button
                className="flex-1 bg-gray-900 text-white py-3 px-6 rounded-lg hover:bg-gray-800 transition-colors duration-200"
                onClick={handleContinue}
                type="button"
              >
                Continue to Order
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientServices;