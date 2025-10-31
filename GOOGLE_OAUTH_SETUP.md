# Google OAuth Setup Guide

## Overview

Your application now supports Google Sign-In for both login and signup functionality. Users can authenticate using their Google account in addition to traditional email/password authentication.

## Prerequisites

- Google Cloud Console account
- Node.js and npm installed
- MongoDB running

## Step 1: Create Google OAuth Credentials

1. **Go to Google Cloud Console**

   - Visit: https://console.cloud.google.com/

2. **Create a New Project (or select existing)**

   - Click on the project dropdown at the top
   - Click "New Project"
   - Give it a name (e.g., "EAD-Auth")
   - Click "Create"

3. **Enable Google+ API**

   - In the left sidebar, go to "APIs & Services" > "Library"
   - Search for "Google+ API" or "Google Identity"
   - Click on it and press "Enable"

4. **Configure OAuth Consent Screen**

   - Go to "APIs & Services" > "OAuth consent screen"
   - Select "External" user type
   - Click "Create"
   - Fill in required fields:
     - App name: Your application name
     - User support email: Your email
     - Developer contact email: Your email
   - Click "Save and Continue"
   - Skip the Scopes section (click "Save and Continue")
   - Add test users if needed (click "Save and Continue")

5. **Create OAuth 2.0 Credentials**
   - Go to "APIs & Services" > "Credentials"
   - Click "+ CREATE CREDENTIALS" > "OAuth client ID"
   - Application type: "Web application"
   - Name: "EAD Web Client"
   - Add Authorized JavaScript origins:
     - `http://localhost:3000`
     - `http://localhost:5000`
   - Add Authorized redirect URIs:
     - `http://localhost:5000/api/auth/google/callback`
   - Click "Create"
   - **Copy the Client ID and Client Secret** - you'll need these!

## Step 2: Configure Environment Variables

### Backend (.env file)

Located at: `backend/.env`

Replace the placeholder values with your actual Google credentials:

```env
GOOGLE_CLIENT_ID=your-actual-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-actual-client-secret
```

### Frontend (.env file)

Located at: `frontend/.env`

Replace the placeholder with your Google Client ID:

```env
REACT_APP_GOOGLE_CLIENT_ID=your-actual-client-id.apps.googleusercontent.com
```

**Note:** Use the SAME Client ID for both backend and frontend!

## Step 3: Install Dependencies

All required packages have been installed:

### Backend packages:

- `google-auth-library` - For verifying Google tokens
- `passport` - Authentication middleware
- `passport-google-oauth20` - Google OAuth strategy
- `express-session` - Session management

### Frontend packages:

- `@react-oauth/google` - Google OAuth for React
- `jwt-decode` - For decoding JWT tokens

## Step 4: Start Your Application

1. **Start the Backend**

   ```bash
   cd backend
   npm start
   ```

2. **Start the Frontend**
   ```bash
   cd frontend
   npm start
   ```

## How It Works

### User Flow:

1. **Login/Signup Page**

   - User sees traditional email/password form
   - Below that, there's a divider with "OR"
   - Google Sign-In button appears

2. **Google Authentication**

   - User clicks "Sign in with Google" button
   - Google popup appears for account selection
   - User selects their Google account
   - Google returns a credential token

3. **Backend Processing**

   - Token is sent to `/api/auth/google`
   - Backend verifies token with Google
   - Checks if user exists in database
   - If exists: logs them in
   - If new: creates account with role "customer"
   - Returns JWT token for session management

4. **Success**
   - JWT token is stored in localStorage
   - User is authenticated and can access protected routes

## Database Schema Updates

The User model now includes:

- `googleId`: Unique identifier from Google (optional)
- Existing fields: name, email, password, role

## Security Features

✅ Google token verification on backend
✅ JWT token generation for session management
✅ Secure password handling (bcrypt for traditional auth)
✅ Email uniqueness enforcement
✅ Role-based access control maintained

## Testing the Integration

1. Start both backend and frontend servers
2. Navigate to login page (`http://localhost:3000/login`)
3. Click "Sign in with Google" button
4. Select your Google account
5. Check that you're logged in successfully
6. Verify the user appears in your MongoDB database

## Troubleshooting

### Common Issues:

1. **"Invalid Client ID" error**

   - Check that GOOGLE_CLIENT_ID in both .env files matches the one from Google Console
   - Ensure .env files are in the correct directories
   - Restart both servers after changing .env files

2. **"Redirect URI mismatch" error**

   - Go to Google Console > Credentials
   - Edit your OAuth client
   - Add `http://localhost:3000` to Authorized JavaScript origins
   - Add `http://localhost:5000/api/auth/google/callback` to Authorized redirect URIs

3. **CORS errors**

   - Ensure your backend has CORS properly configured
   - Check that frontend is making requests to `http://localhost:5000`

4. **"User already exists" but with different auth method**
   - The system handles this by linking the Google account to existing email
   - User can login with either method after linking

## Production Deployment

When deploying to production:

1. Update Authorized JavaScript origins in Google Console:

   - Add your production domain (e.g., `https://yourdomain.com`)

2. Update Authorized redirect URIs:

   - Add your production callback URL (e.g., `https://yourdomain.com/api/auth/google/callback`)

3. Update environment variables with production URLs

4. Consider using HTTPS for all communications

## Files Modified/Created

### Backend:

- ✅ `backend/config/passport.js` - Google OAuth strategy (created)
- ✅ `backend/controllers/authController.js` - Added googleAuth function
- ✅ `backend/routes/authRoutes.js` - Added /google route
- ✅ `backend/models/user.js` - Added googleId field
- ✅ `backend/.env` - Added Google credentials

### Frontend:

- ✅ `frontend/src/pages/login.js` - Added Google Sign-In button
- ✅ `frontend/src/pages/signup.js` - Added Google Sign-In button
- ✅ `frontend/src/services/api.js` - Added googleLogin function
- ✅ `frontend/.env` - Added Google Client ID

## Support

If you encounter issues:

1. Check all environment variables are set correctly
2. Verify Google Console configuration
3. Check browser console for errors
4. Check backend server logs
5. Ensure all dependencies are installed

## Next Steps

Consider implementing:

- Password reset functionality
- Email verification
- Remember me functionality
- Social login with other providers (Facebook, GitHub, etc.)
- Multi-factor authentication
- Account linking UI for existing users
