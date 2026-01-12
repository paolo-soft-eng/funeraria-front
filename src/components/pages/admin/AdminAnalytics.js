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
  Printer,
  X,
  Settings
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
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [paperSize, setPaperSize] = useState('A4');
  const navigate = useNavigate();
  const printRef = useRef();
  const n = process.env.REACT_APP_API_URL;

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
    paymentStatus: ''
  });

  // Paper size configurations
  const paperSizes = {
    'A4': { width: '210mm', height: '297mm' },
    'Letter': { width: '216mm', height: '279mm' },
    'Legal': { width: '216mm', height: '356mm' },
    'A3': { width: '297mm', height: '420mm' }
  };

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
  }, [timeRange]);

  useEffect(() => {
    const fetchServiceTypes = async () => {
      try {
        const response = await fetch(`${n}/api/components/analytics.php?action=service-types`);
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
        timeRange: timeRange, // Make sure this is included
        ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== ''))
      });

      const response = await fetch(`${n}/api/components/analytics.php?${queryParams}`);
      const result = await response.json();

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
  const handleApplyFilters = () => {
    fetchAnalyticsData();
    setIsFilterOpen(false); // Optional: close filter panel after applying
  };


  const handleFilterChange = (e) => {
    const { name, value } = e.target;

    // Validate dates
    if (name === 'startDate' && filters.endDate && value > filters.endDate) {
      // If start date is after end date, clear end date
      setFilters(prev => ({
        ...prev,
        [name]: value,
        endDate: ''
      }));
    } else if (name === 'endDate' && filters.startDate && value < filters.startDate) {
      // If end date is before start date, show error or handle accordingly
      alert('End date cannot be before start date');
      return;
    } else {
      setFilters(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Clear timeRange when manually setting dates
    if ((name === 'startDate' || name === 'endDate') && value) {
      setTimeRange('');
    }
  };

  const getDateRange = (range) => {
    const now = new Date();
    let startDate = new Date();

    switch (range) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        // Show current month data
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'quarter':
        // Show current quarter data
        const currentQuarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), currentQuarter * 3, 1);
        break;
      case 'year':
        // Show current year data
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: now.toISOString().split('T')[0]
    };
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
    setTimeRange('month')
  };

  const handleRefresh = () => {
    fetchAnalyticsData();
  };

  // Generate print content with paper size support
  const generatePrintContent = () => {
    const recentActivity = analyticsData.recentActivity || [];
    const currentDate = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    // Format date to "Month Day, Year" format
    const formatLongDate = (date) => {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };

    // Get date range based on filters or time range
    let dateRangeText = '';
    if (filters.startDate && filters.endDate) {
      dateRangeText = `${formatLongDate(filters.startDate)} - ${formatLongDate(filters.endDate)}`;
    } else {
      const now = new Date();
      let startDate;

      switch (timeRange) {
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'quarter':
          const quarterStart = Math.floor(now.getMonth() / 3) * 3;
          startDate = new Date(now.getFullYear(), quarterStart, 1);
          break;
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      }
      dateRangeText = `${formatLongDate(startDate)} - ${formatLongDate(now)}`;
    }

    // Calculate total revenue from recent activity
    const totalRevenue = recentActivity.reduce((sum, activity) => {
      return sum + (Number(activity.total_amount) || 0);
    }, 0);

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Funeraria Gomez - Sales Report</title>
        <style>
          @media print {
            @page {
              size: ${paperSize.toLowerCase()};
              margin: 20mm;
            }
            body {
              margin: 0;
              padding: 0;
              font-family: Arial, sans-serif;
              color: #000;
            }
          }
          body {
            font-family: Arial, sans-serif;
            max-width: ${paperSizes[paperSize].width};
            margin: 0 auto;
            padding: 20px;
            color: #000;
            background: white;
          }
          .header {
            display: flex;
            align-items: center;
            padding-bottom: 20px;
            border-bottom: 2px solid #333;
            gap: 0;
          }
          .logo {
            flex-shrink: 0;
            position: relative;
            margin-right: 0;
          }
          .logo img {
            width: 120px;
            height: 120px;
            object-fit: contain;
            border-radius: 50%;
            border: 4px solid #ffffff;
            background: white;
          }
          .header-text {
            flex: 1;
            text-align: left;
          }
          .header-text h1 {
            color: #000;
            margin: 0;
            font-size: 25px;
            font-weight: bold;
          }
          .header-text .location{
            color: #000;
            margin: 0;
            font-size: 12px;
          }
            .header-text .contact-number{
            color: #000;
            margin: 0;
            font-size: 12px;
          }
            .header-text .email{
            color: #000;
            margin: 0;
            font-size: 12px;
          }
          .header-text .date-range {
            color: #000;
            font-size: 14px;
          }
          .header-text .generated-date {
            color: #000;
            margin: 0;
            font-size: 12px;
          }
          .transaction-section h2 {
            color: #000;
            font-size: 18px;
            font-weight: bold;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 10px;
          }
          th, td {
            border: 1px solid #000;
            padding: 12px;
            text-align: center;
          }
          th {
            background: #f0f0f0;
            font-weight: bold;
          }
          .summary {
            text-align: right;
            margin-bottom: 30px;
          }
          .total-revenue {
            font-size: 16px;
            color: #000;
            text-align: right;
            margin-right: 40px;
            font-weight: bold;
          }
          .signature {
            text-align: left;
            margin-bottom: 40px;
          }
          .signature-line {
            border-bottom: 1px solid #000;
            width: 250px;
            height: 20px;
            margin-bottom: 5px;
          }
          .footer {
            position: fixed;
            bottom: 20px;
            left: 0;
            right: 0;
            text-align: center;
            border-top: 1px solid #ccc;
            padding-top: 10px;
            background: white;
          }
          .footer-content {
            max-width: ${paperSizes[paperSize].width};
            margin: 0 auto;
            padding: 0 20px;
          }
          .no-data {
            color: #666;
            font-style: italic;
            text-align: center;
            padding: 40px;
          }
        </style>
      </head>
      <body>
        <!-- Header -->
        <div class="header">
          <!-- Logo -->
          <div class="logo">
            <img src="/funeraria/assets/gomez_logo.jpg" alt="Funeraria Gomez Logo" />
          </div>
          
          <!-- Header Text -->
          <div class="header-text">
            <h1>Funeraria Gomez - Udtohan</h1>
            <p class="location">CPG North Avenue, Barangay Cogon, Tagbilaran City, Philippines</p>
            <p class="contact-number">0909 669 7792</p>
            <p class="email">info@funegomezudtohan.com</p>
            <p class="generated-date">Generated on: ${currentDate}</p>
          </div>
          
          <!-- Empty space for balance -->
          <div style="flex-shrink: 0; width: 100px;"></div>
        </div>

        <!-- Main Content -->
        <div class="main-content">
          <!-- Transaction Table -->
          <div class="transaction-section">
            <h2>Sales Report of ${dateRangeText}</h2>
            
            ${recentActivity.length > 0 ? `
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Client Name</th>
                    <th>Service/Item</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  ${recentActivity.map(activity => `
                    <tr>
                      <td>${new Date(activity.created_at).toLocaleDateString()}</td>
                      <td>${activity.client_name || 'N/A'}</td>
                      <td>${activity.service_name || activity.item_name || 'N/A'}</td>
                      <td>₱${Number(activity.total_amount || 0).toLocaleString()}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            ` : '<p class="no-data">No transaction data available for the selected period</p>'}
          </div>

          <!-- Summary Section -->
          <div class="summary-section">
            <!-- Total Revenue -->
            <div class="summary">
              <div>
                <p class="total-revenue">Total: ₱${totalRevenue.toLocaleString()}</p>
              </div>
            </div>

            <!-- Prepared By -->
            <div class="signature">
              <p style="margin: 0 0 10px 0; font-weight: bold; color: #000;">Prepared by:</p>
              <div class="signature-line"></div>
              <p style="margin: 0 60px; font-size: 12px; color: black; font-weight: bold;">Administrator Signature</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  const handlePrintPreview = () => {
    setShowPrintPreview(true);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(generatePrintContent());
    printWindow.document.close();

    printWindow.onload = () => {
      printWindow.print();
    };
  };

  const handleClosePreview = () => {
    setShowPrintPreview(false);
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

  // Print Preview Modal
  const PrintPreviewModal = () => {
    if (!showPrintPreview) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="text-xl font-bold">Print Preview</h2>
            <div className="flex items-center space-x-4">
              {/* Paper Size Selector */}
              <div className="flex items-center space-x-2">
                <Settings size={16} className="text-gray-600" />
                <select
                  value={paperSize}
                  onChange={(e) => setPaperSize(e.target.value)}
                  className="border rounded px-3 py-1 text-sm"
                >
                  {Object.keys(paperSizes).map(size => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={handlePrint}
                className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
              >
                <Printer size={16} className="mr-2" />
                Print
              </button>
              <button
                onClick={handleClosePreview}
                className="flex items-center px-4 py-2 bg-gray-500 text-white rounded-lg text-sm font-medium hover:bg-gray-600"
              >
                <X size={16} className="mr-2" />
                Close
              </button>
            </div>
          </div>

          {/* Preview Content */}
          <div className="flex-1 overflow-auto p-4 bg-gray-100">
            <div
              className="bg-white mx-auto shadow-lg"
              style={{
                width: paperSizes[paperSize].width,
                height: paperSizes[paperSize].height,
                overflow: 'auto'
              }}
            >
              <iframe
                srcDoc={generatePrintContent()}
                title="Print Preview"
                className="w-full h-full border-none"
                style={{
                  minHeight: paperSizes[paperSize].height
                }}
              />
            </div>
          </div>
        </div>
      </div>
    );
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
    navigate('/gomez/dashboard-admin/clients');
  };

  const handleViewAllOrders = () => {
    navigate('/gomez/dashboard-admin/orders');
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
      value: (analyticsData.kpis?.regular_orders || 0).toString(),
      icon: <ShoppingCart size={20} />,
      color: 'text-indigo-600 bg-indigo-100'
    },
    {
      title: 'Funeral Services',
      value: (analyticsData.kpis?.funeral_services || 0).toString(),
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

    // Clear manual date filters when selecting a predefined time range
    setFilters(prev => ({
      ...prev,
      startDate: '',
      endDate: ''
    }));
  };

  const toggleFilter = () => {
    setIsFilterOpen(!isFilterOpen);
  };
  const getTimeRangeDisplayText = (timeRange, filters) => {
    if (filters.startDate && filters.endDate) {
      return `Custom range: ${new Date(filters.startDate).toLocaleDateString()} - ${new Date(filters.endDate).toLocaleDateString()}`;
    }

    switch (timeRange) {
      case 'week':
        return 'Current week (by days)';
      case 'month':
        return 'Current month (by days)';
      case 'quarter':
        return 'Current quarter (by months)';
      case 'year':
        return 'Current year (by months)';
      default:
        return 'Current month (by days)';
    }
  };

  return (
    <AdminLayout currentPage="analytics">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-1">Analytics Dashboard</h1>
              <p className="text-gray-600">Track performance and business growth</p>
              {/* Display current time range */}
              <div className="mt-1 text-sm text-gray-500">
                Showing data for: <span className="font-medium text-indigo-600 capitalize">
                  {getTimeRangeDisplayText(timeRange, filters)}
                </span>
              </div>
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
                onClick={handlePrintPreview}
                className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
              >
                <Printer size={16} className="mr-2" />
                Report
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

          {/* Time Range Selector */}
          <div className="bg-white rounded-lg shadow-sm p-3 flex flex-wrap gap-2">
            <button
              onClick={() => handleTimeRangeChange('week')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${timeRange === 'week'
                ? 'bg-indigo-100 text-indigo-700 border border-indigo-300'
                : 'text-gray-600 hover:bg-gray-100 border border-transparent'
                }`}
            >
              Week
            </button>
            <button
              onClick={() => handleTimeRangeChange('month')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${timeRange === 'month'
                ? 'bg-indigo-100 text-indigo-700 border border-indigo-300'
                : 'text-gray-600 hover:bg-gray-100 border border-transparent'
                }`}
            >
              Month
            </button>
            <button
              onClick={() => handleTimeRangeChange('quarter')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${timeRange === 'quarter'
                ? 'bg-indigo-100 text-indigo-700 border border-indigo-300'
                : 'text-gray-600 hover:bg-gray-100 border border-transparent'
                }`}
            >
              Quarter
            </button>
            <button
              onClick={() => handleTimeRangeChange('year')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${timeRange === 'year'
                ? 'bg-indigo-100 text-indigo-700 border border-indigo-300'
                : 'text-gray-600 hover:bg-gray-100 border border-transparent'
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

              {/* Remove form element and use div instead */}
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input
                      type="date"
                      name="startDate"
                      value={filters.startDate}
                      onChange={handleFilterChange}
                      max={filters.endDate || new Date().toISOString().split('T')[0]}
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
                      min={filters.startDate}
                      max={new Date().toISOString().split('T')[0]}
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
                    </select>
                  </div>

                  {/* Add a quick actions column */}
                  <div className="flex items-end">
                    <div className="space-y-2 w-full">
                      <button
                        onClick={handleApplyFilters}
                        className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700"
                      >
                        Apply Filters
                      </button>
                      <button
                        onClick={() => {
                          handleFilterReset();
                          fetchAnalyticsData();
                        }}
                        className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-300"
                      >
                        Clear All
                      </button>
                    </div>
                  </div>
                </div>
              </div>
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
                    <div className="absolute inset-0 flex items-end justify-between">
                      {revenueData.map((item, index) => {
                        const maxValue = Math.max(...revenueData.map(d => Number(d.value) || 0));
                        const height = maxValue > 0 ? ((Number(item.value) || 0) / maxValue) * 100 : 0;

                        return (
                          <div
                            key={index}
                            className="flex-1 mx-1 bg-green-500 rounded-t-sm hover:bg-green-600 transition-colors relative group flex flex-col items-center"
                            style={{
                              height: `${height}%`,
                              minHeight: height > 0 ? '4px' : '0px',
                              maxWidth: `${90 / revenueData.length}%`
                            }}
                          >
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 text-xs bg-gray-800 text-white py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                              ₱{Number(item.value || 0).toLocaleString()}
                              <div className="text-xs mt-1">{item.period}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex justify-between mt-4 text-xs text-gray-600">
                    {revenueData.map((item, index) => (
                      <div
                        key={index}
                        className="text-center flex-1 px-1"
                        style={{ minWidth: 0 }}
                      >
                        {/* For week view, show abbreviated day names */}
                        {timeRange === 'week' ?
                          item.period.substring(0, 3) : // Mon, Tue, Wed, etc.
                          item.period
                        }
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-500">
                  No revenue data available for the selected period
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
                          <td className="py-3 px-4 text-sm text-gray-600">₱{parseFloat(client.revenue.replace(/,/g, '')).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</td>
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
                  <span className="font-medium">100%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full transition-all duration-300" style={{ width: '100%' }}></div>
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

      {/* Print Preview Modal */}
      <PrintPreviewModal />

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