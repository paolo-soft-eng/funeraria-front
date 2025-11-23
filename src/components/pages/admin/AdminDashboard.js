import React, { useState } from 'react';
import { useNavigate, Outlet, Link } from 'react-router-dom';
import {
    Home,
    List,
    ShoppingCart,
    Users,
    MessageSquare,
    ChevronDown,
    Menu,
    X,
    User,
    Bell,
    Edit,
    Bug,
    FileText,
    Clock,
    MapPin,
    Activity,
    Calendar1,
    Settings,
    BarChart2,
    AlertTriangle,
    Calendar,
    LogOut, // Fixed: Changed from LogOutIcon to LogOut
    LogOutIcon
} from 'lucide-react';
import { EmailContext } from '../../utils/EmailContext';
import LoadingWrapper from '../../static/LoadingWrapper';

import { useAdminAuth } from '../../hooks/admin/useAdminAuth';
import { useUserData } from '../../hooks/admin/useUserData';
import { useDashboardStats } from '../../hooks/admin/useDashboardStats';
import { useRecentActivities } from '../../hooks/admin/useRecentActivities';
import { useNotification } from '../../hooks/admin/useNotifications';
import { useSidebar } from '../../hooks/admin/useSideBar';
import { useDropdown } from '../../hooks/admin/useDropDown';
import { useLogout } from '../../hooks/admin/useLogout';
import { useActivityUtils } from '../../hooks/admin/useActivityUtils';
import { useNavigation } from '../../hooks/admin/useNavigation';

