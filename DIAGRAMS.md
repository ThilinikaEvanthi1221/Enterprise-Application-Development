# System Architecture & Flow Diagrams

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                         │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │  Customer       │  │   Employee      │  │   Admin         │ │
│  │  Dashboard      │  │   Portal        │  │   Panel         │ │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘ │
└───────────┼────────────────────┼────────────────────┼──────────┘
            │                    │                    │
            │ HTTP/REST API (JWT Authentication)      │
            │                    │                    │
┌───────────┼────────────────────┼────────────────────┼──────────┐
│           ▼                    ▼                    ▼          │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              MIDDLEWARE (Auth & Validation)              │  │
│  │  • verifyToken        • requireEmployee                  │  │
│  │  • requireCustomer    • requireAdmin                     │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                   ROUTES (API Endpoints)                  │  │
│  │  /api/services/*          /api/projects/*                │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    CONTROLLERS                            │  │
│  │  servicesController.js    projectsController.js          │  │
│  │  • Customer functions     • Employee functions           │  │
│  │  • Employee functions     • Admin functions              │  │
│  │  • Admin functions                                       │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                 BUSINESS LOGIC                            │  │
│  │  costEstimator.js - Automatic cost calculation           │  │
│  │  • Service cost estimation                               │  │
│  │  • Project cost estimation (with priority)               │  │
│  │  • Actual cost calculation                               │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                   DATA MODELS                             │  │
│  │  Service Model         Project Model      Vehicle Model  │  │
│  │  • Status workflow     • Milestones       • Owner link   │  │
│  │  • Cost tracking       • Priority         • Details      │  │
│  │  • Progress (0-100%)   • Progress                        │  │
│  └──────────────────────────────────────────────────────────┘  │
│                             │                                   │
│                   BACKEND (Node.js + Express)                  │
└─────────────────────────────┼─────────────────────────────────┘
                              │
                              ▼
                   ┌──────────────────────┐
                   │   MongoDB Database   │
                   │  • users             │
                   │  • vehicles          │
                   │  • services          │
                   │  • projects          │
                   └──────────────────────┘
```

---

## Customer Service Request Flow

```
┌──────────┐
│ Customer │
└────┬─────┘
     │
     │ 1. Login (get JWT token)
     ▼
┌────────────────────────┐
│  POST /api/auth/login  │
└────────┬───────────────┘
         │
         │ 2. Request service
         ▼
┌──────────────────────────────────┐
│  POST /api/services/request      │
│  {                               │
│    serviceType: "Oil Change",    │
│    vehicleId: "...",             │
│    partsRequired: [...]          │
│  }                               │
└────────┬─────────────────────────┘
         │
         │ 3. System validates & calculates cost
         ▼
┌─────────────────────────┐
│  costEstimator.js       │
│  • Base cost: $40       │
│  • Labor: $25           │
│  • Parts: $45           │
│  • Contingency: $11     │
│  = Total: $121          │
└────────┬────────────────┘
         │
         │ 4. Service created with status "requested"
         ▼
┌─────────────────────────┐
│  Service saved to DB    │
│  {                      │
│    status: "requested", │
│    estimatedCost: 121,  │
│    progress: 0          │
│  }                      │
└────────┬────────────────┘
         │
         │ 5. Response with cost breakdown
         ▼
┌──────────┐              ┌──────────┐
│ Customer │──watches───▶ │ Progress │
└──────────┘              │   0%     │
                          └──────────┘
```

---

## Employee Workflow

```
┌──────────┐
│ Employee │
└────┬─────┘
     │
     │ 1. View available work
     ▼
┌────────────────────────────┐
│ GET /api/services/available│
│                            │
│ Returns:                   │
│ - Pending services         │
│ - Approved services        │
│ - Unassigned services      │
└────────┬───────────────────┘
         │
         │ 2. Claim a service
         ▼
┌─────────────────────────────┐
│ POST /api/services/:id/claim│
│                             │
│ System:                     │
│ • assignedTo = employee     │
│ • status = "ongoing"        │
│ • startDate = now           │
└────────┬────────────────────┘
         │
         │ 3. Work on service
         │
         │ 4. Update progress
         ▼
┌──────────────────────────────────┐
│ PATCH /api/services/:id/progress │
│ {                                │
│   progress: 50,                  │
│   status: "ongoing",             │
│   notes: "Oil changed..."        │
│ }                                │
└────────┬─────────────────────────┘
         │
         │ Customer sees update immediately
         │
         │ 5. Complete service
         ▼
┌──────────────────────────────────┐
│ PATCH /api/services/:id/progress │
│ {                                │
│   progress: 100,                 │
│   status: "completed",           │
│   actualLaborHours: 0.75         │
│ }                                │
└────────┬─────────────────────────┘
         │
         │ 6. System calculates actual cost
         ▼
┌─────────────────────────┐
│  Actual cost = $130     │
│  (vs estimated $121)    │
│  completionDate = now   │
└─────────────────────────┘
```

---

## Admin Approval Flow

```
┌────────────┐
│   Admin    │
└─────┬──────┘
      │
      │ 1. View all requests
      ▼
┌──────────────────────────┐
│ GET /api/services/       │
│ ?status=requested        │
│                          │
│ Returns all pending      │
│ service requests         │
└──────┬───────────────────┘
       │
       │ 2. Review request
       ▼
┌──────────────────────────┐
│ GET /api/services/:id    │
│                          │
│ View details:            │
│ • Customer info          │
│ • Vehicle details        │
│ • Estimated cost         │
│ • Customer notes         │
└──────┬───────────────────┘
       │
       │ 3. Approve & assign
       ▼
┌─────────────────────────────┐
│ POST /api/services/:id/     │
│      approve                │
│ {                           │
│   assignedTo: "employee_id" │
│ }                           │
└──────┬──────────────────────┘
       │
       │ 4. System updates
       ▼
┌────────────────────────┐
│ Service updated:       │
│ • status = "approved"  │
│ • assignedTo set       │
│ • Employee notified    │
└────────────────────────┘
```

---

## Project (Modification) Milestone Flow

```
┌──────────┐
│ Customer │ Request modification
└────┬─────┘
     │
     ▼
┌────────────────────────┐
│ Project Created        │
│ status: "requested"    │
│ priority: "high"       │
│ estimatedCost: $3000   │
└────────┬───────────────┘
         │
         ▼ Admin approves
┌────────────────────────┐
│ status: "approved"     │
└────────┬───────────────┘
         │
         ▼ Employee claims
┌────────────────────────┐
│ Employee adds          │
│ milestones:            │
│                        │
│ 1. Parts Ordered       │
│ 2. Old parts removed   │
│ 3. New parts installed │
│ 4. Testing complete    │
│                        │
│ progress: 0%           │
└────────┬───────────────┘
         │
         ▼ Complete milestone 1
┌────────────────────────┐
│ Milestone 1 ✓          │
│ progress: 25%          │
│ (1 of 4 complete)      │
└────────┬───────────────┘
         │
         ▼ Complete milestone 2
┌────────────────────────┐
│ Milestone 2 ✓          │
│ progress: 50%          │
│ (2 of 4 complete)      │
└────────┬───────────────┘
         │
         ▼ Complete milestone 3
┌────────────────────────┐
│ Milestone 3 ✓          │
│ progress: 75%          │
│ (3 of 4 complete)      │
└────────┬───────────────┘
         │
         ▼ Complete milestone 4
┌────────────────────────┐
│ ALL MILESTONES ✓       │
│ progress: 100%         │
│ status: "completed"    │
│ actualCost calculated  │
└────────────────────────┘
```

---

## Cost Estimation Flow

```
┌─────────────────────┐
│ Customer requests   │
│ service/project     │
└──────────┬──────────┘
           │
           ▼
┌────────────────────────────┐
│ costEstimator.js           │
│ receives:                  │
│ • serviceType/modType      │
│ • laborHours (optional)    │
│ • partsRequired            │
│ • priority (for projects)  │
└──────────┬─────────────────┘
           │
           ▼
┌────────────────────────────┐
│ Step 1: Get base info      │
│                            │
│ SERVICE_BASE_COSTS or      │
│ MODIFICATION_BASE_COSTS    │
│                            │
│ Returns:                   │
│ • baseCost                 │
│ • default laborHours       │
│ • laborRate                │
└──────────┬─────────────────┘
           │
           ▼
┌────────────────────────────┐
│ Step 2: Calculate labor    │
│                            │
│ laborCost =                │
│   hours × laborRate        │
│                            │
│ Example:                   │
│ 8 hours × $100/hr = $800   │
└──────────┬─────────────────┘
           │
           ▼
┌────────────────────────────┐
│ Step 3: Calculate parts    │
│                            │
│ partsCost = Σ(qty × cost)  │
│                            │
│ Example:                   │
│ 5 × $9 + 1 × $13 = $58     │
└──────────┬─────────────────┘
           │
           ▼
┌────────────────────────────┐
│ Step 4: Apply priority     │
│ (Projects only)            │
│                            │
│ low/medium: × 1.0          │
│ high:       × 1.15 (+15%)  │
│ urgent:     × 1.30 (+30%)  │
└──────────┬─────────────────┘
           │
           ▼
┌────────────────────────────┐
│ Step 5: Add contingency    │
│                            │
│ Services:  +10%            │
│ Projects:  +15%            │
│                            │
│ Buffer for unexpected work │
└──────────┬─────────────────┘
           │
           ▼
┌────────────────────────────┐
│ Return breakdown:          │
│                            │
│ {                          │
│   baseCost: 500,           │
│   laborCost: 800,          │
│   partsCost: 1200,         │
│   subtotal: 2500,          │
│   contingency: 375,        │
│   estimatedTotal: 2875     │
│ }                          │
└────────────────────────────┘
```

---

## Status Workflow Diagram

```
SERVICE/PROJECT STATUS FLOW
───────────────────────────

Customer Request
      │
      ▼
┌──────────┐
│REQUESTED │ ◀── Customer creates request
└────┬─────┘
     │
     │ Admin reviews
     │
     ▼
┌──────────┐
│ PENDING  │ ◀── Under review
└────┬─────┘
     │
     │ Admin approves
     │
     ▼
┌──────────┐
│APPROVED  │ ◀── Waiting for employee
└────┬─────┘
     │
     │ Employee claims
     │
     ▼
┌──────────┐
│ ONGOING  │ ◀── Work in progress
└────┬─────┘     progress: 0-99%
     │
     │ Employee completes
     │
     ▼
┌──────────┐
│COMPLETED │ ◀── Work finished
└──────────┘     progress: 100%

CANCELLATION PATHS
──────────────────

REQUESTED ──┐
PENDING ────┼──▶ CANCELLED
APPROVED ───┤
ONGOING* ───┘

*Services: Can cancel anytime
*Projects: Only if progress < 50%
```

---

## Data Relationships

```
┌────────┐
│  User  │
│ (Model)│
└───┬────┘
    │
    │ 1:many (owns)
    │
    ▼
┌──────────┐
│ Vehicle  │
│  (Model) │
└─────┬────┘
      │
      │ 1:many (has)
      │
      ├────────────────────┐
      │                    │
      ▼                    ▼
┌──────────┐         ┌──────────┐
│ Service  │         │ Project  │
│  (Model) │         │  (Model) │
└─────┬────┘         └─────┬────┘
      │                    │
      │ many:1             │ many:1
      │ (assigned to)      │ (assigned to)
      │                    │
      └────────┬───────────┘
               │
               ▼
          ┌────────┐
          │  User  │
          │(Employee)
          └────────┘

RELATIONSHIPS:
──────────────

Customer (User)
   └─► owns many Vehicles
       └─► has many Services
       └─► has many Projects

Employee (User)
   └─► assigned to many Services
   └─► assigned to many Projects

Service
   ├─► belongs to one Customer
   ├─► belongs to one Vehicle
   └─► assigned to one Employee

Project
   ├─► belongs to one Customer
   ├─► belongs to one Vehicle
   ├─► assigned to one Employee
   └─► has many Milestones (embedded)
```

---

## Role Permissions Matrix

```
                    CUSTOMER    EMPLOYEE    ADMIN
──────────────────────────────────────────────────

SERVICES
────────
Create Request         ✓           ✗          ✓
View Own               ✓           ✗          ✓
View All               ✗           ✗          ✓
View Assigned          ✗           ✓          ✓
Claim Available        ✗           ✓          ✗
Update Own             ✗           ✗          ✗
Update Assigned        ✗           ✓          ✓
Update Any             ✗           ✗          ✓
Delete                 ✗           ✗          ✓
Approve                ✗           ✗          ✓
Cancel Own             ✓           ✗          ✓

PROJECTS
────────
Create Request         ✓           ✗          ✓
View Own               ✓           ✗          ✓
View All               ✗           ✗          ✓
View Assigned          ✗           ✓          ✓
Claim Available        ✗           ✓          ✗
Update Assigned        ✗           ✓          ✓
Update Any             ✗           ✗          ✓
Add Milestones         ✗           ✓          ✓
Delete                 ✗           ✗          ✓
Approve                ✗           ✗          ✓
Cancel Own*            ✓           ✗          ✓

VEHICLES
────────
Create Own             ✓           ✗          ✓
View Own               ✓           ✗          ✓
View All               ✗           ✗          ✓
Update Own             ✓           ✗          ✓
Delete Own             ✓           ✗          ✓

*Cancel own project only if progress < 50%

Legend:
✓ = Allowed
✗ = Denied
```

---

## Performance Considerations

```
DATABASE INDEXES
────────────────

Services Collection:
┌───────────────────────────┐
│ { customer: 1, status: 1 }│ ◀── Customer queries
├───────────────────────────┤
│ { assignedTo: 1, status:1}│ ◀── Employee queries
├───────────────────────────┤
│ { vehicle: 1 }            │ ◀── Vehicle history
└───────────────────────────┘

Projects Collection:
┌───────────────────────────────┐
│ { customer: 1, status: 1 }    │ ◀── Customer queries
├───────────────────────────────┤
│ { assignedTo: 1, status: 1 }  │ ◀── Employee queries
├───────────────────────────────┤
│ { vehicle: 1 }                │ ◀── Vehicle history
├───────────────────────────────┤
│ { status: 1, priority: -1 }   │ ◀── Priority sorting
└───────────────────────────────┘

QUERY OPTIMIZATION
──────────────────

✓ Use indexes for filters
✓ Populate only needed fields
✓ Limit result sets
✓ Use projection to exclude large fields
✓ Cache frequently accessed data

RESPONSE TIME TARGETS
──────────────────────

Simple GET (by ID):     < 50ms
List with filters:      < 100ms
Create with cost calc:  < 200ms
Update with validation: < 150ms
```

---

## Security Layers

```
┌─────────────────────────────────────┐
│         LAYER 1: HTTPS              │
│    Encrypted communication          │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│      LAYER 2: Authentication        │
│      JWT Token Verification         │
│      • Valid signature              │
│      • Not expired                  │
│      • User exists                  │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│      LAYER 3: Authorization         │
│      Role-Based Access Control      │
│      • requireCustomer              │
│      • requireEmployee              │
│      • requireAdmin                 │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│    LAYER 4: Data Ownership          │
│    • Customer owns vehicle?         │
│    • Employee assigned to work?     │
│    • Customer owns request?         │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│    LAYER 5: Business Rules          │
│    • Can cancel?                    │
│    • Can update status?             │
│    • Valid status transition?       │
└──────────────┬──────────────────────┘
               │
               ▼
         ┌──────────┐
         │ ALLOWED  │
         └──────────┘
```

This multi-layered approach ensures:

- Only authenticated users access the system
- Users only access data they're authorized for
- Business rules are enforced
- Data integrity is maintained
