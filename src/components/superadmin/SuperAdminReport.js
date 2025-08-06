import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Edit, X, RefreshCw, Search, Shield, Mail, Calendar, AlertCircle, CheckCircle, XCircle, Clock, ArrowUp, ArrowDown, ArrowLeft } from 'lucide-react';
import axios from 'axios';

const SuperAdminReport = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'descending' });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const navigate = useNavigate();

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost/apii/components/superAdminReport.php?action=get_all_reports');
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const data = await response.json();
      
      if (data.status === 'success') {
        setReports(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch reports');
      }
      setLoading(false);
    } catch (error) {
      setError('Error fetching reports: ' + error.message);
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setIsRefreshing(true);
    await fetchReports();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleUpdateStatus = async (reportId, newStatus) => {
    try {
      const response = await fetch('http://localhost/apii/components/superAdminReport.php', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'update_status',
          report_id: reportId,
          status: newStatus
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update report status');
      }
      
      const result = await response.json();
      
      if (result.status === 'success') {
        setReports(prevReports => prevReports.map(report => 
          report.id === reportId 
            ? { ...report, status: newStatus }
            : report
        ));
        showNotification(`Report status updated to ${newStatus}`, 'success');
      } else {
        throw new Error(result.message || 'Unknown error occurred');
      }
    } catch (error) {
      setError('Error updating report status: ' + error.message);
      showNotification(error.message, 'error');
    }
  };

  const handleDeleteReport = async (reportId) => {
    if (window.confirm('Are you sure you want to delete this report?')) {
      try {
        const response = await fetch('http://localhost/apii/components/superAdminReport.php', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'delete_report',
            report_id: reportId
          }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to delete report');
        }
        
        const result = await response.json();
        
        if (result.status === 'success') {
          setReports(prevReports => prevReports.filter(report => report.id !== reportId));
          showNotification('Report deleted successfully', 'success');
        } else {
          throw new Error(result.message || 'Unknown error occurred');
        }
      } catch (error) {
        setError('Error deleting report: ' + error.message);
        showNotification(error.message, 'error');
      }
    }
  };

  const showNotification = (message, type = 'info') => {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg transition-all duration-500 transform translate-x-0 z-50 ${
      type === 'success' ? 'bg-green-500' : 
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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock size={16} className="text-yellow-500" />;
      case 'resolved':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'rejected':
        return <XCircle size={16} className="text-red-500" />;
      default:
        return <AlertCircle size={16} className="text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredReports = reports.filter(report => 
    report.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.id?.toString().includes(searchTerm)
  );
  
  const sortedReports = [...filteredReports].sort((a, b) => {
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
  const currentItems = sortedReports.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedReports.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

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

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gray-500 p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div className="flex items-center">
                <Shield size={28} className="text-white mr-3" />
                <h1 className="text-2xl md:text-3xl font-bold text-white">Reports Dashboard</h1>
              </div>
              <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
                <button 
                  onClick={() => navigate('/super-admin')}
                  className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white py-2 px-4 rounded-lg flex items-center shadow transition-all duration-200"
                >
                  <ArrowLeft size={18} className="mr-2" />
                  Back to Dashboard
                </button>
                <button 
                  onClick={refreshData}
                  className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white py-2 px-4 rounded-lg flex items-center shadow transition-all duration-200"
                >
                  <RefreshCw size={18} className={`mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
                <button className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg flex items-center shadow transition-all duration-200" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            </div>
          </div>
          
          {/* Dashboard Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 bg-gray-50 border-b">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                  <AlertCircle size={24} />
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Total Reports</p>
                  <p className="text-2xl font-bold">{reports.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 mr-4">
                  <Clock size={24} />
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Pending</p>
                  <p className="text-2xl font-bold">{reports.filter(r => r.status === 'pending').length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                  <CheckCircle size={24} />
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Resolved</p>
                  <p className="text-2xl font-bold">{reports.filter(r => r.status === 'resolved').length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-red-100 text-red-600 mr-4">
                  <XCircle size={24} />
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Rejected</p>
                  <p className="text-2xl font-bold">{reports.filter(r => r.status === 'rejected').length}</p>
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
                placeholder="Search by email, description or status..."
                className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
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
              <p className="mt-4 text-gray-500">Loading reports data...</p>
            </div>
          ) : (
            /* Reports Table for Desktop */
            <div className="overflow-x-auto">
              <div className="hidden md:block">
                {filteredReports.length > 0 ? (
                  <table className="min-w-full">
                    <thead>
                      <tr className="bg-gray-100">
                        <th onClick={() => requestSort('id')} className="py-3 px-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors duration-150">
                          <div className="flex items-center">
                            ID {getSortIcon('id')}
                          </div>
                        </th>
                        <th onClick={() => requestSort('email')} className="py-3 px-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors duration-150">
                          <div className="flex items-center">
                            Email {getSortIcon('email')}
                          </div>
                        </th>
                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
                          Description
                        </th>
                        <th onClick={() => requestSort('status')} className="py-3 px-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors duration-150">
                          <div className="flex items-center">
                            Status {getSortIcon('status')}
                          </div>
                        </th>
                        <th onClick={() => requestSort('created_at')} className="py-3 px-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors duration-150">
                          <div className="flex items-center">
                            Date {getSortIcon('created_at')}
                          </div>
                        </th>
                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {currentItems.map((report) => (
                        <tr key={report.id} className="hover:bg-gray-50 transition-colors duration-150">
                          <td className="py-3 px-4 text-sm text-gray-900">{report.id}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center">
                              <Mail size={14} className="mr-2 text-gray-400" />
                              <span className="text-sm text-gray-900">{report.email}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="max-w-xs">
                              <p className="text-sm text-gray-900 truncate" title={report.description}>
                                {report.description}
                              </p>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center">
                              {getStatusIcon(report.status)}
                              <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(report.status)}`}>
                                {report.status}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center text-sm text-gray-500">
                              <Calendar size={14} className="mr-2 text-gray-400" />
                              {new Date(report.created_at).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2">
                              {report.status === 'pending' && (
                                <>
                                  <button
                                    onClick={() => handleUpdateStatus(report.id, 'resolved')}
                                    className="px-3 py-1 bg-green-100 text-green-700 hover:bg-green-200 rounded-md text-sm font-medium"
                                  >
                                    Resolve
                                  </button>
                                  <button
                                    onClick={() => handleUpdateStatus(report.id, 'rejected')}
                                    className="px-3 py-1 bg-red-100 text-red-700 hover:bg-red-200 rounded-md text-sm font-medium"
                                  >
                                    Reject
                                  </button>
                                </>
                              )}
                              <button
                                onClick={() => handleDeleteReport(report.id)}
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
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No reports found</h3>
                    <p className="text-gray-500">Try adjusting your search criteria</p>
                  </div>
                )}
              </div>
              
              {/* Reports Cards for Mobile */}
              <div className="md:hidden">
                {filteredReports.length > 0 ? (
                  <div className="space-y-4 p-4">
                    {currentItems.map((report) => (
                      <div key={report.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200">
                        <div className="p-4 border-b border-gray-200 bg-indigo-50 flex justify-between items-center">
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-medium mr-3">
                              #{report.id}
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-900">{report.email}</h3>
                              <p className="text-xs text-gray-500">{new Date(report.created_at).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="flex items-center">
                            {getStatusIcon(report.status)}
                            <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(report.status)}`}>
                              {report.status}
                            </span>
                          </div>
                        </div>
                        <div className="p-4">
                          <div className="mb-3">
                            <p className="text-sm text-gray-900">{report.description}</p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {report.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleUpdateStatus(report.id, 'resolved')}
                                  className="px-3 py-1 bg-green-100 text-green-700 hover:bg-green-200 rounded-md text-sm font-medium"
                                >
                                  Resolve
                                </button>
                                <button
                                  onClick={() => handleUpdateStatus(report.id, 'rejected')}
                                  className="px-3 py-1 bg-red-100 text-red-700 hover:bg-red-200 rounded-md text-sm font-medium"
                                >
                                  Reject
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => handleDeleteReport(report.id)}
                              className="px-3 py-1 bg-red-100 text-red-700 hover:bg-red-200 rounded-md text-sm font-medium"
                            >
                              Delete
                            </button>
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
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No reports found</h3>
                    <p className="text-gray-500">Try adjusting your search criteria</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Pagination */}
          {filteredReports.length > itemsPerPage && (
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
                      {indexOfLastItem > filteredReports.length ? filteredReports.length : indexOfLastItem}
                    </span>{' '}
                    of <span className="font-medium">{filteredReports.length}</span> results
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
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === number
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

export default SuperAdminReport; 