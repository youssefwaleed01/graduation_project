import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import {
  ShoppingCart,
  CheckCircle,
  Truck,
  Package,
  Users,
  AlertCircle
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const SalesDashboard = () => {
  const { user } = useAuth();
  const [kpis, setKpis] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [revenueChartData, setRevenueChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [ordersRes, customersRes] = await Promise.all([
        axios.get('/api/sales/orders'),
        axios.get('/api/crm/customers')
      ]);

      const orders = ordersRes.data.data || [];
      const customers = customersRes.data.data || [];
      
      // Calculate KPIs
      const totalOrders = orders.length;
      const pendingOrders = orders.filter(o => o.status === 'pending').length;
      const confirmedOrders = orders.filter(o => o.status === 'confirmed').length;
      // Count delivered orders - include both 'delivered' and 'shipped' as they represent completed orders
      const deliveredOrders = orders.filter(o => 
        o.status === 'delivered' || o.status === 'shipped'
      ).length;
      const totalRevenue = orders
        .filter(o => ['confirmed', 'shipped', 'delivered'].includes(o.status))
        .reduce((sum, o) => sum + (o.total || 0), 0);
      const totalCustomers = customers.length;
      
      // Calculate revenue chart data from actual orders (last 30 days)
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      
      // Filter orders from last 30 days with confirmed/shipped/delivered status
      const recentOrders = orders.filter(o => {
        const orderDate = new Date(o.orderDate);
        return orderDate >= thirtyDaysAgo && 
               ['confirmed', 'shipped', 'delivered'].includes(o.status);
      });
      
      // Group by date
      const revenueByDate = {};
      recentOrders.forEach(order => {
        const orderDate = new Date(order.orderDate);
        const dateKey = orderDate.toISOString().split('T')[0]; // YYYY-MM-DD
        if (!revenueByDate[dateKey]) {
          revenueByDate[dateKey] = {
            date: dateKey,
            revenue: 0,
            orders: 0
          };
        }
        revenueByDate[dateKey].revenue += order.total || 0;
        revenueByDate[dateKey].orders += 1;
      });
      
      // Convert to array and sort by date
      const revenueData = Object.values(revenueByDate)
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .map(item => ({
          date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          revenue: item.revenue,
          orders: item.orders
        }));

      setRevenueChartData(revenueData);
      setKpis({
        totalOrders,
        pendingOrders,
        confirmedOrders,
        deliveredOrders,
        totalRevenue,
        totalCustomers
      });

      // Get recent orders
      setRecentOrders(orders.slice(0, 5));
    } catch (error) {
      console.error('Dashboard data fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'shipped': return <Truck className="h-5 w-5 text-blue-500" />;
      case 'confirmed': return <Package className="h-5 w-5 text-purple-500" />;
      case 'pending': return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      default: return <ShoppingCart className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'shipped': return 'bg-blue-100 text-blue-800';
      case 'confirmed': return 'bg-purple-100 text-purple-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Sales Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Overview of your sales performance and activities
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ShoppingCart className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Total Orders
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    {kpis?.totalOrders || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Customers
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    {kpis?.totalCustomers || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Delivered
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    {kpis?.deliveredOrders || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100">
                Total Revenue
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Revenue trends over the last month
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-green-600">
                ${(kpis?.totalRevenue || 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <div className="px-4 py-5 sm:p-6">
          <div className="h-80">
            {revenueChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#666"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="#666"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip 
                    formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']}
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#10B981" 
                    strokeWidth={3}
                    dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#10B981', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No revenue data available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100">
            Recent Sales Orders
          </h3>
        </div>
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {recentOrders.length === 0 ? (
            <li className="px-4 py-5 sm:px-6">
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                No sales orders yet
              </p>
            </li>
          ) : (
            recentOrders.map((order) => (
              <li key={order._id} className="px-4 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      {getStatusIcon(order.status)}
                    </div>
                    <div className="ml-4">
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {order.orderNumber}
                        </p>
                      </div>
                      <div className="mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <span>{order.customer?.name || 'Unknown Customer'}</span>
                        <span className="mx-2">•</span>
                        <span>${(order.total || 0).toLocaleString()}</span>
                        <span className="mx-2">•</span>
                        <span>{new Date(order.orderDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
};

export default SalesDashboard;

