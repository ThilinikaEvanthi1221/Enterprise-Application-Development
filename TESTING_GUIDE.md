# Quick Testing Guide

## Prerequisites

1. Ensure backend server is running: `node backend/server.js`
2. Have MongoDB running and connected
3. Have test users created with different roles:
   - Customer account
   - Employee account
   - Admin account

---

## Test Data Setup

### 1. Create Test Vehicle (as Customer)

```bash
POST http://localhost:5000/api/vehicles
Authorization: Bearer <customer-token>
Content-Type: application/json

{
  "plateNumber": "TEST123",
  "make": "Toyota",
  "model": "Camry",
  "year": 2020
}
```

Save the `_id` from response as `VEHICLE_ID`

---

## Customer Flow Testing

### 1. Login as Customer

```bash
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "customer@example.com",
  "password": "password123"
}
```

Save the token as `CUSTOMER_TOKEN`

### 2. Request a Service

```bash
POST http://localhost:5000/api/services/request
Authorization: Bearer <CUSTOMER_TOKEN>
Content-Type: application/json

{
  "serviceType": "Oil Change",
  "name": "Regular Oil Change",
  "description": "Need synthetic oil change",
  "vehicleId": "<VEHICLE_ID>",
  "partsRequired": [
    {
      "name": "Synthetic Oil 5W-30",
      "quantity": 5,
      "cost": 8.99
    },
    {
      "name": "Oil Filter",
      "quantity": 1,
      "cost": 12.99
    }
  ],
  "customerNotes": "Please check tire pressure"
}
```

**Expected Response:**

- Status: 201
- Returns service object with `estimatedCost`
- Returns cost breakdown
- Service status: "requested"

Save `service._id` as `SERVICE_ID`

### 3. Request a Modification/Project

```bash
POST http://localhost:5000/api/projects/request
Authorization: Bearer <CUSTOMER_TOKEN>
Content-Type: application/json

{
  "title": "Performance Exhaust Installation",
  "description": "Install aftermarket performance exhaust system",
  "modificationType": "Performance Upgrade",
  "vehicleId": "<VEHICLE_ID>",
  "priority": "medium",
  "partsRequired": [
    {
      "name": "Performance Exhaust Kit",
      "quantity": 1,
      "cost": 1200,
      "supplier": "Performance Parts Inc"
    }
  ],
  "customerNotes": "Want deeper sound but not too loud"
}
```

**Expected Response:**

- Status: 201
- Returns project with `estimatedCost`
- Cost includes base + labor + parts + contingency
- Status: "requested"

Save `project._id` as `PROJECT_ID`

### 4. View My Services

```bash
GET http://localhost:5000/api/services/my-services
Authorization: Bearer <CUSTOMER_TOKEN>
```

**Expected:** Array of customer's services

### 5. View My Projects

```bash
GET http://localhost:5000/api/projects/my-projects
Authorization: Bearer <CUSTOMER_TOKEN>
```

**Expected:** Array of customer's projects

### 6. View Specific Service

```bash
GET http://localhost:5000/api/services/my-services/<SERVICE_ID>
Authorization: Bearer <CUSTOMER_TOKEN>
```

### 7. Cancel Service (before completion)

```bash
PATCH http://localhost:5000/api/services/my-services/<SERVICE_ID>/cancel
Authorization: Bearer <CUSTOMER_TOKEN>
```

**Expected:** Service status changes to "cancelled"

---

## Employee Flow Testing

### 1. Login as Employee

```bash
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "employee@example.com",
  "password": "password123"
}
```

Save token as `EMPLOYEE_TOKEN`

### 2. View Available Services

```bash
GET http://localhost:5000/api/services/available
Authorization: Bearer <EMPLOYEE_TOKEN>
```

**Expected:** List of approved/pending services without assigned employee

### 3. Claim a Service

```bash
POST http://localhost:5000/api/services/<SERVICE_ID>/claim
Authorization: Bearer <EMPLOYEE_TOKEN>
```

**Expected:**

- Service assigned to employee
- Status changes to "ongoing"
- `startDate` set to now

### 4. Update Service Progress

