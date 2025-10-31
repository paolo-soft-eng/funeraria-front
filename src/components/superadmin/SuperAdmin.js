import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Trash2, Edit, Copy, X, RefreshCw, Search, UserCog, ArrowUp, ArrowDown, Shield, Mail, Phone, MapPin, Calendar, FileText, TrendingUp } from 'lucide-react';
import axios from 'axios';

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

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost/funeraria/api/components/superadmin/users.php');

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

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const response = await fetch(`http://localhost/funeraria/api/components/superadmin/delete_user.php?id=${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete user');
        }

        const result = await response.json();
        if (result.success) {
          setUsers(users.filter(user => user.id !== id));
          showNotification('User deleted successfully', 'success');
        } else {
          throw new Error(result.error || 'Unknown error occurred');
        }
      } catch (error) {
        setError('Error deleting user: ' + error.message);
        showNotification(error.message, 'error');
      }
    }
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
      const response = await fetch('http://localhost/funeraria/api/components/superadmin/add_admin.php', {
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
    notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg transition-all duration-500 transform translate-x-0 z-50 ${type === 'success' ? 'bg-green-500' :
        type === 'error' ? 'bg-red-500' :
          'bg-blue-500'
      } text-white`;
    notification.innerHTML = message;

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
  const filteredUsers = users.filter(user =>
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.firstname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.lastname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.telephone?.includes(searchTerm)
  );

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'ascending' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'ascending' ? 1 : -1;
    }
    return 0;
  });

  // Then later in your component, use these variables:
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedUsers.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleToggleAdminStatus = async (userId, currentStatus) => {
    try {
      // Get the current user from the users array
      const currentUser = users.find(user => user.id === userId);
      const effectiveCurrentStatus = currentUser?.status || 'disabled';

      const newStatus = effectiveCurrentStatus === 'active' ? 'disabled' : 'active';

      const response = await fetch('http://localhost/funeraria/api/components/superadmin/toggleAdminStatus.php', {
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
        // Update the local state with the status from the backend response
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

  const handleLogout = async () => {
    const userConfirmed = window.confirm("Are you sure you want to log out?");

    if (userConfirmed) {
      try {
        await axios.post('http://localhost/funeraria/api/config/logout.php');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userRole');
        navigate('/gomez/auth');
      } catch (error) {
        console.error('Error logging out:', error);
        alert('Failed to log out. Please try again.');
      }
    }

  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gray-500 p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div className="flex items-center">
                <Shield size={28} className="text-white mr-3" />
                <h1 className="text-2xl md:text-3xl font-bold text-white">Admin Dashboard</h1>
              </div>
              <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
                <button
                  onClick={refreshData}
                  className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white py-2 px-4 rounded-lg flex items-center shadow transition-all duration-200"
                >
                  <RefreshCw size={18} className={`mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
                <button
                  onClick={toggleAddForm}
                  className={`${showAddForm
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-green-500 hover:bg-green-600'} 
                    text-white py-2 px-4 rounded-lg flex items-center shadow transition-all duration-200`}
                >
                  {showAddForm ? (
                    <>
                      <X size={18} className="mr-2" />
                      Cancel
                    </>
                  ) : (
                    <>
                      <UserPlus size={18} className="mr-2" />
                      Add New Admin
                    </>
                  )}
                </button>

                <button
                  onClick={() => navigate('/gomez/super-admin/reports')}
                  className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg flex items-center shadow transition-all duration-200"
                >
                  <FileText size={18} className="mr-2" />
                  View Reports
                </button>
                <button className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg flex items-center shadow transition-all duration-200" onClick={handleLogout}>Logout</button>
              </div>
            </div>
          </div>

          {/* Dashboard Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 bg-gray-50 border-b">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                  <UserCog size={24} />
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Total Admins</p>
                  <p className="text-2xl font-bold">{users.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                  <UserPlus size={24} />
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Active Users</p>
                  <p className="text-2xl font-bold">{users.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
                  <Calendar size={24} />
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Today's Date</p>
                  <p className="text-xl font-bold">{new Date().toLocaleDateString()}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-amber-100 text-amber-600 mr-4">
                  <RefreshCw size={24} />
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Last Updated</p>
                  <p className="text-xl font-bold">{new Date().toLocaleTimeString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="p-6 bg-white border-b">
            <div className="relative max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={20} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by name, email or phone..."
                className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Add New Admin Form */}
          {showAddForm && (
            <div className="p-6 border-b border-gray-200 bg-indigo-50">
              <div className="max-w-3xl mx-auto">
                <h2 className="text-xl font-semibold mb-4 text-indigo-800 flex items-center">
                  <UserPlus size={20} className="mr-2" />
                  Add New Admin
                </h2>
                <form onSubmit={handleAddAdmin} className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-lg shadow-sm">
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="username">
                      Username
                    </label>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      value={newAdmin.username}
                      onChange={handleInputChange}
                      className={`shadow-sm appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 ${formErrors.username ? 'border-red-500' : 'border-gray-300'} transition-all duration-200`}
                    />
                    {formErrors.username && <p className="text-red-500 text-xs mt-1">{formErrors.username}</p>}
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="firstname">
                      Firstname
                    </label>
                    <input
                      type="text"
                      id="firstname"
                      name="firstname"
                      value={newAdmin.firstname}
                      onChange={handleInputChange}
                      className={`shadow-sm appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 ${formErrors.firstname ? 'border-red-500' : 'border-gray-300'} transition-all duration-200`}
                    />
                    {formErrors.firstname && <p className="text-red-500 text-xs mt-1">{formErrors.firstname}</p>}
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="lastname">
                      Lastname
                    </label>
                    <input
                      type="text"
                      id="lastname"
                      name="lastname"
                      value={newAdmin.lastname}
                      onChange={handleInputChange}
                      className={`shadow-sm appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 ${formErrors.lastname ? 'border-red-500' : 'border-gray-300'} transition-all duration-200`}
                    />
                    {formErrors.lastname && <p className="text-red-500 text-xs mt-1">{formErrors.lastname}</p>}
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="email">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={newAdmin.email}
                      onChange={handleInputChange}
                      className={`shadow-sm appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 ${formErrors.email ? 'border-red-500' : 'border-gray-300'} transition-all duration-200`}
                    />
                    {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="telephone">
                      Telephone
                    </label>
                    <input
                      type="tel"
                      id="telephone"
                      name="telephone"
                      value={newAdmin.telephone}
                      onChange={handleInputChange}
                      className={`shadow-sm appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 ${formErrors.telephone ? 'border-red-500' : 'border-gray-300'} transition-all duration-200`}
                    />
                    {formErrors.telephone && <p className="text-red-500 text-xs mt-1">{formErrors.telephone}</p>}
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="address">
                      Address
                    </label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={newAdmin.address}
                      onChange={handleInputChange}
                      className={`shadow-sm appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 ${formErrors.address ? 'border-red-500' : 'border-gray-300'} transition-all duration-200`}
                    />
                    {formErrors.address && <p className="text-red-500 text-xs mt-1">{formErrors.address}</p>}
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="password">
                      Password
                    </label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={newAdmin.password}
                      onChange={handleInputChange}
                      className={`shadow-sm appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 ${formErrors.password ? 'border-red-500' : 'border-gray-300'} transition-all duration-200`}
                    />
                    {formErrors.password && <p className="text-red-500 text-xs mt-1">{formErrors.password}</p>}
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="confirmPassword">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={newAdmin.confirmPassword}
                      onChange={handleInputChange}
                      className={`shadow-sm appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 ${formErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'} transition-all duration-200`}
                    />
                    {formErrors.confirmPassword && <p className="text-red-500 text-xs mt-1">{formErrors.confirmPassword}</p>}
                  </div>

                  <div className="md:col-span-2 flex justify-end">
                    <button
                      type="submit"
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200 shadow-md"
                    >
                      Add Admin
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="p-4 m-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-md shadow-sm">
              <p className="flex items-center">
                <X size={18} className="mr-2" />
                {error}
              </p>
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="flex flex-col items-center justify-center p-12">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
              <p className="mt-4 text-gray-500">Loading users data...</p>
            </div>
          ) : (
            /* User Table for Desktop */
            <div className="overflow-x-auto">
              <div className="hidden md:block">
                {filteredUsers.length > 0 ? (
                  <table className="min-w-full">
                    <thead>
                      <tr className="bg-gray-100">
                        <th onClick={() => requestSort('id')} className="py-3 px-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors duration-150">
                          <div className="flex items-center">
                            ID {getSortIcon('id')}
                          </div>
                        </th>
                        <th onClick={() => requestSort('username')} className="py-3 px-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors duration-150">
                          <div className="flex items-center">
                            Username {getSortIcon('username')}
                          </div>
                        </th>
                        <th onClick={() => requestSort('firstname')} className="py-3 px-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors duration-150">
                          <div className="flex items-center">
                            First Name {getSortIcon('firstname')}
                          </div>
                        </th>
                        <th onClick={() => requestSort('lastname')} className="py-3 px-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors duration-150">
                          <div className="flex items-center">
                            Last Name {getSortIcon('lastname')}
                          </div>
                        </th>
                        <th onClick={() => requestSort('email')} className="py-3 px-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors duration-150">
                          <div className="flex items-center">
                            Email {getSortIcon('email')}
                          </div>
                        </th>
                        <th onClick={() => requestSort('telephone')} className="py-3 px-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors duration-150">
                          <div className="flex items-center">
                            Phone {getSortIcon('telephone')}
                          </div>
                        </th>
                        <th onClick={() => requestSort('status')} className="py-3 px-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors duration-150">
                          <div className="flex items-center">
                            Status {getSortIcon('status')}
                          </div>
                        </th>
                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {currentItems.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50 transition-colors duration-150">
                          <td className="py-3 px-4 text-sm text-gray-900">{user.id}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center">
                              <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-medium mr-3">
                                {user.username?.charAt(0).toUpperCase() || "U"}
                              </div>
                              <span className="font-medium text-gray-900">{user.username}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-900">{user.first_name}</td>
                          <td className="py-3 px-4 text-sm text-gray-900">{user.last_name}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center text-sm text-gray-500">
                              <Mail size={14} className="mr-2 text-gray-400" />
                              {user.email}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center text-sm text-gray-500">
                              <Phone size={14} className="mr-2 text-gray-400" />
                              {user.telephone}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${user.status === 'active'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                              }`}>
                              {user.status || 'disabled'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleToggleAdminStatus(user.id, user.status)}
                                className={`px-3 py-1 rounded-md text-sm font-medium ${user.status === 'active'
                                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                                  }`}
                              >
                                {user.status === 'active' ? 'Disable' : 'Enable'}
                              </button>
                              <button
                                onClick={() => handleDelete(user.id)}
                                className="px-3 py-1 bg-red-100 text-red-700 hover:bg-red-200 rounded-md text-sm font-medium"
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
                  <div className="p-8 text-center">
                    <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                      <Search size={24} className="text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No users found</h3>
                    <p className="text-gray-500">Try adjusting your search criteria</p>
                  </div>
                )}
              </div>

              {/* User Cards for Mobile */}
              <div className="md:hidden">
                {filteredUsers.length > 0 ? (
                  <div className="space-y-4 p-4">
                    {currentItems.map((user) => (
                      <div key={user.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200">
                        <div className="p-4 border-b border-gray-200 bg-indigo-50 flex justify-between items-center">
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center                             justify-center font-medium mr-3">
                              {user.username?.charAt(0).toUpperCase() || "U"}
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-900">{user.username}</h3>
                              <p className="text-xs text-gray-500">ID: {user.id}</p>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleToggleAdminStatus(user.id, user.status)}
                              className={`px-3 py-1 rounded-md text-sm font-medium ${user.status === 'active'
                                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                  : 'bg-green-100 text-green-700 hover:bg-green-200'
                                }`}
                            >
                              {user.status === 'active' ? 'Disable' : 'Enable'}
                            </button>
                            <button
                              onClick={() => handleDelete(user.id)}
                              className="px-3 py-1 bg-red-100 text-red-700 hover:bg-red-200 rounded-md text-sm font-medium"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                        <div className="p-4">
                          <div className="flex items-center mb-2">
                            <span className="text-sm font-medium text-gray-500 w-24">Name:</span>
                            <span className="text-sm text-gray-900">{user.firstname} {user.lastname}</span>
                          </div>
                          <div className="flex items-center mb-2">
                            <Mail size={14} className="text-gray-400 mr-2 w-6" />
                            <span className="text-sm text-gray-900 break-all">{user.email}</span>
                          </div>
                          <div className="flex items-center mb-2">
                            <Phone size={14} className="text-gray-400 mr-2 w-6" />
                            <span className="text-sm text-gray-900">{user.telephone}</span>
                          </div>
                          <div className="flex items-center mb-2">
                            <span className="text-sm font-medium text-gray-500 w-24">Status:</span>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${user.status === 'active'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                              }`}>
                              {user.status || 'disabled'}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <MapPin size={14} className="text-gray-400 mr-2 w-6" />
                            <span className="text-sm text-gray-900">{user.address}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                      <Search size={24} className="text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No users found</h3>
                    <p className="text-gray-500">Try adjusting your search criteria</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Pagination */}
          {filteredUsers.length > itemsPerPage && (
            <div className="px-6 py-4 bg-white border-t border-gray-200 flex items-center justify-between">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => paginate(currentPage > 1 ? currentPage - 1 : 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => paginate(currentPage < totalPages ? currentPage + 1 : totalPages)}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
                    <span className="font-medium">
                      {indexOfLastItem > filteredUsers.length ? filteredUsers.length : indexOfLastItem}
                    </span>{' '}
                    of <span className="font-medium">{filteredUsers.length}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => paginate(1)}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    >
                      <span className="sr-only">First</span>
                      <ArrowUp size={16} className="transform -rotate-90" />
                    </button>
                    <button
                      onClick={() => paginate(currentPage > 1 ? currentPage - 1 : 1)}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Previous
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                      <button
                        key={number}
                        onClick={() => paginate(number)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${currentPage === number
                            ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                      >
                        {number}
                      </button>
                    ))}
                    <button
                      onClick={() => paginate(currentPage < totalPages ? currentPage + 1 : totalPages)}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Next
                    </button>
                    <button
                      onClick={() => paginate(totalPages)}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    >
                      <span className="sr-only">Last</span>
                      <ArrowDown size={16} className="transform -rotate-90" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SuperAdmin;