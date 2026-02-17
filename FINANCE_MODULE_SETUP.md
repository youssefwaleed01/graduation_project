# Finance Module - Setup Guide

## Overview
A clean, production-ready Finance Module for the ERP system with 4 main screens:
1. **Dashboard** - Financial overview and summary
2. **Transactions** - Pay invoices (sales & purchase)
3. **Bank** - View bank accounts and balances
4. **Expenses** - Manage business expenses

## Database Models

### 1. BankAccount
- `name`: String (e.g., "Cash", "Bank Account")
- `balance`: Number (current balance in EGP)

### 2. Transaction
- `sourceType`: "invoice" | "expense"
- `sourceId`: Reference to Invoice/PurchaseInvoice/Expense
- `sourceModel`: "Invoice" | "PurchaseInvoice" | "Expense"
- `direction`: "in" | "out"
- `amount`: Number
- `bankAccount`: Reference to BankAccount
- `date`: Date
- `notes`: String (optional)

### 3. Expense
- `title`: String
- `amount`: Number
- `category`: String
- `bankAccount`: Reference to BankAccount
- `transaction`: Reference to Transaction (auto-created)
- `date`: Date
- `notes`: String (optional)

### 4. Invoice/PurchaseInvoice (Updated)
- Added `relatedTransaction`: Reference to Transaction

## API Endpoints

### Dashboard
- `GET /api/finance/dashboard` - Get financial summary (Manager/Admin only)

### Invoices
- `GET /api/finance/unpaid-invoices` - Get all unpaid invoices (sales + purchase)
- `POST /api/finance/pay-invoice` - Pay an invoice (Manager/Admin only)
  - Body: `{ invoiceId, invoiceModel, bankAccountId, notes }`

### Transactions
- `GET /api/finance/transactions` - Get all transactions
  - Query params: `limit`, `startDate`, `endDate`

### Bank
- `GET /api/finance/bank` - Get bank accounts with recent transactions

### Expenses
- `GET /api/finance/expenses` - Get all expenses
  - Query params: `limit`, `startDate`, `endDate`, `category`
- `POST /api/finance/expenses` - Create expense (Manager/Admin only)
  - Body: `{ title, amount, category, bankAccountId, notes, date }`

## Business Logic

### Paying Invoices
1. User selects unpaid invoice from Transactions screen
2. User selects bank account
3. System creates Transaction:
   - Sales invoice → direction = "in" (money coming in)
   - Purchase invoice → direction = "out" (money going out)
4. System updates bank account balance
5. System marks invoice as "paid" and links transaction

### Creating Expenses
1. User fills expense form
2. System creates Transaction (direction = "out")
3. System creates Expense and links to transaction
4. System deducts amount from bank account balance

### Bank Accounts
- Read-only view
- Shows current balance and recent transactions
- No manual balance editing (all updates via transactions)

## Frontend Routes

- `/app/finance/dashboard` - Dashboard
- `/app/finance/transactions` - Pay Invoices
- `/app/finance/bank` - Bank Accounts
- `/app/finance/expenses` - Expenses

## Permissions

- **Dashboard**: Admin, Finance Manager
- **Pay Invoice**: Admin, Manager
- **Create Expense**: Admin, Manager
- **View**: All authenticated users with Finance module access

## Initial Setup

### 1. Create Bank Accounts
You need to manually create bank accounts in MongoDB. Example:

```javascript
// In MongoDB shell or Compass
db.bankaccounts.insertMany([
  { name: "Cash", balance: 0 },
  { name: "Bank Account", balance: 0 }
])
```

Or use a script:

```javascript
// server/scripts/seedBankAccounts.js
const mongoose = require('mongoose');
const BankAccount = require('../models/BankAccount');
require('dotenv').config({ path: './config.env' });

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    const accounts = await BankAccount.find();
    if (accounts.length === 0) {
      await BankAccount.create([
        { name: 'Cash', balance: 0 },
        { name: 'Bank Account', balance: 0 }
      ]);
      console.log('Bank accounts created');
    } else {
      console.log('Bank accounts already exist');
    }
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
```

### 2. Set Initial Balance (Optional)
If you want to set an initial balance:

```javascript
db.bankaccounts.updateOne(
  { name: "Cash" },
  { $set: { balance: 10000 } }
)
```

## Testing

1. **Pay Sales Invoice**:
   - Go to Transactions screen
   - Find unpaid sales invoice
   - Click "Pay"
   - Select bank account
   - Confirm payment
   - Verify: Invoice marked as paid, transaction created, balance increased

2. **Pay Purchase Invoice**:
   - Same as above, but balance should decrease

3. **Create Expense**:
   - Go to Expenses screen
   - Click "Add Expense"
   - Fill form and submit
   - Verify: Expense created, transaction created, balance decreased

4. **View Dashboard**:
   - Check total balance, unpaid/paid invoices, monthly expenses

## Notes

- All amounts are in EGP (Egyptian Pounds)
- No double-entry accounting (simple cash flow tracking)
- Transactions are immutable (no editing/deleting)
- Bank balances update automatically via transactions
- Invoice status updates automatically when paid

## Future Enhancements (Not Implemented)

- Transaction editing/deletion
- Multiple currencies
- Recurring expenses
- Expense categories management
- Financial reports and charts
- Bank reconciliation
- Payment methods tracking

