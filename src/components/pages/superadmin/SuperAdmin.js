import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UserPlus, Trash2, Edit, LogOut, X, RefreshCw, Search, 
  UserCog, ArrowUp, ArrowDown, Shield, Mail, Phone, MapPin, 
  Calendar, FileText, AlertTriangle, Filter, MoreVertical,
  CheckCircle, XCircle, Eye, Copy
} from 'lucide-react';
import axios from 'axios';
import DeleteModal from '../../utils/DeleteModal';
const n = process.env.REACT_APP_API_URL;

const SuperAdmin = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'ascending' });
  const [newAdmin, setNewAdmin] = useState({
    username: '',
    firstname: '',
    lastname: '',
    email: '',
    telephone: '',
    address: '',
    password: '',
    confirmPassword: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [activeUserMenu, setActiveUserMenu] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${n}/api/components/superadmin/users.php`);

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();

      const usersWithStatus = data.map(user => {
        return {
          ...user,
          status: user.status || 'disabled'
        };
      });
      setUsers(usersWithStatus);
      setLoading(false);
    } catch (error) {
      setError('Error fetching users: ' + error.message);
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setIsRefreshing(true);
    await fetchUsers();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleDeleteClick = (user, e) => {
  e.stopPropagation();
  setUserToDelete(user);
  setShowDeleteModal(true);
};


  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;

    try {
      const response = await fetch(`${n}/api/components/superadmin/delete_user.php?id=${userToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      const result = await response.json();
      if (result.success) {
        setUsers(users.filter(user => user.id !== userToDelete.id));
        showNotification('User deleted successfully', 'success');
      } else {
        throw new Error(result.error || 'Unknown error occurred');
      }
    } catch (error) {
      setError('Error deleting user: ' + error.message);
      showNotification(error.message, 'error');
    } finally {
      setShowDeleteModal(false);
      setUserToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setUserToDelete(null);
  };

  const validateForm = () => {
    const errors = {};

    if (!newAdmin.username.trim()) errors.username = 'Username is required';
    if (!newAdmin.firstname.trim()) errors.firstname = 'Firstname is required';
    if (!newAdmin.lastname.trim()) errors.lastname = 'Lastname is required';
    if (!newAdmin.address.trim()) errors.address = 'Address is required';
    if (!newAdmin.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(newAdmin.email)) {
      errors.email = 'Email is invalid';
    }

    if (!newAdmin.telephone.trim()) {
      errors.telephone = 'Telephone is required';
    } else if (!/^\d{10,11}$/.test(newAdmin.telephone)) {
      errors.telephone = 'Telephone must be 10-11 digits';
    }

    if (!newAdmin.password) {
      errors.password = 'Password is required';
    } else if (newAdmin.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (newAdmin.password !== newAdmin.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAdmin({
      ...newAdmin,
      [name]: value
    });
  };

  const handleAddAdmin = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const response = await fetch(`${n}/api/components/superadmin/add_admin.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: newAdmin.username,
          firstname: newAdmin.firstname,
          lastname: newAdmin.lastname,
          email: newAdmin.email,
          telephone: newAdmin.telephone,
          address: newAdmin.address,
          password: newAdmin.password
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add admin');
      }

      const result = await response.json();

      if (result.success) {
        fetchUsers();

        setNewAdmin({
          username: '',
          firstname: '',
          lastname: '',
          email: '',
          telephone: '',
          address: '',
          password: '',
          confirmPassword: ''
        });
        setShowAddForm(false);

        showNotification('Admin added successfully!', 'success');
      } else {
        throw new Error(result.error || 'Unknown error occurred');
      }
    } catch (error) {
      setError('Error adding admin: ' + error.message);
      showNotification(error.message, 'error');
    }
  };

  const copyToClipboard = (text) => {
    const sanitizedUser = { ...JSON.parse(text) };
    delete sanitizedUser.password;

    navigator.clipboard.writeText(JSON.stringify(sanitizedUser))
      .then(() => showNotification('User data copied to clipboard!', 'info'))
      .catch(err => {
        console.error('Failed to copy: ', err);
        showNotification('Failed to copy data', 'error');
      });
  };

  const toggleAddForm = () => {
    setShowAddForm(!showAddForm);
    setFormErrors({});
  };

  const showNotification = (message, type = 'info') => {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg transition-all duration-500 transform z-50 ${
      type === 'success' ? 'bg-emerald-500' :
      type === 'error' ? 'bg-rose-500' :
      type === 'warning' ? 'bg-amber-500' :
      'bg-blue-500'
    } text-white`;
    notification.innerHTML = `
      <div class="flex items-center">
        ${type === 'success' ? '<CheckCircle size={20} class="mr-2" />' : ''}
        ${type === 'error' ? '<XCircle size={20} class="mr-2" />' : ''}
        ${message}
      </div>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.classList.add('opacity-0', 'translate-x-full');
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 500);
    }, 3000);
  };

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (name) => {
    if (sortConfig.key === name) {
      return sortConfig.direction === 'ascending' ?
        <ArrowUp size={14} className="ml-1" /> :
        <ArrowDown size={14} className="ml-1" />;
    }
    return null;
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.firstname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.telephone?.includes(searchTerm);

    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'ascending' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'ascending' ? 1 : -1;
    }
    return 0;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedUsers.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleToggleAdminStatus = async (userId, currentStatus) => {
    try {
      const currentUser = users.find(user => user.id === userId);
      const effectiveCurrentStatus = currentUser?.status || 'disabled';

      const newStatus = effectiveCurrentStatus === 'active' ? 'disabled' : 'active';

      const response = await fetch(`${n}/api/components/superadmin/toggleAdminStatus.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          status: newStatus
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      if (data.success) {
        setUsers(prevUsers => prevUsers.map(user =>
          user.id === userId
            ? { ...user, status: data.new_status }
            : user
        ));
        showNotification(`Status updated from ${data.previous_status} to ${data.new_status}`, 'success');
      } else {
        throw new Error(data.message || 'Failed to update admin status');
      }
    } catch (error) {
      console.error('Error toggling status:', error);
      setError('Error updating admin status: ' + error.message);
      showNotification(error.message, 'error');
    }
  };

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = async () => {
    try {
      showNotification('Logging out...', 'info');
      await axios.post(`${n}/api/config/logout.php`);
      localStorage.removeItem('userRole');
      localStorage.removeItem('email');
      localStorage.removeItem('token'); 
      showNotification('Successfully logged out!', 'success');
      setShowLogoutModal(false);

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

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'disabled': return 'bg-rose-100 text-rose-800 border-rose-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getInitials = (name) => {
    return name?.charAt(0).toUpperCase() || "U";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <DeleteModal
        open={showDeleteModal}
        user={userToDelete}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-fade-in">
            <div className="p-6">
              <div className="flex items-center justify-center w-16 h-16 mx-auto bg-rose-100 rounded-full mb-4">
                <AlertTriangle className="text-rose-600" size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
                Confirm Logout
              </h3>
              <p className="text-gray-600 text-center mb-6">
                Are you sure you want to log out? You'll need to sign in again to access your account.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleLogoutCancel}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogoutConfirm}
                  className="flex-1 px-4 py-3 bg-rose-600 text-white rounded-xl font-semibold hover:bg-rose-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header Card */}
        <div className="bg-gradient-to-r from-gray-500 to-gray-600 rounded-2xl shadow-xl overflow-hidden mb-6">
          <div className="p-6 md:p-8">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div className="flex items-center">
                <div className="p-3 bg-white bg-opacity-20 rounded-2xl mr-4">
                  <Shield size={32} className="text-white" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Super Admin Dashboard</h1>
                  <p className="text-blue-100">Manage system administrators and permissions</p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={refreshData}
                  className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white py-3 px-4 rounded-xl flex items-center shadow-lg transition-all duration-200 backdrop-blur-sm"
                >
                  <RefreshCw size={18} className={`mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
                <button
                  onClick={toggleAddForm}
                  className={`${showAddForm
                    ? 'bg-rose-500 hover:bg-rose-600'
                    : 'bg-emerald-500 hover:bg-emerald-600'} 
                    text-white py-3 px-4 rounded-xl flex items-center shadow-lg transition-all duration-200`}
                >
                  {showAddForm ? (
                    <>
                      <X size={18} className="mr-2" />
                      Cancel
                    </>
                  ) : (
                    <>
                      <UserPlus size={18} className="mr-2" />
                      Add Admin
                    </>
                  )}
                </button>

                <button
                  onClick={() => navigate('/gomez/super-admin/reports')}
                  className="bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-xl flex items-center shadow-lg transition-all duration-200"
                >
                  <FileText size={18} className="mr-2" />
                  Reports
                </button>
                <button
                  onClick={handleLogoutClick}
                  className="bg-rose-500 hover:bg-rose-600 text-white py-3 px-4 rounded-xl flex items-center shadow-lg transition-all duration-200"
                >
                  <LogOut size={18} className="mr-2" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300">
            <div className="flex items-center">
              <div className="p-3 rounded-2xl bg-blue-100 text-blue-600 mr-4">
                <UserCog size={24} />
              </div>
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Admins</p>
                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300">
            <div className="flex items-center">
              <div className="p-3 rounded-2xl bg-emerald-100 text-emerald-600 mr-4">
                <CheckCircle size={24} />
              </div>
              <div>
                <p className="text-gray-500 text-sm font-medium">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">{users.filter(u => u.status === 'active').length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300">
            <div className="flex items-center">
              <div className="p-3 rounded-2xl bg-purple-100 text-purple-600 mr-4">
                <Calendar size={24} />
              </div>
              <div>
                <p className="text-gray-500 text-sm font-medium">Today's Date</p>
                <p className="text-lg font-bold text-gray-900">{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300">
            <div className="flex items-center">
              <div className="p-3 rounded-2xl bg-amber-100 text-amber-600 mr-4">
                <RefreshCw size={24} />
              </div>
              <div>
                <p className="text-gray-500 text-sm font-medium">Last Updated</p>
                <p className="text-lg font-bold text-gray-900">{new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search size={20} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search by name, email or phone..."
                    className="pl-12 pr-4 py-3 w-full border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 transition-all duration-200"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="disabled">Disabled</option>
                </select>
              </div>
            </div>
          </div>

          {/* Add New Admin Form */}
          {showAddForm && (
            <div className="border-t border-gray-200 bg-blue-50">
              <div className="p-6">
                <div className="max-w-4xl mx-auto">
                  <div className="bg-white rounded-2xl shadow-sm border border-blue-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6">
                      <h2 className="text-xl font-bold text-white flex items-center">
                        <UserPlus size={20} className="mr-2" />
                        Add New Administrator
                      </h2>
                    </div>
                    <form onSubmit={handleAddAdmin} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="username">
                            Username *
                          </label>
                          <input
                            type="text"
                            id="username"
                            name="username"
                            value={newAdmin.username}
                            onChange={handleInputChange}
                            className={`w-full py-3 px-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                              formErrors.username ? 'border-rose-500 bg-rose-50' : 'border-gray-300 bg-gray-50'
                            }`}
                            placeholder="Enter username"
                          />
                          {formErrors.username && <p className="text-rose-500 text-xs mt-2 flex items-center"><XCircle size={12} className="mr-1" /> {formErrors.username}</p>}
                        </div>

                        <div>
                          <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="firstname">
                            First Name *
                          </label>
                          <input
                            type="text"
                            id="firstname"
                            name="firstname"
                            value={newAdmin.firstname}
                            onChange={handleInputChange}
                            className={`w-full py-3 px-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                              formErrors.firstname ? 'border-rose-500 bg-rose-50' : 'border-gray-300 bg-gray-50'
                            }`}
                            placeholder="Enter first name"
                          />
                          {formErrors.firstname && <p className="text-rose-500 text-xs mt-2 flex items-center"><XCircle size={12} className="mr-1" /> {formErrors.firstname}</p>}
                        </div>

                        <div>
                          <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="email">
                            Email Address *
                          </label>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            value={newAdmin.email}
                            onChange={handleInputChange}
                            className={`w-full py-3 px-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                              formErrors.email ? 'border-rose-500 bg-rose-50' : 'border-gray-300 bg-gray-50'
                            }`}
                            placeholder="Enter email address"
                          />
                          {formErrors.email && <p className="text-rose-500 text-xs mt-2 flex items-center"><XCircle size={12} className="mr-1" /> {formErrors.email}</p>}
                        </div>

                        <div>
                          <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="password">
                            Password *
                          </label>
                          <input
                            type="password"
                            id="password"
                            name="password"
                            value={newAdmin.password}
                            onChange={handleInputChange}
                            className={`w-full py-3 px-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                              formErrors.password ? 'border-rose-500 bg-rose-50' : 'border-gray-300 bg-gray-50'
                            }`}
                            placeholder="Enter password"
                          />
                          {formErrors.password && <p className="text-rose-500 text-xs mt-2 flex items-center"><XCircle size={12} className="mr-1" /> {formErrors.password}</p>}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="lastname">
                            Last Name *
                          </label>
                          <input
                            type="text"
                            id="lastname"
                            name="lastname"
                            value={newAdmin.lastname}
                            onChange={handleInputChange}
                            className={`w-full py-3 px-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                              formErrors.lastname ? 'border-rose-500 bg-rose-50' : 'border-gray-300 bg-gray-50'
                            }`}
                            placeholder="Enter last name"
                          />
                          {formErrors.lastname && <p className="text-rose-500 text-xs mt-2 flex items-center"><XCircle size={12} className="mr-1" /> {formErrors.lastname}</p>}
                        </div>

                        <div>
                          <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="telephone">
                            Telephone *
                          </label>
                          <input
                            type="tel"
                            id="telephone"
                            name="telephone"
                            value={newAdmin.telephone}
                            onChange={handleInputChange}
                            className={`w-full py-3 px-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                              formErrors.telephone ? 'border-rose-500 bg-rose-50' : 'border-gray-300 bg-gray-50'
                            }`}
                            placeholder="Enter phone number"
                          />
                          {formErrors.telephone && <p className="text-rose-500 text-xs mt-2 flex items-center"><XCircle size={12} className="mr-1" /> {formErrors.telephone}</p>}
                        </div>

                        <div>
                          <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="address">
                            Address *
                          </label>
                          <input
                            type="text"
                            id="address"
                            name="address"
                            value={newAdmin.address}
                            onChange={handleInputChange}
                            className={`w-full py-3 px-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                              formErrors.address ? 'border-rose-500 bg-rose-50' : 'border-gray-300 bg-gray-50'
                            }`}
                            placeholder="Enter full address"
                          />
                          {formErrors.address && <p className="text-rose-500 text-xs mt-2 flex items-center"><XCircle size={12} className="mr-1" /> {formErrors.address}</p>}
                        </div>

                       
                      </div>

                      <div className="md:col-span-2 flex justify-end pt-4 border-t border-gray-200">
                        <button
                          type="submit"
                          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-8 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-lg"
                        >
                          Create Administrator
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Error State */}
          {error && (
            <div className="m-6 bg-rose-50 border-l-4 border-rose-500 text-rose-700 rounded-xl shadow-sm">
              <div className="p-4 flex items-center">
                <XCircle size={20} className="mr-3 flex-shrink-0" />
                <p>{error}</p>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="flex flex-col items-center justify-center p-12">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
              <p className="mt-4 text-gray-500 font-medium">Loading administrators...</p>
            </div>
          ) : (
            <>
              {/* User Table for Desktop */}
              <div className="overflow-x-auto">
                <div className="hidden lg:block">
                  {filteredUsers.length > 0 ? (
                    <table className="min-w-full">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                          {['id', 'username', 'firstname', 'lastname', 'email', 'telephone', 'status', 'actions'].map((key) => (
                            <th 
                              key={key}
                              onClick={() => requestSort(key)}
                              className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-150 first:rounded-tl-2xl last:rounded-tr-2xl"
                            >
                              <div className="flex items-center">
                                {key === 'id' && 'ID'}
                                {key === 'username' && 'Username'}
                                {key === 'firstname' && 'First Name'}
                                {key === 'lastname' && 'Last Name'}
                                {key === 'email' && 'Email'}
                                {key === 'telephone' && 'Phone'}
                                {key === 'status' && 'Status'}
                                {key === 'actions' && 'Actions'}
                                {getSortIcon(key)}
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {currentItems.map((user) => (
                          <tr key={user.id} className="hover:bg-gray-50 transition-colors duration-150 group">
                            <td className="py-4 px-6 text-sm font-medium text-gray-900">{user.id}</td>
                            <td className="py-4 px-6">
                              <div className="flex items-center">
                                <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-semibold mr-3 shadow-sm">
                                  {getInitials(user.username)}
                                </div>
                                <span className="font-semibold text-gray-900">{user.username}</span>
                              </div>
                            </td>
                            <td className="py-4 px-6 text-sm text-gray-900">{user.first_name}</td>
                            <td className="py-4 px-6 text-sm text-gray-900">{user.last_name}</td>
                            <td className="py-4 px-6">
                              <div className="flex items-center text-sm text-gray-600">
                                <Mail size={14} className="mr-2 text-gray-400" />
                                {user.email}
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex items-center text-sm text-gray-600">
                                <Phone size={14} className="mr-2 text-gray-400" />
                                {user.telephone}
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(user.status)}`}>
                                {user.status === 'active' && <CheckCircle size={12} className="mr-1" />}
                                {user.status === 'disabled' && <XCircle size={12} className="mr-1" />}
                                {user.status || 'disabled'}
                              </span>
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => handleToggleAdminStatus(user.id, user.status)}
                                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                                    user.status === 'active'
                                      ? 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                                      : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                                  }`}
                                >
                                  {user.status === 'active' ? 'Disable' : 'Enable'}
                                </button>
                                <button
                                  onClick={(e) => handleDeleteClick(user, e)}
                                  className="px-4 py-2 bg-rose-100 text-rose-700 hover:bg-rose-200 rounded-lg text-sm font-semibold transition-all duration-200"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="p-12 text-center">
                      <div className="mx-auto w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                        <Search size={32} className="text-gray-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">No administrators found</h3>
                      <p className="text-gray-500 max-w-md mx-auto">
                        {searchTerm || statusFilter !== 'all' 
                          ? 'Try adjusting your search or filter criteria' 
                          : 'No administrators have been added yet'}
                      </p>
                    </div>
                  )}
                </div>

                {/* User Cards for Mobile */}
                <div className="lg:hidden">
                  {filteredUsers.length > 0 ? (
                    <div className="space-y-4 p-4">
                      {currentItems.map((user) => (
                        <div key={user.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200">
                          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 flex justify-between items-start">
                            <div className="flex items-start space-x-3">
                              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-semibold shadow-sm mt-1">
                                {getInitials(user.username)}
                              </div>
                              <div>
                                <h3 className="font-bold text-gray-900 text-lg">{user.username}</h3>
                                <p className="text-sm text-gray-500">ID: {user.id}</p>
                                <div className="flex items-center mt-1">
                                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(user.status)}`}>
                                    {user.status === 'active' && <CheckCircle size={10} className="mr-1" />}
                                    {user.status === 'disabled' && <XCircle size={10} className="mr-1" />}
                                    {user.status || 'disabled'}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex space-x-1">
                              <button
                                onClick={() => handleToggleAdminStatus(user.id, user.status)}
                                className={`p-2 rounded-lg transition-all duration-200 ${
                                  user.status === 'active'
                                    ? 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                                    : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                                }`}
                              >
                                {user.status === 'active' ? <XCircle size={16} /> : <CheckCircle size={16} />}
                              </button>
                              <button
                                onClick={(e) => handleDeleteClick(user,e)}
                                className="p-2 bg-rose-100 text-rose-700 hover:bg-rose-200 rounded-lg transition-all duration-200"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                          <div className="p-4 space-y-3">
                            <div className="flex items-center">
                              <div className="w-2/5 text-sm font-medium text-gray-500">Full Name:</div>
                              <div className="w-3/5 text-sm text-gray-900">{user.first_name} {user.last_name}</div>
                            </div>
                            <div className="flex items-center">
                              <Mail size={14} className="text-gray-400 mr-3 w-5" />
                              <span className="text-sm text-gray-900 break-all flex-1">{user.email}</span>
                            </div>
                            <div className="flex items-center">
                              <Phone size={14} className="text-gray-400 mr-3 w-5" />
                              <span className="text-sm text-gray-900">{user.telephone}</span>
                            </div>
                            {user.address && (
                              <div className="flex items-start">
                                <MapPin size={14} className="text-gray-400 mr-3 w-5 mt-0.5" />
                                <span className="text-sm text-gray-900 flex-1">{user.address}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center">
                      <div className="mx-auto w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                        <Search size={24} className="text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">No users found</h3>
                      <p className="text-gray-500">Try adjusting your search criteria</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Pagination */}
              {filteredUsers.length > itemsPerPage && (
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between rounded-b-2xl">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => paginate(currentPage > 1 ? currentPage - 1 : 1)}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => paginate(currentPage < totalPages ? currentPage + 1 : totalPages)}
                      disabled={currentPage === totalPages}
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Showing <span className="font-semibold">{indexOfFirstItem + 1}</span> to{' '}
                        <span className="font-semibold">
                          {indexOfLastItem > filteredUsers.length ? filteredUsers.length : indexOfLastItem}
                        </span>{' '}
                        of <span className="font-semibold">{filteredUsers.length}</span> results
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-lg shadow-sm -space-x-px" aria-label="Pagination">
                        <button
                          onClick={() => paginate(1)}
                          disabled={currentPage === 1}
                          className="relative inline-flex items-center px-3 py-2 rounded-l-lg border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                        >
                          <ArrowUp size={16} className="transform -rotate-90" />
                        </button>
                        <button
                          onClick={() => paginate(currentPage > 1 ? currentPage - 1 : 1)}
                          disabled={currentPage === 1}
                          className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                        >
                          Previous
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                          <button
                            key={number}
                            onClick={() => paginate(number)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              currentPage === number
                                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            {number}
                          </button>
                        ))}
                        <button
                          onClick={() => paginate(currentPage < totalPages ? currentPage + 1 : totalPages)}
                          disabled={currentPage === totalPages}
                          className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                        >
                          Next
                        </button>
                        <button
                          onClick={() => paginate(totalPages)}
                          disabled={currentPage === totalPages}
                          className="relative inline-flex items-center px-3 py-2 rounded-r-lg border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                        >
                          <ArrowDown size={16} className="transform -rotate-90" />
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
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

export default SuperAdmin;