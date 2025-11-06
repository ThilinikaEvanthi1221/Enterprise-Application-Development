# Enterprise Application Development - Inventory Management System

A comprehensive inventory and spare parts management system built with Node.js, Express, React, and MongoDB.

## Project Structure

```
Enterprise-Application-Development/
├── backend/                          # Node.js/Express API
│   ├── config/                       # Database configuration
│   ├── controllers/                  # API controllers
│   ├── middleware/                   # Authentication middleware
│   ├── models/                       # Database models
│   ├── routes/                       # API routes
│   ├── inventory-management/         # Inventory module
│   │   ├── controllers/              # Inventory controllers
│   │   ├── middleware/               # Role-based auth middleware
│   │   ├── models/                   # Inventory models
│   │   ├── routes/                   # Inventory routes
│   │   ├── services/                 # Business logic
│   │   └── config/                   # Inventory configuration
│   ├── scripts/                      # Database initialization scripts
│   └── server.js                     # Main server file
├── frontend/                         # React application
│   ├── public/                       # Static files
│   ├── src/                          # React source code
│   │   ├── pages/                    # Page components
│   │   ├── services/                 # API services
│   │   └── inventory-management/     # Inventory UI components
│   └── package.json
└── README.md
```

## Features

### User Management & Authentication
- **Role-based Access Control**: Admin, Inventory Manager, Service Manager, Mechanic, Employee, Customer
- **JWT Authentication**: Secure token-based authentication
- **Permission System**: Granular permissions for different operations
- **User Management Interface**: Create and manage inventory staff

### Inventory Management
- **Parts Management**: Create, update, delete, and track spare parts
- **Stock Control**: Real-time stock tracking and adjustments
- **Location Management**: Warehouse, section, shelf, and bin tracking
- **Category Organization**: Configurable part categories
- **Multi-currency Support**: Handle different currencies

### Smart Alerts & Monitoring
- **Reorder Alerts**: Automatic low stock and out-of-stock notifications
- **Alert Management**: Acknowledge and resolve alerts
- **Stock Level Monitoring**: Min/max stock level enforcement

### Reporting & Analytics
- **Low Stock Reports**: Identify parts needing reorder
- **Transaction Reports**: Detailed transaction history
- **Inventory Summary**: Overview of inventory status
- **Dashboard Analytics**: Key metrics and insights

### Configuration Management
- **Dynamic Configuration**: No hardcoded values
- **Category Management**: Configurable part categories
- **Currency Settings**: Multi-currency support
- **Default Value Management**: Centralized configuration

## User Roles & Permissions

### Admin
- **Full Access**: All system operations
- **User Management**: Create and manage all users
- **System Configuration**: Modify system settings

### Inventory Manager
- **Full Inventory Access**: All inventory operations
- **Staff Management**: Manage inventory team
- **Reports & Analytics**: View all reports
- **Alert Management**: Manage all alerts

### Service Manager
- **Inventory Operations**: Create, update parts and stock
- **Team Coordination**: Manage service team inventory needs
- **Reports Access**: View inventory reports

### Mechanic
- **Parts Access**: View and manage parts
- **Stock Requests**: Request parts and update usage

### Employee
- **Read Access**: View inventory and reports
- **Basic Operations**: Limited inventory viewing

### Customer
- **No Inventory Access**: Standard customer features only

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account or local MongoDB
- npm or yarn package manager

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the backend directory:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRE=30d
   NODE_ENV=development
   ```

4. **Initialize Database**
   Run the database initialization script to create default users and sample data:
   ```bash
   npm run init-db
   ```

5. **Start the server**
   ```bash
   npm run dev          # Development mode with nodemon
   npm start            # Production mode
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the frontend directory:
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

### Default User Accounts

After running the database initialization script, the following default accounts will be created:

| Role | Email | Password | Permissions |
|------|-------|----------|-------------|
| Admin | admin@enterprise.com | admin123 | Full access |
| Inventory Manager | inventory.manager@enterprise.com | inventory123 | Full inventory access |
| Service Manager | service.manager@enterprise.com | service123 | Service & inventory operations |
| Mechanic | mechanic@enterprise.com | mechanic123 | Parts access |
| Employee | employee@enterprise.com | employee123 | Read-only access |
| Customer | customer@enterprise.com | customer123 | No inventory access |

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Inventory Management
- `GET /api/inventory/parts` - Get all parts
- `POST /api/inventory/parts` - Create new part
- `PUT /api/inventory/parts/:id` - Update part
- `DELETE /api/inventory/parts/:id` - Delete part
- `POST /api/inventory/stock/adjust` - Adjust stock levels
- `GET /api/inventory/alerts` - Get reorder alerts
- `GET /api/inventory/reports/low-stock` - Low stock report

### User Management (Admin/Manager only)
- `GET /api/inventory-users/users` - Get inventory users
- `POST /api/inventory-users/users` - Create inventory user
- `PUT /api/inventory-users/users/:id` - Update user
- `PATCH /api/inventory-users/users/:id/toggle-status` - Toggle user status

## Database Schema

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (enum),
  department: String,
  permissions: [String],
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Part Model
```javascript
{
  partNumber: String (unique),
  name: String,
  description: String,
  category: String,
  manufacturer: String,
  supplier: String,
  currentStock: Number,
  minStockLevel: Number,
  maxStockLevel: Number,
  unitPrice: Number,
  currency: String,
  location: {
    warehouse: String,
    section: String,
    shelf: String,
    bin: String
  },
  createdBy: ObjectId
}
```

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for secure password storage
- **Role-based Authorization**: Granular access control
- **Input Validation**: Comprehensive input validation
- **CORS Protection**: Cross-origin request security
- **Environment Variables**: Secure configuration management

## Development Scripts

### Backend Scripts
```bash
npm run dev          # Start development server with nodemon
npm start            # Start production server
npm run init-db      # Initialize database with default data
npm run seed-data    # Alias for init-db
```

### Frontend Scripts
```bash
npm start            # Start development server
npm run build        # Build for production
npm test             # Run tests
```

## Configuration

The system uses a configuration-driven approach to avoid hardcoded values:

### Backend Configuration
- Database connection settings
- JWT configuration
- Default user permissions
- Inventory categories and settings

### Frontend Configuration
- API endpoints
- Default values
- UI configuration
- Currency settings

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License.

## Support

For support and questions, please contact the development team or create an issue in the repository.

---

**Note**: Remember to change default passwords in production and ensure proper environment configuration for security.