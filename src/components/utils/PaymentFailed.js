import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const PaymentFailed = () => {
  const location = useLocation();

  const urlParams = new URLSearchParams(location.search);
  const errorMessage = urlParams.get('error') || 'Your payment could not be processed.';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Payment Failed
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {errorMessage}
          </p>
          <p className="mt-2 text-sm text-gray-600">
            Please try again or use a different payment method.
          </p>
          
          <div className="mt-6">
            <Link
              to="/gomez/dashboard-client/cart"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Try Again
            </Link>
          </div>
          
          <div className="mt-4">
            <Link
              to="/gomez/dashboard-client/menu"
              className="text-sm text-gray-600 hover:text-gray-500"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailed;