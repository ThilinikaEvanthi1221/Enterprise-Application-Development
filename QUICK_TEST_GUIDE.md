# 🚀 QUICK TEST GUIDE - Get Your Vehicle ID in 3 Steps

## The Problem

You got this error: `Cast to ObjectId failed for value "<paste-vehicle-id-here>"`

This happened because you used the placeholder text instead of a REAL MongoDB ObjectId (24-character hex string like `6543210abcdef1234567890a`).

---

## ✅ SOLUTION: 3 Simple Steps

### **Step 1: Login as Customer**

```http
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "customer@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "673abc123def456789012345", // ← Save this! It's YOUR user ID
    "name": "Customer",
    "role": "customer"
  }
}
```

**Save TWO things:**

1. ✅ The `token` - you'll need this for authenticated requests
2. ✅ The `user.id` - this is your customer user ID

---

### **Step 2: Create a Vehicle**

Now create a vehicle using your customer ID:

```http
POST http://localhost:5000/api/vehicles
Authorization: Bearer <paste-token-from-step-1>
Content-Type: application/json

{
  "plateNumber": "TEST-123",
  "make": "Toyota",
  "model": "Camry",
  "year": 2020,
  "owner": "673abc123def456789012345",  // ← Use YOUR user.id from Step 1
  "status": "active"
}
```

**Response:**

```json
{
  "_id": "673b4c8e9f1a2b3c4d5e6f7a", // ← THIS IS THE VEHICLE ID YOU NEED!!!
  "plateNumber": "TEST-123",
  "make": "Toyota",
  "model": "Camry",
  "year": 2020,
  "owner": "673abc123def456789012345",
  "status": "active"
}
```

**Save the `_id` - this is your VEHICLE ID!**

---

### **Step 3: Request a Service (Finally!)**

Now use the REAL vehicle ID to request a service:

```http
POST http://localhost:5000/api/services/request
Authorization: Bearer <paste-token-from-step-1>
Content-Type: application/json

{
  "vehicleId": "673b4c8e9f1a2b3c4d5e6f7a",  // ← Use the _id from Step 2
  "serviceType": "Oil Change",
  "description": "Regular oil change needed",
  "scheduledDate": "2024-12-20T10:00:00Z"
}
```

**Success Response:**

```json
{
  "message": "Service request created successfully",
  "service": {
    "_id": "673c1234abcd5678ef901234",
    "serviceType": "Oil Change",
    "customer": "673abc123def456789012345",
    "vehicle": "673b4c8e9f1a2b3c4d5e6f7a",
    "estimatedCost": 45.0, // ← Cost automatically estimated!
    "actualCost": 0,
    "status": "requested",
    "progress": 0,
    "description": "Regular oil change needed",
    "scheduledDate": "2024-12-20T10:00:00Z"
  }
}
```

---

## 📝 Common Issues

### ❌ "Cast to ObjectId failed"

**Cause:** You used placeholder text or an invalid ID
**Fix:** Make sure the vehicle ID is exactly 24 characters (0-9, a-f)

### ❌ "Vehicle not found"

**Cause:** The vehicle ID doesn't exist in the database
**Fix:** Create a vehicle first (Step 2)

### ❌ "Vehicle does not belong to customer"

**Cause:** You're trying to use someone else's vehicle
**Fix:** Make sure the vehicle's `owner` matches your customer user ID

### ❌ "jwt must be provided"

**Cause:** Missing or incorrect Authorization header
**Fix:** Add `Authorization: Bearer <your-token>` header

---

## 🎯 Alternative: Get Existing Vehicle IDs

If the database already has vehicles (from seed data), you can list them:

### **As Admin:**

```http
GET http://localhost:5000/api/vehicles
Authorization: Bearer <admin-token>
```

This will show all vehicles with their IDs.

### **As Customer:**

Currently there's no endpoint to list YOUR vehicles. You'll need to create one or use the admin endpoint.

---

## 💡 Pro Tips

1. **Use a REST client** like Thunder Client, Postman, or VS Code REST Client extension
2. **Copy-paste the IDs carefully** - they're 24 characters long
3. **Save your tokens** - they expire in 1 hour
4. **Check the response** - it always contains the `_id` you need

---

## 🔍 What If I Already Have Seed Data?

If you ran the seed scripts, vehicles might already exist. Run this helper script:

```bash
node backend/getVehicleIds.js
```

This will show all vehicles with their IDs and owners.

---

## 🎓 Understanding MongoDB ObjectIds

MongoDB ObjectIds look like this:

- ✅ Valid: `673b4c8e9f1a2b3c4d5e6f7a` (24 hex characters)
- ❌ Invalid: `<paste-vehicle-id-here>` (placeholder text)
- ❌ Invalid: `123` (too short)
- ❌ Invalid: `abc-xyz` (not hex)

Always copy the `_id` field from a successful create/get response!

---

## 🚀 Next Steps After Your First Service Request

1. **Login as Employee** and claim the service
2. **Update progress** as employee
3. **Test cost estimation** by adding parts
4. **Create a project** to test modification requests
5. **Test admin approval** workflow

Good luck! 🎉
