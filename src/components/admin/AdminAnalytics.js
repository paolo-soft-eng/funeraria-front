import React, { useState, useEffect } from 'react';
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
  RefreshCw
} from 'lucide-react';
import AdminLayout from './AdminLayout';
import { useNavigate } from 'react-router-dom';

const AdminAnalytics = () => {
  const [timeRange, setTimeRange] = useState('month');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const navigate = useNavigate();

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

  // Fetch initial data and service types
  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  // Refetch when filters change
  useEffect(() => {
    if (!loading) { // Avoid double fetch on initial load
      fetchAnalyticsData();
    }
  }, [filters]);

  // Add this useEffect to fetch service types separately
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
      change: '+18%',
      icon: <DollarSign size={20} />,
      color: 'text-emerald-600 bg-emerald-100'
    },
    {
      title: 'Regular Orders',
      value: (analyticsData.kpis?.total_orders || 0).toString(),
      change: '+12%',
      icon: <ShoppingCart size={20} />,
      color: 'text-indigo-600 bg-indigo-100'
    },
    {
      title: 'Funeral Services',
      value: (analyticsData.kpis?.total_funeral_services || 0).toString(),
      change: '+8%',
      icon: <FileText size={20} />,
      color: 'text-blue-600 bg-blue-100'
    },
    {
      title: 'New Clients',
      value: (analyticsData.kpis?.new_clients || 0).toString(),
      change: '+5%',
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
              <button className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">
                <Download size={16} className="mr-2" />
                Export
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
                      <option value="admin">Admin</option>
                      <option value="staff">Staff</option>
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
              <div className="mt-4 text-xs text-green-600 flex items-center">
                <span>{kpi.change} from last period</span>
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
                          className="flex-1 mx-1 bg-indigo-500 rounded-t-sm hover:bg-indigo-600 transition-colors relative group"
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
                  <>
                    <p className="mb-2">• {analyticsData.services[0]?.name} is the most popular</p>
                    <p className="mb-2">• {analyticsData.services.length} different services/items are being used</p>
                    <p>• Service diversity indicates healthy business mix</p>
                  </>
                ) : (
                  <p>No insights available - no completed orders found</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Row - Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                    <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 flex-shrink-0">
                      <ShoppingCart size={16} />
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
                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${activity.status === 'completed' ? 'bg-green-100 text-green-800' :
                        activity.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                        {activity.status}
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

          {/* Performance Metrics */}
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
          <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
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
    </AdminLayout>
  );
};

export default AdminAnalytics;