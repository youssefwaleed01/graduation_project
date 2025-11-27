const moment = require('moment');
const SalesOrder = require('../models/SalesOrder');
const PurchaseOrder = require('../models/PurchaseOrder');
const Customer = require('../models/Customer');
const Product = require('../models/Product');
const Supplier = require('../models/Supplier');

class ReportService {
  constructor() {
    // Direct database access instead of HTTP requests
  }

  // Generate CSV data for sales report
  generateSalesCSV(salesData) {
    let csv = 'Order Number,Customer,Total,Status,Order Date,Items\n';
    
    if (salesData.orders && salesData.orders.length > 0) {
      salesData.orders.forEach(order => {
        const items = order.items ? 
          order.items.map(item => `${item.product?.name || 'Unknown'} (${item.quantity})`).join('; ') : '';
        const customerName = order.customer?.name || 'Unknown Customer';
        const orderDate = moment(order.orderDate).format('YYYY-MM-DD');
        csv += `${order.orderNumber},"${customerName}",${order.total},${order.status},${orderDate},"${items}"\n`;
      });
    }
    
    return csv;
  }

  // Generate CSV data for purchasing report
  generatePurchasingCSV(purchasingData) {
    let csv = 'Order Number,Supplier,Total,Status,Order Date,Received Date,Items\n';
    
    if (purchasingData.orders && purchasingData.orders.length > 0) {
      purchasingData.orders.forEach(order => {
        const items = order.items ? 
          order.items.map(item => `${item.product?.name || 'Unknown'} (${item.quantity})`).join('; ') : '';
        const supplierName = order.supplier?.name || 'Unknown Supplier';
        const orderDate = moment(order.orderDate).format('YYYY-MM-DD');
        const receivedDate = order.receivedDate ? 
          moment(order.receivedDate).format('YYYY-MM-DD') : 'N/A';
        csv += `${order.orderNumber},"${supplierName}",${order.total},${order.status},${orderDate},${receivedDate},"${items}"\n`;
      });
    }
    
    return csv;
  }

