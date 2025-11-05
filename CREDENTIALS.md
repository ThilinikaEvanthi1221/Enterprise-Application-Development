# Login Credentials

## Admin Account

- **Email:** admin@autoservice.com
- **Password:** Admin@123
- **Role:** admin

## Customer Accounts

Customers can register themselves via the signup page.
All new registrations are automatically assigned the "customer" role.

---

## Role-Based Access

### Admin Can:

- View admin dashboard
- Add new employees
- Manage all users, appointments, services, vehicles
- View time logs

### Employees Can:

- View employee dashboard
- Manage appointments
- Log time
- View assigned services

### Customers Can:

- View customer dashboard
- Book appointments
- View their vehicles
- Track service history

---

## How to Add More Employees

### Option 1: Via Admin Dashboard (Recommended)

1. Login as admin
2. Click "Add New Employee" button on the dashboard
3. Fill in employee details
4. Click "Create Employee"
5. **Important:** Save the generated credentials immediately!

### Option 2: Via Seed Script

Run the following command from the backend directory:

```bash
node scripts/seedEmployees.js
```

**Note:** Update the employee details in `backend/scripts/seedEmployees.js` before running.

---

## Testing Login

### Test Admin Access:

1. Go to http://localhost:3000/login
2. Enter admin credentials
3. You'll be redirected to `/admin` dashboard

### Test Employee Access:

1. Go to http://localhost:3000/login
2. Enter any employee credentials above
3. You'll be redirected to `/employee` dashboard

### Test Customer Access:

1. Go to http://localhost:3000/signup
2. Create a new account
3. Login with those credentials
4. You'll be redirected to `/customer` dashboard
