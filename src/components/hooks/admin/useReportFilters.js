import { useState, useMemo } from 'react';

export const useReportFilters = (reports) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Filter reports based on search term and status
  const filteredReports = useMemo(() => {
    return reports.filter(report => {
      const matchesSearch = 
        report.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.user_id?.toString().includes(searchTerm);
      
      const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [reports, searchTerm, statusFilter]);

  // Get report statistics
  const reportStats = useMemo(() => {
    const total = reports.length;
    const pending = reports.filter(r => r.status === 'pending').length;
    const resolved = reports.filter(r => r.status === 'resolved').length;
    const rejected = reports.filter(r => r.status === 'rejected').length;

    return { total, pending, resolved, rejected };
  }, [reports]);

  return {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    filteredReports,
    reportStats
  };
};