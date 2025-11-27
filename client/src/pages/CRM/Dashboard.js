import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import {
  UserCheck,
  Users,
  CheckCircle,
  TrendingUp,
  DollarSign,
  AlertCircle,
  Mail,
  Phone
} from 'lucide-react';

const CRMDashboard = () => {
  const { user } = useAuth();
  const [kpis, setKpis] = useState(null);
  const [recentCustomers, setRecentCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const customersRes = await axios.get('/api/crm/customers');
      const customers = customersRes.data.data || [];
      
      // Calculate KPIs
      const totalCustomers = customers.length;
      const activeCustomers = customers.filter(c => c.isActive !== false).length;
      
      // Calculate new customers (created in the last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const newCustomers = customers.filter(c => {
        const createdAt = c.createdAt ? new Date(c.createdAt) : null;
        return createdAt && createdAt >= thirtyDaysAgo;
      }).length;
      
      // Get recent customers
      const sortedCustomers = customers
        .sort((a, b) => new Date(b.createdAt || b._id) - new Date(a.createdAt || a._id))
        .slice(0, 5);
      
      setRecentCustomers(sortedCustomers);
      
      setKpis({
        totalCustomers,
        activeCustomers,
        newCustomers
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">CRM Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Overview of customer relationship management
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Total Customers
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
                    Active Customers
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    {kpis?.activeCustomers || 0}
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
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Engagement Rate
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    {kpis?.totalCustomers > 0 
                      ? Math.round((kpis.activeCustomers / kpis.totalCustomers) * 100) 
                      : 0}%
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
                <UserCheck className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    New Customers (30 days)
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    {kpis?.newCustomers || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Customers */}
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100">
            Recent Customers
          </h3>
        </div>
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {recentCustomers.length === 0 ? (
            <li className="px-4 py-5 sm:px-6">
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                No customers yet
              </p>
            </li>
          ) : (
            recentCustomers.map((customer) => (
              <li key={customer._id} className="px-4 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {customer.name}
                      </p>
                      <div className="mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400">
                        {customer.company && (
                          <>
                            <span>{customer.company}</span>
                            <span className="mx-2">•</span>
                          </>
                        )}
                        <span>{customer.email || 'No email'}</span>
                        {customer.phone && (
                          <>
                            <span className="mx-2">•</span>
                            <span>{customer.phone}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${customer.isActive !== false ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {customer.isActive !== false ? 'Active' : 'Inactive'}
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

export default CRMDashboard;

