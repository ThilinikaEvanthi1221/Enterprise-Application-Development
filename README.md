# Enterprise Application Development - AutoServicePro System

A comprehensive automotive service and inventory management system with customer feedback integration, built with Node.js, Express, React, and MongoDB.

## Project Overview

This is a full-stack MERN application that combines:

- **Core Service Management**: Complete automotive service management system
- **Inventory Management**: Comprehensive spare parts and inventory tracking
- **Customer Feedback System**: Service ratings and feedback collection
- **User Management**: Role-based access control for different user types

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
│   ├── src/                          # Customer feedback source
│   │   ├── models/                   # Rating model
│   │   ├── routes/                   # Rating routes
│   │   ├── middleware/               # Auth middleware
│   │   └── index.js                  # Customer feedback server
│   ├── scripts/                      # Database initialization scripts
│   └── server.js                     # Main server file
├── frontend/                         # React application
│   ├── public/                       # Static files
│   ├── src/                          # React source code
│   │   ├── pages/                    # Page components
│   │   │   ├── CustomerDashboard.js  # Main dashboard
│   │   │   ├── Feedback.jsx          # Customer feedback
│   │   │   └── ServiceRatings.jsx    # Ratings dashboard
│   │   ├── services/                 # API services
│   │   └── inventory-management/     # Inventory UI components
│   └── package.json
└── README.md
```

## Features

### Core System Features

- **Role-based Access Control**: Admin, Inventory Manager, Service Manager, Mechanic, Employee, Customer
- **JWT Authentication**: Secure token-based authentication
- **Permission System**: Granular permissions for different operations

### Customer Feedback System

- **Service Ratings**: 1-5 star rating system for services
- **Feedback Collection**: Detailed customer feedback and comments
- **Rating Analytics**: Dashboard with KPIs and breakdowns
- **Search & Filtering**: Advanced filtering by rating, date, service type
- **Data Visualization**: Charts and graphs using Recharts

### Inventory Management

- **Parts Management**: Create, update, delete, and track spare parts
- **Stock Control**: Real-time stock tracking and adjustments
- **Location Management**: Warehouse, section, shelf, and bin tracking
- **Reorder Alerts**: Automatic low stock notifications

## Quick Start Guide

### Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account or local MongoDB
- npm or yarn package manager

### Environment Setup

1. **Backend Environment (.env)**
   Create `backend/.env` with:

   ```env
   MONGO_URI=mongodb+srv://ewadanambi_db_user:QFQEKNS9pWPXcimP@ead.pk3etwe.mongodb.net/
   DB_NAME=autoservicepro
   PORT=5000
   JWT_SECRET=supersecretkey
   ```

2. **Install Dependencies**

   ```bash
   # Backend dependencies
   cd backend && npm install

   # Frontend dependencies
   cd ../frontend && npm install
   ```

3. **Seed Demo Data (Optional)**

   ```bash
   cd backend
   npm run seed
   ```

4. **Run the Applications**

   Open two terminals:

   **Terminal 1 - Backend:**

   ```bash
   cd backend
   npm start
   ```

   **Terminal 2 - Frontend:**

   ```bash
   cd frontend
   npm run dev
   ```

The frontend dev server proxies `/api` to `http://localhost:5000`.

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Customer Feedback & Ratings

- `GET /api/ratings` - List ratings with query params: `page`, `limit`, `search`, `sortBy`, `sortOrder`, `dateFrom`, `dateTo`, `minRating`, `maxRating`, `serviceType`
- `GET /api/ratings/summary` - Aggregated KPIs and breakdown for dashboard
- `POST /api/ratings` - Create new rating/feedback
- `POST /api/ratings/seed` - Seed random demo data

### Inventory Management

- `GET /api/inventory/parts` - Get all parts
- `POST /api/inventory/parts` - Create new part
- `PUT /api/inventory/parts/:id` - Update part
- `DELETE /api/inventory/parts/:id` - Delete part
- `POST /api/inventory/stock/adjust` - Adjust stock levels
- `GET /api/inventory/alerts` - Get reorder alerts

## User Roles & Access Levels

| Role                  | Inventory Access   | Customer Feedback | Service Management |
| --------------------- | ------------------ | ----------------- | ------------------ |
| **Admin**             | Full Access        | Full Access       | Full Access        |
| **Inventory Manager** | Full Inventory     | View Reports      | Limited            |
| **Service Manager**   | Parts Operations   | Full Access       | Full Access        |
| **Mechanic**          | Parts View/Request | View Only         | Service Operations |
| **Employee**          | Read Only          | View Only         | Limited            |
| **Customer**          | No Access          | Create/View Own   | Book Services      |

## Technology Stack

### Backend

- **Runtime**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with bcryptjs
- **API**: RESTful API architecture
- **File Upload**: Multer for file handling

### Frontend

- **Framework**: React 18+ with Vite
- **Routing**: React Router DOM
- **Charts**: Recharts for data visualization
- **HTTP Client**: Axios for API calls
- **Icons**: React Icons
- **Styling**: Modern CSS with responsive design

### Database Schema

#### Rating Model (Customer Feedback)

```javascript
{
  customerName: String,
  serviceType: String,
  rating: Number (1-5),
  comment: String,
  serviceDate: Date,
  createdAt: Date
}
```

#### User Model

```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (enum),
  department: String,
  permissions: [String],
  isActive: Boolean
}
```

## Development Scripts

### Backend Scripts

```bash
npm start            # Start production server
npm run dev          # Development with --watch
npm run seed         # Seed demo rating data
npm test             # Run tests (placeholder)
```

### Frontend Scripts

```bash
npm run dev          # Start Vite dev server
npm start            # Alias for dev
npm run build        # Build for production
npm run preview      # Preview production build
```

## Key Features Implementation

### Customer Feedback Dashboard

- **KPI Cards**: Average rating, total feedback, recent ratings
- **Rating Distribution**: Visual breakdown by star rating
- **Advanced Filtering**: Filter by date range, rating, service type
- **Pagination**: Efficient data loading for large datasets
- **Search Functionality**: Search through feedback comments

### Inventory Integration

- **Real-time Stock Updates**: Live inventory tracking
- **Smart Alerts**: Automated reorder notifications
- **Multi-location Support**: Track parts across locations
- **Role-based Permissions**: Control access by user role

## Security Features

- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: bcrypt for password security
- **Role-based Authorization**: Granular access control
- **Input Validation**: Comprehensive data validation
- **CORS Protection**: Cross-origin request security

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Support

For support and questions, please contact the development team or create an issue in the repository.

---

**Note**: Remember to change default credentials in production and ensure proper environment configuration for security.
