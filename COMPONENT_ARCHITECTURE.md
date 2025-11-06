# 🗺️ Service Request System - Architecture Map

## Component Hierarchy

```
App.js (Main Router)
│
├── Public Routes
│   ├── Home (/)
│   ├── Login (/login)
│   └── Signup (/signup)
│
├── Customer Routes (Protected - Customer Role Only)
│   ├── CustomerDashboard (/customer/*)
│   └── CustomerServiceRequests (/customer-service-requests) ⭐ NEW
│       ├── Service Request Form Modal
│       ├── My Services List
│       ├── Service Details Modal
│       └── Cancel Service Function
│
├── Employee Routes (Protected - Employee Role Only)
│   ├── EmployeeDashboard (/employee/*)
│   └── EmployeeServiceManagement (/employee-services) ⭐ NEW
│       ├── My Assigned Services Tab
│       ├── Available Services Tab
│       ├── Claim Service Function
│       └── Update Progress Modal
│
└── Admin Routes (Protected - Admin Role Only)
    ├── AdminDashboard (/admin/*)
    ├── AdminServiceManagement (/admin-services) ⭐ NEW
    │   ├── Statistics Dashboard
    │   ├── Status Filters
    │   ├── Services Data Table
    │   ├── Approve Service Modal
    │   ├── Service Details Modal
    │   └── Delete Service Function
    │
    └── Other Admin Pages
        ├── Users (/users)
        ├── Vehicles (/vehicles)
        ├── Appointments (/appointments)
        └── TimeLogs (/time-logs)
```

---

## API Service Layer (api.js)

```
API Service (axios instance)
│
├── Auth APIs
│   ├── signup()
│   ├── login()
│   └── googleLogin()
│
├── Customer Service APIs ⭐ NEW
│   ├── requestService(data)
│   ├── getMyServices(params)
│   ├── getMyService(id)
│   └── cancelMyService(id)
│
├── Employee Service APIs ⭐ NEW
│   ├── getAssignedServices(params)
│   ├── getAvailableServices()
│   ├── claimService(id)
│   └── updateServiceProgress(id, data)
│
├── Admin Service APIs ⭐ NEW
│   ├── getAllServices()
│   ├── getService(id)
│   ├── approveService(id, data)
│   └── deleteService(id)
│
├── Customer Project APIs ⭐ NEW (Ready for future use)
│   ├── requestProject(data)
│   ├── getMyProjects(params)
│   ├── getMyProject(id)
│   └── cancelMyProject(id)
│
├── Employee Project APIs ⭐ NEW (Ready for future use)
│   ├── getAssignedProjects(params)
│   ├── getAvailableProjects()
│   ├── claimProject(id)
│   ├── updateProjectProgress(id, data)
│   ├── addMilestone(id, data)
│   └── completeMilestone(id, milestoneId)
│
└── Admin Project APIs ⭐ NEW (Ready for future use)
    ├── getAllProjects()
    ├── getProject(id)
    ├── approveProject(id, data)
    └── deleteProject(id)
```

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    CUSTOMER SERVICE REQUEST FLOW                 │
└─────────────────────────────────────────────────────────────────┘

Customer                      Frontend                    Backend
   │                              │                           │
   │  1. Click "Request Service"  │                           │
   ├─────────────────────────────>│                           │
   │                              │                           │
   │  2. Fill Form & Submit       │                           │
   ├─────────────────────────────>│  POST /api/services/      │
   │                              │        request            │
   │                              ├──────────────────────────>│
   │                              │                           │
   │                              │  Calculate Cost Estimate  │
   │                              │  Create Service Record    │
   │                              │<──────────────────────────┤
   │                              │  Response: Service +      │
   │  3. Service Created!         │            Cost Estimate  │
   │<─────────────────────────────┤                           │
   │                              │                           │
   │  4. View in "My Services"    │  GET /api/services/       │
   ├─────────────────────────────>│      my-services          │
   │                              ├──────────────────────────>│
   │<─────────────────────────────┤<──────────────────────────┤
   │     List of Services         │                           │
   │                              │                           │


