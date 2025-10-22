# Task 15 - Visual Testing Guide

## 🎨 What You Should See in the Browser

### Test 1: Accessing Dashboard Without Login

**Action:** Navigate to `http://localhost:3000/dashboard` (while logged out)

**What happens:**
1. Browser URL changes to: `http://localhost:3000/login?redirectTo=/dashboard`
2. You see the **Login Page** with:
   - Welcome Orb (friendly wave)
   - Email input field
   - Password input field
   - "Sign in with Google" button
   - "Forgot password?" link
   - Link to signup page

**Visual Indicator:** The URL bar shows the redirect parameter, proving the middleware caught your attempt to access a protected route.

---

### Test 2: Logging In Successfully

**Action:** Enter valid credentials and click "Sign In"

**What happens:**
1. Processing Orb appears (thinking pose)
2. Form submits to `/api/auth/login`
3. On success, you're redirected to `/dashboard`
4. You see the **Dashboard Page** with:
   - "Welcome back, [Your Name]!" heading
   - Three stat cards (Study Materials, Study Packs, Quizzes)
   - Getting Started section with 3 steps
   - Debug info (in development mode) showing your email, user ID, and plan

**Visual Indicator:** The URL is now `http://localhost:3000/dashboard` and you can see your personalized dashboard.

---

### Test 3: Trying to Access Login While Logged In

**Action:** While logged in, navigate to `http://localhost:3000/login`

**What happens:**
1. Middleware detects you're already authenticated
2. Browser immediately redirects to: `http://localhost:3000/dashboard`
3. You never see the login page

**Visual Indicator:** The URL changes from `/login` to `/dashboard` almost instantly (you might see a brief flash).

---

### Test 4: Session Persistence (Page Refresh)

**Action:** While on the dashboard, press F5 or Ctrl+R to refresh

**What happens:**
1. Page reloads
2. Middleware checks your session
3. Session is still valid
4. Dashboard loads normally
5. You remain logged in

**Visual Indicator:** No redirect to login page. Dashboard loads with all your data intact.

---

### Test 5: Logging Out

**Action:** Click the logout button (when implemented) or manually call the logout API

**What happens:**
1. Session is cleared
2. Cookies are deleted
3. You're redirected to `/login`
4. If you try to access `/dashboard` now, you'll be redirected to `/login`

**Visual Indicator:** You're back at the login page and can no longer access protected routes.

---

## 🔍 Browser DevTools Inspection

### Checking Cookies (When Logged In)

1. Open DevTools (F12)
2. Go to **Application** tab
3. Click **Cookies** → `http://localhost:3000`
4. You should see cookies like:
   ```
   sb-catwozixwjrwzzzibqfb-auth-token
   sb-catwozixwjrwzzzibqfb-auth-token-code-verifier
   ```

**Visual Indicator:** These cookies contain your session data. If they're missing, you're not logged in.

### Checking Network Requests

1. Open DevTools (F12)
2. Go to **Network** tab
3. Navigate to `/dashboard` while logged out
4. You should see:
   ```
   Request URL: http://localhost:3000/dashboard
   Status Code: 307 Temporary Redirect
   Location: /login?redirectTo=/dashboard
   ```

**Visual Indicator:** The 307 redirect proves the middleware is working before the page even loads.

### Checking Console for Errors

1. Open DevTools (F12)
2. Go to **Console** tab
3. Look for any red error messages
4. If everything is working, you should see minimal logs

**Visual Indicator:** No authentication errors means the middleware is working correctly.

---

## 📱 Mobile Testing (Optional)

The middleware works the same on mobile browsers:

1. Open your phone's browser
2. Navigate to `http://[your-local-ip]:3000/dashboard`
3. Same redirect behavior should occur
4. Session persistence works across mobile refreshes

---

## ✅ Success Criteria

You'll know the middleware is working correctly when:

- ✅ You **cannot** access `/dashboard`, `/profile`, or `/settings` without logging in
- ✅ You **are** automatically redirected to `/login` when trying to access protected routes
- ✅ You **cannot** access `/login` or `/signup` when already logged in
- ✅ You **are** automatically redirected to `/dashboard` when trying to access auth pages while logged in
- ✅ Your session **persists** across page refreshes
- ✅ The `redirectTo` parameter **works** (after login, you're sent to the page you originally tried to access)

---

## 🎯 Quick Test Checklist

Use this checklist to verify everything works:

- [ ] Navigate to `/dashboard` while logged out → Redirects to `/login`
- [ ] Log in with valid credentials → Redirects to `/dashboard`
- [ ] Refresh the dashboard page → Stays on dashboard (no redirect)
- [ ] Navigate to `/login` while logged in → Redirects to `/dashboard`
- [ ] Navigate to `/signup` while logged in → Redirects to `/dashboard`
- [ ] Log out → Redirects to `/login`
- [ ] Try to access `/dashboard` after logout → Redirects to `/login`
- [ ] Check cookies in DevTools → Session cookies present when logged in
- [ ] Check Network tab → See 307 redirects for protected routes when logged out

---

## 🐛 Common Issues and Visual Indicators

### Issue: Infinite Redirect Loop
**Visual:** Browser keeps redirecting between pages rapidly, URL keeps changing
**Solution:** Check middleware configuration, ensure matcher excludes API routes

### Issue: Not Redirecting at All
**Visual:** You can access `/dashboard` without logging in
**Solution:** Middleware might not be running. Check `src/middleware.ts` exists and is properly configured

### Issue: Redirecting Too Much
**Visual:** Even logged in, you get redirected to login
**Solution:** Session might be invalid. Clear cookies and log in again

### Issue: Slow Redirects
**Visual:** You see the protected page briefly before redirect
**Solution:** This is normal for client-side checks. Middleware should catch it server-side first

---

## 🎬 Video Testing Flow (Recommended)

Record your screen while testing to verify the flow:

1. **Start logged out** → Navigate to `/dashboard`
2. **See redirect** → URL changes to `/login?redirectTo=/dashboard`
3. **Log in** → Enter credentials and submit
4. **See dashboard** → Redirected to `/dashboard` with your data
5. **Refresh page** → Dashboard reloads, still logged in
6. **Try to access login** → Immediately redirected back to `/dashboard`
7. **Log out** → Redirected to `/login`
8. **Try dashboard again** → Redirected to `/login`

This complete flow proves the middleware is working end-to-end.

---

## 📊 Expected vs Actual Results

| Test | Expected URL | Expected Page | Expected Behavior |
|------|-------------|---------------|-------------------|
| Access `/dashboard` (logged out) | `/login?redirectTo=/dashboard` | Login page | Immediate redirect |
| Access `/login` (logged in) | `/dashboard` | Dashboard | Immediate redirect |
| Refresh `/dashboard` (logged in) | `/dashboard` | Dashboard | No redirect |
| Access `/dashboard` (after logout) | `/login?redirectTo=/dashboard` | Login page | Immediate redirect |

---

## 🚀 Ready to Test!

Your middleware is now active and protecting your routes. Follow the tests above to verify everything works as expected. If you encounter any issues, refer to the troubleshooting section in `TASK_15_TESTING_GUIDE.md`.
