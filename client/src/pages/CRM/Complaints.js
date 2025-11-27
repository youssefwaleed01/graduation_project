import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Plus, AlertCircle, Mail, Phone, Calendar, Edit, Trash2, X, User, FileText, Tag, CheckCircle, Clock, XCircle } from 'lucide-react';

const CRMComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingComplaint, setEditingComplaint] = useState(null);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    category: ''
  });
  const [formData, setFormData] = useState({
    customer: '',
    subject: '',
    description: '',
    category: 'other',
    priority: 'medium',
    status: 'open',
    relatedOrder: ''
  });

  useEffect(() => {
    fetchComplaints();
    fetchCustomers();
  }, [filters]);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.priority) params.append('priority', filters.priority);
      if (filters.category) params.append('category', filters.category);

      const response = await axios.get(`/api/crm/complaints?${params.toString()}`);
      setComplaints(response.data.data || []);
    } catch (error) {
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          'Failed to fetch complaints';
      toast.error(errorMessage);
      console.error('Fetch complaints error:', error.response?.data || error);
      setComplaints([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await axios.get('/api/crm/customers');
      setCustomers(response.data.data);
    } catch (error) {
      console.error('Failed to fetch customers:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Prepare data - remove empty strings for optional fields
      const submitData = { ...formData };
      if (!submitData.relatedOrder || submitData.relatedOrder === '') {
        delete submitData.relatedOrder;
      }

      if (editingComplaint) {
        await axios.put(`/api/crm/complaints/${editingComplaint._id}`, submitData);
        toast.success('Complaint updated successfully');
      } else {
        await axios.post('/api/crm/complaints', submitData);
        toast.success('Complaint created successfully');
      }
      setShowModal(false);
      setEditingComplaint(null);
      setFormData({
        customer: '',
        subject: '',
        description: '',
        category: 'other',
        priority: 'medium',
        status: 'open',
        relatedOrder: ''
      });
      fetchComplaints();
    } catch (error) {
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          error.message || 
                          'Failed to save complaint';
      toast.error(errorMessage);
      console.error('Complaint submit error:', error.response?.data || error);
    }
  };

  const handleEdit = (complaint) => {
    setEditingComplaint(complaint);
    setFormData({
      customer: complaint.customer._id || complaint.customer,
      subject: complaint.subject,
      description: complaint.description,
      category: complaint.category,
      priority: complaint.priority,
      status: complaint.status,
      relatedOrder: complaint.relatedOrder?._id || complaint.relatedOrder || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this complaint?')) {
      try {
        await axios.delete(`/api/crm/complaints/${id}`);
        toast.success('Complaint deleted successfully');
        fetchComplaints();
      } catch (error) {
        const errorMessage = error.response?.data?.error || 
                            error.response?.data?.message || 
                            'Failed to delete complaint';
        toast.error(errorMessage);
        console.error('Delete complaint error:', error.response?.data || error);
      }
    }
  };

  const handleViewDetails = async (complaint) => {
    try {
      const response = await axios.get(`/api/crm/complaints/${complaint._id}`);
      setSelectedComplaint(response.data.data);
      setShowDetailModal(true);
    } catch (error) {
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          'Failed to fetch complaint details';
      toast.error(errorMessage);
      console.error('Fetch complaint details error:', error.response?.data || error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'open': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryLabel = (category) => {
    const labels = {
      'product-quality': 'Product Quality',
      'delivery': 'Delivery',
      'billing': 'Billing',
      'service': 'Service',
      'other': 'Other'
    };
    return labels[category] || category;
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Complaints</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage customer complaints and support tickets
          </p>
        </div>
        <button
          onClick={() => {
            setEditingComplaint(null);
            setFormData({
              customer: '',
              subject: '',
              description: '',
              category: 'other',
              priority: 'medium',
              status: 'open',
              relatedOrder: ''
            });
            setShowModal(true);
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Complaint
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">All Statuses</option>
              <option value="open">Open</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select
              value={filters.priority}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">All Categories</option>
              <option value="product-quality">Product Quality</option>
              <option value="delivery">Delivery</option>
              <option value="billing">Billing</option>
              <option value="service">Service</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* Complaints List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {complaints.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No complaints found</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {complaints.map((complaint) => (
              <li key={complaint._id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                      <h3 className="text-lg font-medium text-gray-900">
                        {complaint.complaintNumber} - {complaint.subject}
                      </h3>
                    </div>
                    <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-1" />
                        <span>{complaint.customer?.name || 'Unknown Customer'}</span>
                      </div>
                      {complaint.customer?.email && (
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-1" />
                          <span>{complaint.customer.email}</span>
                        </div>
                      )}
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>{formatDate(complaint.createdAt)}</span>
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                      {complaint.description}
                    </p>
                  </div>
                  <div className="ml-4 flex items-center space-x-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(complaint.priority)}`}>
                      {complaint.priority}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(complaint.status)}`}>
                      {complaint.status}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {getCategoryLabel(complaint.category)}
                    </span>
                    <button
                      onClick={() => handleViewDetails(complaint)}
                      className="text-primary-600 hover:text-primary-900"
                      title="View Details"
                    >
                      <FileText className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleEdit(complaint)}
                      className="text-primary-600 hover:text-primary-900"
                      title="Edit"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(complaint._id)}
                      className="text-red-600 hover:text-red-900"
                      title="Delete"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingComplaint ? 'Edit Complaint' : 'Add Complaint'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Customer *
                  </label>
                  <select
                    required
                    value={formData.customer}
                    onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Select a customer</option>
                    {customers.map((customer) => (
                      <option key={customer._id} value={customer._id}>
                        {customer.name} {customer.company ? `- ${customer.company}` : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Subject *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter complaint subject"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Description *
                  </label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter complaint description"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="product-quality">Product Quality</option>
                      <option value="delivery">Delivery</option>
                      <option value="billing">Billing</option>
                      <option value="service">Service</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Priority
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>
                {editingComplaint && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="open">Open</option>
                      <option value="in-progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                )}
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingComplaint(null);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                  >
                    {editingComplaint ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedComplaint && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-xl font-medium text-gray-900">
                  {selectedComplaint.complaintNumber} - {selectedComplaint.subject}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Created: {formatDate(selectedComplaint.createdAt)}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedComplaint(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Status and Priority */}
              <div className="flex items-center space-x-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedComplaint.status)}`}>
                  {selectedComplaint.status}
                </span>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(selectedComplaint.priority)}`}>
                  {selectedComplaint.priority}
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                  {getCategoryLabel(selectedComplaint.category)}
                </span>
              </div>

              {/* Customer Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Customer Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Name:</span>
                    <span className="ml-2 text-gray-900">{selectedComplaint.customer?.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Email:</span>
                    <span className="ml-2 text-gray-900">{selectedComplaint.customer?.email}</span>
                  </div>
                  {selectedComplaint.customer?.phone && (
                    <div>
                      <span className="text-gray-500">Phone:</span>
                      <span className="ml-2 text-gray-900">{selectedComplaint.customer.phone}</span>
                    </div>
                  )}
                  {selectedComplaint.customer?.company && (
                    <div>
                      <span className="text-gray-500">Company:</span>
                      <span className="ml-2 text-gray-900">{selectedComplaint.customer.company}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                <p className="text-gray-700 whitespace-pre-wrap">{selectedComplaint.description}</p>
              </div>

              {/* Resolution */}
              {selectedComplaint.resolution && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Resolution</h4>
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedComplaint.resolution}</p>
                  {selectedComplaint.resolvedAt && (
                    <p className="text-sm text-gray-500 mt-2">
                      Resolved on: {formatDate(selectedComplaint.resolvedAt)}
                    </p>
                  )}
                </div>
              )}

              {/* Notes */}
              {selectedComplaint.notes && selectedComplaint.notes.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Notes</h4>
                  <div className="space-y-2">
                    {selectedComplaint.notes.map((note, idx) => (
                      <div key={idx} className="bg-gray-50 p-3 rounded">
                        <p className="text-gray-700">{note.note}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDate(note.addedAt)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CRMComplaints;

