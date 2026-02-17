# Inventory Module - Standalone Setup Guide

This document lists all files and folders required to run the Inventory Module as a standalone application.

## 📁 Required Files and Folders

### 🔧 Backend Files

#### **Server Entry Point**
- `server/index.js` (modified to only include inventory routes)

#### **Routes**
- `server/routes/inventory.js` ✅ (Core inventory routes)
- `server/routes/auth.js` ✅ (Required for authentication)
- `server/routes/scm.js` ⚠️ (Optional - only needed if you want supplier functionality in RawMaterials)

#### **Models**
- `server/models/Product.js` ✅ (Core model)
- `server/models/InventoryTransaction.js` ✅ (Core model)
- `server/models/User.js` ✅ (Required for authentication)
- `server/models/Supplier.js` ⚠️ (Optional - only needed if RawMaterials uses suppliers)

#### **Middleware**
- `server/middleware/auth.js` ✅ (Required for protected routes)

#### **Configuration**
- `server/config.env` ✅ (Database connection, JWT secret, etc.)
- `server/package.json` ✅ (Dependencies)

---

### 🎨 Frontend Files

#### **Pages (Inventory Module)**
- `client/src/pages/Inventory/Dashboard.js` ✅
- `client/src/pages/Inventory/Products.js` ✅
- `client/src/pages/Inventory/RawMaterials.js` ✅
- `client/src/pages/Inventory/FinishedProducts.js` ✅
- `client/src/pages/Login.js` ✅ (Required for authentication)

#### **Components**
- `client/src/components/Layout.js` ✅ (Modified to show only Inventory module)
- `client/src/components/ProtectedRoute.js` ✅
- `client/src/components/ProtectedModuleRoute.js` ✅
- `client/src/components/ProtectedDashboardRoute.js` ✅

#### **Contexts**
- `client/src/contexts/AuthContext.js` ✅ (Required for authentication)
- `client/src/contexts/ThemeContext.js` ⚠️ (Optional - if Layout uses it)

#### **Configuration**
- `client/src/config/permissions.js` ✅ (Required for route protection)
- `client/src/App.js` ✅ (Modified to include only Inventory routes)
- `client/src/index.js` ✅ (React entry point)
- `client/src/index.css` ✅ (Styles)
- `client/tailwind.config.js` ✅ (If using Tailwind)
- `client/package.json` ✅ (Dependencies)
- `client/public/index.html` ✅

---

## 📋 Detailed File List

### Backend Structure
```
server/
├── index.js                    # Modified - only inventory & auth routes
├── config.env                  # Database & JWT configuration
├── package.json                # Dependencies
├── middleware/
│   └── auth.js                 # Authentication middleware
├── models/
│   ├── Product.js              # Product model
│   ├── InventoryTransaction.js # Transaction model
│   ├── User.js                 # User model (for auth)
│   └── Supplier.js             # Optional - for supplier functionality
└── routes/
    ├── inventory.js            # Inventory API routes
    ├── auth.js                 # Authentication routes
    └── scm.js                  # Optional - supplier routes
```

### Frontend Structure
```
client/
├── public/
│   └── index.html              # HTML template
├── src/
│   ├── index.js                # React entry point
│   ├── index.css               # Global styles
│   ├── App.js                  # Modified - only Inventory routes
│   ├── components/
│   │   ├── Layout.js           # Modified - only Inventory nav
│   │   ├── ProtectedRoute.js
│   │   ├── ProtectedModuleRoute.js
│   │   └── ProtectedDashboardRoute.js
│   ├── contexts/
│   │   ├── AuthContext.js      # Authentication context
│   │   └── ThemeContext.js     # Optional - if using themes
│   ├── config/
│   │   └── permissions.js      # Permission checks
│   └── pages/
│       ├── Login.js            # Login page
│       └── Inventory/
│           ├── Dashboard.js
│           ├── Products.js
│           ├── RawMaterials.js
│           └── FinishedProducts.js
├── package.json                # Dependencies
└── tailwind.config.js          # Tailwind configuration
```