┌─────────────────────────────────────────────────────────────────┐
│                      ADMIN APPROVAL FLOW                         │
└─────────────────────────────────────────────────────────────────┘

Admin                        Frontend                    Backend
   │                              │                           │
   │  1. View All Services        │  GET /api/services        │
   ├─────────────────────────────>│                           │
   │                              ├──────────────────────────>│
   │<─────────────────────────────┤<──────────────────────────┤
   │     All Services List        │                           │
   │                              │                           │
   │  2. Click "Approve"          │                           │
   ├─────────────────────────────>│                           │
   │                              │                           │
   │  3. Assign Employee          │  PATCH /api/services/:id/ │
   │     (Optional) & Approve     │         approve           │
   ├─────────────────────────────>│                           │
   │                              ├──────────────────────────>│
   │                              │  Update Status: approved  │
   │                              │  Assign Employee (if any) │
   │                              │<──────────────────────────┤
   │  4. Service Approved!        │  Updated Service          │
   │<─────────────────────────────┤                           │
   │                              │                           │


┌─────────────────────────────────────────────────────────────────┐
│                    EMPLOYEE CLAIM & UPDATE FLOW                  │
└─────────────────────────────────────────────────────────────────┘

Employee                     Frontend                    Backend
   │                              │                           │
   │  1. View Available Services  │  GET /api/services/       │
   ├─────────────────────────────>│      available            │
   │                              ├──────────────────────────>│
   │<─────────────────────────────┤<──────────────────────────┤
   │  Approved/Pending Services   │                           │
   │                              │                           │
   │  2. Click "Claim Service"    │  POST /api/services/:id/  │
   ├─────────────────────────────>│       claim               │
   │                              ├──────────────────────────>│
   │                              │  Assign to Employee       │
   │                              │  Status: ongoing          │
   │  3. Service Claimed!         │  Start Date: now          │
   │<─────────────────────────────┤<──────────────────────────┤
   │                              │                           │
   │  4. Update Progress          │  PATCH /api/services/:id/ │
   │     Status: ongoing          │         progress          │
   │     Progress: 50%            │                           │
   │     Notes: "Working on it"   │                           │
   ├─────────────────────────────>│                           │
   │                              ├──────────────────────────>│
   │                              │  Update Progress: 50%     │
   │                              │  Update Notes             │
   │  5. Progress Updated!        │<──────────────────────────┤
   │<─────────────────────────────┤  Updated Service          │
   │                              │                           │
   │  6. Complete Service         │  PATCH /api/services/:id/ │
   │     Status: completed        │         progress          │
   │     Progress: 100%           │                           │
   ├─────────────────────────────>│                           │
   │                              ├──────────────────────────>│
   │                              │  Status: completed        │
   │                              │  Progress: 100%           │
   │                              │  Completion Date: now     │
   │                              │  Calculate Actual Cost    │
   │  7. Service Completed!       │<──────────────────────────┤
   │<─────────────────────────────┤                           │
   │                              │                           │
```

---

## State Management Flow

```
┌──────────────────────────────────────────────────────────────┐
│              CustomerServiceRequests Component                │
└──────────────────────────────────────────────────────────────┘

State:
├── services: []                  // List of customer's services
├── vehicles: []                  // Customer's vehicles
├── loading: true                 // Loading state
├── showRequestModal: false       // Show/hide request modal
├── selectedService: null         // Service for details modal
└── formData: {                   // Form state
    ├── serviceType: "Oil Change"
    ├── name: ""
    ├── description: ""
    ├── vehicleId: ""
    ├── laborHours: 1
    ├── partsRequired: []
    └── customerNotes: ""
}

Effects:
├── useEffect(() => fetchMyServices(), [])
└── useEffect(() => fetchMyVehicles(), [])

