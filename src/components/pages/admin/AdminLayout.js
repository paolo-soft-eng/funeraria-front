import React, { useState, useRef, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Home,
  List,
  ShoppingCart,
  Users,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Menu,
  X,
  User,
  LogOut,
  Bell,
  Bug,
  BarChart2,
  Settings,
  Calendar,

  Paperclip,
  FileText,
  AlertTriangle
} from 'lucide-react';
import axios from 'axios';
import { EmailContext } from '../../utils/EmailContext';
import LoadingWrapper from '../../static/loading/LoadingWrapper';

const AdminLayout = ({ children, currentPage }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [notification, setNotification] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isValidatingAdmin, setIsValidatingAdmin] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const { email } = useContext(EmailContext);

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Admin validation function
  const validateAdminAccess = async () => {
    if (!email) {
      showNotification('Access denied: No email found', 'error');
      setTimeout(() => navigate('gomez/auth'), 1500);
      return false;
    }

    try {
      const response = await axios.post('http://localhost/funeraria/api/components/getUserId.php', {
        email: email
      });

      if (response.data.success && response.data.isAdmin) {
        setIsValidatingAdmin(false);
        return true;
      } else {
        showNotification('Access denied: Admin privileges required', 'error');
        setTimeout(() => navigate('/gomez/auth'), 1500);
        return false;
      }
    } catch (error) {
      console.error('Error validating admin access:', error);
      showNotification('Access denied: Unable to verify admin status', 'error');
      setTimeout(() => navigate('/gomez/auth'), 1500);
      return false;
    }
  };

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobileView(window.innerWidth < 1024);
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);

    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  useEffect(() => {
    // Validate admin access first
    validateAdminAccess();
  }, [email, navigate]);

  useEffect(() => {
    // Fetch user data including profile picture only after admin validation
    const fetchUserData = async () => {
      if (!isValidatingAdmin && email) {
        try {
          const response = await axios.post('http://localhost/funeraria/api/components/fetchAdminProfile.php', { email });
          setUserData(response.data.data);
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
    };

    fetchUserData();
  }, [email, isValidatingAdmin]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleNavClick = (path) => {
    if (isMobileView) {
      setIsSidebarOpen(false);
    }
    setIsDropdownOpen(false);
    navigate(path);
  };

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
    setIsDropdownOpen(false);
  };

  const handleLogoutConfirm = async () => {
    try {
      showNotification('Logging out...', 'info');
      await axios.post('http://localhost/funeraria/api/config/logout.php');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userRole');
      showNotification('Successfully logged out!', 'success');
      setShowLogoutModal(false);

      // Delay navigation to show success message
      setTimeout(() => {
        navigate('/gomez/auth');
      }, 1000);
    } catch (error) {
      console.error('Error logging out:', error);
      showNotification('Failed to log out. Please try again.', 'error');
      setShowLogoutModal(false);
    }
  };

  const handleLogoutCancel = () => {
    setShowLogoutModal(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const mainNavItems = [
    { name: 'home', icon: <Home size={20} />, label: 'Home' },
    { name: 'itemlists', icon: <List size={20} />, label: 'Items' },
    { name: 'orders', icon: <ShoppingCart size={20} />, label: 'Orders' },
    { name: 'clients', icon: <Users size={20} />, label: 'Clients' },
    { name: 'messages', icon: <MessageSquare size={20} />, label: 'Messages' },
    { name: 'documents', icon: <FileText size={20} />, label: 'Documents' },
    { name: 'appointments', icon: <Calendar size={20} />, label: 'Appointments' },
    { name: 'analytics', icon: <BarChart2 size={20} />, label: 'Analytics' },
    { name: 'reports', icon: <Bug size={20} />, label: 'Reports' },
    { name: 'settings', icon: <Settings size={20} />, label: 'Settings' },
  ];

  const getPageTitle = () => {
    const page = mainNavItems.find(item => item.name === currentPage);
    return page ? page.label : '';
  };

  return (
    <div className="flex h-screen bg-gray-50 text-gray-800">
      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full animate-fade-in">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                <AlertTriangle className="text-red-600" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 text-center mb-2">
                Confirm Logout
              </h3>
              <p className="text-gray-600 text-center mb-6">
                Are you sure you want to log out? You'll need to sign in again to access your account.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleLogoutCancel}
                  className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogoutConfirm}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {notification && (
        <div className="fixed top-4 right-4 z-50 animate-fade-in">
          <div className={`px-4 py-3 rounded-lg shadow-lg flex items-center space-x-3 ${notification.type === 'success' ? 'bg-green-400 text-white' :
            notification.type === 'error' ? 'bg-red-500 text-white' :
              notification.type === 'warning' ? 'bg-yellow-500 text-white' :
                'bg-blue-500 text-white'
            }`}>
            {notification.type === 'success' && (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            )}
            {notification.type === 'error' && (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            )}
            {notification.type === 'info' && (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            )}
            <span className="font-medium">{notification.message}</span>
            <button
              onClick={() => setNotification(null)}
              className="ml-2 text-white hover:text-gray-200"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {isSidebarOpen && isMobileView && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-20" onClick={toggleSidebar}></div>
      )}

      <aside
        className={`fixed lg:static z-30 h-full bg-gray-800 text-white transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-0 lg:w-20 overflow-hidden'
          }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-center p-4">
            <Link to="/gomez/dashboard-admin/home" className="flex items-center">
              {isSidebarOpen ? (
                <h1 className="text-xl font-bold">Funeraria Gomez</h1>
              ) : (
                <span className="text-2xl font-bold">FG</span>
              )}
            </Link>
            {isMobileView && (
              <button onClick={toggleSidebar} className="text-white">
                <X size={24} />
              </button>
            )}
          </div>

          {/* Profile Section */}
          <div className={`px-4 py-6 ${isSidebarOpen ? 'flex items-center' : 'flex flex-col items-center'}`}>
            <div className="rounded-full  flex items-center justify-center">
              {userData && userData.profileImage ? (
                <img src={`http://localhost/funeraria/api/components/${userData.profileImage}`} alt="Profile" className="rounded-full w-10 h-10 object-cover" />
              ) : (
                <User size={isSidebarOpen ? 24 : 18} />
              )}
            </div>
            {isSidebarOpen && (
              <div className="ml-3">
                <p className="font-medium">{userData ? userData.username : 'Admin User'}</p>
                <p className="text-xs text-indigo-200">{email || 'Loading...'}</p>
              </div>
            )}
          </div>

          <nav className="mt-6 flex-grow">
            <ul className="space-y-1">
              {mainNavItems.map((item) => (
                <li key={item.name}>
                  <Link
                    to={`/gomez/dashboard-admin/${item.name}`}
                    className={`flex items-center px-5 py-4 hover:bg-gray-700 transition-colors ${isSidebarOpen ? 'justify-start' : 'justify-center'
                      }`}
                    onClick={(e) => {
                      if (isMobileView) {
                        setIsSidebarOpen(false);
                      }
                    }}
                  >
                    <span className={isSidebarOpen ? 'mr-3' : ''}>{item.icon}</span>
                    {isSidebarOpen && <span>{item.label}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="p-4 mt-auto">
            <button
              onClick={handleLogoutClick}
              className={`flex items-center text-red-600 hover:text-red-500 transition-colors ${isSidebarOpen ? 'justify-start w-full' : 'justify-center w-full'
                }`}
            >
              <LogOut size={20} className={isSidebarOpen ? 'mr-3' : ''} />
              {isSidebarOpen && <span>Logout</span>}
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm z-10">
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center">
              <button onClick={toggleSidebar} className="mr-4 focus:outline-none">
                <Menu size={24} />
              </button>
              <h2 className="text-xl font-semibold hidden sm:block">{getPageTitle()}</h2>
            </div>

            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-600 hover:text-indigo-600 transition-colors">
                <Bell size={20} />
                <span className="absolute top-1 right-1 bg-red-500 rounded-full w-2 h-2"></span>
              </button>

              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={toggleDropdown}
                  className="flex items-center space-x-2 focus:outline-none"
                >
                  <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700">
                    {userData && userData.profileImage ? (
                      <img src={`http://localhost/funeraria/api/components/${userData.profileImage}`} alt="Profile" className="rounded-full w-8 h-8 object-cover" />
                    ) : (
                      <User size={18} />
                    )}
                  </div>
                  <span className="hidden md:block text-sm">Admin</span>
                  <ChevronDown size={16} className="hidden md:block" />
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                    <Link
                      to="/gomez/dashboard-admin/settings"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <Settings size={16} className="mr-2" />
                      <span>Settings</span>
                    </Link>
                    <div className="border-t border-gray-100 my-1"></div>
                    <button
                      onClick={handleLogoutClick}
                      className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <LogOut size={16} className="mr-2" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          {isValidatingAdmin ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Validating admin access...</p>
              </div>
            </div>
          ) : (
            children
          )}
        </main>

        <footer className="bg-white border-t border-gray-200 py-4 px-6 mt-auto">
          <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center">
            <div className="mb-3 sm:mb-0">
              <p className="text-sm text-gray-600">
                &copy; 2025 Funeraria Gomez - Udtohan. All rights reserved.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="/gomez/term-of-service" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors">
                Terms of Service
              </a>
              <a href="/gomez/privacy-policy" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors">
                Privacy Policy
              </a>
              <a href="/gomez/contact-support" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors">
                Contact Support
              </a>
            </div>
          </div>
        </footer>
      </div>
      <style>{`
        .animate-fade-in {
          animation: fadeIn 0.3s ease-in-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default AdminLayout;