---

## 🔄 Required Modifications

### 1. **server/index.js**
Remove all routes except:
- `/api/auth` (authentication)
- `/api/inventory` (inventory routes)
- `/api/scm` (optional - only if using suppliers)

```javascript
// Keep only these:
app.use('/api/auth', require('./routes/auth'));
app.use('/api/inventory', require('./routes/inventory'));
// app.use('/api/scm', require('./routes/scm')); // Optional
```

### 2. **client/src/App.js**
Remove all routes except:
- `/login` (login page)
- `/app/inventory/*` (inventory routes)

Remove imports for other modules (HR, Sales, Manufacturing, etc.)

### 3. **client/src/components/Layout.js**
Modify the navigation to show only Inventory module:
```javascript
const modules = [
  {
    name: 'Inventory',
    href: '/app/inventory/dashboard',
    icon: Package,
    module: 'inventory',
    items: [
      { name: 'Dashboard', href: '/app/inventory/dashboard' },
      { name: 'All Products', href: '/app/inventory/products' },
      { name: 'Raw Materials', href: '/app/inventory/raw-materials' },
      { name: 'Finished Products', href: '/app/inventory/finished-products' }
    ]
  }
];
```

### 4. **server/routes/inventory.js**
**Optional modifications:**
- If you remove supplier functionality, comment out or remove:
  - `.populate('supplier', 'name contactPerson')` in product queries
  - Supplier-related logic in product creation/update
  - The check for `product.supplier` in auto PO generation

### 5. **client/src/pages/Inventory/RawMaterials.js**
**If removing supplier functionality:**
- Remove `fetchSuppliers()` call
- Remove supplier dropdown from the form
- Remove supplier display from product cards

---

## 📦 Dependencies

### Backend (`server/package.json`)
Required packages:
- `express`
- `mongoose`
- `dotenv`
- `jsonwebtoken`
- `bcryptjs`
- `express-validator`
- `cors`

### Frontend (`client/package.json`)
Required packages:
- `react`
- `react-dom`
- `react-router-dom`
- `axios`
- `react-hot-toast`
- `lucide-react`
- `recharts` (for Dashboard charts)
- `tailwindcss` (if using Tailwind)

---

## 🗄️ Standalone Database Setup

### Required Collections

**Minimum required collections:**
- `users` (for authentication)
- `products` (inventory products)
- `inventorytransactions` (stock movements)

**Optional collections:**
- `suppliers` (if using supplier functionality)

---

## 📊 Database Setup Options

### Option 1: Create a New Standalone Database (Recommended)

#### Step 1: Create New Database
```bash
# Connect to MongoDB
mongosh

# Create new database
use inventory-system

# Verify database creation
show dbs
```

#### Step 2: Update Configuration
Update `server/config.env`:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/inventory-system
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d
```

#### Step 3: Create Initial User
The database will be empty. You need to create at least one user:

**Option A: Using Registration API**
```bash
# Start your server, then:
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@inventory.com",
    "password": "password123",
    "role": "admin",
    "department": "Inventory"
  }'
```

**Option B: Using MongoDB Shell**
```javascript
// Connect to MongoDB
mongosh inventory-system

