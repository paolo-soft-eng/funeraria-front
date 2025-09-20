import React, { useState, useEffect, useRef } from 'react';
import {
  BarChart2,
  TrendingUp,
  Users,
  ShoppingCart,
  DollarSign,
  Calendar,
  FileText,
  Download,
  Filter,
  RefreshCw,
  Printer
} from 'lucide-react';
import AdminLayout from './AdminLayout';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';

const AdminAnalytics = () => {
  const [timeRange, setTimeRange] = useState('month');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const navigate = useNavigate();
  const printRef = useRef();

  const [analyticsData, setAnalyticsData] = useState({
    revenue: [],
    services: [],
    topClients: [],
    recentActivity: [],
    performance: {},
    kpis: {},
    serviceTypes: []
  });

  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    serviceType: '',
    clientType: '',
    paymentStatus: ''
  });
  const getMostPopularService = (services) => {
    if (!services || services.length === 0) {
      return "No service";
    }
    
    const mostPopular = services.reduce((prev, current) => {
      const prevValue = Number(prev.value) || 0;
      const currentValue = Number(current.value) || 0;
      return currentValue > prevValue ? current : prev;
    });

    return mostPopular.name;
  };

  const getServiceInsights = (services) => {
    if (!services || services.length === 0) {
      return {
        mostPopular: "No service",
        totalTypes: 0,
        serviceCount: 0,
        itemCount: 0,
        diversityScore: "Low"
      };
    }

    const mostPopular = services.reduce((prev, current) => {
      const prevValue = Number(prev.value) || 0;
      const currentValue = Number(current.value) || 0;
      return currentValue > prevValue ? current : prev;
    });

    const serviceCount = services.filter(s => s.type === 'service').length;
    const itemCount = services.filter(s => s.type === 'item').length;
    const totalTypes = services.length;

    let diversityScore = "Low";
    if (totalTypes >= 5) diversityScore = "High";
    else if (totalTypes >= 3) diversityScore = "Medium";

    return {
      mostPopular: mostPopular.name,
      mostPopularValue: Number(mostPopular.value).toFixed(1),
      totalTypes,
      serviceCount,
      itemCount,
      diversityScore
    };
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  useEffect(() => {
    if (!loading) { 
      fetchAnalyticsData();
    }
  }, [filters]);
  useEffect(() => {
    const fetchServiceTypes = async () => {
      try {
        const response = await fetch('http://localhost/apii/components/analytics.php?action=service-types');
        const result = await response.json();

        if (result.success) {
          setAnalyticsData(prev => ({
            ...prev,
            serviceTypes: result.data
          }));
        }
      } catch (err) {
        console.error('Service types fetch error:', err);
      }
    };

    fetchServiceTypes();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams({
        action: 'all',
        timeRange: timeRange,
        ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== ''))
      });

      const response = await fetch(`http://localhost/apii/components/analytics.php?${queryParams}`);
      const result = await response.json();

      console.log('Analytics API Response:', result);

      if (result.success) {
        setAnalyticsData(result.data);
        setLastUpdated(new Date());
      } else {
        throw new Error(result.error || 'Failed to fetch analytics data');
      }
    } catch (err) {
      console.error('Analytics fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchAnalyticsData();
  };

  const handleFilterReset = () => {
    setFilters({
      startDate: '',
      endDate: '',
      serviceType: '',
      clientType: '',
      paymentStatus: ''
    });
  };

  const handleRefresh = () => {
    fetchAnalyticsData();
  };

  // New function to format data for printing
  const handleFormatPrint = () => {
    const revenueData = analyticsData.revenue || [];
    const serviceData = analyticsData.services || [];
    const topClients = analyticsData.topClients || [];
    const recentActivity = analyticsData.recentActivity || [];
    const kpis = [
      {
        title: 'Total Revenue',
        value: `₱${Number(analyticsData.kpis?.total_revenue || 0).toLocaleString()}`,
      },
      {
        title: 'Regular Orders',
        value: (analyticsData.kpis?.total_orders || 0).toString(),
      },
      {
        title: 'Funeral Services',
        value: (analyticsData.kpis?.total_funeral_services || 0).toString(),
      },
      {
        title: 'New Clients',
        value: (analyticsData.kpis?.new_clients || 0).toString(),
      },
    ];

    const totalRevenue = revenueData.reduce((sum, item) => sum + (Number(item.value) || 0), 0);
    const currentDate = new Date().toLocaleDateString();

    // Active filters for display
    const activeFilters = Object.entries(filters)
      .filter(([_, value]) => value !== '')
      .map(([key, value]) => {
        if (key === 'serviceType' && analyticsData.serviceTypes) {
          const serviceType = analyticsData.serviceTypes.find(s =>
            value.startsWith('service-')
              ? `service-${s.id}` === value
              : `item-${s.id}` === value
          );
          return `${key}: ${serviceType?.name || value}`;
        }
        return `${key}: ${value}`;
      });

    return `
      <div style="font-family: Arial, sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 15px;">
          <h1 style="color: #333; margin: 0; font-size: 28px;">Funeraria Reports</h1>
          <p style="color: #666; margin: 5px 0; font-size: 14px;">Generated on ${currentDate}</p>
          <p style="color: #666; margin: 5px 0; font-size: 12px;">Time Range: ${timeRange.charAt(0).toUpperCase() + timeRange.slice(1)}</p>
          ${activeFilters.length > 0 ? `<p style="color: #666; margin: 5px 0; font-size: 12px;">Filters Applied: ${activeFilters.join(', ')}</p>` : ''}
        </div>

        <!-- KPI Section -->
        <div style="margin-bottom: 30px;">
          <h2 style="color: #333; border-bottom: 1px solid #ccc; padding-bottom: 8px;">Key Performance Indicators</h2>
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-top: 15px;">
            ${kpis.map(kpi => `
              <div style="border: 1px solid #ddd; border-radius: 8px; padding: 15px; text-align: center; background: #f9f9f9;">
                <h3 style="margin: 0 0 5px 0; font-size: 14px; color: #666;">${kpi.title}</h3>
                <p style="margin: 0; font-size: 20px; font-weight: bold; color: #333;">${kpi.value}</p>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Revenue Overview -->
        <div style="margin-bottom: 30px;">
          <h2 style="color: #333; border-bottom: 1px solid #ccc; padding-bottom: 8px; text-align: center;">Revenue Overview</h2>
          <p style="margin: 10px 0; font-size: 14px; color: #666;">Total Revenue: ₱${Number(totalRevenue).toLocaleString()}</p>
          ${revenueData.length > 0 ? `
            <div style="margin-top: 15px;">
              <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                <thead>
                  <tr style="background: #f5f5f5;">
                    <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Period</th>
                    <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  ${revenueData.map(item => `
                    <tr>
                      <td style="border: 1px solid #ddd; padding: 8px;">${item.month}</td>
                      <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">₱${Number(item.value || 0).toLocaleString()}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          ` : '<p style="color: #666; font-style: italic;">No revenue data available</p>'}
        </div>

        <!-- Service Distribution -->
        <div style="margin-bottom: 30px;">
          <h2 style="color: #333; border-bottom: 1px solid #ccc; padding-bottom: 8px; text-align: center;">Service & Menu Item Distribution</h2>
          ${serviceData.length > 0 ? `
            <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
              <thead>
                <tr style="background: #f5f5f5;">
                  <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Service/Item Name</th>
                  <th style="border: 1px solid #ddd; padding: 8px; text-align: center;">Type</th>
                  <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Percentage</th>
                  <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Count</th>
                </tr>
              </thead>
              <tbody>
                ${serviceData.map(item => `
                  <tr>
                    <td style="border: 1px solid #ddd; padding: 8px;">${item.name}</td>
                    <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">
                      <span style="background: ${item.type === 'service' ? '#e0e7ff' : '#dcfce7'}; color: ${item.type === 'service' ? '#3730a3' : '#166534'}; padding: 2px 6px; border-radius: 12px; font-size: 11px;">
                        ${item.type === 'service' ? 'Service' : 'Menu Item'}
                      </span>
                    </td>
                    <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${Number(item.value || 0).toFixed(1)}%</td>
                    <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${item.count || 0}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          ` : '<p style="color: #666; font-style: italic;">No service or menu item data available</p>'}
        </div>

        <div>
          <!-- Top Clients -->
          <div>
            <h2 style="color: #333; border-bottom: 1px solid #ccc; padding-bottom: 8px; text-align: center;">Top Clients</h2>
            ${topClients.length > 0 ? `
              <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                <thead>
                  <tr style="background: #f5f5f5;">
                    <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Client Name</th>
                    <th style="border: 1px solid #ddd; padding: 8px; text-align: center;">Services</th>
                    <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  ${topClients.map(client => `
                    <tr>
                      <td style="border: 1px solid #ddd; padding: 8px;">${client.name}</td>
                      <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${client.services}</td>
                      <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">₱${client.revenue}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            ` : '<p style="color: #666; font-style: italic;">No client data available</p>'}
          </div>
        </div>
      </div>
    `;
  };

  const handlePrint = () => {
    const printContent = handleFormatPrint();
    const originalContent = document.body.innerHTML;

    document.body.innerHTML = printContent;
    window.print();
    document.body.innerHTML = originalContent;
    window.location.reload();
  };

  const handleExport = () => {
    // Prepare data for export
    const workbook = XLSX.utils.book_new();

    // Revenue data
    const revenueData = analyticsData.revenue.map(item => ({
      Period: item.month,
      Revenue: Number(item.value || 0)
    }));

    // Service data
    const serviceData = analyticsData.services.map(item => ({
      Name: item.name,
      Type: item.type,
      Percentage: Number(item.value || 0),
      Count: item.count || 0
    }));

    // Top clients data
    const clientData = analyticsData.topClients.map(client => ({
      Name: client.name,
      Services: client.services,
      Revenue: Number(client.revenue || 0)
    }));

    // Recent activity data
    const activityData = analyticsData.recentActivity.map(activity => ({
      Type: activity.type,
      Client: activity.client_name,
      Service: activity.service_name || activity.item_name,
      Amount: Number(activity.total_amount || 0),
      Status: activity.status,
      Date: activity.created_at
    }));

    // Create worksheets
    const revenueWS = XLSX.utils.json_to_sheet(revenueData);
    const serviceWS = XLSX.utils.json_to_sheet(serviceData);
    const clientWS = XLSX.utils.json_to_sheet(clientData);
    const activityWS = XLSX.utils.json_to_sheet(activityData);

    // Add worksheets to workbook
    XLSX.utils.book_append_sheet(workbook, revenueWS, "Revenue");
    XLSX.utils.book_append_sheet(workbook, serviceWS, "Services & Items");
    XLSX.utils.book_append_sheet(workbook, clientWS, "Top Clients");
    XLSX.utils.book_append_sheet(workbook, activityWS, "Recent Activity");

    // Export the workbook
    XLSX.writeFile(workbook, `analytics_report_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  if (loading) {
    return (
      <AdminLayout currentPage="analytics">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
          <span className="ml-3 text-gray-600">Loading analytics...</span>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout currentPage="analytics">
        <div className="container mx-auto px-4 py-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="text-red-800 font-medium">Error Loading Analytics</h3>
            <p className="text-red-600 text-sm mt-1">{error}</p>
            <button
              onClick={handleRefresh}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const handleViewAllClients = () => {
    navigate('/dashboard-admin/clients');
  };

  const handleViewAllOrders = () => {
    navigate('/dashboard-admin/orders');
  };

  const revenueData = analyticsData.revenue || [];
  const serviceData = analyticsData.services || [];
  const totalRevenue = revenueData.reduce((sum, item) => sum + (Number(item.value) || 0), 0);
  const topClients = analyticsData.topClients || [];

  const kpis = [
    {
      title: 'Total Revenue',
      value: `₱${Number(analyticsData.kpis?.total_revenue || 0).toLocaleString()}`,
      icon: <DollarSign size={20} />,
      color: 'text-emerald-600 bg-emerald-100'
    },
    {
      title: 'Regular Orders',
      value: (analyticsData.kpis?.total_orders || 0).toString(),
      icon: <ShoppingCart size={20} />,
      color: 'text-indigo-600 bg-indigo-100'
    },
    {
      title: 'Funeral Services',
      value: (analyticsData.kpis?.total_funeral_services || 0).toString(),
      icon: <FileText size={20} />,
      color: 'text-blue-600 bg-blue-100'
    },
    {
      title: 'New Clients',
      value: (analyticsData.kpis?.new_clients || 0).toString(),
      icon: <Users size={20} />,
      color: 'text-amber-600 bg-amber-100'
    },
  ];

  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
  };

  const toggleFilter = () => {
    setIsFilterOpen(!isFilterOpen);
  };


  return (
    <AdminLayout currentPage="analytics">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 mb-1">Analytics Dashboard</h1>
              <p className="text-gray-600">Track performance and business growth</p>
            </div>
            <div className="flex mt-4 sm:mt-0 space-x-3">
              <button
                onClick={handleRefresh}
                className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
              >
                <RefreshCw size={16} className="mr-2" />
                Refresh
              </button>
              <button
                onClick={handleExport}
                className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
              >
                <Download size={16} className="mr-2" />
                Export
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
              >
                <Printer size={16} className="mr-2" />
                Print
              </button>
              <button
                onClick={toggleFilter}
                className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
              >
                <Filter size={16} className="mr-2" />
                Filter
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-3 flex flex-wrap gap-2">
            <button
              onClick={() => handleTimeRangeChange('week')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${timeRange === 'week'
                ? 'bg-indigo-100 text-indigo-700'
                : 'text-gray-600 hover:bg-gray-100'
                }`}
            >
              Week
            </button>
            <button
              onClick={() => handleTimeRangeChange('month')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${timeRange === 'month'
                ? 'bg-indigo-100 text-indigo-700'
                : 'text-gray-600 hover:bg-gray-100'
                }`}
            >
              Month
            </button>
            <button
              onClick={() => handleTimeRangeChange('quarter')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${timeRange === 'quarter'
                ? 'bg-indigo-100 text-indigo-700'
                : 'text-gray-600 hover:bg-gray-100'
                }`}
            >
              Quarter
            </button>
            <button
              onClick={() => handleTimeRangeChange('year')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${timeRange === 'year'
                ? 'bg-indigo-100 text-indigo-700'
                : 'text-gray-600 hover:bg-gray-100'
                }`}
            >
              Year
            </button>
            <div className="ml-auto flex items-center text-gray-500 text-sm">
              <RefreshCw size={14} className="mr-1" />
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
          </div>

          {/* Enhanced Filter Panel */}
          {isFilterOpen && (
            <div className="mt-4 bg-white rounded-lg shadow-sm p-4">
              <h3 className="font-medium text-gray-800 mb-3">Filter Options</h3>
              <form onSubmit={handleFilterSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input
                      type="date"
                      name="startDate"
                      value={filters.startDate}
                      onChange={handleFilterChange}
                      className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input
                      type="date"
                      name="endDate"
                      value={filters.endDate}
                      onChange={handleFilterChange}
                      className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Service Type</label>
                    <select
                      name="serviceType"
                      value={filters.serviceType}
                      onChange={handleFilterChange}
                      className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="">All Services & Items</option>
                      <optgroup label="Services">
                        {analyticsData.serviceTypes
                          ?.filter(item => item.type === 'service')
                          .map(service => (
                            <option key={`service-${service.id}`} value={`service-${service.id}`}>
                              {service.name}
                            </option>
                          ))
                        }
                      </optgroup>
                      <optgroup label="Menu Items">
                        {analyticsData.serviceTypes
                          ?.filter(item => item.type === 'item')
                          .map(item => (
                            <option key={`item-${item.id}`} value={`item-${item.id}`}>
                              {item.name}
                            </option>
                          ))
                        }
                      </optgroup>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Client Type</label>
                    <select
                      name="clientType"
                      value={filters.clientType}
                      onChange={handleFilterChange}
                      className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="">All Clients</option>
                      <option value="user">Regular User</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
                    <select
                      name="paymentStatus"
                      value={filters.paymentStatus}
                      onChange={handleFilterChange}
                      className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="">All Status</option>
                      <option value="paid">Paid</option>
                      <option value="pending">Pending</option>
                      <option value="failed">Failed</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={handleFilterReset}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-300"
                  >
                    Reset
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700"
                  >
                    Apply Filters
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Content to print */}
        <div ref={printRef}>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {kpis.map((kpi, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">{kpi.title}</p>
                    <h3 className="text-2xl font-bold">{kpi.value}</h3>
                  </div>
                  <div className={`p-3 rounded-full ${kpi.color}`}>
                    {kpi.icon}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Revenue Overview */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-800">Revenue Overview</h3>
                <div className="text-sm text-gray-500">
                  <span className="font-medium text-gray-700">Total: </span>
                  ₱{Number(totalRevenue).toLocaleString()}
                </div>
              </div>

              {revenueData.length > 0 ? (
                <>
                  <div className="h-64 relative">
                    <div className="absolute inset-0 flex items-end">
                      {revenueData.map((item, index) => {
                        const maxValue = Math.max(...revenueData.map(d => Number(d.value) || 0));
                        const height = maxValue > 0 ? ((Number(item.value) || 0) / maxValue) * 100 : 0;

                        return (
                          <div
                            key={index}
                            className="flex-1 mx-1 bg-green-500 rounded-t-sm hover:bg-green-600 transition-colors relative group"
                            style={{ height: `${height}%`, minHeight: height > 0 ? '4px' : '0px' }}
                          >
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 text-xs bg-gray-800 text-white py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                              ₱{Number(item.value || 0).toLocaleString()}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex justify-between mt-4 text-xs text-gray-600">
                    {revenueData.map((item, index) => (
                      <div key={index} className="text-center" style={{ flex: '1 0 auto' }}>
                        {item.month}
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-500">
                  No revenue data available
                </div>
              )}
            </div>

            {/* Service Distribution */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-6">Service & Menu Item Distribution</h3>

              {analyticsData.services && analyticsData.services.length > 0 ? (
                <div className="space-y-4">
                  {analyticsData.services.map((item, index) => (
                    <div key={index}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700 truncate" title={item.name}>
                          {item.name}
                          {item.type === 'service' && (
                            <span className="ml-1 text-xs text-indigo-500">(Service)</span>
                          )}
                          {item.type === 'item' && (
                            <span className="ml-1 text-xs text-green-500">(Menu Item)</span>
                          )}
                        </span>
                        <span className="font-medium">{Number(item.value || 0).toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(Number(item.value || 0), 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-32 text-gray-500">
                  No service or menu item data available
                </div>
              )}

              <div className="mt-6 pt-4 border-t border-gray-100">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Key Insights</h4>
                <div className="text-sm text-gray-600">
                  {analyticsData.services && analyticsData.services.length > 0 ? (
                    (() => {
                      const insights = getServiceInsights(analyticsData.services);
                      return (
                        <>
                          <p className="mb-2">• {insights.mostPopular} is the most popular ({insights.mostPopularValue}%)</p>
                          <p className="mb-2">• {insights.serviceCount} services and {insights.itemCount} menu items available</p>
                          <p className="mb-2">• Service diversity: {insights.diversityScore}</p>
                          <p>• Total variety indicates {insights.diversityScore.toLowerCase()} business mix</p>
                        </>
                      );
                    })()
                  ) : (
                    <p>No insights available - no completed orders found</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Row - Tables (excluding Performance Metrics for print) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Clients */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Clients</h3>

              {topClients.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <th className="py-3 px-4">Client</th>
                        <th className="py-3 px-4">Services</th>
                        <th className="py-3 px-4">Revenue</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {topClients.map((client) => (
                        <tr key={client.id}>
                          <td className="py-3 px-4 text-sm font-medium text-gray-800">{client.name}</td>
                          <td className="py-3 px-4 text-sm text-gray-600">{client.services}</td>
                          <td className="py-3 px-4 text-sm text-gray-600">₱{client.revenue}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex items-center justify-center h-32 text-gray-500">
                  No client data available
                </div>
              )}

              <div className="mt-4 pt-3 border-t border-gray-100 text-center">
                <button
                  onClick={handleViewAllClients}
                  className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                >
                  View All Clients
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>

              {analyticsData.recentActivity?.length > 0 ? (
                <div className="space-y-4 max-h-80 overflow-y-auto">
                  {analyticsData.recentActivity.map((activity, index) => (
                    <div key={index} className="flex gap-3">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${activity.status === 'completed' ? 'bg-green-100 text-green-600' :
                          activity.status === 'pending' || activity.status === 'unpaid' ? 'bg-yellow-100 text-yellow-600' :
                            activity.status === 'processing' ? 'bg-blue-100 text-blue-600' :
                              'bg-gray-100 text-gray-600'
                        }`}>
                        {activity.type === 'service' ? (
                          <FileText size={16} />
                        ) : (
                          <ShoppingCart size={16} />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-gray-800 font-medium">
                          {activity.type === 'service' ? 'Service order' : 'Menu items order'}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{activity.client_name}</p>
                        <p className="text-xs text-gray-500">
                          {activity.service_name || activity.item_name || 'No details'}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">{activity.created_at}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-medium">₱{Number(activity.total_amount || 0).toLocaleString()}</p>
                        <span className={`inline-block px-2 py-1 text-xs rounded-full ${activity.status === 'completed' || activity.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                            activity.status === 'pending' || activity.payment_status === 'unpaid' ? 'bg-yellow-100 text-yellow-800' :
                              activity.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                          }`}>
                          {activity.status === 'unpaid' ? 'pending' : activity.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-32 text-gray-500">
                  No recent activity found
                </div>
              )}

              <div className="mt-4 pt-3 border-t border-gray-100 text-center">
                <button
                  onClick={handleViewAllOrders}
                  className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                >
                  View All Activity
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Metrics - Only visible on screen, not in print */}
        <div className="grid grid-cols-1 gap-6 mt-6 no-print">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Performance Metrics</h3>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700">Customer Satisfaction</span>
                  <span className="font-medium">92%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full transition-all duration-300" style={{ width: '92%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700">On-time Delivery</span>
                  <span className="font-medium">{analyticsData.performance?.on_time_delivery || 0}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${analyticsData.performance?.on_time_delivery || 0}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700">Repeat Business</span>
                  <span className="font-medium">{analyticsData.performance?.repeat_business || 0}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-indigo-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${analyticsData.performance?.repeat_business || 0}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Areas for Improvement</h4>
              <div className="text-sm text-gray-600">
                {analyticsData.performance?.repeat_business < 50 ? (
                  <p className="mb-2">• Focus on increasing repeat business</p>
                ) : (
                  <p className="mb-2">• Excellent repeat business rate</p>
                )}
                {analyticsData.performance?.on_time_delivery < 90 ? (
                  <p className="mb-2">• Improve delivery timing</p>
                ) : (
                  <p className="mb-2">• Excellent on-time delivery</p>
                )}
                <p>• Continue monitoring client satisfaction</p>
              </div>
            </div>
          </div>
        </div>

        {/* Active Filters Display */}
        {Object.values(filters).some(filter => filter !== '') && (
          <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4 no-print">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-blue-800">Active Filters:</span>
              {filters.startDate && (
                <span className="inline-flex items-center px-2 py-1 rounded-md bg-blue-100 text-blue-800 text-xs">
                  From: {filters.startDate}
                </span>
              )}
              {filters.endDate && (
                <span className="inline-flex items-center px-2 py-1 rounded-md bg-blue-100 text-blue-800 text-xs">
                  To: {filters.endDate}
                </span>
              )}
              {filters.serviceType && (
                <span className="inline-flex items-center px-2 py-1 rounded-md bg-blue-100 text-blue-800 text-xs">
                  {filters.serviceType.startsWith('service-') ? 'Service: ' : 'Item: '}
                  {analyticsData.serviceTypes?.find(s =>
                    filters.serviceType.startsWith('service-')
                      ? `service-${s.id}` === filters.serviceType
                      : `item-${s.id}` === filters.serviceType
                  )?.name || filters.serviceType}
                </span>
              )}
              {filters.clientType && (
                <span className="inline-flex items-center px-2 py-1 rounded-md bg-blue-100 text-blue-800 text-xs">
                  Client: {filters.clientType}
                </span>
              )}
              {filters.paymentStatus && (
                <span className="inline-flex items-center px-2 py-1 rounded-md bg-blue-100 text-blue-800 text-xs">
                  Payment: {filters.paymentStatus}
                </span>
              )}
              <button
                onClick={handleFilterReset}
                className="inline-flex items-center px-2 py-1 rounded-md bg-red-100 text-red-800 text-xs hover:bg-red-200"
              >
                Clear All
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Print styles */}
      <style>
        {`
          @media print {
            .no-print {
              display: none !important;
            }
            body * {
              visibility: hidden;
            }
            .container, .container * {
              visibility: visible;
            }
            .container {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
            button:not(.no-print button), .bg-indigo-100, .hover\\:bg-gray-100 {
              display: none !important;
            }
          }
        `}
      </style>
    </AdminLayout>
  );
};

export default AdminAnalytics;