import React, { useState, useContext, useRef, useEffect } from 'react';
import { EmailContext } from '../utils/EmailContext';
import toast, { Toaster } from 'react-hot-toast';
import { useServices } from '../hooks/client/useServices';
import { useUser } from '../hooks/client/useUser';
import { useMenuItems } from '../hooks/client/useMenuItems';
import { useQuantities } from '../hooks/client/useQuantities';
import { usePurchase } from '../hooks/client/usePurchase';
import ServiceDetail from './ClientServiceDetail';

const ClientServices = () => {
  const [selectedService, setSelectedService] = useState(null);
  const { email } = useContext(EmailContext);
  const servicesRef = useRef([]);
  const customizationItemsRef = useRef([]);
  const otherProductsRef = useRef([]);
  
  // Custom hooks for services
  const { services, loading: servicesLoading, error: servicesError, refetch: refetchServices } = useServices();
  const { userId, isLoggedIn } = useUser(email);
  
  // Custom hooks for menu items
  const { items, loading: itemsLoading, error: itemsError, updateItemStock } = useMenuItems();
  const { quantities, handleQuantityChange } = useQuantities(items);
  const { handleBuy, purchasing } = usePurchase(isLoggedIn, userId, updateItemStock);

  // Filter items based on whether details contains "item"
  const customizationItems = items.filter(item => 
    !item.details?.toLowerCase().includes('item')
  );
  
  const otherProducts = items.filter(item => 
    item.details?.toLowerCase().includes('item')
  );

  // Intersection Observer for scroll animations
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

    [...servicesRef.current, ...customizationItemsRef.current, ...otherProductsRef.current].forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => {
      [...servicesRef.current, ...customizationItemsRef.current, ...otherProductsRef.current].forEach((ref) => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, [services, customizationItems, otherProducts]);

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

  const onBuyClick = (itemId) => {
    const quantity = quantities[itemId];
    handleBuy(itemId, quantity);
  };

  const getInclusionIcon = (inclusionsCount) => {
    if (!inclusionsCount) return null;

    return (
      <div className="flex justify-center mb-4">
        <div className="h-16 w-16 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200">
          <span className="text-xl font-bold text-blue-600">
            {inclusionsCount}{inclusionsCount > 6 ? '+' : ''}
          </span>
        </div>
      </div>
    );
  };

  // Function to get the best available image for service card
  const getServiceImage = (service) => {
    // Priority: casket_image > cover_image > first casket image > placeholder
    
    // Check if service has direct casket_image
    if (service.casket_image) {
      return `http://localhost/funeraria/api/components/uploads/caskets/${service.casket_image}`;
    }
    
    // Check if service has cover_image
    if (service.cover_image) {
      return `http://localhost/funeraria/api/components/uploads/caskets/${service.cover_image}`;
    }
    
    // Check if service has caskets array and first casket has image
    if (service.caskets && Array.isArray(service.caskets) && service.caskets.length > 0 && service.caskets[0].image) {
      return `http://localhost/funeraria/api/components/uploads/caskets/${service.caskets[0].image}`;
    }
    
    return `http://localhost/funeraria/api/components/uploads/caskets/${service.cover_image}`;
  };

  // Render menu item card
  const renderMenuItemCard = (item, index, refArray) => (
    <div
      key={item.id}
      ref={el => refArray.current[index] = el}
      className="menu-card rounded-xl overflow-hidden"
    >
      <div className="relative">
        <img
          src={`http://localhost/funeraria/api/components/${item.image_path}`}
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
        <p className="text-gray-600 mb-4 text-sm leading-relaxed">{item.details}</p>
        <div className="flex items-center justify-between mb-4">
          <p className="text-gray-900 font-bold text-xl">₱{parseFloat(item.price)}</p>
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
            className={`btn-primary px-4 py-2 rounded-lg text-sm font-medium flex-grow ${
              !isLoggedIn || item.stock < 1 || purchasing
                ? 'opacity-50 cursor-not-allowed'
                : 'text-white'
            }`}
          >
            {purchasing ? 'Adding...' : item.stock < 1 ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );

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
            
            .service-card, .menu-card {
              transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
              background: linear-gradient(145deg, #ffffff, #f3f4f6);
              border: 1px solid rgba(0, 0, 0, 0.1);
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
              opacity: 0;
              transform: translateY(30px);
            }
            
            .service-card:hover, .menu-card:hover {
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
              backdrop-filter: blur(4px);
              background: rgba(0, 0, 0, 0.6);
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

        {/* Service Packages Section */}
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

                return (
                  <div
                    key={service.id}
                    ref={el => servicesRef.current[index] = el}
                    className="service-card rounded-xl overflow-hidden cursor-pointer"
                    onClick={() => isLoggedIn && setSelectedService(service)}
                  >
                    <div className="relative h-48 w-full overflow-hidden">
                      <img
                        src={serviceImage}
                        alt={service.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                    </div>
                    <div className="p-6">
                      {!serviceImage.includes('placeholder') && getInclusionIcon(inclusions.length)}
                      <h2 className="text-2xl font-bold text-gray-900 mb-3">{service.name}</h2>
                      <p className="text-gray-600 mb-6 line-clamp-3">{service.description}</p>
                      <div className="flex items-center text-sm text-gray-500 mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        {inclusions.length} inclusions
                      </div>
                      {isLoggedIn && (
                        <button
                          className="w-full btn-primary text-white py-2 px-4 rounded-lg font-medium"
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
          )}
        </div>

        {/* Package Customization Section */}
        <div className="mb-16">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Gomez Package Customization</h1>
            <p className="text-gray-600">Customize your service package with our additional options</p>
          </div>

          {customizationItems.length === 0 ? (
            <div className="text-center p-8 bg-white rounded-xl shadow-inner border border-gray-200">
              <p className="text-lg text-gray-600">No customization options available at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {customizationItems.map((item, index) => renderMenuItemCard(item, index, customizationItemsRef))}
            </div>
          )}
        </div>

        {/* Other Products Section */}
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
              {otherProducts.map((item, index) => renderMenuItemCard(item, index, otherProductsRef))}
            </div>
          )}
        </div>
      </div>

      {selectedService && (
        <ServiceDetail
          service={selectedService}
          onClose={() => setSelectedService(null)}
          refetchServices={refetchServices}
          showNotification={showNotification}
          userId={userId}
          isLoggedIn={isLoggedIn}
        />
      )}
    </div>
  );
};

export default ClientServices;