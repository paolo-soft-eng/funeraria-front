import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import AdminLayout from './AdminLayout';
import { EmailContext } from '../utils/EmailContext';
import { useNavigate } from 'react-router-dom';
import { FaTable, FaThLarge, FaUser, FaSearch, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AdminClients = () => {
  const [clients, setClients] = useState([]);
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const { email } = useContext(EmailContext);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState(null);
  const [viewMode, setViewMode] = useState('table');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchInput, setSearchInput] = useState('');

  // Mobile detection
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setViewMode('card');
        setItemsPerPage(6); // Fewer items on mobile
      } else {
        setItemsPerPage(10);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (email) {
      fetch(
        `http://localhost/apii/components/getUserId.php?email=${encodeURIComponent(
          email
        )}`
      )
        .then((response) => response.json())
        .then((data) => {
          if (data.userId) {
            setUserId(data.userId);
            setUserName(data.userName || 'Admin');
            setIsLoggedIn(true);
          } else {
            setIsLoggedIn(false);
            navigate("/auth");
          }
        })
        .catch((error) => {
          console.error("Error fetching user ID:", error);
          setIsLoggedIn(false);
          navigate("/auth");
        });
    } else {
      setIsLoggedIn(false);
      navigate("/auth");
    }
  }, [email, navigate]);

  useEffect(() => {
    if (isLoggedIn) {
      fetchClients();
    }
  }, [isLoggedIn, currentPage, itemsPerPage, searchTerm, statusFilter]);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
      });
      
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter) params.append('status', statusFilter);

      const response = await axios.get(`http://localhost/apii/components/fetchClients.php?${params}`);
      
      if (response.data.success) {
        setClients(response.data.data || []);
        setTotalPages(response.data.pagination.total_pages);
        setTotalItems(response.data.pagination.total_items);
      } else {
        setClients([]);
        toast.error('Failed to fetch clients ❌');
      }
    } catch (error) {
      setClients([]);
      toast.error('Network error while fetching clients 🚨');
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setSearchTerm(searchInput.trim());
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleItemsPerPageChange = (newLimit) => {
    setItemsPerPage(newLimit);
    setCurrentPage(1); // Reset to first page when changing limit
  };

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const confirmAction = (client, action) => {
    setSelectedClient({ ...client, action });
    setShowActionModal(true);
  };

  const handleConfirmAction = async () => {
    if (!selectedClient) return;

    try {
      const response = await axios.post("http://localhost/apii/components/fetchClients.php", {
        id: selectedClient.id,
        action: selectedClient.action,
        userId: userId,
        userName: userName
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        // Refresh the current page data instead of updating state manually
        fetchClients();
        setShowActionModal(false);
        toast.success(
          selectedClient.action === "disable"
            ? `Client "${selectedClient.username}" disabled 🚫`
            : `Client "${selectedClient.username}" enabled ✅`
        );
        setSelectedClient(null);
      } else {
        toast.error(response.data.message || "Failed to update client ❌");
      }
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Network error while updating client 🚨");
    }
  };

  const cancelAction = () => {
    setShowActionModal(false);
    setSelectedClient(null);
  };

  // Component for profile picture display
  const ProfilePicture = ({ client, size = 'small' }) => {
    const [imgError, setImgError] = useState(false);
    
    const sizeClasses = {
      small: 'w-8 h-8',
      medium: 'w-12 h-12',
      large: 'w-16 h-16'
    };

    if (imgError || !client.profile_picture) {
      return (
        <div className={`${sizeClasses[size]} bg-gray-300 rounded-full flex items-center justify-center`}>
          <FaUser className="text-gray-500 text-xs" />
        </div>
      );
    }

    return (
      <img
        src={client.profile_picture}
        alt={`${client.username}'s profile`}
        className={`${sizeClasses[size]} rounded-full object-cover`}
        onError={() => setImgError(true)}
      />
    );
  };

  // Pagination component
  const Pagination = () => {
    const getVisiblePages = () => {
      const delta = 2;
      const range = [];
      const rangeWithDots = [];

      for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
        range.push(i);
      }

      if (currentPage - delta > 2) {
        rangeWithDots.push(1, '...');
      } else {
        rangeWithDots.push(1);
      }

      rangeWithDots.push(...range);

      if (currentPage + delta < totalPages - 1) {
        rangeWithDots.push('...', totalPages);
      } else if (totalPages > 1) {
        rangeWithDots.push(totalPages);
      }

      return rangeWithDots;
    };

    if (totalPages <= 1) return null;

    return (
      <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
        <div className="text-sm text-gray-600">
          Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} clients
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            <FaChevronLeft className="w-4 h-4" />
          </button>

          {getVisiblePages().map((page, index) => (
            <button
              key={index}
              onClick={() => typeof page === 'number' && goToPage(page)}
              disabled={page === '...'}
              className={`px-3 py-2 border rounded text-sm ${
                page === currentPage 
                  ? 'bg-blue-500 text-white border-blue-500' 
                  : page === '...' 
                    ? 'cursor-default' 
                    : 'hover:bg-gray-50'
              }`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            <FaChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg text-center">
          <h2 className="mt-4 text-xl font-semibold text-gray-900">Login Required</h2>
          <p className="mt-2 text-gray-600">Please log in to access the admin dashboard.</p>
          <div className="mt-6">
            <a
              href="/auth"
              className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition"
            >
              Go to Login
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout currentPage="clients">
      <div className="p-4 md:p-6">
        <div className="max-w-7xl mx-auto bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-lg font-bold text-gray-900">Client Management</h1>
            {!isMobile && (
              <div className="flex space-x-2">
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-2 rounded-md ${viewMode === 'table' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'}`}
                >
                  <FaTable className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('card')}
                  className={`p-2 rounded-md ${viewMode === 'card' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'}`}
                >
                  <FaThLarge className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {/* Filters and Search */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              {/* Search */}
              <div className="flex gap-2">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search clients..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyPress={handleSearchKeyPress}
                    className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <FaSearch className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                </div>
                <button
                  onClick={handleSearch}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Search
                </button>
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => handleStatusFilter(e.target.value)}
                className="px-5 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="disabled">Disabled</option>
              </select>
            </div>

            {/* Items per page */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Show:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                className="px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          {/* Loading indicator */}
          {loading && (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading clients...</span>
            </div>
          )}

          {/* Table View */}
          {!loading && viewMode === 'table' ? (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left border">
                <thead className="bg-gray-200 text-gray-600 text-xs uppercase">
                  <tr>
                    <th className="px-4 py-2">Profile</th>
                    <th className="px-4 py-2">ID</th>
                    <th className="px-4 py-2">Username</th>
                    <th className="px-4 py-2">Name</th>
                    <th className="px-4 py-2">Email</th>
                    <th className="px-4 py-2">Telephone</th>
                    <th className="px-4 py-2">Address</th>
                    <th className="px-4 py-2">Emergency Contact</th>
                    <th className="px-4 py-2">Created At</th>
                    <th className="px-4 py-2">Status</th>
                    <th className="px-4 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map(client => (
                    <tr key={client.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-2">
                        <ProfilePicture client={client} size="small" />
                      </td>
                      <td className="px-4 py-2">{client.id}</td>
                      <td className="px-4 py-2">{client.username}</td>
                      <td className="px-4 py-2">{client.first_name} {client.last_name}</td>
                      <td className="px-4 py-2">{client.email}</td>
                      <td className="px-4 py-2">{client.telephone}</td>
                      <td className="px-4 py-2">{client.address}</td>
                      <td className="px-4 py-2">{client.emergency_contact}</td>
                      <td className="px-4 py-2">{new Date(client.created_at).toLocaleDateString()}</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 rounded text-white text-xs ${client.status === "disabled" ? "bg-red-500" : "bg-green-500"}`}>
                          {client.status}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        {client.status === "disabled" ? (
                          <button
                            onClick={() => confirmAction(client, "enable")}
                            className="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs"
                          >
                            Enable
                          </button>
                        ) : (
                          <button
                            onClick={() => confirmAction(client, "disable")}
                            className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs"
                          >
                            Disable
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            /* Card View */
            !loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {clients.map(client => (
                  <div key={client.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border">
                    <div className="flex items-center space-x-3 mb-4">
                      <ProfilePicture client={client} size="large" />
                      <div>
                        <h3 className="text-lg font-semibold">{client.username}</h3>
                        <p className="text-sm text-gray-500">ID: {client.id}</p>
                      </div>
                    </div>
                    <div className="mt-3 space-y-2 text-sm text-gray-600">
                      <p><span className="font-medium">Name:</span> {client.first_name} {client.last_name}</p>
                      <p><span className="font-medium">Email:</span> {client.email}</p>
                      <p><span className="font-medium">Phone:</span> {client.telephone}</p>
                      <p><span className="font-medium">Address:</span> {client.address}</p>
                      <p><span className="font-medium">Emergency:</span> {client.emergency_contact}</p>
                      <p><span className="font-medium">Created:</span> {new Date(client.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <span className={`px-2 py-1 rounded text-white text-xs ${client.status === "disabled" ? "bg-red-500" : "bg-green-500"}`}>
                        {client.status}
                      </span>
                      {client.status === "disabled" ? (
                        <button
                          className="bg-green-600 text-white py-1 px-3 rounded hover:bg-green-700 transition"
                          onClick={() => confirmAction(client, "enable")}
                        >
                          Enable
                        </button>
                      ) : (
                        <button
                          className="bg-red-600 text-white py-1 px-3 rounded hover:bg-red-700 transition"
                          onClick={() => confirmAction(client, "disable")}
                        >
                          Disable
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {/* No results message */}
          {!loading && clients.length === 0 && (
            <div className="text-center py-10">
              <p className="text-gray-500">
                {searchTerm || statusFilter ? 'No clients found matching your criteria' : 'No clients found'}
              </p>
              {(searchTerm || statusFilter) && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSearchInput('');
                    setStatusFilter('');
                    setCurrentPage(1);
                  }}
                  className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}

          {/* Pagination */}
          {!loading && <Pagination />}
        </div>
      </div>

      {/* Action Confirmation Modal */}
      {showActionModal && selectedClient && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <ProfilePicture client={selectedClient} size="medium" />
              <div>
                <h2 className="text-lg font-bold">
                  {selectedClient.action === "disable" ? "Disable Client" : "Enable Client"}
                </h2>
                <p className="text-sm text-gray-600">{selectedClient.username}</p>
              </div>
            </div>
            <p className="mb-6 text-sm">
              Are you sure you want to{" "}
              <span className="font-bold">{selectedClient.action}</span>{" "}
              client <span className="font-semibold">{selectedClient.username}</span>?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition text-sm"
                onClick={cancelAction}
              >
                Cancel
              </button>
              <button
                className={`px-4 py-2 rounded text-white text-sm ${
                  selectedClient.action === "disable"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-green-600 hover:bg-green-700"
                }`}
                onClick={handleConfirmAction}
              >
                {selectedClient.action === "disable" ? "Disable" : "Enable"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast notifications */}
      <ToastContainer position="top-right" autoClose={3000} />
    </AdminLayout>
  );
};

export default AdminClients;