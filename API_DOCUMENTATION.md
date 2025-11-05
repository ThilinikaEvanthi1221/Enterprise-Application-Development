# API Endpoints Documentation

## Authentication Endpoints

### 1. Traditional Signup

**POST** `/api/auth/signup`

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "role": "customer"
}
```

**Response (200):**

```json
{
  "msg": "Signup successful",
  "user": {
    "id": "user_id_here",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "customer"
  }
}
```

---

### 2. Traditional Login

**POST** `/api/auth/login`

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response (200):**

```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "user_id_here",
    "name": "John Doe",
    "role": "customer"
  }
}
```

---

### 3. Google OAuth Login/Signup

**POST** `/api/auth/google`

**Request Body:**

```json
{
  "credential": "google_credential_token_from_frontend"
}
```

**Response (200):**

```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "user_id_here",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "customer"
  }
}
```

**What it does:**

- Verifies the Google credential token
- Checks if user exists by email
- If exists: Updates googleId if needed and returns login token
- If new: Creates new user account with Google info
- Returns JWT token for authentication

---

## Error Responses

### 400 - Bad Request

```json
{
  "msg": "User already exists"
}
```

or

```json
{
  "msg": "Invalid credentials"
}
```

### 500 - Server Error

```json
{
  "msg": "Error message here"
}
```

---

## Frontend Usage Examples

### Traditional Login

```javascript
import { login } from "../services/api";

const handleLogin = async (formData) => {
  try {
    const res = await login({
      email: formData.email,
      password: formData.password,
    });
    localStorage.setItem("token", res.data.token);
    console.log("Logged in:", res.data.user);
  } catch (error) {
    console.error("Login failed:", error.response.data.msg);
  }
};
```

### Google Login

```javascript
import { googleLogin } from "../services/api";

const handleGoogleSuccess = async (credentialResponse) => {
  try {
    const res = await googleLogin({
      credential: credentialResponse.credential,
    });
    localStorage.setItem("token", res.data.token);
    console.log("Google login successful:", res.data.user);
  } catch (error) {
    console.error("Google login failed:", error.response.data.msg);
  }
};
```

---

## JWT Token Usage

After login, use the token for authenticated requests:

```javascript
const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Add token to requests
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

---

## User Model Schema

```javascript
{
  googleId: String,        // Optional, only for Google users
  name: String,            // Required
  email: String,           // Required, unique
  password: String,        // Required (placeholder for Google users)
  role: String            // "customer" or "employee"
}
```

---

## Security Notes

✅ Passwords are hashed with bcrypt (10 rounds)
✅ JWT tokens expire in 1 hour
✅ Google tokens are verified server-side
✅ Email uniqueness is enforced
✅ CORS is enabled for cross-origin requests
