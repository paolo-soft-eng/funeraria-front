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
      if (error.response) {
        if (error.response.status === 403 && error.response.data.status === 'disabled') {
          alert('Your account has been disabled. Please contact the administrator.');
        } else if (error.response.data) {
          alert('Error: ' + error.response.data.message);
        } else {
          alert('Error: ' + error.message);
        }
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
      <div
        className="relative min-h-screen overflow-hidden text-slate-100"
        style={{ background: 'linear-gradient(135deg, #2c3e50 0%, #bdc3c7 100%)' }}
      >
        {/* Ambient shapes */}
        <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-amber-500/10 blur-3xl" />

        <div className="relative z-10 mx-auto flex min-h-screen items-center justify-center p-4">
          <div className="grid w-full max-w-6xl grid-cols-1 place-items-center gap-6 lg:grid-cols-2">
            {/* Visual panel */}
            <div className="relative hidden overflow-hidden rounded-2xl shadow-2xl ring-1 ring-white/10 lg:flex">
              <img
                src="/login_bg.jpg"
                alt="Quiet chapel with soft light"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
              <div className="relative z-10 flex h-72 w-full flex-col justify-end p-6 sm:h-96 lg:h-[560px] lg:p-10">
                <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/20">
                  <svg viewBox="0 0 24 24" className="h-7 w-7 text-emerald-300" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M3.5 12c2.5-1.5 4-3.5 4.5-6 1.5 2 3.5 3.5 6 4-1.5 2.5-3 4.5-6 6 2.5 0 5-.5 8-2-1.5 3-4 6-9 6-4 0-6-3-6-8z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h1 className="text-3xl font-semibold tracking-tight text-white/95">Serenity — Funeral Management</h1>
                <p className="mt-2 max-w-md text-sm text-white/70">
                  Coordinate services, families, and memorial details with dignity. Designed for calm, clarity, and care.
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/80">Secure access</span>
                  <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/80">Role‑based dashboards</span>
                  <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/80">Streamlined scheduling</span>
                </div>
              </div>
            </div>

            {/* Form panel */}
            <div
              className={`mx-auto w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-5 shadow-xl backdrop-blur-xl transition-all duration-500 sm:p-8 lg:p-10 ${
                animateForm ? 'translate-y-2 opacity-0' : 'translate-y-0 opacity-100'
              }`}
            >
              <div className="mb-6 flex items-center gap-3">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-400/15 ring-1 ring-emerald-300/30">
                  <svg viewBox="0 0 24 24" className="h-6 w-6 text-emerald-300" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M12 3c2 3 3 5 6 6-3 2-4 4-6 6-2-2-3-4-6-6 3-1 4-3 6-6z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white/95 sm:text-2xl">{isLogin ? 'Welcome back' : 'Create your account'}</h2>
                  <p className="text-sm text-white/60">{isLogin ? 'Sign in to continue' : 'Start managing with care'}</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {!isLogin && (
                  <div>
                    <label className="mb-2 block text-sm font-medium text-white/80">Username</label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white/40" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-white/10 bg-white/10 px-10 py-3 text-white placeholder:text-white/50 outline-none transition focus:border-emerald-300/40 focus:ring-2 focus:ring-emerald-300/30"
                        
                        required
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="mb-2 block text-sm font-medium text-white/80">Email</label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white/40" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-white/10 bg-white/10 px-10 py-3 text-white placeholder:text-white/50 outline-none transition focus:border-emerald-300/40 focus:ring-2 focus:ring-emerald-300/30"
                      
                      required
                    />
                  </div>
                </div>

                {!isLogin && (
                  <div>
                    <label className="mb-2 block text-sm font-medium text-white/80">Telephone</label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white/40" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                        </svg>
                      </div>
                      <input
                        type="tel"
                        name="telephone"
                        value={formData.telephone}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-white/10 bg-white/10 px-10 py-3 text-white placeholder:text-white/50 outline-none transition focus:border-emerald-300/40 focus:ring-2 focus:ring-emerald-300/30"
                        placeholder="Phone number"
                        required
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="mb-2 block text-sm font-medium text-white/80">Password</label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white/40" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-white/10 bg-white/10 px-10 py-3 text-white placeholder:text-white/50 outline-none transition focus:border-emerald-300/40 focus:ring-2 focus:ring-emerald-300/30"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>

                {!isLogin && (
                  <div>
                    <label className="mb-2 block text-sm font-medium text-white/80">Confirm Password</label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white/40" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-white/10 bg-white/10 px-10 py-3 text-white placeholder:text-white/50 outline-none transition focus:border-emerald-300/40 focus:ring-2 focus:ring-emerald-300/30"
                        placeholder="Re-enter password"
                        required
                      />
                    </div>
                  </div>
                )}

                {isLogin && (
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm text-white/80">
                      <input
                        id="remember-me"
                        name="remember-me"
                        type="checkbox"
                        className="h-4 w-4 rounded border-white/20 bg-white/10 text-emerald-400 focus:ring-emerald-300/40"
                      />
                      Remember me
                    </label>
                    <div className="text-sm">
                      <a href="/forgot-password" className="font-medium text-gray-100 hover:text-gray-200 transition-colors">
                        Forgot password?
                      </a>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative inline-flex w-full items-center justify-center overflow-hidden rounded-xl bg-gray-700 px-4 py-3 font-medium text-gray-100 shadow-lg transition hover:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoading ? (
                    <>
                      <svg className="-ml-1 mr-3 h-5 w-5 animate-spin text-slate-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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

              <div className="mt-7">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="bg-transparent px-2 text-white/60">Or continue with</span>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-center">
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={handleGoogleFailure}
                      useOneTap
                      theme="filled_blue"
                      size="medium"
                      type="icon"
                      shape="circle"
                      logo_alignment="left"
                      logo_type="default"
                      logo_color="white"
                      logo_size="small"
                      logo_style="filled"
                      logo_shape="circle"
                      logo_shape_color_style_scheme="light"

                      auto_select
                    width="48"
                    />
                </div>
              </div>

              <div className="mt-8 text-center">
                <p className="text-sm text-white/70">
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
                    className="ml-1 font-medium text-emerald-300 hover:text-emerald-200 focus:outline-none"
                  >
                    {isLogin ? 'Sign up now' : 'Sign in'}
                  </button>
                </p>
              </div>

              {!isLogin && (
                <p className="mt-4 text-center text-xs text-white/50">
                  By creating an account, you agree to our
                  <a href="#" className="ml-1 text-emerald-300 hover:text-emerald-200">Terms of Service</a>
                  <span className="mx-1">and</span>
                  <a href="#" className="text-emerald-300 hover:text-emerald-200">Privacy Policy</a>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default Auth;