```bash
PATCH http://localhost:5000/api/services/<SERVICE_ID>/progress
Authorization: Bearer <EMPLOYEE_TOKEN>
Content-Type: application/json

{
  "status": "ongoing",
  "progress": 50,
  "notes": "Oil drained, replacing filter"
}
```

**Expected:** Service updated with new progress and notes

### 5. Complete Service

```bash
PATCH http://localhost:5000/api/services/<SERVICE_ID>/progress
Authorization: Bearer <EMPLOYEE_TOKEN>
Content-Type: application/json

{
  "status": "completed",
  "progress": 100,
  "notes": "Service completed successfully",
  "actualLaborHours": 0.75,
  "actualParts": [
    {
      "name": "Synthetic Oil 5W-30",
      "quantity": 5,
      "cost": 8.99
    },
    {
      "name": "Oil Filter",
      "quantity": 1,
      "cost": 12.99
    }
  ]
}
```

**Expected:**

- Status: "completed"
- Progress: 100
- `completionDate` set
- `actualCost` calculated

### 6. View Assigned Projects

```bash
GET http://localhost:5000/api/projects/assigned
Authorization: Bearer <EMPLOYEE_TOKEN>
```

### 7. Claim a Project

```bash
POST http://localhost:5000/api/projects/<PROJECT_ID>/claim
Authorization: Bearer <EMPLOYEE_TOKEN>
```

### 8. Add Milestone to Project

```bash
POST http://localhost:5000/api/projects/<PROJECT_ID>/milestones
Authorization: Bearer <EMPLOYEE_TOKEN>
Content-Type: application/json

{
  "title": "Parts Ordered",
  "description": "Performance exhaust kit ordered from supplier"
}
```

### 9. Update Project Progress

```bash
PATCH http://localhost:5000/api/projects/<PROJECT_ID>/progress
Authorization: Bearer <EMPLOYEE_TOKEN>
Content-Type: application/json

{
  "status": "ongoing",
  "progress": 30,
  "notes": "Removed old exhaust system, preparing for installation"
}
```

### 10. Complete Milestone

```bash
PATCH http://localhost:5000/api/projects/<PROJECT_ID>/milestones/complete
Authorization: Bearer <EMPLOYEE_TOKEN>
Content-Type: application/json

{
  "milestoneId": "<MILESTONE_ID>"
}
```

**Expected:** Progress auto-updates based on completed milestones

---

## Admin Flow Testing

### 1. Login as Admin

```bash
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "password123"
}
```

Save token as `ADMIN_TOKEN`

### 2. View All Services

```bash
GET http://localhost:5000/api/services/
Authorization: Bearer <ADMIN_TOKEN>
```

**Query Parameters:**

- `?status=requested` - Filter by status
- `?customerId=<ID>` - Filter by customer
- `?employeeId=<ID>` - Filter by employee
- `?vehicleId=<ID>` - Filter by vehicle

### 3. Approve Service Request

```bash
POST http://localhost:5000/api/services/<SERVICE_ID>/approve
Authorization: Bearer <ADMIN_TOKEN>
Content-Type: application/json

{
  "assignedTo": "<EMPLOYEE_ID>"
}
```

**Expected:**

- Status changes to "approved"
- Employee assigned if provided

### 4. View All Projects

```bash
GET http://localhost:5000/api/projects/
Authorization: Bearer <ADMIN_TOKEN>
```

### 5. Approve Project with Priority

```bash
POST http://localhost:5000/api/projects/<PROJECT_ID>/approve
Authorization: Bearer <ADMIN_TOKEN>
Content-Type: application/json

{
  "assignedTo": "<EMPLOYEE_ID>",
  "priority": "high",
  "estimatedCompletionDate": "2025-12-01T00:00:00.000Z"
}
```

### 6. Update Any Service

```bash
PUT http://localhost:5000/api/services/<SERVICE_ID>
Authorization: Bearer <ADMIN_TOKEN>
Content-Type: application/json

{
  "status": "ongoing",
  "notes": "Admin override - expediting service"
}
```

### 7. Delete Service