Functions:
├── fetchMyServices()             // GET /api/services/my-services
├── fetchMyVehicles()             // GET /api/vehicles (filtered)
├── handleRequestService()        // POST /api/services/request
├── handleCancelService(id)       // PATCH /api/services/:id/cancel
├── getStatusColor(status)        // Returns Tailwind class
└── formatDate(dateString)        // Formats date for display


┌──────────────────────────────────────────────────────────────┐
│            EmployeeServiceManagement Component                │
└──────────────────────────────────────────────────────────────┘

State:
├── assignedServices: []          // Services assigned to employee
├── availableServices: []         // Claimable services
├── activeTab: "assigned"         // Current tab
├── loading: true
├── selectedService: null
├── showProgressModal: false
└── progressData: {               // Progress update form
    ├── status: ""
    ├── progress: 0
    └── notes: ""
}

Effects:
└── useEffect(() => fetchServices(), [activeTab])

Functions:
├── fetchServices()               // GET /api/services/assigned or available
├── handleClaimService(id)        // POST /api/services/:id/claim
├── handleUpdateProgress()        // PATCH /api/services/:id/progress
├── openProgressModal(service)    // Opens modal with pre-filled data
├── getStatusColor(status)
└── formatDate(dateString)


┌──────────────────────────────────────────────────────────────┐
│              AdminServiceManagement Component                 │
└──────────────────────────────────────────────────────────────┘

State:
├── services: []                  // All services in system
├── employees: []                 // All employees
├── loading: true
├── filterStatus: "all"           // Active filter
├── selectedService: null
├── showApproveModal: false
└── assignedEmployee: ""          // Selected employee for assignment

Effects:
├── useEffect(() => fetchServices(), [])
└── useEffect(() => fetchEmployees(), [])

Functions:
├── fetchServices()               // GET /api/services
├── fetchEmployees()              // GET /api/users (filtered)
├── handleApproveService()        // PATCH /api/services/:id/approve
├── handleDeleteService(id)       // DELETE /api/services/:id
├── openApprovalModal(service)
├── getStatusColor(status)
└── formatDate(dateString)

Computed:
├── filteredServices              // services filtered by status
└── stats: {                      // Dashboard statistics
    ├── total
    ├── requested
    ├── approved
    ├── ongoing
    └── completed
}
```

---

## Status Workflow

```
Service Status Lifecycle:

┌──────────┐         ┌─────────┐         ┌──────────┐
│requested │────────>│approved │────────>│ ongoing  │
└──────────┘         └─────────┘         └──────────┘
     │                    │                     │
     │                    │                     │
     ▼                    ▼                     ▼
┌──────────┐         ┌──────────────────────────────┐
│cancelled │         │         completed            │
└──────────┘         └──────────────────────────────┘

Transitions:
• requested → approved  : Admin approves
• requested → cancelled : Customer cancels
• approved → ongoing    : Employee claims
• approved → cancelled  : Customer cancels
• ongoing → completed   : Employee completes
• ongoing → ongoing     : Employee updates progress
```

---

## File Structure

```
frontend/
├── src/
│   ├── App.js                              (✏️ Updated - Added routes)
│   ├── pages/
│   │   ├── CustomerServiceRequests.js      (⭐ NEW)
│   │   ├── EmployeeServiceManagement.js    (⭐ NEW)
│   │   ├── AdminServiceManagement.js       (⭐ NEW)
│   │   ├── CustomerDashboard.js            (Existing)
│   │   ├── EmployeeDashboard.js            (Existing)
│   │   ├── AdminDashboard.js               (Existing)
│   │   └── ...other pages
│   ├── services/
│   │   └── api.js                          (✏️ Updated - Added 25+ APIs)
│   └── components/
│       ├── PrivateRoute.js                 (Existing)
│       ├── Header.js                       (Existing)
│       ├── Sidebar.js                      (Existing)
│       └── ...other components

