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
  Settings
} from 'lucide-react';
import axios from 'axios';
import { EmailContext } from '../EmailContext';
import LoadingWrapper from '../LoadingWrapper';

const AdminLayout = ({ children, currentPage }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const { email } = useContext(EmailContext);

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
    // Fetch user data including profile picture
    const fetchUserData = async () => {
      try {
        const response = await axios.post('http://localhost/apii/components/fetchAdminProfile.php', { email });
        setUserData(response.data.data);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [email]);

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

  const handleLogout = async () => {
    const userConfirmed = window.confirm("Are you sure you want to log out?");

    if (userConfirmed) {
      try {
        await axios.post('http://localhost/apii/config/logout.php');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userRole');
        navigate('/');
      } catch (error) {
        console.error('Error logging out:', error);
        alert('Failed to log out. Please try again.');
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
    { name: 'itemlists', icon: <List size={20} />, label: 'Items' },
    { name: 'orders', icon: <ShoppingCart size={20} />, label: 'Orders' },
    { name: 'clients', icon: <Users size={20} />, label: 'Clients' },
    { name: 'messages', icon: <MessageSquare size={20} />, label: 'Messages' },
    { name: 'documents', icon: <List size={20} />, label: 'Documents' },
    { name: 'appointments', icon: <Users size={20} />, label: 'Appointments' },
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
      {isSidebarOpen && isMobileView && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-20" onClick={toggleSidebar}></div>
      )}

      <aside
        className={`fixed lg:static z-30 h-full bg-gray-800 text-white transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-0 lg:w-20 overflow-hidden'
          }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4">
            <Link to="/dashboard-admin/home" className="flex items-center">
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
                <img src={`http://localhost/apii/components/${userData.profileImage}`} alt="Profile" className="rounded-full w-10 h-10 object-cover" />
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
                    to={`/dashboard-admin/${item.name}`}
                    className={`flex items-center px-4 py-3 hover:bg-gray-700 transition-colors ${isSidebarOpen ? 'justify-start' : 'justify-center'
                      }`}
                    onClick={() => handleNavClick(`/dashboard-admin/${item.name}`)}
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
              onClick={handleLogout}
              className={`flex items-center text-indigo-200 hover:text-white transition-colors ${isSidebarOpen ? 'justify-start w-full' : 'justify-center w-full'
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
                      <img src={`http://localhost/apii/components/${userData.profileImage}`} alt="Profile" className="rounded-full w-8 h-8 object-cover" />
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
                      to="/dashboard-admin/settings"
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

        <main className="flex-1 overflow-auto">{children}</main>

        <footer className="bg-white border-t border-gray-200 py-4 px-6 mt-auto">
          <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center">
            <div className="mb-3 sm:mb-0">
              <p className="text-sm text-gray-600">
                &copy; 2025 Funeraria Gomez. All rights reserved.
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
    </div>
  );
};

export default AdminLayout;
