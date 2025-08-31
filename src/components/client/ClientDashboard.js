import React, { useState, useRef, useEffect, useContext } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import {
  Home,
  Info,
  Briefcase,
  Phone,
  Menu as MenuIcon,
  BookOpen,
  ShoppingCart,
  MessageSquare,
  User,
  LogOut,
  Settings,
  X,
  Bell,
  Settings2
} from 'lucide-react';

import LoadingWrapper from '../LoadingWrapper';

import { EmailContext } from '../EmailContext';

const ClientDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [currentPage, setCurrentPage] = useState('Client Dashboard');
  const [profileImage, setProfileImage] = useState(null);
  const [username, setUsername] = useState('');
  const [notification, setNotification] = useState(null);
  const navigate = useNavigate();
  const {email} = useContext(EmailContext);
  const location = useLocation();
  const dropdownRef = useRef(null);

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
      setCurrentPage('Client Dashboard');
    }
  }, [location.pathname]);

  useEffect(() => {
    if (email) {
      fetchProfileImage();
    }
  }, [email]);

  const fetchProfileImage = async () => {
    try {
      const response = await axios.get(`http://localhost/apii/components/client_picture.php?email=${email}`);
      if (response.data && response.data.success) {
        if (response.data.image_path) {
          setProfileImage(response.data.image_path);
        }
        if (response.data.username) {
          setUsername(response.data.username);
        }
      }
    } catch (error) {
      console.error('Error fetching profile image:', error);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLogout = async () => {
    const userConfirmed = window.confirm("Are you sure you want to log out?");

    if (userConfirmed) {
      try {
        showNotification('Logging out...', 'info');
        await axios.post('http://localhost/apii/config/logout.php');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userRole');
        showNotification('Successfully logged out!', 'success');
        
        // Delay navigation to show success message
        setTimeout(() => {
          navigate('/auth');
        }, 1000);
      } catch (error) {
        console.error('Error logging out:', error);
        showNotification('Failed to log out. Please try again.', 'error');
      }
    }
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
    { name: 'services', icon: <Briefcase size={20} />, label: 'Services' },
    { name: 'menu', icon: <BookOpen size={20} />, label: 'Menu List' },
    { name: 'cart', icon: <ShoppingCart size={20} />, label: 'Cart' },
    { name: 'messages', icon: <MessageSquare size={20} />, label: 'Messages' },
    { name: 'settings', icon: <Settings size={20} />, label: 'Settings' }
  ];

  return (
    <div className="flex h-screen bg-gray-50 text-gray-800">
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
          <div className="flex items-center justify-between p-4">
            <Link to="/dashboard-client/home" className="flex items-center">
              {isSidebarOpen ? (
                <h1 className="text-xl font-bold">Gomez Funeraria</h1>
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

          <div className={`px-4 py-6 ${isSidebarOpen ? 'flex items-center' : 'flex flex-col items-center'}`}>
            {profileImage ? (
              <div className="rounded-full p-1 flex items-center justify-center overflow-hidden">
                <img 
                  src={`http://localhost/apii/components/${profileImage}`} 
                  alt="Profile" 
                  className="rounded-full w-9 h-9 object-cover"
                />
              </div>
            ) : (
              <div className="rounded-full bg-gray-700 p-2 flex items-center justify-center">
                <User size={isSidebarOpen ? 24 : 18} />
              </div>
            )}
            {isSidebarOpen && (
              <div className="ml-3">
                <p className="font-medium">{username || 'Client User'}</p>
                <p className="text-xs text-white truncate max-w-[180px]">{email}</p>
              </div>
            )}
          </div>

          <nav className="mt-6 flex-grow">
            <ul className="space-y-1">
              {mainNavItems.map((item) => (
                <li key={item.name}>
                  <Link
                    to={`/dashboard-client/${item.name}`}
                    className={`flex items-center px-4 py-3 hover:bg-gray-700 transition-colors ${
                      isSidebarOpen ? 'justify-start' : 'justify-center'
                    }`}
                  >
                    <span className={isSidebarOpen ? 'mr-3' : ''}>{item.icon}</span>
                    {isSidebarOpen && <span>{item.label}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm z-10">
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center">
              <button onClick={toggleSidebar} className="mr-4 focus:outline-none">
                <MenuIcon size={24} />
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
                    <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden">
                      <img 
                        src={`http://localhost/apii/components/${profileImage}`} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700">
                      <User size={18} />
                    </div>
                  )}
                  <span className="hidden md:block text-sm">Client</span>
                  <svg
                    className="hidden md:block"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M6 9L12 15L18 9"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                    <Link
                      to="/dashboard-client/settings"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <Settings size={16} className="mr-2" />
                      <span>Settings</span>
                    </Link>
                    <div className="border-t border-gray-100 my-1"></div>
                    <button
                      onClick={handleLogout}
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
                &copy; 2025 Gomez Funeraria. All rights reserved.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="#" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors">
                Terms of Service
              </a>
              <a href="#" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors">
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