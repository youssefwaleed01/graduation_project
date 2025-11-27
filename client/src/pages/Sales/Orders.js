import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Plus, ShoppingCart, CheckCircle, Truck, Package, Trash2, FileText, Printer, X } from 'lucide-react';

const SalesOrders = () => {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);
  const [loadingInvoice, setLoadingInvoice] = useState(false);
  const [formData, setFormData] = useState({
    customer: '',
    items: [{ product: '', quantity: '', unitPrice: '' }],
    deliveryDate: '',
    notes: ''
  });

  useEffect(() => {
    fetchOrders();
    fetchCustomers();
    fetchProducts();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get('/api/sales/orders');
      setOrders(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch sales orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await axios.get('/api/crm/customers');
      setCustomers(response.data.data);
    } catch (error) {
      console.error('Failed to fetch customers');
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
      // Ensure all required fields are properly formatted
      const submitData = {
        ...formData,
        items: formData.items.map(item => ({
          ...item,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice)
        })).filter(item => item.product && item.quantity && item.unitPrice),
        deliveryDate: formData.deliveryDate ? new Date(formData.deliveryDate).toISOString() : null
      };

      // Validate that we have at least one valid item
      if (submitData.items.length === 0) {
        toast.error('Please add at least one item with valid product, quantity, and price');
        return;
      }

      await axios.post('/api/sales/orders', submitData);
      toast.success('Sales order created successfully');
      setShowModal(false);
      setFormData({
        customer: '',
        items: [{ product: '', quantity: '', unitPrice: '' }],
        deliveryDate: '',
        notes: ''
      });
      fetchOrders();
    } catch (error) {
      console.error('Create sales order error:', error);
      console.error('Error response:', error.response?.data);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          'Failed to create sales order';
      toast.error(errorMessage);
    }
  };

  const handleConfirm = async (id) => {
    try {
      await axios.put(`/api/sales/orders/${id}/confirm`);
      toast.success('Sales order confirmed successfully');
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to confirm order');
    }
  };

  const handleShip = async (id) => {
    try {
      await axios.put(`/api/sales/orders/${id}/ship`);
      toast.success('Sales order shipped successfully');
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to ship order');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this sales order?')) {
      try {
        await axios.delete(`/api/sales/orders/${id}`);
        toast.success('Sales order deleted successfully');
        fetchOrders();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete sales order');
      }
    }
  };

  const handleViewInvoice = async (orderId) => {
    setLoadingInvoice(true);
    try {
      const response = await axios.get(`/api/sales/invoices/${orderId}`);
      setInvoiceData(response.data.data);
      setShowInvoice(true);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load invoice');
    } finally {
      setLoadingInvoice(false);
    }
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { product: '', quantity: '', unitPrice: '' }]
    });
  };

  const removeItem = (index) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index)
    });
  };

  const updateItem = (index, field, value) => {
    const updatedItems = [...formData.items];
    updatedItems[index][field] = value;
    setFormData({ ...formData, items: updatedItems });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'shipped': return <Truck className="h-5 w-5 text-blue-500" />;
      case 'confirmed': return <Package className="h-5 w-5 text-yellow-500" />;
      case 'pending': return <ShoppingCart className="h-5 w-5 text-gray-500" />;
      default: return <ShoppingCart className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'shipped': return 'bg-blue-100 text-blue-800';
      case 'confirmed': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
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
          <h1 className="text-2xl font-bold text-gray-900">Sales Orders</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage customer orders and sales transactions
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Sales Order
        </button>
      </div>

      {/* Sales Orders */}
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
                        {order.customer?.name || 'Unknown Customer'}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center text-sm text-gray-500">
                      <span>Total: ${order.total.toLocaleString()}</span>
                      <span className="mx-2">•</span>
                      <span>Items: {order.items.length}</span>
                      <span className="mx-2">•</span>
                      <span>Date: {new Date(order.orderDate).toLocaleDateString()}</span>
                      {order.deliveryDate && (
                        <>
                          <span className="mx-2">•</span>
                          <span>Delivery: {new Date(order.deliveryDate).toLocaleDateString()}</span>
                        </>
                      )}
                    </div>
                    <div className="mt-1 text-sm text-gray-500">
                      <span className="font-medium">Items:</span> {order.items.map(item => 
                        `${item.product?.name || 'Unknown Product'} (${item.quantity})`
                      ).join(', ')}
                    </div>
                    {order.notes && (
                      <div className="mt-1 text-sm text-gray-500">
                        <span className="font-medium">Notes:</span> {order.notes}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleViewInvoice(order._id)}
                    disabled={loadingInvoice}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    title="View Invoice"
                  >
                    <FileText className="h-3 w-3 mr-1" />
                    Invoice
                  </button>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                  {order.status === 'pending' && (
                    <button
                      onClick={() => handleConfirm(order._id)}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Confirm
                    </button>
                  )}
                  {order.status === 'confirmed' && (
                    <button
                      onClick={() => handleShip(order._id)}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700"
                    >
                      <Truck className="h-3 w-3 mr-1" />
                      Ship
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
                Create Sales Order
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Customer
                  </label>
                  <select
                    required
                    value={formData.customer}
                    onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Select Customer</option>
                    {customers.map(customer => (
                      <option key={customer._id} value={customer._id}>
                        {customer?.name || 'Unknown Customer'}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Items
                  </label>
                  {formData.items.map((item, index) => (
                    <div key={index} className="flex space-x-2 mb-2">
                      <select
                        value={item.product}
                        onChange={(e) => updateItem(index, 'product', e.target.value)}
                        className="flex-1 border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="">Select Product</option>
                        {products.filter(p => p.category === 'finished-good').map(product => (
                          <option key={product._id} value={product._id}>
                            {product?.name || 'Unknown Product'} - ${product?.sellingPrice || 0}
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                        className="w-20 border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                      />
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Price"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(index, 'unitPrice', e.target.value)}
                        className="w-24 border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                      />
                      {formData.items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addItem}
                    className="text-sm text-primary-600 hover:text-primary-800"
                  >
                    + Add Item
                  </button>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Delivery Date
                  </label>
                  <input
                    type="date"
                    value={formData.deliveryDate}
                    onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                  />
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

      {/* Invoice Modal */}
      {showInvoice && invoiceData && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white print:shadow-none">
            <div className="mb-4 flex justify-between items-center print:hidden">
              <h3 className="text-lg font-medium text-gray-900">Sales Invoice</h3>
              <div className="flex space-x-2">
                <button
                  onClick={handlePrintInvoice}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Print
                </button>
                <button
                  onClick={() => {
                    setShowInvoice(false);
                    setInvoiceData(null);
                  }}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <X className="h-4 w-4 mr-2" />
                  Close
                </button>
              </div>
            </div>
            
            {/* Invoice Content */}
            <div className="bg-white p-8 print:p-4">
              {/* Header */}
              <div className="mb-8 border-b-2 border-gray-300 pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">MTI-ERP</h1>
                    <p className="text-gray-600">Sales Invoice</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Invoice #: <span className="font-semibold">{invoiceData.invoiceNumber}</span></p>
                    <p className="text-sm text-gray-600">Order #: <span className="font-semibold">{invoiceData.salesOrder?.orderNumber || 'N/A'}</span></p>
                    <p className="text-sm text-gray-600">Date: <span className="font-semibold">{new Date(invoiceData.invoiceDate).toLocaleDateString()}</span></p>
                    <p className="text-sm text-gray-600">Due Date: <span className="font-semibold">{new Date(invoiceData.dueDate).toLocaleDateString()}</span></p>
                  </div>
                </div>
              </div>

              {/* Bill To */}
              <div className="mb-8 grid grid-cols-2 gap-8">
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Bill To:</h3>
                  <p className="text-sm text-gray-900 font-medium">{invoiceData.customer?.name || 'N/A'}</p>
                  {invoiceData.customer?.company && (
                    <p className="text-sm text-gray-600">{invoiceData.customer.company}</p>
                  )}
                  {invoiceData.customer?.address && (
                    <div className="text-sm text-gray-600 mt-1">
                      {invoiceData.customer.address.street && <p>{invoiceData.customer.address.street}</p>}
                      {invoiceData.customer.address.city && (
                        <p>
                          {invoiceData.customer.address.city}
                          {invoiceData.customer.address.state && `, ${invoiceData.customer.address.state}`}
                          {invoiceData.customer.address.zipCode && ` ${invoiceData.customer.address.zipCode}`}
                        </p>
                      )}
                      {invoiceData.customer.address.country && <p>{invoiceData.customer.address.country}</p>}
                    </div>
                  )}
                  {invoiceData.customer?.email && (
                    <p className="text-sm text-gray-600 mt-1">{invoiceData.customer.email}</p>
                  )}
                  {invoiceData.customer?.phone && (
                    <p className="text-sm text-gray-600">{invoiceData.customer.phone}</p>
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Payment Terms:</h3>
                  <p className="text-sm text-gray-600">{invoiceData.paymentTerms || 'Net 30'}</p>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2 mt-4">Status:</h3>
                  <p className="text-sm text-gray-600 capitalize">{invoiceData.status}</p>
                </div>
              </div>

              {/* Items Table */}
              <div className="mb-8">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {invoiceData.items.map((item, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.productName || item.product?.name || 'Unknown Product'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ${item.unitPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                          ${item.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="flex justify-end">
                <div className="w-64">
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-sm text-gray-600">Subtotal:</span>
                    <span className="text-sm font-medium text-gray-900">
                      ${invoiceData.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-sm text-gray-600">Tax:</span>
                    <span className="text-sm font-medium text-gray-900">
                      ${invoiceData.tax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between py-4">
                    <span className="text-lg font-bold text-gray-900">Total:</span>
                    <span className="text-lg font-bold text-gray-900">
                      ${invoiceData.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {invoiceData.notes && (
                <div className="mt-8 pt-4 border-t border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Notes:</h3>
                  <p className="text-sm text-gray-600">{invoiceData.notes}</p>
                </div>
              )}

              {/* Footer */}
              <div className="mt-8 pt-4 border-t border-gray-200 text-center text-xs text-gray-500">
                <p>Thank you for your business!</p>
                <p className="mt-2">MTI-ERP System</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesOrders;
