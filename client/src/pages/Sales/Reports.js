import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  BarChart3, 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Download,
  Filter,
  RefreshCw,
  Mail
} from 'lucide-react';

const SalesReports = () => {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [reports, setReports] = useState({
    revenue: null,
    orders: null,
    customers: null,
    products: null,
    trends: null
  });
  const [sendLoading, setSendLoading] = useState(false);

  useEffect(() => {
    fetchAllReports();
  }, [dateRange]);

  const fetchAllReports = async () => {
    setLoading(true);
    try {
      const [revenueRes, ordersRes, customersRes, productsRes, trendsRes] = await Promise.all([
        axios.get(`/api/sales/revenue?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`),
        axios.get(`/api/sales/orders?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`),
        axios.get(`/api/sales/customers-report?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`),
        axios.get(`/api/sales/products-report?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`),
        axios.get(`/api/sales/trends?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`)
      ]);

      setReports({
        revenue: revenueRes.data.data,
        orders: ordersRes.data.data,
        customers: customersRes.data.data,
        products: productsRes.data.data,
        trends: trendsRes.data.data
      });
    } catch (error) {
      toast.error('Failed to fetch reports data');
      console.error('Reports fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeChange = (field, value) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const exportReport = async (type) => {
    try {
      const response = await axios.get(`/api/sales/export/${type}?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type}-report-${dateRange.startDate}-to-${dateRange.endDate}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success(`${type} report exported successfully`);
    } catch (error) {
      toast.error(`Failed to export ${type} report`);
    }
  };

  const sendReport = async () => {
    setSendLoading(true);
    try {
      // Fetch orders data (same as export endpoint logic)
      const ordersResponse = await axios.get('/api/sales/orders');
      const allOrders = ordersResponse.data.data || [];

      // Filter by date range and status (same as export endpoint)
      const startDate = new Date(dateRange.startDate);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(dateRange.endDate);
      endDate.setHours(23, 59, 59, 999);

      const filteredOrders = allOrders.filter(order => {
        // Filter by status (confirmed, shipped, delivered)
        if (!['confirmed', 'shipped', 'delivered'].includes(order.status)) {
          return false;
        }

        // Filter by date range
        if (order.orderDate) {
          const orderDate = new Date(order.orderDate);
          return orderDate >= startDate && orderDate <= endDate;
        }

        return false;
      });

      // Format orders to match export structure
      const reportData = filteredOrders.map(order => {
        const items = order.items?.map(item => 
          `${item.product?.name || 'N/A'} (${item.quantity || 0})`
        ).join('; ') || 'N/A';
        
        return {
          'Order Number': order.orderNumber || '',
          'Customer': order.customer?.name || 'N/A',
          'Total': order.total || 0,
          'Status': order.status || '',
          'Order Date': order.orderDate ? new Date(order.orderDate).toISOString().split('T')[0] : '',
          'Items': items
        };
      });

      if (reportData.length === 0) {
        toast.error('No orders found for the selected date range');
        setSendLoading(false);
        return;
      }

      // Send report via email
      const response = await axios.post('/api/reports/send', {
        module: 'sales',
        reportData: reportData
      });

      if (response.data.success) {
        toast.success(response.data.message || 'Report sent successfully');
      } else {
        toast.error(response.data.message || 'Failed to send report');
      }
    } catch (error) {
      console.error('Send report error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to send report';
      toast.error(errorMessage);
    } finally {
      setSendLoading(false);
    }
  };


  const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Icon className={`h-6 w-6 ${color}`} />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd className="text-lg font-medium text-gray-900">{value}</dd>
              {subtitle && <dd className="text-sm text-gray-500">{subtitle}</dd>}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sales Reports</h1>
          <p className="mt-1 text-sm text-gray-500">
            Comprehensive sales analytics and insights
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => fetchAllReports()}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
          <button
            onClick={sendReport}
            disabled={sendLoading}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
          >
            <Mail className="h-4 w-4 mr-2" />
            {sendLoading ? 'Sending...' : 'Send Report'}
          </button>
          <button
            onClick={() => exportReport('sales')}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </button>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center space-x-4">
          <Filter className="h-5 w-5 text-gray-400" />
          <div className="flex space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Start Date</label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">End Date</label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value={`$${reports.revenue?.totalRevenue?.toLocaleString() || '0'}`}
          icon={DollarSign}
          color="text-green-600"
          subtitle={`${reports.revenue?.orderCount || 0} orders`}
        />
        <StatCard
          title="Average Order Value"
          value={`$${reports.revenue?.averageOrderValue?.toFixed(2) || '0'}`}
          icon={ShoppingCart}
          color="text-blue-600"
          subtitle="Per order"
        />
        <StatCard
          title="Active Customers"
          value={reports.customers?.activeCustomers || '0'}
          icon={Users}
          color="text-purple-600"
          subtitle="In period"
        />
        <StatCard
          title="Top Product"
          value={reports.products?.topProduct?.name || 'N/A'}
          icon={BarChart3}
          color="text-orange-600"
          subtitle={`${reports.products?.topProduct?.quantitySold || 0} sold`}
        />
      </div>

      {/* Revenue Trends */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Revenue Trends
          </h3>
          {reports.trends?.monthlyRevenue && (
            <div className="space-y-4">
              {reports.trends.monthlyRevenue.map((month, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">{month.month}</span>
                  <div className="flex items-center space-x-4">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary-600 h-2 rounded-full" 
                        style={{ width: `${(month.revenue / Math.max(...reports.trends.monthlyRevenue.map(m => m.revenue))) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-20 text-right">
                      ${month.revenue.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Top Customers */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Top Customers
          </h3>
          {reports.customers?.topCustomers && (
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Orders
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Spent
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Order
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reports.customers.topCustomers.map((customer, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {customer.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {customer.orderCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${customer.totalSpent.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(customer.lastOrderDate).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Top Selling Products
          </h3>
          {reports.products?.topProducts && (
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity Sold
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Revenue
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Avg Price
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reports.products.topProducts.map((product, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {product.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.quantitySold}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${product.revenue.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${product.averagePrice.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Order Status Distribution */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Order Status Distribution
          </h3>
          {reports.orders?.statusDistribution && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Object.entries(reports.orders.statusDistribution).map(([status, count]) => (
                <div key={status} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className={`w-3 h-3 rounded-full ${
                        status === 'delivered' ? 'bg-green-500' :
                        status === 'shipped' ? 'bg-blue-500' :
                        status === 'confirmed' ? 'bg-yellow-500' :
                        'bg-gray-500'
                      }`}></div>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900 capitalize">{status}</p>
                      <p className="text-lg font-semibold text-gray-600">{count}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SalesReports;
