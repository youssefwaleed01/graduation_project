import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Plus, Play, CheckCircle, Factory, Package, Clock, Trash2 } from 'lucide-react';

const ManufacturingOrders = () => {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    product: '',
    quantity: '',
    materials: [{ product: '', quantity: '', unitCost: '' }],
    notes: ''
  });

  useEffect(() => {
    fetchOrders();
    fetchProducts();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get('/api/manufacturing/production-orders');
      setOrders(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch production orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get('/api/inventory/products');
      setProducts(response.data.data);
    } catch (error) {
      console.error('Failed to fetch products');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/manufacturing/production-orders', formData);
      toast.success('Production order created successfully');
      setShowModal(false);
      setFormData({
        product: '',
        quantity: '',
        materials: [{ product: '', quantity: '', unitCost: '' }],
        notes: ''
      });
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create production order');
    }
  };

  const handleStart = async (id) => {
    try {
      await axios.put(`/api/manufacturing/production-orders/${id}/start`);
      toast.success('Production started successfully');
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to start production');
    }
  };

  const handleComplete = async (id) => {
    try {
      await axios.put(`/api/manufacturing/production-orders/${id}/complete`);
      toast.success('Production completed successfully');
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to complete production');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this production order?')) {
      try {
        await axios.delete(`/api/manufacturing/production-orders/${id}`);
        toast.success('Production order deleted successfully');
        fetchOrders();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete production order');
      }
    }
  };

  const addMaterial = () => {
    setFormData({
      ...formData,
      materials: [...formData.materials, { product: '', quantity: '', unitCost: '' }]
    });
  };

  const removeMaterial = (index) => {
    setFormData({
      ...formData,
      materials: formData.materials.filter((_, i) => i !== index)
    });
  };

  const updateMaterial = (index, field, value) => {
    const updatedMaterials = [...formData.materials];
    updatedMaterials[index][field] = value;
    setFormData({ ...formData, materials: updatedMaterials });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'in-progress': return <Play className="h-5 w-5 text-blue-500" />;
      case 'pending': return <Clock className="h-5 w-5 text-yellow-500" />;
      default: return <Factory className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Production Orders</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage manufacturing operations and production orders
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Production Order
        </button>
      </div>

      {/* Production Orders */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {orders.map((order) => (
            <li key={order._id} className="px-4 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    {getStatusIcon(order.status)}
                  </div>
                  <div className="ml-4">
                    <div className="flex items-center">
                      <p className="text-sm font-medium text-gray-900">
                        {order.orderNumber}
                      </p>
                      <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {order.product?.name || 'Unknown Product'}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center text-sm text-gray-500">
                      <span>Quantity: {order.quantity}</span>
                      <span className="mx-2">•</span>
                      <span>Materials: {order.materials.length}</span>
                      {order.startDate && (
                        <>
                          <span className="mx-2">•</span>
                          <span>Started: {new Date(order.startDate).toLocaleDateString()}</span>
                        </>
                      )}
                      {order.endDate && (
                        <>
                          <span className="mx-2">•</span>
                          <span>Completed: {new Date(order.endDate).toLocaleDateString()}</span>
                        </>
                      )}
                    </div>
                    {order.notes && (
                      <div className="mt-1 text-sm text-gray-500">
                        <span className="font-medium">Notes:</span> {order.notes}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                  {order.status === 'pending' && (
                    <button
                      onClick={() => handleStart(order._id)}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700"
                    >
                      <Play className="h-3 w-3 mr-1" />
                      Start
                    </button>
                  )}
                  {order.status === 'in-progress' && (
                    <button
                      onClick={() => handleComplete(order._id)}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Complete
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(order._id)}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Delete
                  </button>
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
                Create Production Order
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Product
                  </label>
                  <select
                    required
                    value={formData.product}
                    onChange={(e) => setFormData({ ...formData, product: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Select Product</option>
                    {products.filter(p => p.category === 'finished-good').map(product => (
                      <option key={product._id} value={product._id}>
                        {product?.name || 'Unknown Product'}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Quantity
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Materials
                  </label>
                  {formData.materials.map((material, index) => (
                    <div key={index} className="flex space-x-2 mb-2">
                      <select
                        value={material.product}
                        onChange={(e) => updateMaterial(index, 'product', e.target.value)}
                        className="flex-1 border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="">Select Material</option>
                        {products.filter(p => p.category === 'raw-material' || p.category === 'component').map(product => (
                          <option key={product._id} value={product._id}>
                            {product?.name || 'Unknown Product'}
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        placeholder="Qty"
                        value={material.quantity}
                        onChange={(e) => updateMaterial(index, 'quantity', e.target.value)}
                        className="w-20 border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                      />
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Cost"
                        value={material.unitCost}
                        onChange={(e) => updateMaterial(index, 'unitCost', e.target.value)}
                        className="w-20 border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                      />
                      {formData.materials.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeMaterial(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addMaterial}
                    className="text-sm text-primary-600 hover:text-primary-800"
                  >
                    + Add Material
                  </button>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                  >
                    Create Order
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManufacturingOrders;