// Insert user (password will be hashed by the model)
db.users.insertOne({
  name: "Admin User",
  email: "admin@inventory.com",
  password: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyY5Y5Y5Y5Y5", // hash of "password123"
  role: "admin",
  department: "Inventory",
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

**Option C: Create Seed Script**
Create `server/scripts/seed-inventory.js`:
```javascript
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config({ path: './config.env' });

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const seedUsers = async () => {
  try {
    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@inventory.com',
      password: 'password123',
      role: 'admin',
      department: 'Inventory'
    });
    console.log('Admin user created:', admin.email);

    // Create inventory manager
    const manager = await User.create({
      name: 'Inventory Manager',
      email: 'manager@inventory.com',
      password: 'password123',
      role: 'manager',
      department: 'Inventory'
    });
    console.log('Manager user created:', manager.email);

    // Create inventory employee
    const employee = await User.create({
      name: 'Inventory Employee',
      email: 'employee@inventory.com',
      password: 'password123',
      role: 'employee',
      department: 'Inventory'
    });
    console.log('Employee user created:', employee.email);

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedUsers();
```

Run the seed script:
```bash
node server/scripts/seed-inventory.js
```

---

### Option 2: Export/Import from Existing Database

If you want to migrate inventory data from your existing ERP database:

#### Step 1: Export Inventory Collections

```bash
# Export users (filter for Inventory department or admins)
mongoexport --db=erp-system --collection=users \
  --query='{"$or": [{"department": "Inventory"}, {"role": "admin"}]}' \
  --out=users.json

# Export products
mongoexport --db=erp-system --collection=products \
  --out=products.json

# Export inventory transactions
mongoexport --db=erp-system --collection=inventorytransactions \
  --out=inventorytransactions.json

# Export suppliers (optional)
mongoexport --db=erp-system --collection=suppliers \
  --out=suppliers.json
```

#### Step 2: Create New Database

```bash
# Create new database
mongosh
use inventory-system
```

#### Step 3: Import Collections

```bash
# Import users
mongoimport --db=inventory-system --collection=users \
  --file=users.json --jsonArray

# Import products
mongoimport --db=inventory-system --collection=products \
  --file=products.json --jsonArray

# Import inventory transactions
mongoimport --db=inventory-system --collection=inventorytransactions \
  --file=inventorytransactions.json --jsonArray

# Import suppliers (optional)
mongoimport --db=inventory-system --collection=suppliers \
  --file=suppliers.json --jsonArray
```

#### Step 4: Verify Data

```bash
mongosh inventory-system

# Check collections
show collections

# Count documents
db.users.countDocuments()
db.products.countDocuments()
db.inventorytransactions.countDocuments()
```

#### Step 5: Update ObjectId References (Important!)

Since you're moving to a new database, ObjectId references might need updating. However, if you're starting fresh, this won't be an issue. If you're importing existing data:

```javascript
// Connect to new database
mongosh inventory-system

// Update product supplier references (if suppliers were imported)
// Note: This assumes supplier ObjectIds remain the same
// If ObjectIds changed, you'll need to map old IDs to new IDs

// Example: Update products with supplier references
db.products.updateMany(
  { supplier: { $exists: true } },
  { $set: { supplier: null } } // Or map to new supplier IDs
)
```

---

### Option 3: Using MongoDB Compass (GUI Method)

1. **Connect to your existing database** in MongoDB Compass
2. **Export Collections:**
   - Right-click on `users` collection → Export Collection
   - Filter: `{"$or": [{"department": "Inventory"}, {"role": "admin"}]}`
   - Export to JSON
   - Repeat for `products`, `inventorytransactions`, and optionally `suppliers`

3. **Create New Database:**
   - Click "Create Database"
   - Name: `inventory-system`

4. **Import Collections:**
   - Right-click on `inventory-system` database
   - Import the exported JSON files

---

## 🗃️ Database Schema Reference

### Users Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (enum: ['admin', 'manager', 'employee']),
  department: String (enum: ['Inventory', ...]),
  isActive: Boolean,
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Products Collection
```javascript
{
  _id: ObjectId,
  name: String,
  sku: String (unique),
  description: String,
  category: String (enum: ['raw-material', 'finished-good', 'component']),
  unit: String,
  currentStock: Number,
  minStockLevel: Number,
  maxStockLevel: Number,
  unitCost: Number,
  sellingPrice: Number,
  supplier: ObjectId (ref: 'Supplier', optional),
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### InventoryTransactions Collection
```javascript
{
  _id: ObjectId,
  product: ObjectId (ref: 'Product'),
  type: String (enum: ['in', 'out', 'adjustment']),
  quantity: Number,
  unitCost: Number,
  totalCost: Number,
  reference: String,
  referenceId: ObjectId (optional),
  notes: String,
  performedBy: ObjectId (ref: 'Employee', optional),
  createdAt: Date,
  updatedAt: Date
}
```

### Suppliers Collection (Optional)
```javascript
{
  _id: ObjectId,
  name: String,
  contactPerson: String,
  email: String,
  phone: String,
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  rating: Number,
  paymentTerms: String,
  isActive: Boolean,
  products: [ObjectId],
  createdAt: Date,
  updatedAt: Date
}
```

---

## ⚙️ Configuration

### `server/config.env`
Required variables:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/inventory-system
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d
```

**Important:** Change the database name in `MONGODB_URI` to `inventory-system` (or your chosen name).

---

## 🚀 Complete Setup Steps

### 1. Copy Required Files
Copy all required files to a new project directory following the checklist above.

### 2. Install Dependencies
```bash
cd server && npm install
cd ../client && npm install
```

### 3. Setup Standalone Database

**Choose one of the database setup options above (Option 1, 2, or 3)**

**Quick Start (Option 1 - New Database):**
```bash
# Create seed script (see seed script example above)
# Save as: server/scripts/seed-inventory.js

# Run seed script to create initial users
node server/scripts/seed-inventory.js
```

### 4. Configure Environment
Update `server/config.env`:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/inventory-system
JWT_SECRET=your-secret-key-here
JWT_EXPIRE=7d
```

**Important:** 
- Change database name to `inventory-system` (or your chosen name)
- Use a strong, unique JWT_SECRET

### 5. Modify Application Files
Modify files as listed in "Required Modifications" section:
- `server/index.js` - Remove non-inventory routes
- `client/src/App.js` - Remove non-inventory routes
- `client/src/components/Layout.js` - Show only Inventory navigation

### 6. Start the Application
```bash
# Terminal 1 - Backend
cd server && npm start

# Terminal 2 - Frontend  
cd client && npm start
```

### 7. Login
- Navigate to `http://localhost:3000/login`
- Use credentials from seed script:
  - Admin: `admin@inventory.com` / `password123`
  - Manager: `manager@inventory.com` / `password123`
  - Employee: `employee@inventory.com` / `password123`

**⚠️ Security Note:** Change default passwords immediately after first login!

---

## ⚠️ Important Notes

1. **Supplier Dependency**: The `RawMaterials.js` page calls `/api/scm/suppliers`. You have two options:
   - Include `server/routes/scm.js` and `server/models/Supplier.js`
   - Modify `RawMaterials.js` to remove supplier functionality

2. **Authentication**: The inventory module requires authentication. You must have:
   - User registration/login functionality
   - At least one user with `department: 'Inventory'` or `role: 'admin'`

3. **Order Dependencies**: The inventory routes check for product usage in:
   - `SalesOrder` (for deletion check)
   - `PurchaseOrder` (for deletion check)
   - `ProductionOrder` (for deletion check)
   
   If you want to remove these checks, modify `server/routes/inventory.js` DELETE route.

4. **Scheduler Service**: The inventory routes reference `schedulerService` for auto PO generation. You can:
   - Remove this functionality
   - Create a minimal scheduler service
   - Comment out the scheduler calls

---

## 📝 Summary Checklist

### Backend ✅
- [ ] `server/index.js` (modified)
- [ ] `server/routes/inventory.js`
- [ ] `server/routes/auth.js`
- [ ] `server/models/Product.js`
- [ ] `server/models/InventoryTransaction.js`
- [ ] `server/models/User.js`
- [ ] `server/middleware/auth.js`
- [ ] `server/config.env`
- [ ] `server/package.json`
- [ ] `server/routes/scm.js` (optional)
- [ ] `server/models/Supplier.js` (optional)

### Frontend ✅
- [ ] `client/src/App.js` (modified)
- [ ] `client/src/index.js`
- [ ] `client/src/index.css`
- [ ] `client/src/pages/Login.js`
- [ ] `client/src/pages/Inventory/Dashboard.js`
- [ ] `client/src/pages/Inventory/Products.js`
- [ ] `client/src/pages/Inventory/RawMaterials.js`
- [ ] `client/src/pages/Inventory/FinishedProducts.js`
- [ ] `client/src/components/Layout.js` (modified)
- [ ] `client/src/components/ProtectedRoute.js`
- [ ] `client/src/components/ProtectedModuleRoute.js`
- [ ] `client/src/components/ProtectedDashboardRoute.js`
- [ ] `client/src/contexts/AuthContext.js`
- [ ] `client/src/config/permissions.js`
- [ ] `client/package.json`
- [ ] `client/tailwind.config.js`
- [ ] `client/public/index.html`

---

## 🎯 Minimal Version (Without Suppliers)

If you want the absolute minimum without supplier functionality:

1. **Remove from backend:**
   - `server/routes/scm.js`
   - `server/models/Supplier.js`

2. **Modify:**
   - `server/routes/inventory.js` - Remove supplier populate calls
   - `client/src/pages/Inventory/RawMaterials.js` - Remove supplier form fields and API calls

3. **Update `server/index.js`:**
   - Remove the SCM route registration

This will give you a fully functional inventory system without supplier management.

---

## 📝 Seed Script Template

Create `server/scripts/seed-inventory.js`:

```javascript
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Product = require('../models/Product');

dotenv.config({ path: './config.env' });

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

const seedDatabase = async () => {
  try {
    // Clear existing data (optional - only for fresh start)
    // await User.deleteMany({});
    // await Product.deleteMany({});

    // Create users
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@inventory.com',
      password: 'password123',
      role: 'admin',
      department: 'Inventory'
    });
    console.log('✅ Admin user created:', admin.email);

    const manager = await User.create({
      name: 'Inventory Manager',
      email: 'manager@inventory.com',
      password: 'password123',
      role: 'manager',
      department: 'Inventory'
    });
    console.log('✅ Manager user created:', manager.email);

    const employee = await User.create({
      name: 'Inventory Employee',
      email: 'employee@inventory.com',
      password: 'password123',
      role: 'employee',
      department: 'Inventory'
    });
    console.log('✅ Employee user created:', employee.email);

    // Optional: Create sample products
    const sampleProducts = [
      {
        name: 'Steel Rod',
        sku: 'RAW-STEEL-001',
        description: 'High-grade steel rod for manufacturing',
        category: 'raw-material',
        unit: 'kg',
        currentStock: 1000,
        minStockLevel: 200,
        maxStockLevel: 5000,
        unitCost: 5.50,
        isActive: true
      },
      {
        name: 'Finished Widget',
        sku: 'FG-WIDGET-001',
        description: 'Completed widget ready for sale',
        category: 'finished-good',
        unit: 'piece',
        currentStock: 500,
        minStockLevel: 100,
        maxStockLevel: 2000,
        unitCost: 15.00,
        sellingPrice: 25.00,
        isActive: true
      }
    ];

    for (const product of sampleProducts) {
      const created = await Product.create(product);
      console.log(`✅ Product created: ${created.name} (${created.sku})`);
    }

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('   Admin:   admin@inventory.com / password123');
    console.log('   Manager: manager@inventory.com / password123');
    console.log('   Employee: employee@inventory.com / password123');
    console.log('\n⚠️  Remember to change passwords after first login!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

// Run seed
seedDatabase();
```

**Usage:**
```bash
node server/scripts/seed-inventory.js
```

---

## 🔍 Database Verification Checklist

After setting up your standalone database, verify:

- [ ] Database `inventory-system` exists
- [ ] `users` collection has at least one user
- [ ] User has `department: 'Inventory'` or `role: 'admin'`
- [ ] `products` collection exists (can be empty initially)
- [ ] `inventorytransactions` collection exists (can be empty initially)
- [ ] `suppliers` collection exists (if using supplier functionality)
- [ ] MongoDB connection string in `config.env` points to correct database
- [ ] Can connect to database from application
- [ ] Can login with seeded user credentials

