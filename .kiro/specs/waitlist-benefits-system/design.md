# Design Document

## Overview

The waitlist benefits system extends the existing waitlist functionality to track and apply three key benefits for early adopters: early access invitations, a 12-month founding price lock, and a 7-day Pro trial. The system integrates with the existing authentication flow to automatically detect waitlist members during signup and apply their benefits. An admin interface allows controlled rollout of early access invites.

## Architecture

The system consists of four main components:

1. **Waitlist Enhancement Layer**: Extends the existing waitlist table with benefit tracking fields
2. **Signup Integration Layer**: Detects waitlist membership during account creation and applies benefits
3. **Benefit Enforcement Layer**: Checks benefit eligibility when displaying pricing and enforcing plan limits
4. **Admin Management Layer**: Provides interface for viewing waitlist and sending invites

Data flows from waitlist signup → benefit storage → signup detection → benefit application → ongoing enforcement.

## Components and Interfaces

### 1. Database Schema Extensions

**Waitlist Table Additions:**
```typescript
interface WaitlistEntry {
  // Existing fields
  id: string
  email: string
  studying: string | null
  current_tool: string | null
  wants_early_access: boolean
  referral_code: string
  referred_by: string | null
  created_at: string
  meta_json: Record<string, any>
  
  // New fields (stored in meta_json)
  invited_at?: string
  invite_sent_at?: string
  converted_at?: string
  invite_status?: 'pending' | 'invited' | 'converted' | 'failed'
}
```

**Users Table Additions:**
```typescript
interface UserBenefits {
  // Stored in users.meta_json
  founding_price_lock?: {
    enabled: boolean
    expires_at: string
    locked_prices: {
      student_pro_monthly: number
      student_pro_semester: number
      pro_plus_monthly: number
    }
  }
  trial?: {
    plan: 'student_pro' | 'pro_plus'
    started_at: string
    expires_at: string
  }
  from_waitlist: boolean
}
```

### 2. WaitlistService

```typescript
class WaitlistService {
  // Check if email is on waitlist
  static async checkWaitlistMembership(email: string): Promise<WaitlistEntry | null>
  
  // Mark waitlist entry as converted
  static async markAsConverted(email: string): Promise<void>
  
  // Get all waitlist entries (admin)
  static async getAllEntries(): Promise<WaitlistEntry[]>
  
  // Mark entries as invited
  static async markAsInvited(emails: string[]): Promise<void>
  
  // Export waitlist to CSV
  static async exportToCSV(): Promise<string>
}
```

### 3. BenefitService

```typescript
class BenefitService {
  // Apply waitlist benefits to new user
  static async applyWaitlistBenefits(userId: string, email: string): Promise<void>
  
  // Check if user has active founding price lock
  static async hasActivePriceLock(userId: string): Promise<boolean>
  
  // Get locked prices for user
  static async getLockedPrices(userId: string): Promise<LockedPrices | null>
  
  // Check if user is in trial
  static async isInTrial(userId: string): Promise<boolean>
  
  // Get trial info
  static async getTrialInfo(userId: string): Promise<TrialInfo | null>
  
  // Handle trial expiration
  static async expireTrial(userId: string): Promise<void>
}
```

### 4. Signup Flow Integration

The signup process will be modified to:
1. Check if email exists in waitlist
2. If yes, apply benefits after user creation
3. Mark waitlist entry as converted

```typescript
// In signup API route
async function handleSignup(email: string, password: string) {
  // Create auth user
  const { user } = await supabase.auth.signUp({ email, password })
  
  // Create user profile
  const profile = await createUserProfile(user.id, email)
  
  // Check waitlist and apply benefits
  const waitlistEntry = await WaitlistService.checkWaitlistMembership(email)
  if (waitlistEntry) {
    await BenefitService.applyWaitlistBenefits(profile.id, email)
    await WaitlistService.markAsConverted(email)
  }
  
  return profile
}
```

## Data Models

### Founding Price Lock

```typescript
interface FoundingPriceLock {
  enabled: boolean
  expires_at: string // ISO timestamp
  locked_prices: {
    student_pro_monthly: number // e.g., 7.99
    student_pro_semester: number // e.g., 24.00
    pro_plus_monthly: number // e.g., 11.99
  }
}
```

Stored in `users.meta_json.founding_price_lock`

### Trial Information

```typescript
interface TrialInfo {
  plan: 'student_pro' | 'pro_plus'
  started_at: string // ISO timestamp
  expires_at: string // ISO timestamp
}
```

Stored in `users.meta_json.trial`

