import axios from 'axios';
import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { EmailContext } from './components/EmailContext';
import { GoogleLogin } from '@react-oauth/google';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";

const Auth = () => {
  const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    telephone: '',
    password: '',
    confirmPassword: '',
  });
  const navigate = useNavigate();
  const { setEmail } = useContext(EmailContext);

  const [animateForm, setAnimateForm] = useState(false);

  useEffect(() => {
    setAnimateForm(true);
    const timer = setTimeout(() => setAnimateForm(false), 500);
    return () => clearTimeout(timer);
  }, [isLogin]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (formData.email === 'super@gmail.com' && formData.password === 'super12345') {
      navigate('/super-admin');
    }



    // Check if passwords match
    if (!isLogin && formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      setIsLoading(false);
      return;
    }

    const url = isLogin ? 'http://localhost/apii/components/login.php' : 'http://localhost/apii/components/register.php';

    try {
      console.log("Form Data:", formData);
      const response = await axios.post(url, formData);
      console.log("Response Data:", response.data);

      if (response && response.data) {
        if (response.data.message === "Login successful") {
          setEmail(formData.email);
          // Store user role in localStorage
          localStorage.setItem('userRole', response.data.user.role);

          const userRole = response.data.user.role;

          

          if (userRole === 'admin') {
            alert('Login successful as admin');
            navigate('/dashboard-admin/home');
          } else if (userRole === 'client') {
            alert('Login successful as client');
            navigate('/dashboard-client');
          } else if (userRole === 'superadmin') {
            alert('Login successful as super admin');
            navigate('/super-admin');
          } else {
            // Default case if role is undefined or not recognized
            alert('Login successful');
            navigate('/dashboard-client');
          }
        } else if (response.data.message === "Registration successful") {
          alert("Registration successful");
          setIsLogin(true); // Switch to login form after successful registration
        } else {
          alert(response.data.message);
        }
      } else {
        alert('Error: Unexpected response format');
      }
    } catch (error) {
      console.error("Error:", error);
      if (error.response && error.response.data) {
        alert('Error: ' + error.response.data.message);
      } else {
        alert('Error: ' + error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setIsLoading(true);

    try {
      // Use jwtDecode instead of jwt_decode
      const decoded = jwtDecode(credentialResponse.credential);
      const { email, name, picture, sub } = decoded;

      // Prepare data for backend
      const googleData = {
        email,
        username: name || email.split('@')[0], // Fallback to email prefix if no name
        googleId: sub,
        avatar: picture
      };

      // Send to backend for verification/registration
      const response = await axios.post(
        'http://localhost/apii/components/google-auth.php',
        googleData
      );

      if (response.data.message === "Login successful" || response.data.message === "Registration successful") {
        setEmail(email);
        // Store user role in localStorage
        localStorage.setItem('userRole', response.data.user?.role || 'client');

        const userRole = response.data.user?.role || 'client';

        if (userRole === 'admin') {
          navigate('/dashboard-admin/home');
        } else if (userRole === 'superadmin') {
          navigate('/super-admin');
        } else {
          navigate('/dashboard-client');
        }
      } else {
        alert(response.data.message || "Google authentication failed");
      }
    } catch (error) {
      console.error("Google auth error:", error);
      alert("Google authentication failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleFailure = (error) => {
    if (error.error !== 'idpiframe_initialization_failed') {
      console.error('Google login failed:', error);
      alert('Google login failed. Please try again.');
    }
  };

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className={`bg-white p-8 rounded-lg shadow-lg w-full max-w-md transition-all duration-500 ${animateForm ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </div>
          <h2 className="text-3xl font-bold mb-2 text-center text-gray-800">
            {isLogin ? 'Welcome' : 'Create Account'}
          </h2>
          <p className="text-center text-gray-600 mb-8">
            {isLogin ? 'Sign in to access your account' : 'Fill in your details to get started'}
          </p>
          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="group">
                <label className="block text-gray-700 text-sm font-medium mb-2">Username</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 outline-gray-400 transition-all duration-200 bg-gray-50"
                    placeholder="Enter your username"
                    required
                  />
                </div>
              </div>
            )}
            <div className="group">
              <label className="block text-gray-700 text-sm font-medium mb-2">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 outline-gray-400 transition-all duration-200 bg-gray-50"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>
            {!isLogin && (
              <div className="group">
                <label className="block text-gray-700 text-sm font-medium mb-2">Telephone</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                  </div>
                  <input
                    type="tel"
                    name="telephone"
                    value={formData.telephone}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 outline-gray-400 transition-all duration-200 bg-gray-50"
                    placeholder="Enter your phone number"
                    required
                  />
                </div>
              </div>
            )}
            <div className="group">
              <label className="block text-gray-700 text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 outline-gray-400 transition-all duration-200 bg-gray-50"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>
            {!isLogin && (
              <div className="group">
                <label className="block text-gray-700 text-sm font-medium mb-2">Confirm Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 outline-gray-400 transition-all duration-200 bg-gray-50"
                    placeholder="Confirm your password"
                    required
                  />
                </div>
              </div>
            )}
            {isLogin && (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-600">
                    Remember me
                  </label>
                </div>
                <div className="text-sm">
                  <a href="#" className="font-medium text-gray-600 hover:text-gray-500 transition-colors duration-200">
                    Forgot password?
                  </a>
                </div>
              </div>
            )}
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
                isLogin ? 'Sign In' : 'Create Account'
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button
                type="button"
                onClick={() => {
                  setAnimateForm(true);
                  setTimeout(() => {
                    setIsLogin(!isLogin);
                    setFormData({
                      username: '',
                      email: '',
                      telephone: '',
                      password: '',
                      confirmPassword: '',
                    });
                  }, 200);
                }}
                className="ml-1 font-medium text-gray-600 hover:text-gray-500 focus:outline-none transition-colors duration-200"
              >
                {isLogin ? 'Sign up now' : 'Sign in'}
              </button>
            </p>
          </div>

          {!isLogin && (
            <p className="mt-4 text-xs text-center text-gray-500">
              By creating an account, you agree to our
              <a href="#" className="text-gray-600 hover:underline"> Terms of Service</a> and
              <a href="#" className="text-gray-600 hover:underline"> Privacy Policy</a>
            </p>
          )}

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-6 flex justify-center gap-3">
              {/* GitHub button (unchanged) */}
              <button
                type="button"
                className="w-full inline-flex justify-center py-2.5 px-4 border border-gray-200 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 0C4.477 0 0 4.477 0 10c0 4.42 2.865 8.166 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.03-2.682-.103-.253-.447-1.27.098-2.646 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.376.202 2.394.1 2.646.64.699 1.026 1.591 1.026 2.682 0 3.841-2.337 4.687-4.565 4.934.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10c0-5.523-4.478-10-10-10z" clipRule="evenodd" />
                </svg>
              </button>

              {/* Google button - updated */}
              <div className="w-full flex justify-center items-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleFailure}
                  useOneTap
                  theme="filled_blue"
                  size="medium"
                  text="continue_with"
                  shape="circle"
                  logo_alignment="left"
                  logo_type="default"
                  logo_color="white"
                  logo_size="small"
                  logo_style="filled"
                  logo_shape="circle"
                  logo_color_scheme="light"
                  logo_shape_style="filled"
                  logo_shape_color="white"
                  logo_shape_color_scheme="light"
                  logo_shape_color_style="filled"
                  logo_shape_color_style_scheme="light"

                  auto_select
                  width="200"
                />
              </div>

              <button
                type="button"
                className="w-full inline-flex justify-center py-2.5 px-4 border border-gray-200 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16.365 1.43c0 1.14-.493 2.27-1.177 3.08-.744.9-1.99 1.57-2.987 1.57-.12 0-.23-.02-.3-.03-.01-.06-.04-.22-.04-.39 0-1.15.572-2.27 1.206-2.98.804-.94 2.142-1.64 3.248-1.68.03.13.05.28.05.43zm4.565 15.71c-.03.07-.463 1.58-1.518 3.12-.945 1.34-1.94 2.71-3.43 2.71-1.517 0-1.9-.88-3.63-.88-1.698 0-2.302.91-3.67.91-1.377 0-2.332-1.26-3.428-2.8-1.287-1.82-2.323-4.63-2.323-7.28 0-4.28 2.797-6.55 5.552-6.55 1.448 0 2.675.95 3.6.95.865 0 2.222-1.01 3.902-1.01.613 0 2.886.06 4.374 2.19-.13.09-2.383 1.37-2.383 4.19 0 3.26 2.854 4.42 2.955 4.45z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default Auth;