import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import {
  Users,
  ShoppingCart,
  ShoppingBag,
  Package,
  TrendingUp,
  Clock,
  Factory,
  Truck,
  UserCheck,
  AlertTriangle,
  DollarSign,
  Star
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const Dashboard = () => {
  const { user } = useAuth();
  const [kpis, setKpis] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);
  const [departmentChart, setDepartmentChart] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      if (user?.role === 'admin') {
        // Admin gets comprehensive data from all departments
        const [kpisRes, activitiesRes, chartRes] = await Promise.all([
          axios.get('/api/dashboard/kpis'),
          axios.get('/api/dashboard/recent-activities'),
          axios.get('/api/dashboard/sales-chart?period=month')
        ]);

        setKpis(kpisRes.data.data);
        setRecentActivities(activitiesRes.data.data);
        setDepartmentChart(chartRes.data.data);
      } else {
        // Managers get department-specific data
        const [kpisRes, activitiesRes, chartRes] = await Promise.all([
          axios.get(`/api/dashboard/kpis?department=${user?.department}`),
          axios.get(`/api/dashboard/recent-activities?department=${user?.department}`),
          axios.get(`/api/dashboard/department-chart?department=${user?.department}&period=month`)
        ]);

        setKpis(kpisRes.data.data);
        setRecentActivities(activitiesRes.data.data);
        setDepartmentChart(chartRes.data.data);
      }
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

  // Department-specific KPI cards
  const getDepartmentKPIs = () => {
    // Admin gets comprehensive overview of all departments
    if (user?.role === 'admin') {
      return [
        {
          title: 'Total Employees',
          value: kpis?.employees?.total || 0,
          icon: Users,
          color: 'text-blue-600',
          bgColor: 'bg-blue-100'
        },
        {
          title: 'Sales Revenue',
          value: `$${((kpis?.sales?.totalRevenue || 0)).toLocaleString()}`,
          icon: DollarSign,
          color: 'text-green-600',
          bgColor: 'bg-green-100'
        },
        {
          title: 'Total Products',
          value: kpis?.inventory?.totalProducts || 0,
          icon: Package,
          color: 'text-purple-600',
          bgColor: 'bg-purple-100'
        },
        {
          title: 'Low Stock Alerts',
          value: kpis?.inventory?.lowStockAlerts || 0,
          icon: AlertTriangle,
          color: 'text-red-600',
          bgColor: 'bg-red-100'
        },
        {
          title: 'Pending Orders',
          value: (kpis?.production?.pending || 0) + (kpis?.purchasing?.pending || 0),
          icon: Clock,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100'
        },
        {
          title: 'Total Customers',
          value: kpis?.customers?.total || 0,
          icon: UserCheck,
          color: 'text-indigo-600',
          bgColor: 'bg-indigo-100'
        },
        {
          title: 'Active Suppliers',
          value: kpis?.suppliers?.total || 0,
          icon: Truck,
          color: 'text-orange-600',
          bgColor: 'bg-orange-100'
        },
        {
          title: 'Top Product',
          value: kpis?.topProduct?.name || 'N/A',
          subtitle: kpis?.topProduct ? `${kpis.topProduct.totalQuantity} sold` : 'No sales data',
          icon: Star,
          color: 'text-pink-600',
          bgColor: 'bg-pink-100'
        }
      ];
    }

    // Managers get department-specific data
    const department = user?.department?.toLowerCase();
    
    switch (department) {
      case 'sales':
        return [
          {
            title: 'Total Revenue',
            value: `$${((kpis?.revenue || 0)).toLocaleString()}`,
            icon: DollarSign,
            color: 'text-green-600',
            bgColor: 'bg-green-100'
          },
          {
            title: 'Orders This Month',
            value: kpis?.orders || 0,
            icon: ShoppingCart,
            color: 'text-blue-600',
            bgColor: 'bg-blue-100'
          },
          {
            title: 'Active Customers',
            value: kpis?.customers || 0,
            icon: UserCheck,
            color: 'text-indigo-600',
            bgColor: 'bg-indigo-100'
          },
          {
            title: 'Top Product',
            value: kpis?.topProduct?.name || 'N/A',
            subtitle: kpis?.topProduct ? `${kpis.topProduct.quantity} sold` : 'No sales data',
            icon: Star,
            color: 'text-orange-600',
            bgColor: 'bg-orange-100'
          }
        ];
      
      case 'purchasing':
        return [
          {
            title: 'Total Spending',
            value: `$${((kpis?.spending || 0)).toLocaleString()}`,
            icon: DollarSign,
            color: 'text-purple-600',
            bgColor: 'bg-purple-100'
          },
          {
            title: 'Purchase Orders',
            value: kpis?.orders || 0,
            icon: ShoppingBag,
            color: 'text-blue-600',
            bgColor: 'bg-blue-100'
          },
          {
            title: 'Active Suppliers',
            value: kpis?.suppliers || 0,
            icon: Truck,
            color: 'text-indigo-600',
            bgColor: 'bg-indigo-100'
          },
          {
            title: 'Pending Orders',
            value: kpis?.pending || 0,
            icon: Clock,
            color: 'text-yellow-600',
            bgColor: 'bg-yellow-100'
          }
        ];
      
      case 'hr':
        return [
          {
            title: 'Total Employees',
            value: kpis?.employees || 0,
            icon: Users,
            color: 'text-blue-600',
            bgColor: 'bg-blue-100'
          },
          {
            title: 'Present Today',
            value: kpis?.present || 0,
            icon: UserCheck,
            color: 'text-green-600',
            bgColor: 'bg-green-100'
          },
          {
            title: 'Absent Today',
            value: kpis?.absent || 0,
            icon: AlertTriangle,
            color: 'text-red-600',
            bgColor: 'bg-red-100'
          },
          {
            title: 'New Hires This Month',
            value: kpis?.newHires || 0,
            icon: TrendingUp,
            color: 'text-purple-600',
            bgColor: 'bg-purple-100'
          }
        ];
      
      case 'inventory':
        return [
          {
            title: 'Total Products',
            value: kpis?.products || 0,
            icon: Package,
            color: 'text-blue-600',
            bgColor: 'bg-blue-100'
          },
          {
            title: 'Low Stock Items',
            value: kpis?.lowStock || 0,
            icon: AlertTriangle,
            color: 'text-red-600',
            bgColor: 'bg-red-100'
          },
          {
            title: 'Total Value',
            value: `$${((kpis?.totalValue || 0)).toLocaleString()}`,
            icon: DollarSign,
            color: 'text-green-600',
            bgColor: 'bg-green-100'
          },
          {
            title: 'Recent Movements',
            value: kpis?.movements || 0,
            icon: TrendingUp,
            color: 'text-purple-600',
            bgColor: 'bg-purple-100'
          }
        ];
      
      case 'manufacturing':
        return [
          {
            title: 'Production Orders',
            value: kpis?.orders || 0,
            icon: Factory,
            color: 'text-blue-600',
            bgColor: 'bg-blue-100'
          },
          {
            title: 'Completed Today',
            value: kpis?.completed || 0,
            icon: UserCheck,
            color: 'text-green-600',
            bgColor: 'bg-green-100'
          },
          {
            title: 'In Progress',
            value: kpis?.inProgress || 0,
            icon: Clock,
            color: 'text-yellow-600',
            bgColor: 'bg-yellow-100'
          },
          {
            title: 'Efficiency Rate',
            value: `${kpis?.efficiency || 0}%`,
            icon: TrendingUp,
            color: 'text-purple-600',
            bgColor: 'bg-purple-100'
          }
        ];
      
      default:
        return [
          {
            title: 'Department Overview',
            value: 'No data available',
            icon: Package,
            color: 'text-gray-600',
            bgColor: 'bg-gray-100'
          }
        ];
    }
  };

  const kpiCards = getDepartmentKPIs();

  const getActivityIcon = (type) => {
    switch (type) {
      case 'sales': return ShoppingCart;
      case 'production': return Factory;
      case 'purchasing': return Truck;
      default: return Clock;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'sales': return 'text-green-600';
      case 'production': return 'text-blue-600';
      case 'purchasing': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'in-progress': return 'text-blue-600 bg-blue-100';
      case 'confirmed': return 'text-green-600 bg-green-100';
      case 'shipped': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Overview of your ERP system performance
        </p>
      </div>


      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {kpiCards.map((card, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`p-3 rounded-md ${card.bgColor}`}>
                    <card.icon className={`h-6 w-6 ${card.color}`} />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      {card.title}
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">
                      {card.value}
                    </dd>
                    {card.subtitle && (
                      <dd className="text-sm text-gray-500 dark:text-gray-400">
                        {card.subtitle}
                      </dd>
                    )}
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>


      {/* Charts and Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              {user?.role === 'admin' ? 'Sales Revenue Chart' : `${user?.department} Performance Trend`}
            </h3>
            <div className="flex items-center text-sm text-green-600">
              <TrendingUp className="h-4 w-4 mr-1" />
              {departmentChart.length > 0 ? 
                `$${departmentChart.reduce((sum, item) => sum + (user?.role === 'admin' ? (item.revenue || 0) : (item.value || 0)), 0).toLocaleString()} total` : 
                'No data'
              }
            </div>
          </div>
          <div className="h-64">
            {departmentChart.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={departmentChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="_id" 
                    stroke="#666"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
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
                    labelFormatter={(value) => new Date(value).toLocaleDateString()}
                  />
                  <Line 
                    type="monotone" 
                    dataKey={user?.role === 'admin' ? 'revenue' : 'value'} 
                    stroke="#3B82F6" 
                    strokeWidth={3}
                    dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <TrendingUp className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>No sales data available</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Recent Activities</h3>
          <div className="space-y-4">
            {recentActivities.slice(0, 5).map((activity, index) => {
              const Icon = getActivityIcon(activity.type);
              return (
                <div key={index} className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="p-2 bg-gray-100 rounded-full">
                      <Icon className="h-4 w-4 text-gray-600" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 dark:text-gray-100">{activity.description}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                        {activity.status}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(activity.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Employee Attendance */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Employee Attendance</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">Present Today</span>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {kpis?.employees?.presentToday || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">Total Employees</span>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {kpis?.employees?.total || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">Attendance Rate</span>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {kpis?.employees?.attendanceRate || 0}%
              </span>
            </div>
          </div>
        </div>

        {/* Production Status */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Production Status</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Pending Orders</span>
              <span className="text-sm font-medium text-gray-900">
                {kpis?.production?.pending || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">In Progress</span>
              <span className="text-sm font-medium text-gray-900">
                {kpis?.production?.inProgress || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Total Orders</span>
              <span className="text-sm font-medium text-gray-900">
                {kpis?.production?.totalOrders || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Inventory Value */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Inventory Value</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Total Value</span>
              <span className="text-sm font-medium text-gray-900">
                ${(kpis?.inventory?.totalValue || 0).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Low Stock Items</span>
              <span className="text-sm font-medium text-red-600">
                {kpis?.inventory?.lowStockAlerts || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Total Products</span>
              <span className="text-sm font-medium text-gray-900">
                {kpis?.inventory?.totalProducts || 0}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
