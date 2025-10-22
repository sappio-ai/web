# Spec Improvements: Production-Grade Usage System

**Date**: 2025-10-21  
**Status**: Approved and Integrated into Spec  
**Affected Documents**: `design.md`, `tasks.md`

## Context

After completing Tasks 1-3 (infrastructure, types, MaterialService), we reviewed the original UsageService design and identified several production-grade improvements based on industry best practices.

## Original Design Issues

1. **Performance**: Counting events with `COUNT(*)` on every request is slow
2. **Race Conditions**: No protection against double-counting on retries
3. **Billing Logic**: Calendar month resets don't account for user signup dates
4. **Conversion**: Hard limits without grace period hurt conversion
5. **Cost Protection**: No limits on material size (OpenAI API cost risk)

## Improvements Made

### 1. Usage Counters Table

**Problem**: Querying events table with COUNT(*) is slow and expensive.

**Solution**: Maintain pre-aggregated counters.

```sql
CREATE TABLE usage_counters (
  user_id UUID NOT NULL,
  period_start DATE NOT NULL,
  metric TEXT NOT NULL,
  count INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, period_start, metric)
);
```

**Benefits**:
- ✅ O(1) lookups instead of O(n) scans
- ✅ Scales to millions of users
- ✅ No index bloat on events table

### 2. Idempotency Keys

**Problem**: Retries or double-clicks can double-count usage.

**Solution**: Track processed operations.

```sql
CREATE TABLE usage_idempotency (
  idempotency_key TEXT PRIMARY KEY,
  user_id UUID NOT NULL,
  metric TEXT NOT NULL,
  amount INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Benefits**:
- ✅ Prevents double-counting
- ✅ Safe retries
- ✅ Handles network failures gracefully

### 3. Atomic Operations

**Problem**: Separate check + increment can race.

**Solution**: PostgreSQL function for atomic check-and-increment.

```sql
CREATE OR REPLACE FUNCTION increment_usage_counter(
  p_user_id UUID,
  p_period_start DATE,
  p_metric TEXT,
  p_amount INT,
  p_idempotency_key TEXT
) RETURNS void AS $$
BEGIN
  -- Insert idempotency record
  INSERT INTO usage_idempotency (...)
  VALUES (...);
  
  -- Upsert counter
  INSERT INTO usage_counters (...)
  VALUES (...)
  ON CONFLICT (user_id, period_start, metric)
  DO UPDATE SET count = usage_counters.count + p_amount;
END;
$$ LANGUAGE plpgsql;
```

**Benefits**:
- ✅ No race conditions
- ✅ Transaction-safe
- ✅ Single database round-trip

### 4. Billing Anchor

**Problem**: Calendar month resets are unfair (user signs up on 15th, resets on 1st).

**Solution**: Store billing anchor per user.

```sql
ALTER TABLE users 
  ADD COLUMN billing_anchor DATE DEFAULT CURRENT_DATE,
  ADD COLUMN timezone TEXT DEFAULT 'UTC';
```

**Benefits**:
- ✅ Fair billing periods
- ✅ Matches Stripe subscription cycles
- ✅ Timezone-aware resets

### 5. Grace Window

**Problem**: Hard limits hurt conversion (user hits limit, leaves frustrated).

**Solution**: Allow 1 extra pack with upgrade prompt.

```typescript
const GRACE_PACKS = 1
if (usage >= limit && usage < limit + GRACE_PACKS) {
  return { 
    canCreate: true, 
    isGrace: true, 
    showUpgradeModal: true 
  }
}
```

**Benefits**:
- ✅ Better user experience
- ✅ Higher conversion rates
- ✅ Reduces support tickets

### 6. Cost Protection

**Problem**: A 500-page PDF could cost $5+ in OpenAI API calls.

**Solution**: Add per-material limits.

```typescript
maxPagesPerMaterial: {
  free: 50,
  student_pro: 200,
  pro_plus: 500
}
```

**Benefits**:
- ✅ Protects API costs
- ✅ Prevents abuse
- ✅ Predictable expenses

### 7. Database-Driven Limits

**Problem**: Code changes required to adjust limits.

**Solution**: Store limits in database.

```sql
CREATE TABLE plan_limits (
  plan_tier TEXT PRIMARY KEY,
  packs_per_month INT NOT NULL,
  cards_per_pack INT NOT NULL,
  -- ... other limits
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Benefits**:
- ✅ Edit via Supabase dashboard
- ✅ No deployment needed
- ✅ A/B test different limits
- ✅ Audit trail

### 8. In-Memory Cache

**Problem**: Querying plan limits on every request is wasteful.

**Solution**: 5-minute TTL cache.

```typescript
const limitsCache = new Map<string, { 
  limits: PlanLimits, 
  expires: number 
}>()
```

**Benefits**:
- ✅ Reduces DB load
- ✅ Faster responses
- ✅ Still fresh enough

## Updated Task Breakdown

### Task 4.1: Database Schema
- Create plan_limits table
- Create usage_counters table
- Create usage_idempotency table
- Add billing_anchor to users
- Create atomic increment function

### Task 4.2: Core Service
- Implement getPlanLimits with cache
- Implement calculatePeriodStart
- Implement getUsageForPeriod

### Task 4.3: Quota Management
- Implement canCreatePack with grace
- Implement consumePackQuota with idempotency
- Implement getUsageStats

### Task 4.4: Helpers
- User profile fetching
- Cache management
- Error handling
- Logging

## What We're NOT Building (Yet)

These are good ideas but deferred for post-MVP:

- ❌ Versioned plan limits (effective_from/to)
- ❌ Per-user override table
- ❌ Separate entitlements table
- ❌ Daily burst caps
- ❌ Nightly reconciliation job
- ❌ Admin history logging
- ❌ Stripe webhook sync (no Stripe yet)
- ❌ Add-on credits system

We'll add these when we have:
- Multiple admins (history logging)
- Stripe integration (webhook sync)
- Scale issues (reconciliation)
- Abuse patterns (burst caps)

## Implementation Status

- ✅ Spec updated (design.md, tasks.md)
- ⏳ Task 4 implementation (next)
- ⏳ Migration scripts (next)
- ⏳ UsageService code (next)

## References

- Original design: `.kiro/specs/study-pack-creation/design.md`
- Updated tasks: `.kiro/specs/study-pack-creation/tasks.md`
- ChatGPT suggestions: (see conversation history)

## Approval

This improvement was discussed and approved before implementation to ensure:
1. We don't forget these improvements later
2. The spec reflects what we're actually building
3. Future developers understand the design decisions

---

**Next Step**: Implement Task 4 with this enhanced design.
