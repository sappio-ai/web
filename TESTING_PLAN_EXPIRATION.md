# Testing Plan Expiration Cron Job

## ✅ Tests Created and Passing

All 8 unit tests pass:
- Finding expired users (3 tests)
- Expiring users (3 tests)
- Edge cases (2 tests)

Run tests: `npm test -- expire-plans.test.ts`

---

## 🧪 How to Test Manually

### Method 1: Inngest Dev Dashboard (Recommended)

**Steps:**
1. Start your dev server:
   ```bash
   npm run dev
   ```

2. Start Inngest dev server in another terminal:
   ```bash
   npx inngest-cli@latest dev
   ```

3. Open Inngest dashboard:
   ```
   http://localhost:8288
   ```

4. Find the `expire-plans` function in the list

5. Click **"Invoke"** button to run it immediately

6. View logs and results in real-time

**What to check:**
- Function runs without errors
- Logs show "Found X expired users"
- Logs show "Successfully expired plan for..."
- Returns summary: `{ total, succeeded, failed }`

---

### Method 2: Manual API Trigger (Admin Only)

**Steps:**
1. Make sure you're logged in as admin

2. Call the test endpoint:
   ```bash
   curl -X POST http://localhost:3000/api/admin/test/expire-plans \
     -H "Cookie: your-session-cookie"
   ```

   Or use your browser console:
   ```javascript
   fetch('/api/admin/test/expire-plans', { method: 'POST' })
     .then(r => r.json())
     .then(console.log)
   ```

3. Check Inngest dashboard to see the job running

**Expected response:**
```json
{
  "success": true,
  "message": "Plan expiration job triggered"
}
```

---

### Method 3: Database Test (Most Realistic)

**Steps:**
1. Create a test user with expired plan in Supabase SQL Editor:
   ```sql
   -- Create test user with expired plan
   UPDATE users 
   SET 
     plan = 'student_pro',
     plan_expires_at = NOW() - INTERVAL '1 day'
   WHERE email = 'your-test-email@example.com';
   ```

2. Verify the user has expired plan:
   ```sql
   SELECT id, email, plan, plan_expires_at 
   FROM users 
   WHERE email = 'your-test-email@example.com';
   ```

3. Trigger the cron job (Method 1 or 2)

4. Verify user was downgraded:
   ```sql
   SELECT id, email, plan, plan_expires_at 
   FROM users 
   WHERE email = 'your-test-email@example.com';
   -- Should show: plan = 'free', plan_expires_at = null
   ```

5. Check user's trial was removed:
   ```sql
   SELECT meta_json->'trial' as trial
   FROM users 
   WHERE email = 'your-test-email@example.com';
   -- Should be null or empty
   ```

---

## 🔍 What Gets Checked

The cron job:
1. ✅ Finds users where `plan_expires_at < NOW()`
2. ✅ Excludes users already on free tier
3. ✅ Excludes users with no expiry date
4. ✅ Calls `BenefitService.expireTrial()` for each
5. ✅ Handles errors gracefully (continues if one fails)
6. ✅ Returns summary of results

---

## 📊 Expected Behavior

**When plan expires:**
- User's `plan` changes to `'free'`
- User's `plan_expires_at` set to `null`
- User's `meta_json.trial` removed
- User loses access to pro features
- User's usage limits revert to free tier

**Cron schedule:**
- Runs daily at midnight UTC (00:00)
- Processes all expired users in one batch
- Retries up to 2 times if it fails

---

## 🐛 Troubleshooting

**Job not showing in Inngest dashboard?**
- Make sure Inngest dev server is running
- Check `http://localhost:3000/api/inngest` is accessible
- Restart both dev servers

**Job runs but doesn't find users?**
- Check your test user's `plan_expires_at` is in the past
- Verify user is not already on free tier
- Check Supabase connection

**Job finds users but doesn't downgrade?**
- Check `BenefitService.expireTrial()` logs
- Verify service role client has permissions
- Check for database errors in logs

---

## 🎯 Production Deployment

Once deployed to Vercel:
1. Inngest will automatically detect the cron schedule
2. Job will run daily at midnight UTC
3. View runs in Inngest Cloud dashboard (if configured)
4. Monitor via logs in Vercel dashboard

No additional configuration needed!