const AdminDashboard = () => {
    const navigate = useNavigate();

    // Use custom hooks
    const { isLoggedIn, isValidatingAdmin, email } = useAdminAuth();
    const { userData } = useUserData(email, isValidatingAdmin);
    const { dashboardStats, isLoading } = useDashboardStats(email, isValidatingAdmin);
    const { recentActivities, activitiesLoading, fetchRecentActivities } = useRecentActivities(email, isValidatingAdmin);
    const { notification, showNotification } = useNotification();
    const { isSidebarOpen, isMobileView, toggleSidebar, closeSidebar } = useSidebar();
    const { isDropdownOpen, dropdownRef, toggleDropdown, closeDropdown } = useDropdown();
    const { handleLogout } = useLogout(showNotification);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const { getActivityIcon, getActivityColor, formatTime12Hour } = useActivityUtils();
    const {
        handleOrders,
        handleClient,
        handleReports,
        handleMessage,
        handleItems,
        handleEditProfile
    } = useNavigation();

    // Main nav items with icons
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

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-PH', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };
    const handleLogoutClick = () => {
        setShowLogoutModal(true);
    };

    const handleLogoutConfirm = () => {
        handleLogout();
        setShowLogoutModal(false);
    };

    const handleLogoutCancel = () => {
        setShowLogoutModal(false);
    };


    if (!isLoggedIn && !isValidatingAdmin) {
        return (
            <LoadingWrapper>
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                    <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
                        <div className="text-center">
                            <svg className="mx-auto h-12 w-12 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <h2 className="mt-4 text-xl font-semibold text-gray-900">Login Required</h2>
                            <p className="mt-2 text-gray-600">Please log in to access the admin dashboard.</p>
                            <div className="mt-6">
                                <a
                                    href="/gomez/auth"
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    Go to Login
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </LoadingWrapper>
        );
    }

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
                            onClick={() => showNotification(null)}
                            className="ml-2 text-white hover:text-gray-200"
                        >
                            <X size={16} />
                        </button>
                    </div>
                </div>
            )}
            {/* Overlay for mobile */}
            {isSidebarOpen && isMobileView && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-20"
                    onClick={toggleSidebar}
                ></div>
            )}

            {/* Sidebar */}
            <aside
                className={`fixed lg:static z-30 h-full bg-gray-800 text-white transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-0 lg:w-20 overflow-hidden'
                    }`}
            >
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="flex items-center justify-evenly p-4">
                        <Link to="/gomez/dashboard-admin/home" className="flex items-center">
                            {isSidebarOpen ? (
                                <h1 className="text-xl font-bold">Funeraria Gomez</h1>
                            ) : (
                                <span className="text-2xl font-bold text-center">FG</span>
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

                    {/* Navigation */}
                    <nav className="mt-6 flex-grow">
                        <ul className="space-y-1">
                            {mainNavItems.map((item) => (
                                <li key={item.name}>
                                    <Link
                                        to={`/gomez/dashboard-admin/${item.name}`}
                                        className={`flex items-center px-5 py-4 hover:bg-gray-700 transition-colors ${isSidebarOpen ? 'justify-start' : 'justify-center'
                                            }`}
                                        onClick={() => {
                                            if (isMobileView) {
                                                closeSidebar();
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

                    {/* Logout Button */}
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

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="bg-white shadow-sm z-10">
                    <div className="px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center">
                            <button onClick={toggleSidebar} className="mr-4 focus:outline-none">
                                <Menu size={24} />
                            </button>
                            <h2 className="text-xl font-semibold hidden sm:block">Dashboard</h2>
                        </div>

                        {/* User Actions */}
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
                                            onClick={() => isDropdownOpen(false)}
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
                                            {isSidebarOpen && <span>Logout</span>}
                                        </button>

                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="flex-1 overflow-auto">
                    {isValidatingAdmin ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                                <p className="text-gray-600">Validating admin access...</p>
                            </div>
                        </div>
                    ) : (
                        <div className="container mx-auto px-4 py-6">
                            {/* Stats Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-indigo-500">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="text-sm text-gray-500 mb-1">Total Orders</p>
                                            <h3 className="text-2xl font-bold">{dashboardStats.totalOrders}</h3>
                                        </div>
                                        <div className="bg-indigo-100 p-3 rounded-full">
                                            <ShoppingCart size={20} className="text-indigo-600" />
                                        </div>
                                    </div>
                                    <div className="mt-4 text-xs text-blue-600 flex items-center">
                                        <span>{dashboardStats.current_month_orders} orders this {dashboardStats.current_month_name}</span>
                                    </div>
                                </div>

                                <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="text-sm text-gray-500 mb-1">Total Clients</p>
                                            <h3 className="text-2xl font-bold">{dashboardStats.totalClients}</h3>
                                        </div>
                                        <div className="bg-blue-100 p-3 rounded-full">
                                            <Users size={20} className="text-blue-600" />
                                        </div>
                                    </div>
                                    <div className="mt-4 text-xs text-blue-600 flex items-center">
                                        <span>{dashboardStats.current_month_clients} new clients this {dashboardStats.current_month_name}</span>
                                    </div>
                                </div>

                                <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-amber-500">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="text-sm text-gray-500 mb-1">New Messages</p>
                                            <h3 className="text-2xl font-bold">{dashboardStats.newMessages}</h3>
                                        </div>
                                        <div className="bg-amber-100 p-3 rounded-full">
                                            <MessageSquare size={20} className="text-amber-600" />
                                        </div>
                                    </div>
                                    <div className="mt-4 text-xs text-amber-600 flex items-center">
                                        <span>{dashboardStats.newMessages} unread messages</span>
                                    </div>
                                </div>

                                <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-emerald-500">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="text-sm text-gray-500 mb-1">Total Revenue</p>
                                            {/* Updated line below */}
                                            <h3 className="text-2xl font-bold">₱ {formatCurrency(dashboardStats.totalRevenue)}</h3>
                                        </div>
                                        <div className="bg-emerald-100 p-3 rounded-full">
                                            <Activity size={20} className="text-emerald-600" />
                                        </div>
                                    </div>
                                    <div className="mt-4 text-xs text-emerald-600 flex items-center">
                                        {/* Updated line below */}
                                        <span>₱ {formatCurrency(dashboardStats.current_month_revenue)} earned this {dashboardStats.current_month_name}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Main Content Grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="bg-white rounded-lg shadow-sm p-6">
                                    <div className="flex flex-col items-center mb-6">
                                        <div className="h-24 w-24 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mb-4">
                                            {userData && userData.profileImage ? (
                                                <img src={`http://localhost/funeraria/api/components/${userData.profileImage}`} alt="Profile" className="rounded-full w-24 h-24 object-cover" />
                                            ) : (
                                                <User size={48} />
                                            )}
                                        </div>
                                        <h2 className="text-xl font-bold">{userData ? userData.username : 'Admin User'}</h2>
                                        <p className="text-gray-500 text-sm">{email || 'Loading...'}</p>
                                        <div className="mt-4 flex space-x-2">
                                            <button className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg text-sm font-medium hover:bg-indigo-200 transition-colors" onClick={handleEditProfile}>
                                                Edit Profile
                                            </button>
                                            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors" onClick={handleEditProfile}>
                                                Settings
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="font-medium text-gray-800 mb-4 flex items-center">
                                            <Activity size={18} className="mr-2" />
                                            Recent Activities
                                            {activitiesLoading && (
                                                <div className="ml-2 animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
                                            )}
                                        </h3>
                                        <div className="space-y-3 ">
                                            {recentActivities.length > 0 ? (
                                                recentActivities.map((activity) => (
                                                    <div
                                                        key={activity.id}
                                                        className={`p-3 rounded-lg border hover:shadow-sm transition-all duration-200 ${getActivityColor(activity.type)}`}
                                                    >
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex items-start space-x-3">
                                                                <div className="flex-shrink-0 mt-1">
                                                                    {getActivityIcon(activity.type)}
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center space-x-2 mb-1">
                                                                        <h4 className="font-medium text-gray-800 text-sm">
                                                                            {activity.type}
                                                                        </h4>
                                                                        {activity.user_name && (
                                                                            <span className="text-xs text-gray-500">
                                                                                by {activity.user_name}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <p className="text-gray-600 text-sm leading-relaxed">
                                                                        {activity.description}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <span className="text-xs bg-white bg-opacity-80 text-gray-700 px-2 py-1 rounded-full whitespace-nowrap ml-2">
                                                                {activity.time}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="p-4 text-center text-gray-500">
                                                    {activitiesLoading ? (
                                                        <div className="flex items-center justify-center">
                                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mr-2"></div>
                                                            Loading activities...
                                                        </div>
                                                    ) : (
                                                        "No recent activities found"
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        {recentActivities.length > 0 && (
                                            <div className="mt-4 text-center">
                                                <button
                                                    className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                                                    onClick={fetchRecentActivities}
                                                >
                                                    Refresh Activities
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Main Content Area */}
                                <div className="lg:col-span-2 space-y-6">
                                    {/* Messages Section */}
                                    <div className="bg-white rounded-lg shadow-sm p-5">
                                        <h3 className="text-lg font-semibold mb-4 flex items-center">
                                            <MessageSquare size={18} className="mr-2 text-indigo-600" />
                                            Recent Messages
                                        </h3>
                                        <div className="space-y-4">
                                            {dashboardStats.recent_messages.length > 0 ? (
                                                dashboardStats.recent_messages.map((message) => (
                                                    <div
                                                        key={message.id}
                                                        className="p-4 border border-gray-100 rounded-lg hover:border-gray-200 transition bg-white shadow-sm flex items-start gap-3"
                                                    >
                                                        {/* Avatar */}
                                                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
                                                            {message.sender_image_path ? (
                                                                <img
                                                                    src={`http://localhost/funeraria/api/components/${message.sender_image_path}`}
                                                                    alt="Profile"
                                                                    className="rounded-full w-10 h-10 object-cover"
                                                                />
                                                            ) : (
                                                                <User size={20} />
                                                            )}
                                                        </div>

                                                        {/* Message content */}
                                                        <div className="flex-1">
                                                            <div className="flex justify-between items-start mb-1">
                                                                <h4 className="font-medium text-gray-800">
                                                                    {message.sender_username}
                                                                </h4>
                                                                <div className="flex flex-col items-end">
                                                                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                                                                        {new Date(message.timestamp).toLocaleDateString("en-US", {
                                                                            month: "short",
                                                                            day: "numeric",
                                                                            year:
                                                                                new Date(message.timestamp).getFullYear() !==
                                                                                    new Date().getFullYear()
                                                                                    ? "numeric"
                                                                                    : undefined,
                                                                        })}
                                                                    </span>
                                                                    <span className="text-xs text-gray-500">
                                                                        {new Date(message.timestamp).toLocaleTimeString([], {
                                                                            hour: "2-digit",
                                                                            minute: "2-digit",
                                                                        })}
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            <p className="text-gray-600 text-sm">{message.message}</p>

                                                            <div className="mt-3 flex justify-end">
                                                                <button
                                                                    className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                                                                    onClick={() => handleMessage()}
                                                                >
                                                                    Reply
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>

                                                ))
                                            ) : (
                                                <div className="p-4 text-center text-gray-500">
                                                    No recent messages found
                                                </div>
                                            )}
                                        </div>
                                        <div className="mt-4 text-center">
                                            <button
                                                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                                                onClick={handleMessage}
                                            >
                                                View All Messages
                                            </button>
                                        </div>
                                    </div>


                                    {/* Upcoming Orders */}
                                    <div className="bg-white rounded-lg shadow-sm p-5">
                                        <h3 className="text-xl font-semibold mb-6 flex items-center text-gray-800">
                                            <Clock size={20} className="mr-2 text-indigo-600" />
                                            Upcoming Orders
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {dashboardStats.upcoming_orders && dashboardStats.upcoming_orders.map((order) => (
                                                <div key={order.id} className="p-5 border border-gray-200 rounded-lg bg-white shadow-sm hover:shadow-lg transition-shadow duration-300">
                                                    <div className="flex flex-col">
                                                        <span className="text-xs bg-indigo-100 text-indigo-800 px-4 py-1 rounded-full whitespace-nowrap min-w-[140px] text-center mb-3 self-end">
                                                            {new Date(order.delivery_date).toLocaleDateString('en-US', {
                                                                month: 'long',
                                                                day: 'numeric',
                                                                year: 'numeric'
                                                            })}
                                                        </span>
                                                        {/* Show either order items or service name, but not both */}
                                                        {order.order_items ? (
                                                            <h6 className="font-medium text-gray-800">Order Items: {order.order_items}</h6>
                                                        ) : order.service_name ? (
                                                            <p className="text-sm text-gray-600">
                                                                <span className="font-medium">Service: </span>
                                                                {order.service_name}
                                                            </p>
                                                        ) : null}
                                                    </div>
                                                    <p className="text-gray-600 text-sm mt-3 flex items-center">
                                                        <MapPin size={16} className="mr-2 text-gray-400" />
                                                        <span>{order.address}</span>
                                                    </p>
                                                    <div className="mt-4 flex items-center text-sm text-gray-500">
                                                        <User size={16} className="mr-2" />
                                                        <span>Client: {order.client_name} family</span>
                                                    </div>
                                                    <div className="mt-3 text-sm">
                                                        <span className="font-medium">Amount: </span>
                                                        <span className="font-semibold text-gray-900">₱{typeof order.total_amount === 'number' ? formatCurrency(order.total_amount) : formatCurrency(order.total_amount)}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="mt-6 text-center">
                                            <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium py-2 px-4 border border-indigo-600 rounded hover:bg-indigo-50 transition-colors duration-300" onClick={handleOrders}>
                                                View All Orders
                                            </button>
                                        </div>
                                    </div>

                                    {/* Upcoming Appointments */}
                                    <div className="bg-white rounded-lg shadow-sm p-5">
                                        <h3 className="text-xl font-semibold mb-6 flex items-center text-gray-800">
                                            <Calendar size={20} className="mr-2 text-indigo-600" />
                                            Upcoming Appointments
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {dashboardStats.upcoming_appointments && dashboardStats.upcoming_appointments.length > 0 ? (
                                                dashboardStats.upcoming_appointments.map((appointment) => (
                                                    <div key={appointment.id} className="p-5 border border-gray-200 rounded-lg bg-white shadow-sm hover:shadow-lg transition-shadow duration-300">
                                                        <div className="flex flex-col">
                                                            <span className="text-xs bg-indigo-100 text-indigo-800 px-4 py-1 rounded-full whitespace-nowrap min-w-[140px] text-center mb-3 self-end">
                                                                {new Date(appointment.appointment_date).toLocaleDateString('en-US', {
                                                                    month: 'long',
                                                                    day: 'numeric',
                                                                    year: 'numeric'
                                                                })}
                                                            </span>
                                                            <p className="text-sm text-gray-600">
                                                                <span className="font-medium">Purpose: </span>
                                                                {appointment.purpose}
                                                            </p>
                                                        </div>
                                                        <div className="mt-4 flex items-center text-sm text-gray-500">
                                                            <Clock size={16} className="mr-2" />
                                                            <span>{formatTime12Hour(appointment.appointment_time)}</span>
                                                        </div>
                                                        <div className="mt-3 flex items-center text-sm text-gray-500">
                                                            <User size={16} className="mr-2" />
                                                            <span>Client: {appointment.client_name}</span>
                                                        </div>
                                                        <div className="mt-3">
                                                            <span className={`px-2 py-1 text-xs rounded-full ${appointment.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                                                                appointment.status === 'finished' ? 'bg-green-100 text-green-800' :
                                                                    'bg-gray-100 text-gray-800'
                                                                }`}>
                                                                {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="col-span-2 text-center text-gray-500 py-4">
                                                    No upcoming appointments found
                                                </div>
                                            )}
                                        </div>
                                        <div className="mt-6 text-center">
                                            <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium py-2 px-4 border border-indigo-600 rounded hover:bg-indigo-50 transition-colors duration-300" onClick={() => navigate('/gomez/dashboard-admin/appointments')}>
                                                View All Appointments
                                            </button>
                                        </div>
                                    </div>

                                    {/* Quick Actions */}
                                    <div className="bg-white rounded-lg shadow-sm p-5">
                                        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <button className="p-4 bg-indigo-50 rounded-lg text-center hover:bg-indigo-100 transition-colors flex flex-col items-center" onClick={handleOrders}>
                                                <ShoppingCart size={24} className="text-indigo-600 mb-2" />
                                                <span className="text-sm font-medium text-gray-800">New Order</span>
                                            </button>
                                            <button className="p-4 bg-blue-50 rounded-lg text-center hover:bg-blue-100 transition-colors flex flex-col items-center" onClick={handleClient}>
                                                <Users size={24} className="text-blue-600 mb-2" />
                                                <span className="text-sm font-medium text-gray-800">Clients</span>
                                            </button>
                                            <button className="p-4 bg-amber-50 rounded-lg text-center hover:bg-amber-100 transition-colors flex flex-col items-center" onClick={handleMessage}>
                                                <MessageSquare size={24} className="text-amber-600 mb-2" />
                                                <span className="text-sm font-medium text-gray-800">Send Message</span>
                                            </button>
                                            <button className="p-4 bg-emerald-50 rounded-lg text-center hover:bg-emerald-100 transition-colors flex flex-col items-center" onClick={handleItems}>
                                                <Edit size={24} className="text-emerald-600 mb-2" />
                                                <span className="text-sm font-medium text-gray-800">Edit Items</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </main>

                {/* Footer */}
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

            {/* Child Routes */}
            <Outlet />

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

export default AdminDashboard;