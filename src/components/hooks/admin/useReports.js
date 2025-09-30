import { useState, useEffect } from 'react';

export const useReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL = 'http://localhost/apii/components/adminReport.php';

  // Fetch all reports
  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}?action=get_all_reports`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.status === 'success') {
        setReports(data.data || []);
      } else {
        throw new Error(data.message || 'Failed to fetch reports');
      }
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError(err.message || 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  // Handle report status update
  const updateReportStatus = async (reportId, newStatus) => {
    try {
      const response = await fetch(API_BASE_URL, {
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

      const data = await response.json();
      return data;
    } catch (err) {
      console.error('Error updating report status:', err);
      throw err;
    }
  };

  // Handle report deletion
  const deleteReport = async (reportId) => {
    try {
      const response = await fetch(API_BASE_URL, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'delete_report',
          report_id: reportId
        }),
      });

      const data = await response.json();
      return data;
    } catch (err) {
      console.error('Error deleting report:', err);
      throw err;
    }
  };

  // Load reports on component mount
  useEffect(() => {
    fetchReports();
  }, []);

  return {
    reports,
    loading,
    error,
    fetchReports,
    updateReportStatus,
    deleteReport,
    setReports
  };
};