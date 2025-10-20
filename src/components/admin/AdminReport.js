import React from 'react';
import AdminLayout from './AdminLayout';
import { 
  Eye, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle,
  RefreshCw,
  Search,
  Filter
} from 'lucide-react';

// Import custom hooks
import { useReports } from '../hooks/admin/useReports';
import { useReportFilters } from '../hooks/admin/useReportFilters';
import { useReportModal } from '../hooks/admin/useReportModal';
import { useReportUtils } from '../hooks/admin/useReportUtils';
import { useStatusMessage } from '../hooks/admin/useStatusMessage';

export const AdminReport = () => {
  // Use custom hooks
  const {
    reports,
    loading,
    error,
    fetchReports,
    updateReportStatus,
    deleteReport
  } = useReports();

  const {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    filteredReports,
    reportStats
  } = useReportFilters(reports);

  const {
    selectedReport,
    isViewModalOpen,
    openModal,
    closeModal
  } = useReportModal();

  const {
    statusMessage,
    showSuccess,
    showError,
    clearMessage
  } = useStatusMessage();

  const {
    getStatusInfo,
    formatDate
  } = useReportUtils();

  // Handle report status update with message
  const handleStatusUpdate = async (reportId, newStatus) => {
    try {
      const data = await updateReportStatus(reportId, newStatus);
      if (data.status === 'success') {
        showSuccess(`Report marked as ${newStatus}`);
        fetchReports(); // Refresh the list
      } else {
        showError(data.message || 'Failed to update report status');
      }
    } catch (err) {
      console.error('Error updating report status:', err);
      showError('Failed to update report status. Please try again.');
    }
  };

  // Handle report deletion with confirmation
  const handleDeleteReport = async (reportId) => {
    if (window.confirm('Are you sure you want to delete this report? This action cannot be undone.')) {
      try {
        const data = await deleteReport(reportId);
        if (data.status === 'success') {
          showSuccess('Report deleted successfully');
          fetchReports(); // Refresh the list
        } else {
          showError(data.message || 'Failed to delete report');
        }
      } catch (err) {
        console.error('Error deleting report:', err);
        showError('Failed to delete report. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <AdminLayout currentPage='reports'>
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-lg text-gray-700 font-medium">Loading reports...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout currentPage='reports'>
      <div className="space-y-6 p-4">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-1">Bug Reports</h1>
            <p className="text-gray-600">Manage and respond to user bug reports</p>
          </div>
          <button
            onClick={fetchReports}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw size={16} className="mr-2" />
            Refresh
          </button>
        </div>

        {/* Status Message Display */}
        {statusMessage.message && (
          <div className={`p-4 rounded-lg ${
            statusMessage.type === 'success' 
              ? 'bg-green-100 text-green-700' 
              : 'bg-red-100 text-red-700'
          }`}>
            {statusMessage.message}
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
            <div className="flex items-center">
              <AlertCircle size={20} className="text-red-500 mr-2" />
              <span className="text-red-700">{error}</span>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by email, description, or user ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Filter size={20} className="text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="resolved">Resolved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Reports Table */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredReports.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <AlertCircle size={48} className="text-gray-300 mb-4" />
                        <p className="text-lg font-medium">No reports found</p>
                        <p className="text-sm">No bug reports match your current filters.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredReports.map((report) => {
                    const statusInfo = getStatusInfo(report.status);
                    return (
                      <tr key={report.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {report.email || 'Anonymous'}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {report.user_id || 'N/A'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-xs truncate">
                            {report.description}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                            {statusInfo.icon}
                            <span className="ml-1">{statusInfo.label}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(report.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => openModal(report)}
                              className="text-blue-600 hover:text-blue-900 p-1"
                              title="View Details"
                            >
                              <Eye size={16} />
                            </button>
                            
                            {report.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleStatusUpdate(report.id, 'resolved')}
                                  className="text-green-600 hover:text-green-900 p-1"
                                  title="Mark as Resolved"
                                >
                                  <CheckCircle size={16} />
                                </button>
                                <button
                                  onClick={() => handleStatusUpdate(report.id, 'rejected')}
                                  className="text-red-600 hover:text-red-900 p-1"
                                  title="Mark as Rejected"
                                >
                                  <XCircle size={16} />
                                </button>
                              </>
                            )}
                            
                            <button
                              onClick={() => handleDeleteReport(report.id)}
                              className="text-red-600 hover:text-red-900 p-1"
                              title="Delete Report"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{reportStats.total}</div>
              <div className="text-sm text-gray-500">Total Reports</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{reportStats.pending}</div>
              <div className="text-sm text-gray-500">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{reportStats.resolved}</div>
              <div className="text-sm text-gray-500">Resolved</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{reportStats.rejected}</div>
              <div className="text-sm text-gray-500">Rejected</div>
            </div>
          </div>
        </div>
      </div>

      {/* View Report Modal */}
      {isViewModalOpen && selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-lg font-medium">Report Details</h3>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <XCircle size={24} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">User Email</label>
                <p className="text-gray-900">{selectedReport.email || 'Anonymous'}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
                <p className="text-gray-900">{selectedReport.user_id || 'N/A'}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <div className="mt-1">
                  {(() => {
                    const statusInfo = getStatusInfo(selectedReport.status);
                    return (
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
                        {statusInfo.icon}
                        <span className="ml-1">{statusInfo.label}</span>
                      </span>
                    );
                  })()}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Submitted</label>
                <p className="text-gray-900">{formatDate(selectedReport.created_at)}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-900 whitespace-pre-wrap">{selectedReport.description}</p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 p-6 border-t">
              {selectedReport.status === 'pending' && (
                <>
                  <button
                    onClick={() => {
                      handleStatusUpdate(selectedReport.id, 'resolved');
                      closeModal();
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
                  >
                    <CheckCircle size={16} className="mr-2" />
                    Mark Resolved
                  </button>
                  <button
                    onClick={() => {
                      handleStatusUpdate(selectedReport.id, 'rejected');
                      closeModal();
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center"
                  >
                    <XCircle size={16} className="mr-2" />
                    Mark Rejected
                  </button>
                </>
              )}
              <button
                onClick={closeModal}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminReport;