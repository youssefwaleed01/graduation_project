# Finance Module Integration Guide

## Overview

The Finance Module has been successfully created with the following features:

### Backend Components
- **Models**: BankAccount, Transaction, Expense
- **Services**: transactionService, expenseService, financeIntegration
- **Routes**: `/api/finance/*`

### Frontend Components
- **Dashboard**: Overview with balances, income, expenses, and recent transactions
- **Reports**: Date range filtering with CSV export
- **Expenses**: Create and manage expenses
- **Manual Transactions**: Create manual deposits/withdrawals (Admin/Manager only)

## Integration with Sales & Purchasing

### Sales Module Integration

To automatically create IN transactions when sales invoices are paid, add this code to your sales invoice payment endpoint:

```javascript
const financeIntegration = require('../services/financeIntegration');
const Invoice = require('../models/Invoice');

// When marking invoice as paid
router.put('/invoices/:id/mark-paid', protect, async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    // Update invoice status
    invoice.status = 'paid';
    await invoice.save();

    // Create Finance IN transaction
    try {
      await financeIntegration.recordSalesPayment(invoice, req.body.bankAccountId);
    } catch (error) {
      console.error('Error recording sales payment in Finance:', error);
      // Don't fail the request if Finance sync fails
    }

    res.json({ success: true, data: invoice });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});
```

### Purchasing Module Integration

To automatically create OUT transactions when purchase invoices are paid:

```javascript
const financeIntegration = require('../services/financeIntegration');
const PurchaseInvoice = require('../models/PurchaseInvoice');

// When marking purchase invoice as paid
router.put('/invoices/:id/mark-paid', protect, async (req, res) => {
  try {
    const purchaseInvoice = await PurchaseInvoice.findById(req.params.id);
    
    if (!purchaseInvoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    // Update invoice status
    purchaseInvoice.status = 'paid';
    await purchaseInvoice.save();

    // Create Finance OUT transaction
    try {
      await financeIntegration.recordPurchasePayment(purchaseInvoice, req.body.bankAccountId);
    } catch (error) {
      console.error('Error recording purchase payment in Finance:', error);
      // Don't fail the request if Finance sync fails
    }

    res.json({ success: true, data: purchaseInvoice });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});
```

## API Endpoints

### Bank Accounts
- `GET /api/finance/accounts` - Get all active accounts
- `POST /api/finance/accounts` - Create account (Admin/Manager)
- `DELETE /api/finance/accounts/:id` - Soft delete account (Admin/Manager)

### Transactions
- `GET /api/finance/transactions` - Get transactions with filters
- `POST /api/finance/transactions` - Create manual transaction (Admin/Manager)
- `DELETE /api/finance/transactions/:id` - Soft delete transaction (Admin/Manager)

### Expenses
- `GET /api/finance/expenses` - Get expenses with filters
- `POST /api/finance/expenses` - Create expense (auto-creates OUT transaction)
- `DELETE /api/finance/expenses/:id` - Soft delete expense (Admin/Manager)

### Dashboard
- `GET /api/finance/dashboard` - Get dashboard data (Admin/Manager only)

### Reports
- `GET /api/finance/reports` - Get report data (requires startDate & endDate)
- `GET /api/finance/reports/export` - Export CSV (requires startDate & endDate)

## Permissions

- **Dashboard Access**: Admin and Managers only
- **Manual Transactions**: Admin and Managers only
- **Expenses**: All authenticated users can create
- **Delete Operations**: Admin and Managers only

## Features

1. **Soft Delete**: All entities support soft delete (isDeleted flag)
2. **Balance Updates**: Only via Transactions (automatic on create/delete)
3. **Single Currency**: EGP only
4. **Server Time**: All dates use server time
5. **CSV Export**: Reports can be exported to CSV format

## Database Collections

- `bankaccounts` - Bank account information
- `transactions` - All financial transactions
- `expenses` - Expense records (linked to transactions)

## Notes

- Expenses automatically create OUT transactions
- Transactions automatically update bank account balances
- Soft delete reverses balance changes
- Integration with Sales/Purchasing requires adding payment endpoints (see examples above)

