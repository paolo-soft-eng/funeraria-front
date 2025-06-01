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

const AdminAnalytics = () => {
  const [timeRange, setTimeRange] = useState('month');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analyticsData, setAnalyticsData] = useState({
    revenue: [],
    services: [],
    topClients: [],
    recentActivity: [],
    performance: {},
    kpis: {}
  });
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    serviceType: '',
    clientType: '',
    paymentStatus: ''
  });

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        action: 'all',
        ...filters
      });
      
      const response = await fetch(`http://localhost/apii/components/analytics.php?${queryParams}`);
      const result = await response.json();
      
      if (result.success) {
        setAnalyticsData(result.data);
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
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
    fetchAnalyticsData();
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  const revenueData = analyticsData.revenue;
  const serviceData = analyticsData.services;
  const totalRevenue = revenueData.reduce((sum, item) => sum + item.value, 0);

  const topClients = analyticsData.topClients;

  const kpis = [
    {
      title: 'Total Revenue',
      value: `$${(analyticsData.kpis.total_revenue/1000).toFixed(1)}k`,
      change: '+18%',
      icon: <DollarSign size={20} />,
      color: 'text-emerald-600 bg-emerald-100'
    },
    {
      title: 'Total Orders',
      value: analyticsData.kpis.total_orders.toString(),
      change: '+12%',
      icon: <ShoppingCart size={20} />,
      color: 'text-indigo-600 bg-indigo-100'
    },
    {
      title: 'New Clients',
      value: analyticsData.kpis.new_clients.toString(),
      change: '+5%',
      icon: <Users size={20} />,
      color: 'text-blue-600 bg-blue-100'
    },
    {
      title: 'Growth Rate',
      value: '15%',
      change: '+3%',
      icon: <TrendingUp size={20} />,
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
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              timeRange === 'week'
                ? 'bg-indigo-100 text-indigo-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Week
          </button>
          <button
            onClick={() => handleTimeRangeChange('month')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              timeRange === 'month'
                ? 'bg-indigo-100 text-indigo-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Month
          </button>
          <button
            onClick={() => handleTimeRangeChange('quarter')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              timeRange === 'quarter'
                ? 'bg-indigo-100 text-indigo-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Quarter
          </button>
          <button
            onClick={() => handleTimeRangeChange('year')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              timeRange === 'year'
                ? 'bg-indigo-100 text-indigo-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Year
          </button>
          <div className="ml-auto flex items-center text-gray-500 text-sm">
            <RefreshCw size={14} className="mr-1" />
            Last updated: Today, 10:30 AM
          </div>
        </div>

        {isFilterOpen && (
          <div className="mt-4 bg-white rounded-lg shadow-sm p-4">
            <h3 className="font-medium text-gray-800 mb-3">Filter Options</h3>
            <form onSubmit={handleFilterSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Service Type</label>
                  <select 
                    name="serviceType"
                    value={filters.serviceType}
                    onChange={handleFilterChange}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="">All Services</option>
                    <option value="1">Basic Package</option>
                    <option value="2">Standard Package</option>
                    <option value="3">Premium Package</option>
                    <option value="4">Customized Package</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                  <div className="flex space-x-2">
                    <input 
                      type="date" 
                      name="startDate"
                      value={filters.startDate}
                      onChange={handleFilterChange}
                      className="w-full p-2 border border-gray-300 rounded-md text-sm" 
                    />
                    <input 
                      type="date" 
                      name="endDate"
                      value={filters.endDate}
                      onChange={handleFilterChange}
                      className="w-full p-2 border border-gray-300 rounded-md text-sm" 
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Client Type</label>
                  <select 
                    name="clientType"
                    value={filters.clientType}
                    onChange={handleFilterChange}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="">All Clients</option>
                    <option value="client">Individual</option>
                    <option value="admin">Corporate</option>
                  </select>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <button 
                  type="button"
                  onClick={handleFilterReset}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md text-sm font-medium mr-2 hover:bg-gray-300"
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-800">Revenue Overview</h3>
            <div className="text-sm text-gray-500">
              <span className="font-medium text-gray-700">Total: </span>
              ${(totalRevenue/1000).toFixed(1)}k
            </div>
          </div>

          <div className="h-64 relative">
            <div className="absolute inset-0 flex items-end">
              {revenueData.map((item, index) => (
                <div
                  key={index}
                  className="flex-1 mx-1 bg-indigo-500 rounded-t-sm hover:bg-indigo-600 transition-colors relative group"
                  style={{ height: `${(item.value / 30000) * 100}%` }}
                >
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 text-xs bg-gray-800 text-white py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    ${(item.value/1000).toFixed(1)}k
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between mt-4 text-xs text-gray-600">
            {revenueData.map((item, index) => (
              <div key={index} className="text-center">
                {item.month}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Service Distribution</h3>

          <div className="space-y-4">
            {serviceData.map((item, index) => (
              <div key={index}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700">{item.name}</span>
                  <span className="font-medium">{item.value}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-indigo-600 h-2 rounded-full"
                    style={{ width: `${item.value}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Key Insights</h4>
            <div className="text-sm text-gray-600">
              <p className="mb-2">• Cremations remain our most requested service</p>
              <p className="mb-2">• Memorial services have increased by 15%</p>
              <p>• Custom services are showing growth potential</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Clients</h3>

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
                    <td className="py-3 px-4 text-sm text-gray-600">${client.revenue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100 text-center">
            <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
              View All Clients
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>

          <div className="space-y-4">
            {analyticsData.recentActivity.map((activity, index) => (
              <div key={index} className="flex gap-3">
                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 flex-shrink-0">
                  <ShoppingCart size={16} />
                </div>
                <div>
                  <p className="text-sm text-gray-800 font-medium">{activity.type === 'order' ? 'New order created' : 'Event scheduled'}</p>
                  <p className="text-xs text-gray-500">{activity.client_name}</p>
                  <p className="text-xs text-gray-400 mt-1">{activity.created_at}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100 text-center">
            <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
              View All Activity
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Performance Metrics</h3>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-700">Customer Satisfaction</span>
                <span className="font-medium">92%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '92%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-700">On-time Delivery</span>
                <span className="font-medium">{analyticsData.performance.on_time_delivery}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ width: `${analyticsData.performance.on_time_delivery}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-700">Repeat Business</span>
                <span className="font-medium">{analyticsData.performance.repeat_business}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                    className="bg-indigo-500 h-2 rounded-full" 
                    style={{ width: `${analyticsData.performance.repeat_business}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Areas for Improvement</h4>
            <div className="text-sm text-gray-600">
              <p className="mb-2">• Focus on increasing repeat business</p>
              <p className="mb-2">• Improve budget estimation process</p>
              <p>• Maintain excellent on-time service delivery</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    </AdminLayout>
  );
};

export default AdminAnalytics;
