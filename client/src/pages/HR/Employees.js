import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2, User, Mail, Phone, Calendar, Shield, Search } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { canManageEmployees, canAddEmployee, canEditEmployee, canDeleteEmployee } from '../../config/permissions';

const Employees = () => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'employee',
    department: ''
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      console.log('Current user role:', user?.role);
      const response = await axios.get('/api/hr/employees');
      console.log('Fetched employees:', response.data);
      setEmployees(response.data.data);
    } catch (error) {
      console.error('Fetch employees error:', error);
      console.error('Error details:', error.response?.data);
      toast.error('Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingEmployee) {
        // For editing, update employee
        const submitData = {
          name: formData.name,
          email: formData.email,
          role: formData.role,
          password: formData.password,
          department: formData.department,
          salary: formData.salary || 0,
          holidays: formData.holidays || 0
        };
        
        await axios.put(`/api/hr/employees/${editingEmployee._id}`, submitData);
        toast.success('Employee updated successfully');
      } else {
        // For new employees, create user
        console.log('Creating employee with data:', formData);
        console.log('Form validation - name:', formData.name);
        console.log('Form validation - email:', formData.email);
        console.log('Form validation - password:', formData.password);
        console.log('Form validation - role:', formData.role);
        console.log('Form validation - department:', formData.department);
        console.log('Form validation - salary:', formData.salary);
        console.log('Form validation - holidays:', formData.holidays);
        
        const response = await axios.post('/api/hr/employees', {
          ...formData,
          salary: formData.salary || 0,
          holidays: formData.holidays || 0
        });
        console.log('Employee created:', response.data);
        toast.success('Employee created successfully');
      }
      setShowModal(false);
      setEditingEmployee(null);
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'employee',
        department: '',
        salary: '',
        holidays: ''
      });
      // Force refresh the employees list
      await fetchEmployees();
    } catch (error) {
      console.error('Employee save error:', error);
      console.error('Error response:', error.response?.data);
      
      if (error.response?.status === 400) {
        // Validation errors
        const errorMessage = error.response.data.message || 'Validation failed';
        toast.error(errorMessage);
      } else if (error.response?.status === 500) {
        // Server errors
        toast.error('Server error. Please try again.');
      } else {
        // Other errors
        toast.error(error.response?.data?.message || 'Failed to save employee');
      }
    }
  };

  const handleEdit = (employee) => {
    if (!employee.user) {
      toast.error('Cannot edit employee: User data is missing');
      return;
    }
    setEditingEmployee(employee);
    setFormData({
      name: employee.user.name || '',
      email: employee.user.email || '',
      password: '', // Don't show password for editing
      role: employee.user.role || 'employee',
      department: employee.department || '',
      salary: employee.salary || '',
      holidays: employee.holidays || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await axios.delete(`/api/hr/employees/${id}`);
        toast.success('Employee deleted successfully');
        fetchEmployees();
      } catch (error) {
        console.error('Delete error:', error);
        toast.error(error.response?.data?.message || 'Failed to delete employee');
      }
    }
  };

  // Check if user can manage employees
  const canManage = canManageEmployees(user);
  const canAdd = canAddEmployee(user);
  const canEdit = canEditEmployee(user);
  const canDelete = canDeleteEmployee(user);
  console.log('User data:', user);
  console.log('Can manage employees:', canManage);
  console.log('Can add employee:', canAdd);

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
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-gray-900">Employees</h1>
            {canManage && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                <Shield className="h-3 w-3 mr-1" />
                Admin/HR Manager Only
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-gray-500">
            {canAdd 
              ? "Manage employee accounts and information (Admin/Manager/Employee access - HR employees restricted)"
              : "View employee information (Contact admin, manager, or non-HR employee to add new users)"
            }
          </p>
        </div>
        {canAdd ? (
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Employee
          </button>
        ) : (
          <button
            onClick={() => {
              toast.error('Only administrators, managers, and non-HR employees can add new users. Please contact your admin, manager, or non-HR employee.');
            }}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-gray-100 hover:bg-gray-200 cursor-not-allowed"
          >
            <Shield className="h-4 w-4 mr-2" />
            Add Employee (Admin/Manager/Employee Only)
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="bg-white shadow rounded-lg p-4 mb-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search employees by name..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Employees Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {employees
            .filter((employee) => employee.user) // Filter out employees without user data
            .filter((employee) => {
              if (!searchQuery) return true;
              const name = employee.user?.name || '';
              return name.toLowerCase().includes(searchQuery.toLowerCase());
            })
            .map((employee) => (
            <li key={employee._id}>
              <div className="px-4 py-4 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                      <User className="h-5 w-5 text-primary-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="flex items-center">
                      <p className="text-sm font-medium text-gray-900">
                        {employee.user?.name || 'Unknown'}
                      </p>
                      <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {employee.employeeId}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center text-sm text-gray-500">
                      <span>{employee.position}</span>
                      <span className="mx-2">•</span>
                      <span>{employee.department}</span>
                      <span className="mx-2">•</span>
                      <span>${(employee.salary || 0).toLocaleString()}</span>
                      {employee.holidays !== undefined && employee.holidays > 0 && (
                        <>
                          <span className="mx-2">•</span>
                          <span>{employee.holidays} holidays</span>
                        </>
                      )}
                    </div>
                    <div className="mt-1 flex items-center text-sm text-gray-500">
                      <Mail className="h-4 w-4 mr-1" />
                      <span>{employee.user?.email || 'No email'}</span>
                      {employee.personalInfo?.phone && (
                        <>
                          <span className="mx-2">•</span>
                          <Phone className="h-4 w-4 mr-1" />
                          <span>{employee.personalInfo.phone}</span>
                        </>
                      )}
                    </div>
                    <div className="mt-1 flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>Hired: {new Date(employee.hireDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {canEdit ? (
                    <button
                      onClick={() => handleEdit(employee)}
                      className="text-primary-600 hover:text-primary-900"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        toast.error('Only administrators, managers, and non-HR employees can edit users. Please contact your admin, manager, or non-HR employee.');
                      }}
                      className="cursor-not-allowed text-gray-400"
                      disabled
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                  )}
                  {canDelete ? (
                    <button
                      onClick={() => handleDelete(employee._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        toast.error('Only administrators, managers, and non-HR employees can delete users. Please contact your admin, manager, or non-HR employee.');
                      }}
                      className="cursor-not-allowed text-gray-400"
                      disabled
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingEmployee ? 'Edit Employee' : 'Add Employee'}
              </h3>
              {!canManage && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <div className="flex">
                    <Shield className="h-5 w-5 text-yellow-400" />
                    <div className="ml-3">
                      <h4 className="text-sm font-medium text-yellow-800">Admin Access Required</h4>
                      <p className="text-sm text-yellow-700">
                        Only administrators can create or edit users. Please contact your admin.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                {!editingEmployee && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Password
                    </label>
                    <input
                      type="password"
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Role
                  </label>
                  <select
                    required
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="employee">Employee</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Department
                  </label>
                  <select
                    required
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Select Department</option>
                    <option value="HR">HR</option>
                    <option value="Manufacturing">Manufacturing</option>
                    <option value="SCM">SCM</option>
                    <option value="CRM">CRM</option>
                    <option value="Sales">Sales</option>
                    <option value="Inventory">Inventory</option>
                    <option value="Purchasing">Purchasing</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Salary
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Holidays (Annual Days)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={formData.holidays}
                    onChange={(e) => setFormData({ ...formData, holidays: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                    placeholder="0"
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingEmployee(null);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  {canManage ? (
                    <button
                      type="submit"
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                    >
                      {editingEmployee ? 'Update' : 'Create'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        toast.error('Only administrators can create or edit users. Please contact your admin.');
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-500 bg-gray-100 cursor-not-allowed"
                      disabled
                    >
                      {editingEmployee ? 'Update (Admin Only)' : 'Create (Admin Only)'}
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;