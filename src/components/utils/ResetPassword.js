import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [tokenValid, setTokenValid] = useState(false);
  const [tokenError, setTokenError] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const n = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setTokenError('Invalid reset token');
        setTokenValid(false);
        setIsValidating(false);
        return;
      }

      try {
        const response = await axios.post(`${n}/api/components/validate-reset-token.php`, {
          token
        });

        if (response.data.valid) {
          setTokenValid(true);
          setTokenError('');
        } else {
          setTokenValid(false);
          setTokenError(response.data.message || 'Invalid reset token');
        }
      } catch (error) {
        setTokenValid(false);
        const errorMsg = error.response?.data?.message || 'Unable to validate reset token';
        setTokenError(errorMsg);
        
        // Check for specific error reasons
        if (error.response?.data?.reason === 'already_used') {
          setTokenError('This reset link has already been used. Please request a new password reset.');
        } else if (error.response?.data?.reason === 'expired') {
          setTokenError('This reset link has expired. Please request a new password reset.');
        }
      } finally {
        setIsValidating(false);
      }
    };

    validateToken();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      setIsLoading(false);
      return;
    }

    // Check password strength
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);

    if (!hasUpperCase || !hasLowerCase || !hasNumber) {
      setError('Password must contain at least one uppercase letter, one lowercase letter, and one number');
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${n}/api/components/reset-password.php`, {
        token,
        password
      });

      if (response.data.success) {
        setMessage(response.data.message);
        // Redirect to login page after 3 seconds
        setTimeout(() => {
          navigate('/gomez/auth');
        }, 3000);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'An error occurred. Please try again.';
      setError(errorMsg);
      
      // If token was already used, disable the form
      if (errorMsg.includes('already been used') || errorMsg.includes('already used')) {
        setTokenValid(false);
        setTokenError(errorMsg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while validating token
  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
          <div className="text-center">
            <svg className="animate-spin h-12 w-12 text-gray-800 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <h2 className="text-xl font-semibold text-gray-800">Validating reset link...</h2>
          </div>
        </div>
      </div>
    );
  }

  // Show error if token is invalid
  if (!tokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
          <div className="text-center">
            <div className="text-red-600 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Invalid Reset Link</h2>
            <p className="text-gray-600 mb-6">{tokenError || 'This password reset link is invalid or has expired.'}</p>
            <button
              onClick={() => navigate('/gomez/forgot-password')}
              className="w-full px-4 py-3 text-white bg-gray-800 rounded-lg hover:bg-black focus:outline-none focus:ring-4 focus:ring-gray-300 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Request a New Reset Link
            </button>
            <button
              onClick={() => navigate('/gomez/auth')}
              className="mt-4 text-sm font-medium text-gray-600 hover:text-gray-500 focus:outline-none transition-colors duration-200"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show password reset form if token is valid
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
        </div>
        <h2 className="text-3xl font-bold mb-2 text-center text-gray-800">Reset Password</h2>
        <p className="text-center text-gray-600 mb-8">
          Enter your new password below
        </p>

        {message && (
          <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-lg">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="group">
            <label className="block text-gray-700 text-sm font-medium mb-2">New Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 outline-gray-400 transition-all duration-200 bg-gray-50"
                placeholder="Enter new password"
                required
                disabled={isLoading}
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">Must be at least 8 characters with uppercase, lowercase, and number</p>
          </div>

          <div className="group">
            <label className="block text-gray-700 text-sm font-medium mb-2">Confirm New Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 outline-gray-400 transition-all duration-200 bg-gray-50"
                placeholder="Confirm new password"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-4 py-3 text-white bg-gray-800 rounded-lg hover:bg-black focus:outline-none focus:ring-4 focus:ring-gray-300 disabled:opacity-50 transition-all duration-300 font-medium text-center flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              'Reset Password'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/gomez/auth')}
            className="text-sm font-medium text-gray-600 hover:text-gray-500 focus:outline-none transition-colors duration-200"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;