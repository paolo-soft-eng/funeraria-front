import React, { useState, useContext, useEffect } from 'react';
import { EmailContext } from '../EmailContext';

const ClientContact = () => {
  const { email } = useContext(EmailContext);
  const [formData, setFormData] = useState({
    name: 'Gomez Funeral',
    email: email || '',
    phone: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setFormData(prevData => ({
      ...prevData,
      email: email || ''
    }));
  }, [email]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    e.preventDefault();
  
  // Client-side validation
  if (!formData.name.trim()) {
    setError('Company name is required');
    return;
  }
  
  if (!formData.email.trim()) {
    setError('Email is required');
    return;
  }

    try {
      const response = await fetch('http://localhost/apii/components/contact_submit.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit the form');
      }

      if (result.email_error) {
        console.warn('Form submitted but email failed:', result.email_error);
        setError('Request submitted but email confirmation failed');
      } else {
        console.log('Form submitted successfully:', result);
      }

      setIsSubmitting(false);
      setIsSubmitted(true);

      setTimeout(() => {
        setIsSubmitted(false);
        setFormData({ name: '', email: email || '', phone: '', message: '' });
      }, 5000);
    } catch (err) {
      console.error('Error submitting form:', err);
      setIsSubmitting(false);
      setError(err.message || 'An unexpected error occurred. Please try again.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        {isSubmitted ? (
          <div className="text-center py-16 md:py-20 px-6">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-50 mb-6">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">Thank You for Reaching Out</h3>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">We understand this is a difficult time. A member of our team will contact you shortly to provide assistance.</p>
          </div>
        ) : (
          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-center justify-center mb-8 gap-4">
              <div className="bg-blue-100 rounded-full p-4">
                <svg className="w-8 h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                </svg>
              </div>
              <div className="text-center md:text-left">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Contact Our Care Team</h2>
                <p className="text-gray-600 mt-2">We're here to provide guidance and support during this difficult time.</p>
              </div>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <p className="text-red-700 font-medium">{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-gray-700 text-sm font-medium" htmlFor="name">
                    Company Name
                  </label>
                  <input
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 transition-all"
                    id="name"
                    type="text"
                    name="name"
                    value={formData.name} 
                    onChange={handleChange}
                    placeholder="Name here"
                    required
                    aria-required="true"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-gray-700 text-sm font-medium" htmlFor="email">
                    Email Address
                  </label>
                  <input
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 transition-all"
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Email here"
                    required
                    aria-required="true"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-gray-700 text-sm font-medium" htmlFor="phone">
                  Phone Number
                </label>
                <input
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 transition-all"
                  id="phone"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Phone Number here"
                  required
                  aria-required="true"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-gray-700 text-sm font-medium" htmlFor="message">
                  How Can We Help You?
                </label>
                <textarea
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 transition-all min-h-[120px] resize-none"
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Please share any specific needs or questions you have..."
                  required
                  aria-required="true"
                />
              </div>

              <div className="pt-4">
                <button
                  className="w-full bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-6 rounded-xl focus:outline-none  shadow-lg transition-all flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <span>Request Assistance</span>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-10 pt-8 border-t border-gray-200">
              <div className="text-center space-y-4">
                <div className="bg-blue-50 rounded-xl p-6 max-w-md mx-auto">
                  <p className="text-gray-600 mb-2">For immediate assistance, please call our 24/7 helpline</p>
                  <p className="text-2xl font-bold text-gray-700">09123456789</p>
                </div>
                <div className="flex justify-center space-x-8">
                  <a href="#" className="text-gray-500 hover:text-blue-700 transition-colors">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z" />
                    </svg>
                  </a>
                  <a href="#" className="text-gray-500 hover:text-blue-700 transition-colors">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 10.049 10.049 0 01-3.127 1.195 4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.902 4.902 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                    </svg>
                  </a>
                  <a href="#" className="text-gray-500 hover:text-blue-700 transition-colors">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0C5.383 0 0 5.383 0 12s5.383 12 12 12 12-5.383 12-12S18.617 0 12 0zm-1.95 14.925L7.4 12.2l.906-.906 1.744 1.8 4.094-4.2.9.9-5.094 5.131z" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientContact;