  // Fetch sales report data
  async fetchSalesReport(startDate, endDate) {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // End of day

      // Get revenue data
      const revenueOrders = await SalesOrder.find({
        status: { $in: ['confirmed', 'shipped', 'delivered'] },
        orderDate: { $gte: start, $lte: end }
      });

      const totalRevenue = revenueOrders.reduce((sum, order) => sum + (order.total || 0), 0);
      const orderCount = revenueOrders.length;
      const averageOrderValue = orderCount > 0 ? totalRevenue / orderCount : 0;

      const revenue = {
        totalRevenue,
        orderCount,
        averageOrderValue,
        period: { startDate, endDate }
      };

      // Get orders data
      const orders = await SalesOrder.find({
        orderDate: { $gte: start, $lte: end }
      })
      .populate('customer', 'name email company')
      .populate('items.product', 'name sku')
      .sort({ orderDate: -1 });

      // Get customer analytics
      const customerMap = new Map();
      revenueOrders.forEach(order => {
        if (order.customer) {
          const customerId = order.customer.toString();
          if (!customerMap.has(customerId)) {
            customerMap.set(customerId, {
              name: order.customer.name || 'Unknown',
              email: order.customer.email || '',
              company: order.customer.company || '',
              orderCount: 0,
              totalSpent: 0,
              lastOrderDate: order.orderDate
            });
          }
          const customer = customerMap.get(customerId);
          customer.orderCount += 1;
          customer.totalSpent += order.total;
          if (order.orderDate > customer.lastOrderDate) {
            customer.lastOrderDate = order.orderDate;
          }
        }
      });

      const topCustomers = Array.from(customerMap.values())
        .sort((a, b) => b.totalSpent - a.totalSpent)
        .slice(0, 10);

      const customers = {
        activeCustomers: customerMap.size,
        topCustomers
      };

      // Get product analytics
      const productMap = new Map();
      revenueOrders.forEach(order => {
        order.items.forEach(item => {
          if (item.product) {
            const productId = item.product.toString();
            if (!productMap.has(productId)) {
              productMap.set(productId, {
                name: item.product.name || 'Unknown',
                sku: item.product.sku || '',
                category: item.product.category || '',
                quantitySold: 0,
                revenue: 0
              });
            }
            const product = productMap.get(productId);
            product.quantitySold += item.quantity;
            product.revenue += item.total;
          }
        });
      });

      const topProducts = Array.from(productMap.values())
        .map(product => ({
          ...product,
          averagePrice: product.quantitySold > 0 ? product.revenue / product.quantitySold : 0
        }))
        .sort((a, b) => b.quantitySold - a.quantitySold)
        .slice(0, 10);

      const topProduct = topProducts[0] || null;

      const products = {
        topProducts,
        topProduct
      };

      const salesData = {
        revenue,
        orders,
        customers,
        products
      };

      // Generate CSV data
      salesData.csvData = this.generateSalesCSV(salesData);

      return salesData;
    } catch (error) {
      console.error('Error fetching sales report:', error);
      throw error;
    }
  }

  // Fetch purchasing report data
  async fetchPurchasingReport(startDate, endDate) {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // End of day

      // Get spending data
      const receivedOrders = await PurchaseOrder.find({
        status: 'received',
        receivedDate: { $gte: start, $lte: end }
      });

      const totalSpent = receivedOrders.reduce((sum, order) => sum + (order.total || 0), 0);
      const orderCount = receivedOrders.length;
      const averageOrderValue = orderCount > 0 ? totalSpent / orderCount : 0;

      const spending = {
        totalSpent,
        orderCount,
        averageOrderValue,
        period: { startDate, endDate }
      };

      // Get orders data
      const orders = await PurchaseOrder.find({
        orderDate: { $gte: start, $lte: end }
      })
      .populate('supplier', 'name contactPerson email')
      .populate('items.product', 'name sku')
      .sort({ orderDate: -1 });

      // Get supplier analytics
      const supplierMap = new Map();
      receivedOrders.forEach(order => {
        if (order.supplier) {
          const supplierId = order.supplier.toString();
          if (!supplierMap.has(supplierId)) {
            supplierMap.set(supplierId, {
              name: order.supplier.name || 'Unknown',
              contactPerson: order.supplier.contactPerson || '',
              email: order.supplier.email || '',
              orderCount: 0,
              totalSpent: 0,
              lastOrderDate: order.orderDate
            });
          }
          const supplier = supplierMap.get(supplierId);
          supplier.orderCount += 1;
          supplier.totalSpent += order.total;
          if (order.orderDate > supplier.lastOrderDate) {
            supplier.lastOrderDate = order.orderDate;
          }
        }
      });

      const topSuppliers = Array.from(supplierMap.values())
        .map(supplier => ({
          ...supplier,
          averageOrderValue: supplier.totalSpent / supplier.orderCount
        }))
        .sort((a, b) => b.totalSpent - a.totalSpent)
        .slice(0, 10);

      const suppliers = {
        activeSuppliers: supplierMap.size,
        topSuppliers
      };

      // Get product analytics
      const productMap = new Map();
      const categoryMap = new Map();

      receivedOrders.forEach(order => {
        order.items.forEach(item => {
          if (item.product) {
            const productId = item.product.toString();
            if (!productMap.has(productId)) {
              productMap.set(productId, {
                name: item.product.name || 'Unknown',
                sku: item.product.sku || '',
                category: item.product.category || '',
                quantityPurchased: 0,
                totalCost: 0,
                suppliers: new Set()
              });
            }
            const product = productMap.get(productId);
            product.quantityPurchased += item.quantity;
            product.totalCost += item.total;
            if (order.supplier) {
              product.suppliers.add(order.supplier.name || 'Unknown');
            }

            // Category breakdown
            const category = item.product.category || 'Unknown';
            if (!categoryMap.has(category)) {
              categoryMap.set(category, {
                count: 0,
                totalCost: 0
              });
            }
            const categoryData = categoryMap.get(category);
            categoryData.count += 1;
            categoryData.totalCost += item.total;
          }
        });
      });

      const topProducts = Array.from(productMap.values())
        .map(product => ({
          ...product,
          averageUnitCost: product.quantityPurchased > 0 ? product.totalCost / product.quantityPurchased : 0,
          supplier: Array.from(product.suppliers).join(', ')
        }))
        .sort((a, b) => b.quantityPurchased - a.quantityPurchased)
        .slice(0, 10);

      const categoryBreakdown = Object.fromEntries(
        Array.from(categoryMap.entries()).map(([category, data]) => [
          category,
          {
            count: data.count,
            totalCost: data.totalCost
          }
        ])
      );

      const products = {
        topProducts,
        categoryBreakdown
      };

      // Get low stock alerts
      const lowStockProducts = await Product.find({
        $expr: { $lte: ['$currentStock', '$minStockLevel'] },
        isActive: true
      })
      .populate('supplier', 'name contactPerson email');

      const lowStock = lowStockProducts.map(product => ({
        product: {
          id: product._id,
          name: product.name,
          sku: product.sku,
          currentStock: product.currentStock,
          minStockLevel: product.minStockLevel,
          maxStockLevel: product.maxStockLevel,
          unitCost: product.unitCost
        },
        suggestedQuantity: product.maxStockLevel - product.currentStock,
        supplier: product.supplier,
        priority: product.currentStock === 0 ? 'high' : 'medium'
      }));

      const purchasingData = {
        spending,
        orders,
        suppliers,
        products,
        lowStock
      };

      // Generate CSV data
      purchasingData.csvData = this.generatePurchasingCSV(purchasingData);

      return purchasingData;
    } catch (error) {
      console.error('Error fetching purchasing report:', error);
      throw error;
    }
  }


  // Generate daily reports for yesterday
  async generateDailyReports() {
    const yesterday = moment().subtract(1, 'day');
    const startDate = yesterday.format('YYYY-MM-DD');
    const endDate = yesterday.format('YYYY-MM-DD');

    console.log(`Generating daily reports for ${startDate}`);

    try {
      const [salesData, purchasingData] = await Promise.all([
        this.fetchSalesReport(startDate, endDate),
        this.fetchPurchasingReport(startDate, endDate)
      ]);

      return {
        salesData,
        purchasingData,
        date: startDate
      };
    } catch (error) {
      console.error('Error generating daily reports:', error);
      throw error;
    }
  }

  // Generate reports for custom date range
  async generateCustomReports(startDate, endDate) {
    console.log(`Generating custom reports from ${startDate} to ${endDate}`);

    try {
      const [salesData, purchasingData] = await Promise.all([
        this.fetchSalesReport(startDate, endDate),
        this.fetchPurchasingReport(startDate, endDate)
      ]);

      return {
        salesData,
        purchasingData,
        date: `${startDate} to ${endDate}`
      };
    } catch (error) {
      console.error('Error generating custom reports:', error);
      throw error;
    }
  }
}

module.exports = new ReportService();
