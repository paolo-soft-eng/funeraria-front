import React from 'react';
import AdminLayout from './AdminLayout';
import { FaTable, FaThLarge, FaUser, FaSearch, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import custom hooks
import { useAuth } from '../../hooks/admin/useAuth';
import { useClients } from '../../hooks/admin/useClients';
import { useClientActions } from '../../hooks/admin/useClientActions';
import { usePagination } from '../../hooks/admin/usePagination';
import { useFilters } from '../../hooks/admin/useFilters';
import { useViewMode } from '../../hooks/admin/useViewMode';
import { useProfilePicture } from '../../hooks/admin/useProfilePicture';


const AdminClients = () => {
  // Use custom hooks
  const { isLoggedIn, userId, userName } = useAuth();
  const { viewMode, isMobile, setViewMode } = useViewMode('table');

  // Add state for itemsPerPage and currentPage
  const [itemsPerPage, setItemsPerPage] = React.useState(isMobile ? 6 : 10);
  const [currentPage, setCurrentPage] = React.useState(1);

  const {
    searchTerm,
    searchInput,
    statusFilter,
    setSearchInput,
    handleSearch,
    handleSearchKeyPress,
    handleStatusFilter,
    clearFilters
  } = useFilters();

  const {
    clients,
    loading,
    fetchClients
  } = useClients(isLoggedIn, currentPage, itemsPerPage, searchTerm, statusFilter);

  // Fix: Update usePagination usage to match what it actually returns
  const {
    totalPages,
    handlePageChange,
    handleItemsPerPageChange, // This expects an event object
    getVisiblePageNumbers  // This is what usePagination actually returns
  } = usePagination(clients.totalCount || 0, itemsPerPage, currentPage, setCurrentPage, setItemsPerPage);

  const {
    showActionModal,
    selectedClient,
    confirmAction,
    handleConfirmAction,
    cancelAction
  } = useClientActions(userId, userName, fetchClients);

  const { ProfilePicture } = useProfilePicture();

  // Update items per page when mobile detection changes
  React.useEffect(() => {
    setItemsPerPage(isMobile ? 6 : 10);
  }, [isMobile]);

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  // Fix: Create a custom handler for items per page change
  const handleItemsPerPageChangeCustom = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };


  const getDisplayRange = () => {
    const totalItems = clients.totalCount || 0;
    if (totalItems === 0) {
      return { start: 0, end: 0 };
    }
    const start = (currentPage - 1) * itemsPerPage + 1;
    const end = Math.min(currentPage * itemsPerPage, totalItems);
    return { start, end };
  };

  const { start, end } = getDisplayRange();
  const totalItems = clients.totalCount || 0;

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg text-center">
          <h2 className="mt-4 text-xl font-semibold text-gray-900">Login Required</h2>
          <p className="mt-2 text-gray-600">Please log in to access the admin dashboard.</p>
          <div className="mt-6">
            <a
              href="/gomez/auth"
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
        <div>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Client Management</h1>
              <p className='text-gray-600 text-sm mb-5'>manage and track customers</p>
            </div>

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
                onChange={(e) => {
                  const newItemsPerPage = Number(e.target.value);
                  setItemsPerPage(newItemsPerPage);
                  setCurrentPage(1); // Reset to first page when changing items per page
                }}
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
                      <td className="px-4 py-2">{client.id || "N/A"}</td>
                      <td className="px-4 py-2">{client.username || "N/A"}</td>
                      <td className="px-4 py-2">{client.first_name || client.last_name || "N/A"}</td>
                      <td className="px-4 py-2">{client.email || "N/A"}</td>
                      <td className="px-4 py-2">{client.telephone || "N/A"}</td>
                      <td className="px-4 py-2">{client.address || "N/A"}</td>
                      <td className="px-4 py-2">{client.emergency_contact || "N/A"}</td>
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
                      <p><span className="font-medium">Name:</span> {client.first_name || client.last_name || "N/A"}</p>
                      <p><span className="font-medium">Email:</span> {client.email || "N/A"}</p>
                      <p><span className="font-medium">Phone:</span> {client.telephone || "N/A"}</p>
                      <p><span className="font-medium">Address:</span> {client.address || "N/A"}</p>
                      <p><span className="font-medium">Emergency:</span> {client.emergency_contact || "N/A"}</p>
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
                  onClick={clearFilters}
                  className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}

          {/* Pagination */}
          {!loading && totalPages > 0 && (
            <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
              <div className="text-sm text-gray-600">
                Showing {start} to {end} of {totalItems} clients
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <FaChevronLeft className="w-4 h-4" />
                </button>

                {/* Fix: Use getVisiblePageNumbers instead of getVisiblePages */}
                {getVisiblePageNumbers().map((page, index) => (
                  <button
                    key={index}
                    onClick={() => typeof page === 'number' && handlePageChange(page)}
                    disabled={page === '...'}
                    className={`px-3 py-2 border rounded text-sm ${page === currentPage
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
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <FaChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
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
                className={`px-4 py-2 rounded text-white text-sm ${selectedClient.action === "disable"
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