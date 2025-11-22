import React, { useState, useRef, useEffect, useContext } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import {
  Home,
  Info,
  Briefcase,
  Phone,
  Menu,
  BookOpen,
  ShoppingCart,
  MessageSquare,
  User,
  LogOut,
  Settings,
  X,
  Bell,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Package,
  Clock,
  CheckCircle,
  BriefcaseBusiness
} from 'lucide-react';
import { EmailContext } from '../utils/EmailContext';

const ClientDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [currentPage, setCurrentPage] = useState('Cart');
  const [profileImage, setProfileImage] = useState(null);
  const [username, setUsername] = useState('');
  const [notification, setNotification] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isCartExpanded, setIsCartExpanded] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);
  
  const { email } = useContext(EmailContext);

  // Fetch profile image and username
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!email) return;

      try {
        const response = await axios.get(`http://localhost/funeraria/api/components/client_picture.php?email=${email}`);
        
        if (response.data?.success) {
          // Set username from response
          if (response.data.username) {
            setUsername(response.data.username);
          }
          
          // Set profile image if available
          if (response.data.image_path) {
            setProfileImage(response.data.image_path);
          }
        }
      } catch (err) {
        console.error('Error fetching profile data:', err);
        // Fallback: try to get username from getUserId.php
        try {
          const userResponse = await axios.get(`http://localhost/funeraria/api/components/getUserId.php?email=${email}`);
          if (userResponse.data?.userName) {
            setUsername(userResponse.data.userName);
          }
        } catch (userErr) {
          console.error('Error fetching user data:', userErr);
        }
      }
    };

    fetchProfileData();
  }, [email]);

  // Toast notification function
  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
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
    const path = location.pathname.split('/').pop();
    const navItem = mainNavItems.find(item => item.name === path);
    if (navItem) {
      setCurrentPage(navItem.label);
    } else if (path === 'profile') {
      setCurrentPage('Profile');
    } else {
      setCurrentPage('Cart');
    }
    
    // Auto-expand cart if on a cart sub-page
    if (path === 'cart' || path === 'active-orders' || path === 'order-history') {
      setIsCartExpanded(true);
    }
  }, [location.pathname]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const toggleCartAccordion = () => {
    setIsCartExpanded(!isCartExpanded);
  };

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
    setIsDropdownOpen(false);
  };

  const handleLogoutConfirm = async () => {
    showNotification('Successfully logged out!', 'success');
    setShowLogoutModal(false);
    setTimeout(() => {
      navigate('/gomez/auth');
    }, 1000);
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
    { name: 'about', icon: <Info size={20} />, label: 'About' },
    { name: 'services', icon: <BriefcaseBusiness size={20} />, label: 'Services' },
    { 
      name: 'cart', 
      icon: <ShoppingCart size={20} />, 
      label: 'Cart',
      hasAccordion: true,
      subItems: [
        { name: 'cart', icon: <ShoppingCart size={18} />, label: 'Shopping Cart' },
        { name: 'funeral-cart', icon: <Briefcase size={18} />, label: 'Package Cart' },
        { name: 'active-orders', icon: <Clock size={18} />, label: 'Active Orders' },
        { name: 'order-history', icon: <CheckCircle size={18} />, label: 'Order History' }
      ]
    },
    { name: 'messages', icon: <MessageSquare size={20} />, label: 'Messages' },
    { name: 'settings', icon: <Settings size={20} />, label: 'Settings' }
  ];

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

      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 animate-fade-in">
          <div className={`px-4 py-3 rounded-lg shadow-lg flex items-center space-x-3 ${
            notification.type === 'success' ? 'bg-green-500 text-white' :
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
        className={`fixed lg:static z-30 h-full bg-gray-800 text-white transition-all duration-300 ${
          isSidebarOpen ? 'w-64' : 'w-0 lg:w-20 overflow-hidden'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-center p-4">
            <Link to="/gomez/dashboard-client/home" className="flex items-center">
              {isSidebarOpen ? (
                <h1 className="text-2xl font-bold">Funeraria Gomez</h1>
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
            {profileImage ? (
              <div className="rounded-full flex items-center justify-center overflow-hidden bg-white">
                <img
                  src={`http://localhost/funeraria/api/components/${profileImage}`}
                  alt="Profile"
                  className="rounded-full w-10 h-10 object-cover"
                />
              </div>
            ) : (
              <div className="rounded-full bg-gray-700 p-2 flex items-center justify-center">
                <User size={isSidebarOpen ? 24 : 18} />
              </div>
            )}
            {isSidebarOpen && (
              <div className="ml-3">
                <p className="font-medium">{username || 'Loading...'}</p>
                <p className="text-xs text-gray-300 truncate max-w-[180px]">{email}</p>
              </div>
            )}
          </div>

          <nav className="mt-6 flex-grow overflow-y-auto">
            <ul className="space-y-1">
              {mainNavItems.map((item) => (
                <li key={item.name}>
                  {item.hasAccordion ? (
                    <>
                      <button
                        onClick={toggleCartAccordion}
                        className={`flex items-center w-full px-5 py-4 hover:bg-gray-700 transition-colors ${
                          isSidebarOpen ? 'justify-between' : 'justify-center'
                        }`}
                      >
                        <div className="flex items-center">
                          <span className={isSidebarOpen ? 'mr-3' : ''}>{item.icon}</span>
                          {isSidebarOpen && <span>{item.label}</span>}
                        </div>
                        {isSidebarOpen && (
                          <span className="transition-transform duration-200">
                            {isCartExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                          </span>
                        )}
                      </button>
                      
                      {/* Accordion Content */}
                      {isSidebarOpen && (
                        <div
                          className={`overflow-hidden transition-all duration-300 ${
                            isCartExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                          }`}
                        >
                          <ul className="bg-gray-900 py-1">
                            {item.subItems.map((subItem) => (
                              <li key={subItem.name}>
                                <Link
                                  to={`/gomez/dashboard-client/${subItem.name}`}
                                  className={`flex items-center px-5 py-3 pl-12 hover:bg-gray-700 transition-colors text-sm ${
                                    location.pathname.includes(subItem.name) ? 'bg-gray-700 border-l-4 border-indigo-500' : ''
                                  }`}
                                >
                                  <span className="mr-3">{subItem.icon}</span>
                                  <span>{subItem.label}</span>
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </>
                  ) : (
                    <Link
                      to={`/gomez/dashboard-client/${item.name}`}
                      className={`flex items-center px-5 py-4 hover:bg-gray-700 transition-colors ${
                        isSidebarOpen ? 'justify-start' : 'justify-center'
                      } ${
                        location.pathname.includes(item.name) ? 'bg-gray-700 border-l-4 border-indigo-500' : ''
                      }`}
                    >
                      <span className={isSidebarOpen ? 'mr-3' : ''}>{item.icon}</span>
                      {isSidebarOpen && <span>{item.label}</span>}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>
          
          <div className="p-4 mt-auto">
            <button
              onClick={handleLogoutClick}
              className={`flex items-center text-red-400 hover:text-red-300 transition-colors ${
                isSidebarOpen ? 'justify-start w-full' : 'justify-center w-full'
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
              <h2 className="text-xl font-semibold hidden sm:block">{currentPage}</h2>
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
                  {profileImage ? (
                    <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden border border-gray-200">
                      <img
                        src={`http://localhost/funeraria/api/components/${profileImage}`}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700">
                      <User size={18} />
                    </div>
                  )}
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                    <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                      <p className="text-xs text-gray-500 truncate">{email}</p>
                    </div>
                    <Link
                      to="/gomez/dashboard-client/settings"
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
          <div>
            <Outlet />
          </div>
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

export default ClientDashboard;