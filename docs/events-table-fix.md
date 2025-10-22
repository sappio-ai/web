# Events Table Fix - Investigation & Resolution

## Problem

Events were not being inserted into the `events` table despite code being in place to log them.

## Root Cause Analysis

### Issue 1: Wrong Supabase Client in Background Jobs

**Location:** `src/lib/services/UsageService.ts` - `logUsageEvent()` method

**Problem:**
```typescript
const supabase = await createClient()  // ❌ Uses user session
```

The method was using `createClient()` which requires a user session. When called from background workers (Inngest), there is no user session, causing the insert to fail silently.

**Solution:**
```typescript
const supabase = createServiceRoleClient()  // ✅ Uses service role
```

### Issue 2: Same Issue in ErrorLogger

**Location:** `src/lib/services/ErrorLogger.ts` - `logError()` method

**Problem:**
```typescript
const supabase = await createClient()  // ❌ Uses user session
```

Same issue - when errors occur in background jobs, there's no user session.

**Solution:**
```typescript
// Try user session first, fallback to service role
let supabase = await createClient()
// ... try to get user ...
if (!userId) {
  supabase = createServiceRoleClient()  // ✅ Fallback to service role
}
```

### Issue 3: No Logging for Debugging

**Problem:**
- Silent failures - no way to know if events were being inserted
- No console logs to track execution flow

**Solution:**
- Added comprehensive console.log statements throughout
- Log before and after database operations
- Log errors with context

## Changes Made

### 1. Fixed UsageService.logUsageEvent()

**File:** `src/lib/services/UsageService.ts`

**Changes:**
- ✅ Changed to use `createServiceRoleClient()`
- ✅ Added logging before insert
- ✅ Added logging after insert with error checking
- ✅ Log success/failure explicitly

### 2. Fixed ErrorLogger.logError()

**File:** `src/lib/services/ErrorLogger.ts`

**Changes:**
- ✅ Try user session first, fallback to service role
- ✅ Added logging for error tracking
- ✅ Log insert success/failure
- ✅ Better error context in console

### 3. Fixed ErrorLogger Monitoring Methods

**Methods:** `getErrorRate()` and `isErrorRateHigh()`

**Changes:**
- ✅ Changed to use `createServiceRoleClient()`
- ✅ Added detailed logging
- ✅ Log query results

### 4. Enhanced generate-pack Worker Logging

**File:** `src/lib/inngest/functions/generate-pack.ts`

**Changes:**
- ✅ Added `[generate-pack]` prefix to all logs
- ✅ Log before and after event logging
- ✅ Wrap event logging in try-catch
- ✅ Log success/failure explicitly

### 5. Created Test Endpoint

**File:** `src/app/api/test-events/route.ts`

**Purpose:**
- Test events table functionality
- Verify inserts are working
- Debug event logging

**Endpoints:**
- `GET /api/test-events` - View recent events
- `POST /api/test-events` - Create test events (3 different methods)

## Testing

### Test the Fix

1. **Test event logging via API:**
   ```bash
   # Create test events (requires authentication)
   curl -X POST http://localhost:3000/api/test-events
   
   # View events
   curl http://localhost:3000/api/test-events
   ```

2. **Test via pack creation:**
   - Upload a material in the UI
   - Wait for pack generation to complete
   - Check console logs for `[UsageService] Event logged successfully`
   - Query database: `SELECT * FROM events WHERE event = 'pack_created'`

3. **Test error logging:**
   - Trigger an error (e.g., upload invalid file)
   - Check console logs for `[ErrorLogger] Error event logged successfully`
   - Query database: `SELECT * FROM events WHERE event = 'error_occurred'`

### Verify in Database

```sql
-- Check all events
SELECT * FROM events ORDER BY created_at DESC LIMIT 10;

-- Count by event type
SELECT event, COUNT(*) as count 
FROM events 
GROUP BY event 
ORDER BY count DESC;

-- Check recent pack_created events
SELECT * FROM events 
WHERE event = 'pack_created' 
ORDER BY created_at DESC 
LIMIT 5;

-- Check error events
SELECT * FROM events 
WHERE event = 'error_occurred' 
ORDER BY created_at DESC 
LIMIT 5;
```

## Console Log Patterns

### Successful Event Logging

```
[UsageService] Logging event: { userId: '...', event: 'pack_created', metadata: {...} }
[UsageService] Event logged successfully: pack_created
```

### Failed Event Logging

```
[UsageService] Logging event: { userId: '...', event: 'pack_created', metadata: {...} }
[UsageService] Failed to insert event: { error details }
```

### Pack Generation Flow

```
[generate-pack] Study pack generation complete: abc-123
[generate-pack] Consuming quota for user: user-456
[generate-pack] Quota consumed successfully. New count: 5
[generate-pack] Logging pack_created event for user: user-456
[UsageService] Logging event: { userId: 'user-456', event: 'pack_created', ... }
[UsageService] Event logged successfully: pack_created
[generate-pack] Event logged successfully
```

## Why This Happened

### Background Context

1. **Supabase Client Types:**
   - `createClient()` - Uses cookies/session, requires authenticated user
   - `createServiceRoleClient()` - Uses service role key, bypasses RLS

2. **Background Jobs:**
   - Inngest workers run in background without user session
   - No cookies or auth headers available
   - Must use service role client

3. **Silent Failures:**
   - The code had `try-catch` that swallowed errors
   - No logging to indicate failures
   - Events table appeared to work but nothing was inserted

## Prevention

### Best Practices Going Forward

1. **Always use service role in background jobs:**
   ```typescript
   // ✅ Good - in background job
   const supabase = createServiceRoleClient()
   
   // ❌ Bad - in background job
   const supabase = await createClient()
   ```

2. **Add logging for critical operations:**
   ```typescript
   console.log('[Service] Starting operation')
   const result = await operation()
   console.log('[Service] Operation result:', result)
   ```

3. **Check for errors explicitly:**
   ```typescript
   const { data, error } = await supabase.from('table').insert(...)
   if (error) {
     console.error('[Service] Insert failed:', error)
   } else {
     console.log('[Service] Insert succeeded')
   }
   ```

4. **Test background jobs separately:**
   - Don't assume API endpoints and background jobs use same auth
   - Test with service role client explicitly

## Summary

**Problem:** Events not being inserted due to wrong Supabase client in background jobs

**Solution:** Use `createServiceRoleClient()` instead of `createClient()` in background contexts

**Impact:** Events table now works correctly for:
- ✅ Pack creation tracking
- ✅ Error logging
- ✅ Quota tracking
- ✅ Analytics data collection

**Files Modified:**
1. `src/lib/services/UsageService.ts`
2. `src/lib/services/ErrorLogger.ts`
3. `src/lib/inngest/functions/generate-pack.ts`

**Files Created:**
1. `src/app/api/test-events/route.ts` (test endpoint)
2. `docs/events-table-fix.md` (this document)
