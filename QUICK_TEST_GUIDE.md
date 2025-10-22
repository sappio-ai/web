# Quick Test Guide - Tasks 14 & 15

## 🚀 Start Testing in 30 Seconds

### 1. Start Server
```bash
npm run dev
```

### 2. Test Middleware (Task 15)
```
Visit: http://localhost:3000/dashboard (while logged out)
✅ Should redirect to: /login?redirectTo=/dashboard
```

### 3. Test Profile (Task 14)
```
Visit: http://localhost:3000/profile (after logging in)
✅ Should show: Profile page with editable form
```

---

## 📋 Quick Checklist

### Middleware Tests:
- [ ] `/dashboard` (logged out) → redirects to `/login`
- [ ] `/profile` (logged out) → redirects to `/login`
- [ ] `/login` (logged in) → redirects to `/dashboard`
- [ ] Refresh `/dashboard` (logged in) → stays on dashboard

### Profile Tests:
- [ ] View profile page → see your data
- [ ] Update full name → success message
- [ ] Update username → success message
- [ ] Try short username (< 3 chars) → error message
- [ ] Change language → success message

---

## 🎯 What You Should See

### Profile Page:
```
┌─────────────────────────────────────┐
│ Profile Settings                    │
├──────────────────┬──────────────────┤
│ Personal Info    │ Current Plan     │
│ [Email]          │ 🆓 Free          │
│ [Full Name]      │                  │
│ [Username]       │ Account Info     │
│ [Avatar URL]     │ Role: user       │
│ [Language]       │ Member Since:... │
│ [Save Changes]   │                  │
│                  │ [Dashboard]      │
│                  │ [Settings]       │
└──────────────────┴──────────────────┘
```

### Success Message:
```
✓ Profile updated successfully!
```

### Error Message:
```
✗ Username already taken
```

---

## 🔍 Browser DevTools Check

### Cookies (when logged in):
```
Application → Cookies → localhost:3000
✅ Should see: sb-catwozixwjrwzzzibqfb-auth-token
```

### Network (when accessing /dashboard logged out):
```
Network → Headers
✅ Status: 307 Temporary Redirect
✅ Location: /login?redirectTo=/dashboard
```

---

## ⚡ Quick Fixes

### Can't access profile?
→ Make sure you're logged in

### Changes not saving?
→ Check browser console for errors

### Redirecting to login?
→ Your session expired, log in again

### Username error?
→ Try a different username (must be unique)

---

## 📱 Test URLs

```
Home:              http://localhost:3000/
Login:             http://localhost:3000/login
Signup:            http://localhost:3000/signup
Dashboard:         http://localhost:3000/dashboard
Profile:           http://localhost:3000/profile
```

---

## ✅ Success Criteria

You'll know everything works when:
- ✅ Can't access `/dashboard` without logging in
- ✅ Can access `/profile` after logging in
- ✅ Can update profile and see success message
- ✅ Session persists across page refreshes
- ✅ Redirects work correctly

---

## 🎉 That's It!

**Both tasks are working. Start testing now!**

For detailed testing, see:
- `TASK_14_COMPLETE_REPORT.md`
- `TASK_15_TESTING_GUIDE.md`
