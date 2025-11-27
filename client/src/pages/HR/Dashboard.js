import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import {
  Users,
  Clock,
  Calendar
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';

const HRDashboard = () => {
  const { user } = useAuth();
  const [kpis, setKpis] = useState(null);
  const [departmentChartData, setDepartmentChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Colors for pie chart
  const COLORS = [
    '#3B82F6', // Blue
    '#10B981', // Green
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#06B6D4', // Cyan
    '#84CC16'  // Lime
  ];

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [employeesRes, attendanceRes] = await Promise.all([
        axios.get('/api/hr/employees'),
        axios.get('/api/hr/attendance')
      ]);

      const employees = employeesRes.data.data || [];
      const attendance = attendanceRes.data.data || [];
      
      // Calculate KPIs
      const totalEmployees = employees.length;
      const todayAttendance = attendance.filter(a => {
        const today = new Date();
        const attDate = new Date(a.date);
        return attDate.toDateString() === today.toDateString();
      }).length;
      
      // Group by department
      const byDepartment = employees.reduce((acc, emp) => {
        const dept = emp.department || 'Unknown';
        acc[dept] = (acc[dept] || 0) + 1;
        return acc;
      }, {});

      // Transform department data for pie chart
      const chartData = Object.entries(byDepartment).map(([name, value]) => ({
        name,
        value
      }));

      setDepartmentChartData(chartData);
      setKpis({
        totalEmployees,
        todayAttendance,
        byDepartment
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">HR Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Overview of your human resources and workforce analytics
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Total Employees
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    {kpis?.totalEmployees || 0}
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
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Today's Attendance
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    {kpis?.todayAttendance || 0}
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
                <Calendar className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Attendance Rate
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    {kpis?.totalEmployees > 0 
                      ? Math.round((kpis.todayAttendance / kpis.totalEmployees) * 100) 
                      : 0}%
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Department Distribution */}
      {departmentChartData.length > 0 && (
        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100">
              Department Distribution
            </h3>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={departmentChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {departmentChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [`${value} employees`, 'Count']}
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    formatter={(value, entry) => (
                      <span style={{ color: entry.color }}>
                        {value}: {departmentChartData.find(d => d.name === value)?.value || 0}
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HRDashboard;

