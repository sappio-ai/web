# Task 15 - Authentication Middleware Testing Guide

## ✅ Completed Implementation

Task 15 has been successfully completed. The following components were created:

### 1. Next.js Middleware (`src/middleware.ts`)
- Automatically checks authentication on all routes
- Refreshes session tokens automatically
- Redirects unauthenticated users from protected routes to `/login`
- Redirects authenticated users from auth pages to `/dashboard`
- Protected routes: `/dashboard`, `/profile`, `/settings`
- Auth routes: `/login`, `/signup`

### 2. AuthGuard Component (`src/components/auth/AuthGuard.tsx`)
- Client-side authentication guard for wrapping protected content
- Shows loading spinner while checking authentication
- Redirects to login if not authenticated
- Listens for auth state changes (logout, token refresh)
- Can be used in client components for additional protection

## 🧪 How to Test

### Prerequisites
1. Make sure the development server is running:
   ```bash
   npm run dev
   ```
2. Open your browser to `http://localhost:3000`

### Test Scenarios

#### Scenario 1: Unauthenticated User Access
**Test:** Try to access protected routes without being logged in

1. **Clear your browser cookies** (or use incognito mode)
2. Try to navigate to: `http://localhost:3000/dashboard`
3. **Expected Result:** You should be automatically redirected to `/login` with a `redirectTo` parameter
4. The URL should look like: `http://localhost:3000/login?redirectTo=/dashboard`

#### Scenario 2: Authenticated User on Auth Pages
**Test:** Try to access login/signup pages while already logged in

1. **Log in first** using existing credentials:
   - Email: `petar.markota@gmail.com` or `perosells@gmail.com`
   - (You'll need to know the password or reset it)
2. After logging in, try to navigate to: `http://localhost:3000/login`
3. **Expected Result:** You should be automatically redirected to `/dashboard`
4. Same should happen if you try: `http://localhost:3000/signup`

#### Scenario 3: Session Persistence
**Test:** Verify that sessions persist across page refreshes

1. **Log in** to your account
2. Navigate to `/dashboard`
3. **Refresh the page** (F5 or Ctrl+R)
4. **Expected Result:** You should remain on the dashboard without being redirected to login
5. The middleware automatically refreshes your session token

#### Scenario 4: Logout and Redirect
**Test:** Verify that logout clears session and redirects properly

1. **Log in** to your account
2. Navigate to `/dashboard`
3. **Log out** (using the logout functionality)
4. Try to access `/dashboard` again
5. **Expected Result:** You should be redirected to `/login`

#### Scenario 5: Token Refresh
**Test:** Verify automatic token refresh

1. **Log in** to your account
2. Keep the browser tab open for a while (the session token will approach expiration)
3. Navigate between pages or refresh
4. **Expected Result:** The middleware automatically refreshes your token in the background
5. You should remain authenticated without any interruption

#### Scenario 6: Direct URL Access
**Test:** Try accessing protected routes directly via URL

1. **While logged out**, paste this URL directly: `http://localhost:3000/dashboard`
2. **Expected Result:** Immediate redirect to `/login?redirectTo=/dashboard`
3. After logging in, you should be redirected back to `/dashboard`

### Testing with Browser DevTools

#### Check Cookies
1. Open DevTools (F12)
2. Go to **Application** tab → **Cookies** → `http://localhost:3000`
3. Look for Supabase session cookies (they start with `sb-`)
4. When logged in, you should see:
   - `sb-catwozixwjrwzzzibqfb-auth-token`
   - `sb-catwozixwjrwzzzibqfb-auth-token-code-verifier`

#### Check Network Requests
1. Open DevTools (F12) → **Network** tab
2. Navigate to `/dashboard` while logged out
3. You should see:
   - Initial request to `/dashboard`
   - 307 redirect to `/login`
4. The middleware handles this before the page even loads

#### Check Console Logs
1. Open DevTools (F12) → **Console** tab
2. Look for any authentication errors
3. The AuthGuard component logs errors if authentication fails

## 🎯 Expected Behavior Summary

| User State | Tries to Access | Expected Result |
|------------|----------------|-----------------|
| Not logged in | `/dashboard` | Redirect to `/login?redirectTo=/dashboard` |
| Not logged in | `/profile` | Redirect to `/login?redirectTo=/profile` |
| Not logged in | `/settings` | Redirect to `/login?redirectTo=/settings` |
| Not logged in | `/login` | Show login page |
| Not logged in | `/signup` | Show signup page |
| Logged in | `/dashboard` | Show dashboard |
| Logged in | `/profile` | Show profile page |
| Logged in | `/settings` | Show settings page |
| Logged in | `/login` | Redirect to `/dashboard` |
| Logged in | `/signup` | Redirect to `/dashboard` |
| Logged in | `/` (home) | Show home page (no redirect) |

## 🔍 Troubleshooting

### Issue: Infinite redirect loop
**Cause:** Middleware might be misconfigured
**Solution:** Check that the middleware matcher excludes static files and API routes

### Issue: Not redirecting when logged out
**Cause:** Session cookies might still be present
**Solution:** Clear all cookies for `localhost:3000` and try again

### Issue: Redirecting when shouldn't
**Cause:** Session might be expired or invalid
**Solution:** Log out completely, clear cookies, and log in again

## 📝 Implementation Details

### Middleware Flow
```
Request → Middleware → updateSession() → Check User
                                          ↓
                                    User exists?
                                    ↙         ↘
                                  Yes         No
                                   ↓           ↓
                        Protected route?   Auth route?
                              ↓                ↓
                             Yes              Yes
                              ↓                ↓
                        Allow access    Redirect to /dashboard
                              
                        Auth route?     Protected route?
                              ↓                ↓
                             Yes              Yes
                              ↓                ↓
                    Redirect to /dashboard  Redirect to /login
```

### AuthGuard Usage (Optional)
The AuthGuard component can be used in client components for additional protection:

```tsx
import { AuthGuard } from '@/components/auth/AuthGuard'

export default function ProtectedClientComponent() {
  return (
    <AuthGuard>
      <div>Protected content here</div>
    </AuthGuard>
  )
}
```

## 🚀 Next Steps

The middleware is now active and protecting your routes. You can:

1. Continue with **Task 14** (Profile Management) to add profile pages
2. Continue with **Task 16** (Dashboard Layout) to enhance the dashboard
3. Test the complete authentication flow end-to-end

## 📊 Current Database State

There are 2 existing users in the database:
- `petar.markota@gmail.com` (created: 2025-10-21)
- `perosells@gmail.com` (created: 2025-10-18, name: "Pero Sell")

You can use these accounts for testing if you have the passwords, or create a new account via the signup page.