```bash
DELETE http://localhost:5000/api/services/<SERVICE_ID>
Authorization: Bearer <ADMIN_TOKEN>
```

---

## Error Testing (Should Fail)

### 1. Customer tries to access another customer's service

```bash
GET http://localhost:5000/api/services/my-services/<OTHER_CUSTOMER_SERVICE_ID>
Authorization: Bearer <CUSTOMER_TOKEN>
```

**Expected:** 403 Forbidden

### 2. Customer tries to request service for someone else's vehicle

```bash
POST http://localhost:5000/api/services/request
Authorization: Bearer <CUSTOMER_TOKEN>
Content-Type: application/json

{
  "serviceType": "Oil Change",
  "name": "Test",
  "vehicleId": "<SOMEONE_ELSE_VEHICLE_ID>"
}
```

**Expected:** 403 Forbidden

### 3. Employee tries to update unassigned service

```bash
PATCH http://localhost:5000/api/services/<UNASSIGNED_SERVICE_ID>/progress
Authorization: Bearer <EMPLOYEE_TOKEN>
Content-Type: application/json

{
  "progress": 50
}
```

**Expected:** Works! (Employee can update if not assigned to someone else)

### 4. Employee tries to update another employee's service

```bash
PATCH http://localhost:5000/api/services/<OTHER_EMPLOYEE_SERVICE_ID>/progress
Authorization: Bearer <EMPLOYEE_TOKEN>
```

**Expected:** 403 Forbidden

### 5. Customer tries to cancel completed service

```bash
PATCH http://localhost:5000/api/services/my-services/<COMPLETED_SERVICE_ID>/cancel
Authorization: Bearer <CUSTOMER_TOKEN>
```

**Expected:** 400 Bad Request - "Cannot cancel a completed service"

### 6. Customer tries to cancel project >50% complete

```bash
# First, have employee update project to 60% progress
# Then try to cancel
PATCH http://localhost:5000/api/projects/my-projects/<PROJECT_ID>/cancel
Authorization: Bearer <CUSTOMER_TOKEN>
```

**Expected:** 400 Bad Request - "Cannot cancel project that is more than 50% complete"

### 7. Non-authenticated request

```bash
GET http://localhost:5000/api/services/my-services
# No Authorization header
```

**Expected:** 401 Unauthorized

### 8. Customer tries to access admin endpoint

```bash
GET http://localhost:5000/api/services/
Authorization: Bearer <CUSTOMER_TOKEN>
```

**Expected:** 403 Forbidden - "Admins only"

---

## Cost Estimation Testing

### Test 1: Basic Service Cost

Request Oil Change with no custom parts:

**Expected Calculation:**

```
Base: $40
Labor: 0.5 hours × $50/hr = $25
Parts: $0
Subtotal: $65
Contingency (10%): $6.50
TOTAL: $71.50
```

### Test 2: Service with Parts

Request Oil Change with parts:

**Input:**

```json
{
  "partsRequired": [
    { "name": "Synthetic Oil", "quantity": 5, "cost": 8.99 },
    { "name": "Oil Filter", "quantity": 1, "cost": 12.99 }
  ]
}
```

**Expected Calculation:**

```
Base: $40
Labor: 0.5 hours × $50/hr = $25
Parts: (5 × $8.99) + (1 × $12.99) = $57.94
Subtotal: $122.94
Contingency (10%): $12.29
TOTAL: $135.23
```

### Test 3: Project with High Priority

Request Performance Upgrade with high priority:

**Input:**

```json
{
  "modificationType": "Performance Upgrade",
  "priority": "high",
  "partsRequired": [{ "name": "Turbo Kit", "quantity": 1, "cost": 2000 }]
}
```

**Expected Calculation:**

```
Base: $500
Labor: 8 hours × $100/hr = $800
Parts: $2000
Subtotal: $3300
Priority Adjustment (high +15%): $3795
Contingency (15%): $569.25
TOTAL: $4364.25
```

### Test 4: Urgent Project

Same as above but with `"priority": "urgent"`

**Expected:**

- Priority multiplier: 1.3 (+30%)
- Higher total than "high" priority

---

