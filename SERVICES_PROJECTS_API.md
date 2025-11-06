# Services & Projects API Documentation

This document covers the **Services** and **Projects (Modifications)** API endpoints with role-based access control.

## Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [Service Requests API](#service-requests-api)
- [Project Requests API (Modifications)](#project-requests-api-modifications)
- [Cost Estimation](#cost-estimation)
- [Role-Based Access Summary](#role-based-access-summary)

---

## Overview

This API enables:

- **Customers** to request vehicle services and modifications
- **Employees** to manage assigned work and track progress
- **Admins** to oversee all operations

### Key Features

- ✅ Automatic cost estimation
- ✅ Role-based access control (Customer, Employee, Admin)
- ✅ Real-time progress tracking
- ✅ Status management workflow
- ✅ Milestone tracking for projects

---

## Authentication

All endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

User roles: `customer`, `employee`, `admin`

---

## Service Requests API

Base URL: `/api/services`

### Customer Endpoints

#### 1. Request a New Service

**POST** `/api/services/request`

**Role Required:** Customer

**Request Body:**

```json
{
  "serviceType": "Oil Change",
  "name": "Regular Oil Change Service",
  "description": "Need oil change for my vehicle",
  "vehicleId": "vehicle_object_id",
  "laborHours": 0.5, // Optional - will use default if not provided
  "partsRequired": [
    // Optional
    {
      "name": "Synthetic Oil 5W-30",
      "quantity": 5,
      "cost": 8.99
    }
  ],
  "customerNotes": "Please use synthetic oil"
}
```

**Service Types:**

- `Oil Change`
- `Tire Replacement`
- `Brake Service`
- `Engine Repair`
- `Transmission Service`
- `AC Service`
- `Battery Replacement`
- `General Inspection`
- `Other`

**Response:**

```json
{
  "service": {
    "_id": "service_id",
    "serviceType": "Oil Change",
    "name": "Regular Oil Change Service",
    "customer": {
      "_id": "customer_id",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "vehicle": {
      "_id": "vehicle_id",
      "make": "Toyota",
      "model": "Camry",
      "year": 2020,
      "plateNumber": "ABC123"
    },
    "estimatedCost": 95.15,
    "laborHours": 0.5,
    "status": "requested",
    "progress": 0,
    "requestedDate": "2025-11-05T10:00:00.000Z",
    "partsRequired": [...],
    "customerNotes": "Please use synthetic oil"
  },
  "costEstimate": {
    "baseCost": 40,
    "laborHours": 0.5,
    "laborRate": 50,
    "laborCost": 25,
    "partsCost": 44.95,
    "subtotal": 109.95,
    "contingency": 10.99,
    "estimatedTotal": 95.15,
    "breakdown": {
      "base": 40,
      "labor": 25,
      "parts": 44.95,
      "contingency": 10.99
    }
  }
}
```

#### 2. Get My Services

**GET** `/api/services/my-services`

**Role Required:** Customer

**Query Parameters:**

- `status` (optional): Filter by status (`requested`, `pending`, `approved`, `ongoing`, `completed`, `cancelled`)
- `vehicleId` (optional): Filter by vehicle

**Response:**

```json
[
  {
    "_id": "service_id",
    "serviceType": "Oil Change",
    "name": "Regular Oil Change Service",
    "vehicle": {...},
    "assignedTo": {...},
    "status": "ongoing",
    "progress": 50,
    "estimatedCost": 95.15,
    "requestedDate": "2025-11-05T10:00:00.000Z",
    "startDate": "2025-11-05T11:00:00.000Z"
  }
]
```

#### 3. Get Specific Service Details

**GET** `/api/services/my-services/:id`

**Role Required:** Customer

**Response:** Single service object with full details

#### 4. Cancel Service Request

**PATCH** `/api/services/my-services/:id/cancel`

**Role Required:** Customer

**Note:** Cannot cancel completed services

**Response:**

```json
{
  "msg": "Service cancelled successfully",
  "service": {...}
}
```

---

### Employee Endpoints

#### 1. Get Assigned Services

**GET** `/api/services/assigned`

**Role Required:** Employee

**Query Parameters:**

- `status` (optional): Filter by status

**Response:** Array of services assigned to the employee

#### 2. Get Available Services

**GET** `/api/services/available`

**Role Required:** Employee

**Description:** Get unassigned services that are pending or approved

**Response:** Array of available services

#### 3. Claim a Service

**POST** `/api/services/:id/claim`

**Role Required:** Employee

**Description:** Assign an available service to yourself

**Response:**

```json
{
  "msg": "Service claimed successfully",
  "service": {...}
}
```

#### 4. Update Service Progress

**PATCH** `/api/services/:id/progress`

**Role Required:** Employee

**Request Body:**

```json
{
  "status": "ongoing",  // Optional: requested, pending, approved, ongoing, completed, cancelled
  "progress": 75,       // Optional: 0-100
  "notes": "Replaced oil filter, using synthetic oil as requested",
  "actualLaborHours": 0.75,  // Optional - for completed services
  "actualParts": [...]       // Optional - for completed services
}
```

**Response:**

```json
{
  "msg": "Service updated successfully",
  "service": {...}
}
```

---

### Admin Endpoints

#### 1. List All Services

**GET** `/api/services/`

**Role Required:** Admin

**Query Parameters:**

- `status`: Filter by status
- `customerId`: Filter by customer
- `employeeId`: Filter by assigned employee
- `vehicleId`: Filter by vehicle

#### 2. Get Service

**GET** `/api/services/:id`

**Role Required:** Admin

#### 3. Create Service (Manual)

**POST** `/api/services/`

**Role Required:** Admin

**Request Body:** Full service object

#### 4. Update Service

**PUT** `/api/services/:id`

**Role Required:** Admin

**Request Body:** Fields to update

#### 5. Delete Service

**DELETE** `/api/services/:id`

**Role Required:** Admin

#### 6. Approve Service Request

**POST** `/api/services/:id/approve`

**Role Required:** Admin

**Request Body:**

```json
{
  "assignedTo": "employee_id" // Optional - assign to specific employee
}
```

---

## Project Requests API (Modifications)

Base URL: `/api/projects`

### Customer Endpoints

#### 1. Request a New Modification/Project

**POST** `/api/projects/request`

**Role Required:** Customer

**Request Body:**

```json
{
  "title": "Custom Performance Exhaust",
  "description": "Install performance exhaust system with headers",
  "modificationType": "Performance Upgrade",
  "vehicleId": "vehicle_object_id",
  "priority": "medium", // Optional: low, medium, high, urgent
  "laborHours": 8, // Optional
  "partsRequired": [
    // Optional
    {
      "name": "Performance Exhaust Kit",
      "quantity": 1,
      "cost": 1200,
      "supplier": "Performance Parts Inc"
    }
  ],
  "customerNotes": "Want a deeper sound but not too loud",
  "estimatedCompletionDate": "2025-11-20T00:00:00.000Z" // Optional
}
```

**Modification Types:**

- `Performance Upgrade`
- `Aesthetic Modification`
- `Custom Paint Job`
- `Interior Modification`
- `Audio System`
- `Suspension Upgrade`
- `Engine Tuning`
- `Body Kit Installation`
- `Other`

**Priority Levels:**

- `low` - Standard processing
- `medium` - Default
- `high` - Expedited (+15% cost)
- `urgent` - Rush service (+30% cost)

**Response:**

```json
{
  "project": {
    "_id": "project_id",
    "title": "Custom Performance Exhaust",
    "modificationType": "Performance Upgrade",
    "customer": {...},
    "vehicle": {...},
    "estimatedCost": 2415,
    "laborHours": 8,
    "priority": "medium",
    "status": "requested",
    "progress": 0,
    "requestedDate": "2025-11-05T10:00:00.000Z",
    "milestones": []
  },
  "costEstimate": {
    "baseCost": 500,
    "laborHours": 8,
    "laborRate": 100,
    "laborCost": 800,
    "partsCost": 1200,
    "priorityMultiplier": 1.0,
    "subtotal": 2500,
    "contingency": 375,
    "estimatedTotal": 2415,
    "breakdown": {...}
  }
}
```

#### 2. Get My Projects

**GET** `/api/projects/my-projects`

**Role Required:** Customer

**Query Parameters:**

- `status`: Filter by status
- `vehicleId`: Filter by vehicle

#### 3. Get Specific Project

**GET** `/api/projects/my-projects/:id`

**Role Required:** Customer

#### 4. Cancel Project Request

**PATCH** `/api/projects/my-projects/:id/cancel`

**Role Required:** Customer

**Note:** Cannot cancel if completed or more than 50% complete

---

### Employee Endpoints

#### 1. Get Assigned Projects

**GET** `/api/projects/assigned`

**Role Required:** Employee

**Query Parameters:**

- `status`: Filter by status

**Note:** Results sorted by priority (high first)

#### 2. Get Available Projects

**GET** `/api/projects/available`

**Role Required:** Employee

**Description:** Get unassigned projects

#### 3. Claim a Project

**POST** `/api/projects/:id/claim`

**Role Required:** Employee

#### 4. Update Project Progress

**PATCH** `/api/projects/:id/progress`

**Role Required:** Employee

**Request Body:**

```json
{
  "status": "ongoing",
  "progress": 60,
  "notes": "Headers installed, working on exhaust pipes",
  "milestones": [
    {
      "title": "Headers Installed",
      "description": "Performance headers installed and tested",
      "completed": true,
      "completedDate": "2025-11-06T14:00:00.000Z"
    }
  ],
  "actualLaborHours": 10,  // For completed projects
  "actualParts": [...]      // For completed projects
}
```

#### 5. Add Milestone

**POST** `/api/projects/:id/milestones`

**Role Required:** Employee

**Request Body:**

```json
{
  "title": "Paint Preparation Complete",
  "description": "Surface prepared and primed"
}
```

#### 6. Complete Milestone

**PATCH** `/api/projects/:id/milestones/complete`

**Role Required:** Employee

**Request Body:**

```json
{
  "milestoneId": "milestone_object_id"
}
```

**Note:** Automatically updates project progress based on completed milestones

---

### Admin Endpoints

#### 1. List All Projects

**GET** `/api/projects/`

**Role Required:** Admin

**Query Parameters:**

- `status`: Filter by status
- `customerId`: Filter by customer
- `employeeId`: Filter by employee
- `vehicleId`: Filter by vehicle
- `priority`: Filter by priority

#### 2. Get Project

**GET** `/api/projects/:id`

**Role Required:** Admin

#### 3. Create Project (Manual)

**POST** `/api/projects/`

**Role Required:** Admin

#### 4. Update Project

**PUT** `/api/projects/:id`

**Role Required:** Admin

#### 5. Delete Project

**DELETE** `/api/projects/:id`

**Role Required:** Admin

#### 6. Approve Project Request

**POST** `/api/projects/:id/approve`

**Role Required:** Admin

**Request Body:**

```json
{
  "assignedTo": "employee_id", // Optional
  "estimatedCompletionDate": "2025-11-30T00:00:00.000Z", // Optional
  "priority": "high" // Optional - adjust priority
}
```

---

## Cost Estimation

### Service Cost Calculation

**Formula:**

```
Total = Base Cost + Labor Cost + Parts Cost + Contingency (10%)
Labor Cost = Labor Hours × Labor Rate
Parts Cost = Sum of (Quantity × Cost) for all parts
```

**Base Labor Rates:**

- Standard Service: $50/hour
- Specialized Repair: $75/hour
- Modifications: $100/hour

**Example Service Costs:**
| Service Type | Base Cost | Est. Hours | Labor Rate |
|--------------|-----------|------------|------------|
| Oil Change | $40 | 0.5 | $50/hr |
| Tire Replacement | $80 | 1.0 | $50/hr |
| Brake Service | $150 | 2.0 | $75/hr |
| Engine Repair | $300 | 4.0 | $75/hr |

### Project Cost Calculation

**Formula:**

```
Subtotal = Base Cost + Labor Cost + Parts Cost
Priority Adjustment = Subtotal × Priority Multiplier
Total = Priority Adjustment + Contingency (15%)
```

**Priority Multipliers:**

- Low/Medium: 1.0 (no adjustment)
- High: 1.15 (+15%)
- Urgent: 1.30 (+30%)

**Example Project Costs:**
| Modification Type | Base Cost | Est. Hours | Labor Rate |
|-------------------|-----------|------------|------------|
| Performance Upgrade | $500 | 8 | $100/hr |
| Custom Paint Job | $800 | 12 | $100/hr |
| Audio System | $300 | 4 | $100/hr |
| Engine Tuning | $1000 | 15 | $100/hr |

---

## Role-Based Access Summary

### Customer Capabilities

✅ Request services and modifications for their vehicles  
✅ View their own service/project history  
✅ Track real-time progress  
✅ Cancel pending requests  
✅ Receive automatic cost estimates  
❌ Cannot see other customers' data  
❌ Cannot modify employee work

### Employee Capabilities

✅ View assigned services and projects  
✅ Claim available work  
✅ Update progress and status  
✅ Add milestones and notes  
✅ Mark work as completed  
✅ View customer and vehicle details for assigned work  
❌ Cannot access unassigned customer data  
❌ Cannot delete records

### Admin Capabilities

✅ Full CRUD operations on all services and projects  
✅ Approve/reject requests  
✅ Assign work to employees  
✅ View all customer and employee data  
✅ Override any restrictions  
✅ Generate reports and analytics

---

## Status Workflow

### Service Status Flow

```
requested → pending → approved → ongoing → completed
           ↓                        ↓
      cancelled                cancelled
```

### Project Status Flow

```
requested → pending → approved → ongoing → completed
           ↓           ↓            ↓
      cancelled   cancelled    cancelled*
```

\*Projects >50% complete cannot be cancelled by customer

---

## Error Responses

All endpoints return standard error responses:

```json
{
  "msg": "Error description"
}
```

**HTTP Status Codes:**

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (no token or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

---

## Testing the API

### 1. Customer Flow Example

```bash
# Login as customer
POST /api/auth/login
{
  "email": "customer@example.com",
  "password": "password123"
}

# Get auth token from response, then:

# Request a service
POST /api/services/request
Authorization: Bearer <token>
{
  "serviceType": "Oil Change",
  "name": "Regular Maintenance",
  "vehicleId": "<your-vehicle-id>",
  "customerNotes": "Please check tire pressure too"
}

# Check service status
GET /api/services/my-services
Authorization: Bearer <token>
```

### 2. Employee Flow Example

```bash
# Login as employee
POST /api/auth/login
{
  "email": "employee@example.com",
  "password": "password123"
}

# View available work
GET /api/services/available
Authorization: Bearer <token>

# Claim a service
POST /api/services/<service-id>/claim
Authorization: Bearer <token>

# Update progress
PATCH /api/services/<service-id>/progress
Authorization: Bearer <token>
{
  "status": "ongoing",
  "progress": 50,
  "notes": "Oil changed, checking filters"
}
```

---

## Additional Notes

1. **Automatic Cost Estimation**: All service and project requests automatically calculate estimated costs based on type, labor hours, and parts.

2. **Real-time Updates**: Progress updates from employees are immediately visible to customers when they query their services/projects.

3. **Vehicle Ownership Verification**: Customers can only request services for vehicles they own.

4. **Timestamps**: All records include `createdAt` and `updatedAt` timestamps.

5. **Population**: Related data (customer, vehicle, employee) is automatically populated in responses for convenience.

6. **Validation**: All endpoints validate input data and return meaningful error messages.

7. **Indexes**: Database indexes are configured for efficient queries on common filters (customer, status, assignedTo, vehicle).