Documentation/
├── FRONTEND_SERVICE_REQUESTS_GUIDE.md      (⭐ NEW - Complete guide)
├── FRONTEND_COMPLETE_SUMMARY.md            (⭐ NEW - Quick summary)
└── COMPONENT_ARCHITECTURE.md               (⭐ NEW - This file)
```

---

## API Endpoints Used

```javascript
// Customer Endpoints
POST   /api/services/request          // Request new service
GET    /api/services/my-services      // Get customer's services
GET    /api/services/:id              // Get specific service
PATCH  /api/services/:id/cancel       // Cancel service

// Employee Endpoints
GET    /api/services/assigned         // Get assigned services
GET    /api/services/available        // Get claimable services
POST   /api/services/:id/claim        // Claim service
PATCH  /api/services/:id/progress     // Update progress

// Admin Endpoints
GET    /api/services                  // Get all services
GET    /api/services/:id              // Get specific service
PATCH  /api/services/:id/approve      // Approve service
DELETE /api/services/:id              // Delete service

// Supporting Endpoints
GET    /api/vehicles                  // Get vehicles
GET    /api/users                     // Get users
```

---

## Authentication Flow

```
┌─────────────────────────────────────────────────────────────┐
│                  JWT Authentication Flow                     │
└─────────────────────────────────────────────────────────────┘

Login
  │
  ├──> POST /api/auth/login { email, password }
  │
  ├──> Backend validates credentials
  │
  ├──> Backend generates JWT token
  │
  └──> Response: { token, user: { id, name, role } }
         │
         ├──> Store token in localStorage
         ├──> Store user in localStorage
         │
         └──> Navigate to role-specific dashboard
              │
              ├──> Customer → /customer/*
              ├──> Employee → /employee/*
              └──> Admin → /admin/*


API Request with Auth
  │
  ├──> axios.interceptors.request.use()
  │
  ├──> Get token from localStorage
  │
  ├──> Add to headers: Authorization: Bearer <token>
  │
  └──> Send request to backend
         │
         └──> Backend verifies token
              │
              ├──> Valid → Process request
              └──> Invalid → Return 401
                      │
                      └──> Frontend redirects to /login
```

---

## Component Communication

```
Parent: App.js
   │
   ├──> PrivateRoute (HOC)
   │       │
   │       ├──> Checks authentication
   │       ├──> Checks role authorization
   │       │
   │       └──> Renders child component or redirects
   │
   └──> Child Components
           │
           ├──> CustomerServiceRequests
           │       │
           │       ├──> Uses api.js functions
           │       ├──> Manages own state
           │       └──> No props from parent
           │
           ├──> EmployeeServiceManagement
           │       │
           │       ├──> Uses api.js functions
           │       ├──> Manages own state
           │       └──> No props from parent
           │
           └──> AdminServiceManagement
                   │
                   ├──> Uses api.js functions
                   ├──> Manages own state
                   └──> No props from parent

Note: All components are self-contained with their own state management.
No Redux or Context API needed for this implementation.
```

---

## Responsive Design Breakpoints

```
Mobile First Approach (Tailwind CSS)

Default (Mobile):     < 640px
  └─> Single column layout
  └─> Stacked cards
  └─> Full-width modals

sm: (Small tablets)   ≥ 640px
  └─> 2-column grids where appropriate

md: (Tablets)         ≥ 768px
  └─> 3-4 column grids
  └─> Side-by-side layouts
  └─> Wider modals

lg: (Laptops)         ≥ 1024px
  └─> Full table layouts
  └─> Multi-column statistics
  └─> Optimal spacing

xl: (Desktops)        ≥ 1280px
  └─> Maximum width containers
  └─> Extra padding

2xl: (Large screens)  ≥ 1536px
  └─> Ultra-wide layouts
```

---

This architecture provides a **complete, scalable, and maintainable** frontend solution for your service request system! 🚀
