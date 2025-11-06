# Inventory & Spare Parts Management Module

This module provides comprehensive inventory and spare parts management functionality for the Enterprise Application Development system.

## Features

- **Parts Management**: Complete CRUD operations for spare parts
- **Stock Tracking**: Real-time stock level monitoring and adjustments
- **Reorder Alerts**: Automatic alerts for low stock, out of stock situations
- **Transaction History**: Detailed logging of all inventory movements
- **Dashboard**: Overview of inventory status and analytics
- **Configurable Categories**: Dynamic part categories and settings

## Module Structure

### Backend (`/backend/inventory-management/`)

```
inventory-management/
├── config/
│   └── inventoryConfig.js          # Configuration constants
├── controllers/
│   ├── inventoryController.js      # Main inventory operations
│   └── configController.js         # Configuration endpoints
├── models/
│   ├── Part.js                     # Part model schema
│   ├── InventoryTransaction.js     # Transaction model schema
│   ├── ReorderAlert.js             # Alert model schema
│   └── index.js                    # Models export
├── routes/
│   └── inventoryRoutes.js          # API routes
├── services/
│   └── inventoryService.js         # Business logic layer
└── index.js                        # Module entry point
```

### Frontend (`/frontend/src/inventory-management/`)

```
inventory-management/
├── components/
│   └── PartForm.js                 # Part creation/editing form
├── config/
│   └── inventoryConfig.js          # Frontend configuration
├── pages/
│   ├── InventoryDashboard.js       # Main dashboard
│   └── PartsManagement.js          # Parts listing and management
├── services/
│   └── inventoryApi.js             # API service layer
└── styles/
    └── InventoryDashboard.css      # Dashboard styles
```

## API Endpoints

### Configuration
- `GET /api/inventory/config` - Get full inventory configuration
- `GET /api/inventory/config/categories` - Get part categories

### Dashboard
- `GET /api/inventory/dashboard` - Get dashboard data

### Parts Management
- `GET /api/inventory/parts` - Get all parts (with filtering & pagination)
- `GET /api/inventory/parts/:id` - Get single part
- `POST /api/inventory/parts` - Create new part
- `PUT /api/inventory/parts/:id` - Update part
- `DELETE /api/inventory/parts/:id` - Delete part (soft delete)

### Stock Management
- `POST /api/inventory/stock/adjust` - Adjust stock levels

### Transactions
- `GET /api/inventory/parts/:id/transactions` - Get part transaction history

### Alerts
- `GET /api/inventory/alerts` - Get reorder alerts
- `PUT /api/inventory/alerts/:id/acknowledge` - Acknowledge alert

## Configuration

The module uses centralized configuration for:

### Categories
- Engine, Transmission, Brakes, Electrical, Body
- Interior, Exterior, Suspension, Cooling, Fuel, Other

### Currencies
- USD (US Dollar)
- EUR (Euro) 
- GBP (British Pound)
- LKR (Sri Lankan Rupee)

### Transaction Types
- IN (Stock In)
- OUT (Stock Out)
- ADJUSTMENT (Direct Adjustment)
- TRANSFER (Transfer between locations)
- DAMAGE (Damage/Loss)
- RETURN (Return)

### Alert Priorities
- LOW, MEDIUM, HIGH, CRITICAL

### Default Values
- Min Stock Level: 5
- Max Stock Level: 100
- Currency: USD
- Category: Other
- Default warehouse location

## Features in Detail

### 1. Parts Management
- Create, read, update, delete spare parts
- Part number validation (unique, alphanumeric)
- Category-based organization
- Location tracking (warehouse, section, shelf, bin)
- Stock level monitoring
- Price management with multi-currency support

### 2. Stock Tracking
- Real-time stock level updates
- Stock adjustment transactions (IN/OUT/ADJUSTMENT)
- Transaction history with audit trail
- Minimum/maximum stock level enforcement
- Automatic reorder point calculations

### 3. Reorder Alerts
- Automatic alert generation for low stock
- Critical alerts for out-of-stock items
- Priority-based alert classification
- Alert acknowledgment and resolution tracking
- Suggested order quantities

### 4. Dashboard Analytics
- Total parts count
- Low stock and out-of-stock summaries
- Active alerts count
- Recent transaction history
- Stock value by category
- Visual stock level indicators

### 5. Search and Filtering
- Text search across part numbers, names, descriptions
- Category-based filtering
- Stock status filtering (low, out, overstock, reorder required)
- Pagination for large datasets
- Sortable columns

## Installation & Setup

1. **Backend Setup**:
   ```bash
   cd backend
   npm install
   # Ensure MongoDB is running
   npm run dev
   ```

2. **Frontend Setup**:
   ```bash
   cd frontend
   npm install
   npm start
   ```

3. **Integration**:
   - The inventory routes are automatically mounted at `/api/inventory`
   - Authentication middleware is applied to all protected routes
   - Configuration endpoints are public for initial app setup

## Usage Examples

### Creating a New Part
```javascript
const newPart = {
  partNumber: "ENG-001",
  name: "Engine Oil Filter",
  description: "High-performance oil filter for diesel engines",
  category: "Engine",
  manufacturer: "FilterCorp",
  currentStock: 25,
  minStockLevel: 5,
  maxStockLevel: 50,
  unitPrice: 15.99,
  currency: "USD",
  location: {
    warehouse: "Main Warehouse",
    section: "A",
    shelf: "3",
    bin: "2"
  }
};
```

### Stock Adjustment
```javascript
const stockAdjustment = {
  partId: "60f7b1b8e4b0f83d8c8b4567",
  transactionType: "IN",
  quantity: 10,
  unitPrice: 15.99,
  reference: "PO-2023-001",
  notes: "Monthly restock from supplier"
};
```

## Contributing

When adding new features:
1. Update configuration files for new enums/constants
2. Add corresponding API endpoints
3. Update frontend components to use new configuration
4. Add appropriate validation and error handling
5. Update documentation

## Security

- All API endpoints (except config) require authentication
- Input validation using Mongoose schemas
- SQL injection prevention through parameterized queries
- Rate limiting on API endpoints (recommended)
- Audit trail for all inventory transactions