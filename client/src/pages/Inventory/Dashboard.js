import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import {
  Package,
  AlertTriangle,
  CheckCircle,
  TrendingDown,
  DollarSign,
  BarChart3,
  Warehouse,
  AlertCircle
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip
} from 'recharts';

const InventoryDashboard = () => {
  const { user } = useAuth();
  const [kpis, setKpis] = useState(null);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [productsRes, lowStockRes] = await Promise.all([
        axios.get('/api/inventory/products'),
        axios.get('/api/inventory/low-stock')
      ]);

      const products = productsRes.data.data || [];
      const lowStock = lowStockRes.data.data || [];
      
      // Calculate KPIs
      const totalProducts = products.length;
      const lowStockCount = lowStock.length;
      const outOfStockCount = products.filter(p => p.currentStock === 0).length;
      
      // Calculate total stock value
      const stockValue = products.reduce((sum, p) => 
        sum + (p.currentStock * (p.unitCost || 0)), 0
      );

      // Group by category
      const byCategory = products.reduce((acc, prod) => {
        const category = prod.category || 'Unknown';
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {});

      setLowStockProducts(lowStock.slice(0, 5));
      
      setKpis({
        totalProducts,
        lowStockCount,
        outOfStockCount,
        stockValue,
        byCategory
      });
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

  const getStatusColor = (current, min) => {
    if (current === 0) return 'bg-red-100 text-red-800';
    if (current <= min) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const getStatusText = (current, min) => {
    if (current === 0) return 'Out of Stock';
    if (current <= min) return 'Low Stock';
    return 'In Stock';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Inventory Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Overview of your inventory levels and stock management
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Total Products
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    {kpis?.totalProducts || 0}
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
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Stock Value
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    ${(kpis?.stockValue || 0).toLocaleString()}
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
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Low Stock
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    {kpis?.lowStockCount || 0}
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
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Out of Stock
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    {kpis?.outOfStockCount || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Low Stock Alerts */}
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100 flex items-center">
            <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
            Low Stock Alerts
          </h3>
        </div>
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {lowStockProducts.length === 0 ? (
            <li className="px-4 py-5 sm:px-6">
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                No low stock alerts
              </p>
            </li>
          ) : (
            lowStockProducts.map((product) => (
              <li key={product._id} className="px-4 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {product.name}
                      </p>
                      <div className="mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <span>SKU: {product.sku}</span>
                        <span className="mx-2">•</span>
                        <span>Stock: {product.currentStock}</span>
                        <span className="mx-2">•</span>
                        <span>Min: {product.minStockLevel}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(product.currentStock, product.minStockLevel)}`}>
                      {getStatusText(product.currentStock, product.minStockLevel)}
                    </span>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>

      {/* Category Distribution */}
      {kpis?.byCategory && Object.keys(kpis.byCategory).length > 0 && (() => {
        const categoryColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];
        const chartData = Object.entries(kpis.byCategory).map(([category, count], index) => ({
          name: category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
          value: count,
          color: categoryColors[index % categoryColors.length]
        }));

        return (
          <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100">
                Products by Category
              </h3>
            </div>
            <div className="px-4 py-5 sm:p-6">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value, name) => [value, name]}
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px'
                    }}
                  />
                  <Legend 
                    formatter={(value, entry) => `${entry.payload.name}: ${entry.payload.value}`}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default InventoryDashboard;

