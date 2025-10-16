import React, { useState, useContext } from 'react';
import { API_BASE_URL } from '../Api';
import { EmailContext } from '../utils/EmailContext';
import { useServices } from '../hooks/client/useServices';
import { useUser } from '../hooks/client/useUser';
import ServiceDetail from './ClientServiceDetail'; 

const ClientServices = () => {
  const [selectedService, setSelectedService] = useState(null);
  const [notification, setNotification] = useState(null);
  const { email } = useContext(EmailContext);
  
  // Use custom hooks
  const { services, loading, error, refetch: refetchServices } = useServices();
  const { userId, isLoggedIn } = useUser(email);

  // Notification function
  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const getInclusionIcon = (inclusionsCount) => {
    if (!inclusionsCount) return null;

    const colors = {
      low: 'bg-blue-50 text-blue-600',
      medium: 'bg-blue-50 text-blue-600',
      high: 'bg-blue-50 text-blue-600'
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