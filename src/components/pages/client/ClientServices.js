import React, { useState, useContext, useRef, useEffect } from 'react';
import { EmailContext } from '../../utils/EmailContext';
import toast, { Toaster } from 'react-hot-toast';
import { useServices } from '../../hooks/client/useServices';
import { useUser } from '../../hooks/client/useUser';
import ServiceDetail from './ClientServiceDetail';

const ClientServices = () => {
  const [selectedService, setSelectedService] = useState(null);
  const [openDirectlyToForm, setOpenDirectlyToForm] = useState(false);
  const { email } = useContext(EmailContext);
  const servicesRef = useRef([]);

  // Custom hooks for services
  const { services, loading: servicesLoading, error: servicesError, refetch: refetchServices } = useServices();
  const { userId, isLoggedIn } = useUser(email);

  // Helper function to format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

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
    setSelectedService(service);
    setOpenDirectlyToForm(true);
  };

  const handleViewDetails = (service) => {
    setSelectedService(service);
    setOpenDirectlyToForm(false);
  };

  const handleCloseModal = () => {
    setSelectedService(null);
    setOpenDirectlyToForm(false);
  };

  // Function to get the best available image for service card
  const getServiceImage = (service) => {
    // Priority: casket_image > cover_image > first casket image > placeholder

    // Check if service has direct casket_image
    if (service.casket_image) {
      return `http://192.168.100.99:8000/components/uploads/caskets/${service.casket_image}`;
    }

    // Check if service has cover_image
    if (service.cover_image) {
      return `http://192.168.100.99:8000/components/uploads/caskets/${service.cover_image}`;
    }

    // Check if service has caskets array and first casket has image
    if (service.caskets && Array.isArray(service.caskets) && service.caskets.length > 0 && service.caskets[0].image) {
      return `http://192.168.100.99:8000/components/uploads/caskets/${service.caskets[0].image}`;
    }

    return `http://192.168.100.99:8000/components/uploads/caskets/${service.cover_image}`;
  };

  const loading = servicesLoading;
  const error = servicesError;

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
                    onClick={() => isLoggedIn && handleViewDetails(service)}
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
                      <h2 className="text-2xl font-bold text-gray-900 mb-3">{service.name}</h2>
                      <p className="text-gray-600 mb-4 line-clamp-3">{service.description}</p>
                      <div className="mb-4">
                        <p className="text-2xl font-bold text-gray-900">₱{formatCurrency(parseFloat(service.price_range))}
                        </p>
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
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOrderNow(service);
                            }}
                          >
                            Order Now
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

      {selectedService && (
        <ServiceDetail
          service={selectedService}
          onClose={handleCloseModal}
          refetchServices={refetchServices}
          showNotification={showNotification}
          userId={userId}
          isLoggedIn={isLoggedIn}
          openDirectlyToForm={openDirectlyToForm}
        />
      )}
    </div>
  );
};

export default ClientServices;