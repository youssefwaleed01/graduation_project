import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import {
  Truck,
  CheckCircle,
  Users
} from 'lucide-react';

const SCMDashboard = () => {
  const { user } = useAuth();
  const [kpis, setKpis] = useState(null);
  const [recentSuppliers, setRecentSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const suppliersRes = await axios.get('/api/scm/suppliers');
      const suppliers = suppliersRes.data.data || [];
      
      // Calculate KPIs
      const totalSuppliers = suppliers.length;
      const activeSuppliers = suppliers.filter(s => s.isActive !== false).length;
      
      // Get recent suppliers
      const sortedSuppliers = suppliers
        .sort((a, b) => new Date(b.createdAt || b._id) - new Date(a.createdAt || a._id))
        .slice(0, 5);
      
      setRecentSuppliers(sortedSuppliers);
      
      setKpis({
        totalSuppliers,
        activeSuppliers
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Supply Chain Management Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Overview of supplier management and supply chain operations
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Truck className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Total Suppliers
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    {kpis?.totalSuppliers || 0}
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
                    Active Suppliers
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    {kpis?.activeSuppliers || 0}
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
                    Supplier Contact Rate
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    {kpis?.totalSuppliers > 0 
                      ? Math.round((kpis.activeSuppliers / kpis.totalSuppliers) * 100) 
                      : 0}%
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Suppliers */}
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100">
            Recent Suppliers
          </h3>
        </div>
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {recentSuppliers.length === 0 ? (
            <li className="px-4 py-5 sm:px-6">
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                No suppliers yet
              </p>
            </li>
          ) : (
            recentSuppliers.map((supplier) => (
              <li key={supplier._id} className="px-4 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {supplier.name}
                      </p>
                      <div className="mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400">
                        {supplier.contactPerson && (
                          <>
                            <span>{supplier.contactPerson}</span>
                            <span className="mx-2">•</span>
                          </>
                        )}
                        {supplier.email && (
                          <>
                            <span>{supplier.email}</span>
                            <span className="mx-2">•</span>
                          </>
                        )}
                        <span>{supplier.phone || 'No phone'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${supplier.isActive !== false ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {supplier.isActive !== false ? 'Active' : 'Inactive'}
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

export default SCMDashboard;

