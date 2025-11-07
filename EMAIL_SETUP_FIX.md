# Fix Email Authentication Error

## Problem

Getting error: "Username and Password not accepted" when trying to send password reset emails.

## Solution: Generate New Gmail App Password

### Step 1: Enable 2-Factor Authentication

1. Go to https://myaccount.google.com/security
2. Under "Signing in to Google", click "2-Step Verification"
3. Follow the steps to enable 2FA (if not already enabled)

### Step 2: Generate App Password

1. Go to https://myaccount.google.com/apppasswords
   - Or: Google Account → Security → 2-Step Verification → App passwords
2. Click "Select app" → Choose "Mail"
3. Click "Select device" → Choose "Other (Custom name)"
4. Enter: **Auto Service Pro Backend**
5. Click "Generate"
6. **COPY THE 16-CHARACTER PASSWORD** (it will be shown only once!)
   - Example format: `abcd efgh ijkl mnop`

### Step 3: Update Environment Variable

Open `backend/.env` and replace the EMAIL_PASS value:

```env
EMAIL_USER=autoserviceproteam@gmail.com
EMAIL_PASS=your-16-char-app-password-here
```

**Important**:

- Remove spaces from the app password (use: `abcdefghijklmnop` not `abcd efgh ijkl mnop`)
- Do NOT use your regular Gmail password
- This is a one-time generated password specifically for this app

### Step 4: Restart Backend Server

```powershell
cd backend
node server.js
```

### Step 5: Test

Try the forgot password feature again. You should see:

- "User saved successfully" ✓
- "Password reset email sent successfully to: [email]" ✓

## Alternative: Use Different Email Service

If you don't want to use Gmail app passwords, you can use other services:

### SendGrid (Free tier: 100 emails/day)

```javascript
// Update backend/services/emailService.js
const transporter = nodemailer.createTransport({
  host: "smtp.sendgrid.net",
  port: 587,
  auth: {
    user: "apikey",
    pass: process.env.SENDGRID_API_KEY,
  },
});
```

### Mailgun, Postmark, etc.

Similar configuration with their SMTP credentials.

## Troubleshooting

**Error: "Username and Password not accepted"**

- App password might be incorrect
- 2FA might not be enabled
- Using regular password instead of app password

**Error: "Less secure app access"**

- Google removed this option in May 2022
- You MUST use App Passwords with 2FA now

**Emails not sending but no error**

- Check spam/junk folder
- Verify EMAIL_USER is correct
- Check Gmail "Sent" folder to confirm

## Current Status

✓ Token generation working
✓ Database save working
✗ Email authentication failing
→ Need to update EMAIL_PASS with valid app password
