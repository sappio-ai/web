# Email Troubleshooting Guide

## Current Setup

Your password reset system is **already using Resend** (not Supabase Auth). The implementation is correct, but emails might not be sending due to configuration issues.

## Quick Diagnosis

### Step 1: Test Email Sending

Run this command to test if emails are working:

```bash
curl -X POST http://localhost:3000/api/auth/test-email \
  -H "Content-Type: application/json" \
  -d '{"email":"your@email.com"}'
```

Or use this in your browser console:
```javascript
fetch('/api/auth/test-email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'your@email.com' })
}).then(r => r.json()).then(console.log)
```

### Step 2: Check Server Logs

After testing, check your terminal/console for detailed logs. You should see:
- ✅ Green checkmarks if everything works
- ❌ Red X marks with error details if something fails

## Common Issues & Solutions

### Issue 1: RESEND_API_KEY Not Set

**Symptoms:**
```
Error: RESEND_API_KEY is not set in environment variables
```

**Solution:**
1. Go to [Resend Dashboard](https://resend.com/api-keys)
2. Create an API key
3. Add to `.env.local`:
```env
RESEND_API_KEY=re_your_api_key_here
```
4. Restart your dev server

### Issue 2: Email FROM Address Not Verified

**Symptoms:**
```
Error: Email address not verified
```

**Solution:**
1. Go to [Resend Domains](https://resend.com/domains)
2. Either:
   - **Option A**: Verify your custom domain (e.g., `sappio.app`)
   - **Option B**: Use Resend's test domain for development:
     ```env
     EMAIL_FROM=onboarding@resend.dev
     ```

### Issue 3: Invalid API Key

**Symptoms:**
```
Error: Invalid API key
```

**Solution:**
1. Check your API key in Resend dashboard
2. Make sure you copied the full key
3. Regenerate if necessary
4. Update `.env.local`

### Issue 4: Rate Limit Exceeded

**Symptoms:**
```
Error: Rate limit exceeded
```

**Solution:**
- Wait a few minutes
- Check your Resend plan limits
- Upgrade plan if needed

### Issue 5: Environment Variables Not Loading

**Symptoms:**
- No error, but emails don't send
- Logs show "Using default" for EMAIL_FROM

**Solution:**
1. Make sure `.env.local` exists in project root
2. Restart your dev server completely
3. Check file is named exactly `.env.local` (not `.env.local.txt`)

## Required Environment Variables

Add these to your `.env.local`:

```env
# Resend API Key (required)
RESEND_API_KEY=re_your_api_key_here

# Email Configuration
EMAIL_FROM=noreply@sappio.app
EMAIL_FROM_NAME=Sappio

# App URL (for email links)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Verify Setup

### 1. Check Environment Variables

```bash
# In your terminal, run:
node -e "console.log(process.env.RESEND_API_KEY ? 'API Key is set' : 'API Key is NOT set')"
```

### 2. Test Password Reset Flow

1. Go to `/forgot-password`
2. Enter your email
3. Check server logs for:
   ```
   📧 Preparing to send password reset email...
   ✅ Password reset email sent successfully!
   ```
4. Check your email inbox (and spam folder!)

### 3. Check Resend Dashboard

Go to [Resend Logs](https://resend.com/emails) to see:
- Email delivery status
- Any errors from Resend's side
- Email content preview

## Development vs Production

### Development (localhost)

Use Resend's test domain:
```env
EMAIL_FROM=onboarding@resend.dev
```

### Production

1. Add your domain to Resend
2. Verify DNS records
3. Update EMAIL_FROM:
```env
EMAIL_FROM=noreply@yourdomain.com
```

## Still Not Working?

### Check These:

1. **Server is running**: Make sure your Next.js dev server is running
2. **No typos**: Double-check environment variable names
3. **Restart required**: Always restart dev server after changing `.env.local`
4. **Firewall**: Check if your firewall is blocking outgoing SMTP
5. **Resend status**: Check [Resend Status Page](https://status.resend.com/)

### Get More Help:

1. Check server logs for detailed error messages
2. Use the test endpoint: `/api/auth/test-email`
3. Check Resend dashboard for delivery logs
4. Contact Resend support if API issues persist

## Implementation Details

### How It Works

1. User submits email on `/forgot-password`
2. System generates secure token (SHA-256 hash)
3. Token stored in `password_reset_tokens` table
4. Email sent via Resend with reset link
5. Link expires in 1 hour
6. Token can only be used once

### Email Template

Located at: `src/lib/email/templates/PasswordResetEmail.tsx`

Uses React Email components for:
- Responsive design
- Dark mode optimization
- Consistent branding with Orb mascot

### Security Features

- ✅ Tokens hashed before storage
- ✅ 1-hour expiration
- ✅ One-time use only
- ✅ Email enumeration prevention
- ✅ Secure password validation

## Remove Test Endpoint

**Important**: Before deploying to production, remove or protect the test endpoint:

```bash
rm src/app/api/auth/test-email/route.ts
```

Or add authentication to it.