## Performance Testing

### Test Concurrent Requests

Use tools like Apache Bench or Postman Runner:

```bash
# Test 100 concurrent service list requests
ab -n 100 -c 10 -H "Authorization: Bearer <TOKEN>" \
   http://localhost:5000/api/services/my-services
```

### Test Database Indexes

All these should be fast (< 50ms for small datasets):

```bash
# Filter by customer
GET /api/services/?customerId=<ID>

# Filter by status
GET /api/services/?status=ongoing

# Filter by employee
GET /api/services/?employeeId=<ID>

# Filter by vehicle
GET /api/services/?vehicleId=<ID>

# Combined filters
GET /api/projects/?status=ongoing&priority=high
```

---

## Postman Collection

To make testing easier, create a Postman collection with:

1. **Environment Variables:**

   - `BASE_URL`: `http://localhost:5000`
   - `CUSTOMER_TOKEN`: (set after customer login)
   - `EMPLOYEE_TOKEN`: (set after employee login)
   - `ADMIN_TOKEN`: (set after admin login)
   - `VEHICLE_ID`: (set after creating vehicle)
   - `SERVICE_ID`: (set after creating service)
   - `PROJECT_ID`: (set after creating project)

2. **Folders:**

   - Authentication (login endpoints)
   - Customer Services
   - Customer Projects
   - Employee Services
   - Employee Projects
   - Admin Services
   - Admin Projects

3. **Tests Scripts:**
   Add to login requests:

   ```javascript
   pm.test("Status code is 200", function () {
     pm.response.to.have.status(200);
   });

   pm.test("Response has token", function () {
     var jsonData = pm.response.json();
     pm.expect(jsonData.token).to.exist;
     pm.environment.set("CUSTOMER_TOKEN", jsonData.token);
   });
   ```

---

## Common Issues & Troubleshooting

### Issue: "No token, authorization denied"

**Solution:** Include `Authorization: Bearer <token>` header

### Issue: "Vehicle not found"

**Solution:** Create vehicle first or use valid vehicle ID

### Issue: "Service not found"

**Solution:** Use correct service/project ID from creation response

### Issue: "Access denied" (Customer accessing service)

**Solution:** Ensure service belongs to the logged-in customer

### Issue: "This service is not assigned to you" (Employee)

**Solution:** Employee can only update services assigned to them

### Issue: Cost not calculating

**Solution:** Check that `serviceType` or `modificationType` is one of the predefined types

### Issue: Milestone progress not updating

**Solution:** Ensure milestones array has items before completing them

---

## Success Criteria Checklist

- [ ] Customer can request service and receive cost estimate
- [ ] Customer can request modification/project with priority
- [ ] Customer can view only their own services/projects
- [ ] Customer can cancel pending requests
- [ ] Employee can view assigned work
- [ ] Employee can claim available work
- [ ] Employee can update progress (0-100%)
- [ ] Employee can add milestones to projects
- [ ] Employee cannot access other employees' work
- [ ] Admin can view all services/projects
- [ ] Admin can approve requests
- [ ] Admin can assign work to employees
- [ ] Admin can update/delete any record
- [ ] Cost estimation works correctly
- [ ] Priority affects project costs correctly
- [ ] Status workflow enforced properly
- [ ] Vehicle ownership verified
- [ ] All endpoints return proper error codes
- [ ] Population works (customer, vehicle, employee data included)
- [ ] Timestamps are set correctly

---

## Production Checklist

Before deploying:

- [ ] Add rate limiting
- [ ] Add request validation middleware
- [ ] Add API documentation (Swagger/OpenAPI)
- [ ] Add logging (Winston/Morgan)
- [ ] Add monitoring (DataDog/New Relic)
- [ ] Set up proper CORS for frontend domain
- [ ] Use environment variables for all configs
- [ ] Add database backup strategy
- [ ] Add error tracking (Sentry)
- [ ] Add automated tests (Jest/Mocha)
- [ ] Set up CI/CD pipeline
- [ ] Configure HTTPS
- [ ] Add API versioning
- [ ] Document deployment process
- [ ] Set up health check endpoint
