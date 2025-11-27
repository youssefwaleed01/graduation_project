import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Plus, ShoppingBag, CheckCircle, Clock, Truck, Edit, Trash2, FileText, Printer, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { canCreatePurchaseOrder, canEditPurchaseOrder, canAcceptPurchaseOrder, canReceivePurchaseOrder, canDeletePurchaseOrder } from '../../config/permissions';

const PurchasingOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);
  const [loadingInvoice, setLoadingInvoice] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [formData, setFormData] = useState({
    supplier: '',
    items: [{ product: '', quantity: '', unitPrice: '' }],
    expectedDelivery: '',
    notes: ''
  });

  useEffect(() => {
    fetchOrders();
    fetchSuppliers();
    fetchProducts();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get('/api/purchasing/orders');
      setOrders(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch purchase orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const response = await axios.get('/api/scm/suppliers');
      setSuppliers(response.data.data);
    } catch (error) {
      console.error('Failed to fetch suppliers');
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
        expectedDelivery: formData.expectedDelivery ? new Date(formData.expectedDelivery).toISOString() : null
      };

      // Validate that we have at least one valid item
      if (submitData.items.length === 0) {
        toast.error('Please add at least one item with valid product, quantity, and price');
        return;
      }

      if (editingOrder) {
        await axios.put(`/api/purchasing/orders/${editingOrder._id}`, submitData);
        toast.success('Purchase order updated successfully');
      } else {
        await axios.post('/api/purchasing/orders', submitData);
        toast.success('Purchase order created successfully');
      }
      
      setShowModal(false);
      setEditingOrder(null);
      setFormData({
        supplier: '',
        items: [{ product: '', quantity: '', unitPrice: '' }],
        expectedDelivery: '',
        notes: ''
      });
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to ${editingOrder ? 'update' : 'create'} purchase order`);
    }
  };

  const handleOrder = async (id) => {
    try {
      await axios.put(`/api/purchasing/orders/${id}/order`);
      toast.success('Purchase order placed successfully');
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to place order');
    }
  };

  const handleReceive = async (id) => {
    try {
      await axios.put(`/api/purchasing/orders/${id}/receive`);
      toast.success('Purchase order received successfully');
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to receive order');
    }
  };

  const handleEdit = (order) => {
    setEditingOrder(order);
    setFormData({
      supplier: order.supplier._id,
      items: order.items.map(item => ({
        product: item.product._id,
        quantity: item.quantity,
        unitPrice: item.unitPrice
      })),
      expectedDelivery: order.expectedDelivery ? new Date(order.expectedDelivery).toISOString().split('T')[0] : '',
      notes: order.notes || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this purchase order?')) {
      try {
        await axios.delete(`/api/purchasing/orders/${id}`);
        toast.success('Purchase order deleted successfully');
        fetchOrders();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete purchase order');
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingOrder(null);
    setFormData({
      supplier: '',
      items: [{ product: '', quantity: '', unitPrice: '' }],
      expectedDelivery: '',
      notes: ''
    });
  };

  const handleViewInvoice = async (orderId) => {
    setLoadingInvoice(true);
    try {
      const response = await axios.get(`/api/purchasing/invoices/${orderId}`);
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
      case 'received': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'ordered': return <Truck className="h-5 w-5 text-blue-500" />;
      case 'pending': return <Clock className="h-5 w-5 text-yellow-500" />;
      default: return <ShoppingBag className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'received': return 'bg-green-100 text-green-800';
      case 'ordered': return 'bg-blue-100 text-blue-800';
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
          <h1 className="text-2xl font-bold text-gray-900">Purchase Orders</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage supplier orders and procurement
          </p>
        </div>
        {canCreatePurchaseOrder(user) && (
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Purchase Order
          </button>
        )}
      </div>

      {/* Purchase Orders */}
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
                      {order.autoGenerated && (
                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Auto (Inventory)
                        </span>
                      )}
                      {!order.autoGenerated && (
                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Manual
                        </span>
                      )}
                      <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {order.supplier?.name || 'Unknown Supplier'}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center text-sm text-gray-500">
                      <span>Total: ${order.total.toLocaleString()}</span>
                      <span className="mx-2">•</span>
                      <span>Items: {order.items.length}</span>
                      <span className="mx-2">•</span>
                      <span>Date: {new Date(order.orderDate).toLocaleDateString()}</span>
                      {order.expectedDelivery && (
                        <>
                          <span className="mx-2">•</span>
                          <span>Expected: {new Date(order.expectedDelivery).toLocaleDateString()}</span>
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
                    {order.autoGenerated && (
                      <div className="mt-2 px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-md">
                        <p className="text-xs text-yellow-800">
                          <span className="font-semibold">Auto-Generated:</span> This Purchase Order was automatically created from inventory due to low stock levels.
                        </p>
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
                  {order.status === 'pending' && canAcceptPurchaseOrder(user) && (
                    <button
                      onClick={() => handleOrder(order._id)}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700"
                    >
                      <Truck className="h-3 w-3 mr-1" />
                      Order
                    </button>
                  )}
                  {order.status === 'ordered' && canReceivePurchaseOrder(user) && (
                    <button
                      onClick={() => handleReceive(order._id)}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Receive
                    </button>
                  )}
                  {order.status === 'pending' && canEditPurchaseOrder(user) && (
                    <button
                      onClick={() => handleEdit(order)}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </button>
                  )}
                  {canDeletePurchaseOrder(user) && (
                    <button
                      onClick={() => handleDelete(order._id)}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Delete
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
                {editingOrder ? 'Edit Purchase Order' : 'Create Purchase Order'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Supplier
                  </label>
                  <select
                    required
                    value={formData.supplier}
                    onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Select Supplier</option>
                    {suppliers.map(supplier => (
                      <option key={supplier._id} value={supplier._id}>
                        {supplier?.name || 'Unknown Supplier'}
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
                        {products.map(product => (
                          <option key={product._id} value={product._id}>
                            {product?.name || 'Unknown Product'} - ${product?.unitCost || 0}
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
                    Expected Delivery
                  </label>
                  <input
                    type="date"
                    value={formData.expectedDelivery}
                    onChange={(e) => setFormData({ ...formData, expectedDelivery: e.target.value })}
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
                    onClick={handleCloseModal}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                  >
                    {editingOrder ? 'Update Order' : 'Create Order'}
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
              <h3 className="text-lg font-medium text-gray-900">Purchase Invoice</h3>
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
                    <p className="text-gray-600">Purchase Invoice</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Invoice #: <span className="font-semibold">{invoiceData.invoiceNumber}</span></p>
                    <p className="text-sm text-gray-600">Order #: <span className="font-semibold">{invoiceData.purchaseOrder?.orderNumber || 'N/A'}</span></p>
                    <p className="text-sm text-gray-600">Date: <span className="font-semibold">{new Date(invoiceData.invoiceDate).toLocaleDateString()}</span></p>
                    <p className="text-sm text-gray-600">Due Date: <span className="font-semibold">{new Date(invoiceData.dueDate).toLocaleDateString()}</span></p>
                  </div>
                </div>
              </div>

              {/* Bill From (Supplier) */}
              <div className="mb-8 grid grid-cols-2 gap-8">
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Bill From:</h3>
                  <p className="text-sm text-gray-900 font-medium">{invoiceData.supplier?.name || 'N/A'}</p>
                  {invoiceData.supplier?.contactPerson && (
                    <p className="text-sm text-gray-600">{invoiceData.supplier.contactPerson}</p>
                  )}
                  {invoiceData.supplier?.address && (
                    <div className="text-sm text-gray-600 mt-1">
                      {invoiceData.supplier.address.street && <p>{invoiceData.supplier.address.street}</p>}
                      {invoiceData.supplier.address.city && (
                        <p>
                          {invoiceData.supplier.address.city}
                          {invoiceData.supplier.address.state && `, ${invoiceData.supplier.address.state}`}
                          {invoiceData.supplier.address.zipCode && ` ${invoiceData.supplier.address.zipCode}`}
                        </p>
                      )}
                      {invoiceData.supplier.address.country && <p>{invoiceData.supplier.address.country}</p>}
                    </div>
                  )}
                  {invoiceData.supplier?.email && (
                    <p className="text-sm text-gray-600 mt-1">{invoiceData.supplier.email}</p>
                  )}
                  {invoiceData.supplier?.phone && (
                    <p className="text-sm text-gray-600">{invoiceData.supplier.phone}</p>
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

export default PurchasingOrders;
