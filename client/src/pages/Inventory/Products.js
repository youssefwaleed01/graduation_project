import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Plus, Package, AlertTriangle, TrendingUp, Edit, Trash2, Search } from 'lucide-react';

const InventoryProducts = () => {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    description: '',
    category: '',
    unit: '',
    currentStock: '',
    minStockLevel: '',
    maxStockLevel: '',
    unitCost: '',
    sellingPrice: ''
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('/api/inventory/products');
      setProducts(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Ensure all numeric fields are properly converted
      const submitData = {
        ...formData,
        currentStock: Number(formData.currentStock) || 0,
        minStockLevel: Number(formData.minStockLevel) || 0,
        maxStockLevel: Number(formData.maxStockLevel) || 0,
        unitCost: Number(formData.unitCost) || 0,
        sellingPrice: Number(formData.sellingPrice) || 0
      };

      if (editingProduct) {
        await axios.put(`/api/inventory/products/${editingProduct._id}`, submitData);
        toast.success('Product updated successfully');
      } else {
        await axios.post('/api/inventory/products', submitData);
        toast.success('Product created successfully');
      }
      setShowModal(false);
      setEditingProduct(null);
      setFormData({
        name: '',
        sku: '',
        description: '',
        category: '',
        unit: '',
        currentStock: '',
        minStockLevel: '',
        maxStockLevel: '',
        unitCost: '',
        sellingPrice: ''
      });
      fetchProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save product');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      sku: product.sku,
      description: product.description || '',
      category: product.category,
      unit: product.unit,
      currentStock: product.currentStock,
      minStockLevel: product.minStockLevel,
      maxStockLevel: product.maxStockLevel,
      unitCost: product.unitCost,
      sellingPrice: product.sellingPrice || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        console.log('Attempting to delete product with ID:', id);
        const response = await axios.delete(`/api/inventory/products/${id}`);
        console.log('Delete response:', response.data);
        toast.success('Product deleted successfully');
        // Refresh the product list
        await fetchProducts();
      } catch (error) {
        console.error('Delete error:', error);
        console.error('Error response:', error.response?.data);
        console.error('Error status:', error.response?.status);
        
        // Handle specific error cases
        if (error.response?.status === 404) {
          toast.error('Product not found. Refreshing the list...');
          await fetchProducts(); // Refresh to sync with database
        } else if (error.response?.status === 400) {
          toast.error(error.response?.data?.message || 'Cannot delete product');
        } else {
          toast.error('Failed to delete product');
        }
      }
    }
  };

  const isLowStock = (product) => {
    return product.currentStock <= product.minStockLevel;
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'raw-material': return 'bg-blue-100 text-blue-800';
      case 'finished-good': return 'bg-green-100 text-green-800';
      case 'component': return 'bg-purple-100 text-purple-800';
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
          <h1 className="text-2xl font-bold text-gray-900">All Products</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage all inventory products and stock levels
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products by name..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {products
          .filter((product) => {
            if (!searchQuery) return true;
            const name = product.name || '';
            return name.toLowerCase().includes(searchQuery.toLowerCase());
          })
          .map((product) => (
          <div key={product._id} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Package className="h-8 w-8 text-gray-400" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">{product.name}</h3>
                    <p className="text-sm text-gray-500">{product.sku}</p>
                  </div>
                </div>
                {isLowStock(product) && (
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                )}
              </div>
              
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Stock Level</span>
                  <span className={`font-medium ${isLowStock(product) ? 'text-red-600' : 'text-gray-900'}`}>
                    {product.currentStock} {product.unit}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="text-gray-500">Min Level</span>
                  <span className="text-gray-900">{product.minStockLevel} {product.unit}</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="text-gray-500">Unit Cost</span>
                  <span className="text-gray-900">${product.unitCost}</span>
                </div>
                {product.sellingPrice && (
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <span className="text-gray-500">Selling Price</span>
                    <span className="text-gray-900">${product.sellingPrice}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 flex items-center justify-between">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(product.category)}`}>
                  {product.category.replace('-', ' ')}
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEdit(product)}
                    className="text-primary-600 hover:text-primary-900"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(product._id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingProduct ? 'Edit Product' : 'Add Product'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Product Name
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
                    SKU
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Category
                  </label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Select Category</option>
                    <option value="raw-material">Raw Material</option>
                    <option value="finished-good">Finished Good</option>
                    <option value="component">Component</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Unit
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Current Stock
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.currentStock}
                      onChange={(e) => setFormData({ ...formData, currentStock: e.target.value })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Min Stock Level
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.minStockLevel}
                      onChange={(e) => setFormData({ ...formData, minStockLevel: e.target.value })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Max Stock Level
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.maxStockLevel}
                      onChange={(e) => setFormData({ ...formData, maxStockLevel: e.target.value })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Unit Cost
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.unitCost}
                      onChange={(e) => setFormData({ ...formData, unitCost: e.target.value })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Selling Price
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.sellingPrice}
                      onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingProduct(null);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                  >
                    {editingProduct ? 'Update' : 'Create'}
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

export default InventoryProducts;