During trial:
- `users.plan` = 'student_pro'
- `users.plan_expires_at` = trial expiration date

After trial expires:
- `users.plan` = 'free'
- `users.plan_expires_at` = null

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Waitlist detection is accurate
*For any* email address, checking waitlist membership should return a result if and only if that email exists in the waitlist table
**Validates: Requirements 2.1**

### Property 2: Benefits are applied atomically
*For any* waitlist member creating an account, either all three benefits (price lock, trial, conversion mark) are applied successfully or none are applied
**Validates: Requirements 2.2, 2.3, 2.4, 7.3**

### Property 3: Price lock expiration is enforced
*For any* user with a founding price lock, locked prices should be displayed if and only if the current date is before the expiration date
**Validates: Requirements 3.1, 3.3**

### Property 4: Trial access is time-bound
*For any* user with a trial, Student Pro features should be accessible if and only if the current date is within the trial period
**Validates: Requirements 4.1, 4.2**

### Property 5: Non-waitlist users get standard accounts
*For any* email not on the waitlist, creating an account should result in a free tier account with no benefits
**Validates: Requirements 2.5**

### Property 6: Conversion is idempotent
*For any* waitlist entry, marking it as converted multiple times should result in the same state as marking it once
**Validates: Requirements 7.3**

### Property 7: Invite status transitions are valid
*For any* waitlist entry, the invite status should only transition in valid sequences: pending → invited → converted, or pending → invited → failed
**Validates: Requirements 5.3, 6.3**

## Error Handling

### Signup Flow Errors

- **Waitlist lookup fails**: Log error, continue with standard signup (no benefits)
- **Benefit application fails**: Rollback user creation, return error to user
- **Conversion marking fails**: Log error, user still gets benefits (can be reconciled later)

### Admin Operations Errors

- **Email send fails**: Mark entry as failed, log error, allow retry
- **CSV export fails**: Return error message, suggest retry
- **Bulk invite fails**: Process individually, track successes and failures

### Benefit Enforcement Errors

- **Price lock data missing**: Fall back to current prices, log warning
- **Trial data corrupted**: Treat as expired, log error
- **Date parsing fails**: Use safe defaults, log error

## Testing Strategy

### Unit Tests

1. **WaitlistService.checkWaitlistMembership**
   - Returns entry for existing email
   - Returns null for non-existent email
   - Handles case-insensitive email matching

2. **BenefitService.applyWaitlistBenefits**
   - Creates correct price lock structure
   - Sets trial dates correctly
   - Updates user plan and expiration

3. **BenefitService.hasActivePriceLock**
   - Returns true for active lock
   - Returns false for expired lock
   - Returns false for missing lock

4. **BenefitService.isInTrial**
   - Returns true during trial period
   - Returns false after expiration
   - Returns false for no trial

### Property-Based Tests

Property-based tests will use **fast-check** (JavaScript/TypeScript PBT library) with a minimum of 100 iterations per test.

1. **Property 1: Waitlist detection accuracy**
   - Generate random emails (some in waitlist, some not)
   - Verify detection matches actual presence in database
   - **Validates: Requirements 2.1**

2. **Property 2: Benefit application atomicity**
   - Generate random user data
   - Apply benefits and verify all three are present or all are absent
   - **Validates: Requirements 2.2, 2.3, 2.4**

3. **Property 3: Price lock expiration enforcement**
   - Generate random dates (before and after expiration)
   - Verify locked prices shown only when not expired
   - **Validates: Requirements 3.1, 3.3**

4. **Property 4: Trial time-bound access**
   - Generate random dates (within and outside trial period)
   - Verify access granted only during trial
   - **Validates: Requirements 4.1, 4.2**

5. **Property 5: Non-waitlist standard accounts**
   - Generate random emails not on waitlist
   - Verify accounts created with free tier and no benefits
   - **Validates: Requirements 2.5**

### Integration Tests

1. **Full signup flow with waitlist member**
   - Create waitlist entry
   - Sign up with same email
   - Verify all benefits applied
   - Verify waitlist marked as converted

2. **Full signup flow without waitlist**
   - Sign up with email not on waitlist
   - Verify standard free account created
   - Verify no benefits applied

3. **Admin invite workflow**
   - Mark entries as invited
   - Verify status updated
   - Verify timestamps recorded

4. **Price display with active lock**
   - Create user with price lock
   - Fetch pricing
   - Verify locked prices displayed

5. **Trial expiration**
   - Create user with expired trial
   - Check plan access
   - Verify reverted to free tier
