# Google OAuth Setup - Quick Reference

## Step 1: Get Google Credentials

1. Go to **Google Cloud Console**: https://console.cloud.google.com/
2. Create a new project or select existing one
3. Go to **APIs & Services** > **Credentials**
4. Click **+ CREATE CREDENTIALS** > **OAuth client ID**

## Step 2: Configure OAuth Client

### Application Type:

- Select: **Web application**

### Authorized JavaScript origins:

Add these URLs:

```
http://localhost:3000
http://localhost:5000
```

### Authorized redirect URIs:

Add this URL:

```
http://localhost:5000/api/auth/google/callback
```

### For Production (when deploying):

```
https://your-production-domain.com
https://your-production-domain.com/api/auth/google/callback
```

## Step 3: Copy Your Credentials

After creating, Google will show you:

- **Client ID** (looks like: `123456789-abcdefg.apps.googleusercontent.com`)
- **Client Secret** (looks like: `GOCSPX-abc123def456`)

## Step 4: Update Your .env Files

### Backend (.env):

```env
GOOGLE_CLIENT_ID=paste-your-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=paste-your-client-secret-here
```

### Frontend (.env):

```env
REACT_APP_GOOGLE_CLIENT_ID=paste-the-same-client-id-here.apps.googleusercontent.com
```

**Important**: Use the SAME Client ID in both files!

## Step 5: Restart Your Servers

After updating .env files:

```powershell
# Backend
cd backend
npm start

# Frontend (in new terminal)
cd frontend
npm start
```

## Summary of URLs for Google Console:

| Field                         | URL to Add                                       |
| ----------------------------- | ------------------------------------------------ |
| Authorized JavaScript origins | `http://localhost:3000`                          |
| Authorized JavaScript origins | `http://localhost:5000`                          |
| Authorized redirect URIs      | `http://localhost:5000/api/auth/google/callback` |

## Test the Setup

1. Go to http://localhost:3000/login
2. Click "Sign in with Google" button
3. Select your Google account
4. You should be logged in successfully!

## Troubleshooting

**Error: "redirect_uri_mismatch"**

- Make sure you added `http://localhost:5000/api/auth/google/callback` to Authorized redirect URIs

**Error: "Invalid client ID"**

- Check that GOOGLE_CLIENT_ID matches in both .env files
- Restart both servers after changing .env

**Google button not showing**

- Make sure REACT_APP_GOOGLE_CLIENT_ID is set in frontend/.env
- Check browser console for errors
