# Quick Setup Instructions - Google OAuth

## 🚀 Quick Start (5 Minutes)

### 1. Get Google Credentials (3 minutes)

1. Go to: https://console.cloud.google.com/
2. Create new project or select existing
3. Go to: APIs & Services > Credentials
4. Click: "+ CREATE CREDENTIALS" > "OAuth client ID"
5. Choose: "Web application"
6. Add origins: `http://localhost:3000` and `http://localhost:5000`
7. Add redirect: `http://localhost:5000/api/auth/google/callback`
8. Copy your Client ID and Client Secret

### 2. Update Environment Files (1 minute)

**backend/.env:**

```env
GOOGLE_CLIENT_ID=paste-your-client-id-here
GOOGLE_CLIENT_SECRET=paste-your-client-secret-here
```

**frontend/.env:**

```env
REACT_APP_GOOGLE_CLIENT_ID=paste-your-client-id-here
```

### 3. Run Your App (1 minute)

**Terminal 1 - Backend:**

```bash
cd backend
npm start
```

**Terminal 2 - Frontend:**

```bash
cd frontend
npm start
```

### 4. Test It! ✅

- Open: http://localhost:3000/login
- Click: "Sign in with Google" button
- Choose your Google account
- Done! You should be logged in

## 📋 What Was Installed

### Backend Dependencies:

- ✅ google-auth-library
- ✅ passport
- ✅ passport-google-oauth20
- ✅ express-session

### Frontend Dependencies:

- ✅ @react-oauth/google
- ✅ jwt-decode

## 🎯 Key Features

✨ **Login Page** - Traditional login + Google Sign-In button
✨ **Signup Page** - Traditional signup + Google Sign-Up button
✨ **Auto Account Creation** - New Google users automatically get accounts
✨ **Account Linking** - Existing email users can link Google account
✨ **Secure** - Token verification, JWT authentication, bcrypt passwords
✨ **Role Support** - Google users get "customer" role by default

## 🔧 Need Help?

See the full guide: `GOOGLE_OAUTH_SETUP.md`

## ⚠️ Remember:

- Use the SAME Client ID for both backend and frontend
- Restart servers after changing .env files
- Google Console must have correct redirect URIs
