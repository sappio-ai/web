# Design Document

## Overview

The extra study packs feature allows users to purchase additional study pack creation capacity beyond their monthly subscription limits. This system implements one-time purchases through Stripe, tracks pack balances with expiration dates, and integrates seamlessly with the existing quota tracking system.

### Key Design Principles

1. **Consumption Order First**: Always consume monthly quota before extra packs to maximize subscription value
2. **Transparent Expiration**: 6-month expiration with clear warnings prevents indefinite accumulation
3. **Atomic Operations**: All balance changes use database transactions to prevent race conditions
4. **Seamless Integration**: Extends existing UsageService without breaking current functionality
5. **Student-Friendly Pricing**: Bundle pricing (€2.99, €6.99, €14.99) provides clear value tiers

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend Layer                           │
├─────────────────────────────────────────────────────────────┤
│  CreatePackModal  →  QuotaExhaustedPaywall  →  StripeCheckout│
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│                      API Layer                               │
├─────────────────────────────────────────────────────────────┤
│  /api/materials/*     /api/payments/extra-packs              │
│  /api/webhooks/stripe                                        │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│                   Service Layer                              │
├─────────────────────────────────────────────────────────────┤
│  UsageService (extended)  │  ExtraPacksService (new)         │
│  PaymentService (new)     │  StripeService (new)             │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────┴────────────────────────────────────┐
│                   Database Layer                             │
├─────────────────────────────────────────────────────────────┤
│  users (extra_packs_*)  │  extra_pack_purchases (new)        │
│  payments               │  usage_counters                    │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│                Background Jobs (Inngest)                     │
├─────────────────────────────────────────────────────────────┤
│  expire-extra-packs (cron: daily at 1 AM UTC)                │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

**Pack Creation Flow:**
1. User attempts to create pack → API checks quota via UsageService
2. UsageService calculates: monthly remaining + available extra packs
3. If allowed: consume from monthly first, then extra packs
4. If blocked: return quota exceeded with purchase options

**Purchase Flow:**
1. User selects bundle → Frontend creates Stripe checkout session
2. User completes payment → Stripe webhook fires
3. Webhook validates payment → Credits extra packs to user
4. User receives confirmation → Balance updated immediately

**Expiration Flow:**
1. Inngest cron runs daily at 1 AM UTC
2. Queries extra_pack_purchases where expires_at < now()
3. Marks purchases as expired
4. Logs expiration events for analytics

## Components and Interfaces

### Database Schema Changes

**New Table: extra_pack_purchases**
```sql
CREATE TABLE extra_pack_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  amount_paid NUMERIC(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  stripe_payment_intent_id TEXT UNIQUE,
  purchased_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  consumed INTEGER NOT NULL DEFAULT 0 CHECK (consumed >= 0 AND consumed <= quantity),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'refunded')),
  refunded_at TIMESTAMPTZ,
  refund_amount NUMERIC(10, 2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_extra_pack_purchases_user_id ON extra_pack_purchases(user_id);
CREATE INDEX idx_extra_pack_purchases_expires_at ON extra_pack_purchases(expires_at);
CREATE INDEX idx_extra_pack_purchases_status ON extra_pack_purchases(status);
```

**Users Table Additions**
```sql
-- Add computed columns for quick access (optional, can be calculated on-the-fly)
ALTER TABLE users 
ADD COLUMN extra_packs_available INTEGER GENERATED ALWAYS AS (
  (SELECT COALESCE(SUM(quantity - consumed), 0) 
   FROM extra_pack_purchases 
   WHERE user_id = users.id 
   AND status = 'active' 
   AND expires_at > NOW())
) STORED;
```

### Service Interfaces

**ExtraPacksService**
```typescript
interface ExtraPackPurchase {
  id: string
  userId: string
  quantity: number
  amountPaid: number
  currency: string
  stripePaymentIntentId: string
  purchasedAt: Date
  expiresAt: Date
  consumed: number
  status: 'active' | 'expired' | 'refunded'
  refundedAt?: Date
  refundAmount?: number
}

interface PackBundle {
  quantity: number
  price: number
  pricePerPack: number
  savings?: string
}

class ExtraPacksService {
  // Get available bundles
  static getBundles(): PackBundle[]
  
  // Get user's available extra packs (excluding expired)
  static async getAvailableBalance(userId: string): Promise<{
    total: number
    purchases: ExtraPackPurchase[]
    nearestExpiration?: Date
  }>
  
  // Purchase extra packs
  static async createPurchase(
    userId: string,
    quantity: number,
    amountPaid: number,
    stripePaymentIntentId: string
  ): Promise<ExtraPackPurchase>
  
  // Consume extra packs (FIFO - oldest first)
  static async consumeExtraPacks(
    userId: string,
    count: number
  ): Promise<{ success: boolean; newBalance: number }>
  
  // Check if refund is allowed
  static async canRefund(purchaseId: string): Promise<{
    allowed: boolean
    reason?: string
  }>
  
  // Process refund
  static async processRefund(
    purchaseId: string,
    refundAmount: number
  ): Promise<void>
  
  // Expire old purchases
  static async expirePurchases(): Promise<{
    expired: number
    usersAffected: number
  }>
}
```

**Extended UsageService**
```typescript
interface ExtendedUsageStats extends UsageStats {
  extraPacksAvailable: number
  extraPacksNearExpiration?: {
    count: number
    expiresAt: Date
  }
  totalAvailable: number // monthly remaining + extra packs
}

class UsageService {
  // Extended to include extra packs
  static async canCreatePack(userId: string): Promise<{
    allowed: boolean
    reason?: string
    usage?: ExtendedUsageStats
    consumptionSource?: 'monthly' | 'extra' | 'grace'
  }>
  
  // Extended to consume from correct source
  static async consumePackQuota(
    userId: string,
    idempotencyKey: string
  ): Promise<{
    success: boolean
    newCount: number
    source: 'monthly' | 'extra'
    usage?: ExtendedUsageStats
  }>
}
```

**StripeService**
```typescript
interface CheckoutSession {
  sessionId: string
  url: string
}

class StripeService {
  // Create checkout session for extra packs
  static async createExtraPacksCheckout(
    userId: string,
    quantity: number,
    price: number
  ): Promise<CheckoutSession>
  
  // Verify webhook signature
  static verifyWebhookSignature(
    payload: string,
    signature: string
  ): boolean
  
  // Process successful payment
  static async handlePaymentSuccess(
    paymentIntentId: string
  ): Promise<void>
  
  // Process refund
  static async createRefund(
    paymentIntentId: string,
    amount: number
  ): Promise<void>
}
```

## Data Models

### ExtraPackPurchase Model

```typescript
interface ExtraPackPurchase {
  id: string
  userId: string
  quantity: number // Total packs in this purchase
  amountPaid: number // Amount in euros
  currency: string // 'EUR'
  stripePaymentIntentId: string
  purchasedAt: Date
  expiresAt: Date // purchasedAt + 6 months
  consumed: number // How many packs used from this purchase
  status: 'active' | 'expired' | 'refunded'
  refundedAt?: Date
  refundAmount?: number
  createdAt: Date
  updatedAt: Date
}
```

### Pack Bundle Model

```typescript
interface PackBundle {
  quantity: 10 | 30 | 75
  price: 2.99 | 6.99 | 14.99
  pricePerPack: number // Calculated
  popular?: boolean // Mark 30-pack as popular
}

const PACK_BUNDLES: PackBundle[] = [
  { quantity: 10, price: 2.99, pricePerPack: 0.299 },
  { quantity: 30, price: 6.99, pricePerPack: 0.233, popular: true },
  { quantity: 75, price: 14.99, pricePerPack: 0.200 },
]
```

### Extended Usage Stats

```typescript
interface ExtendedUsageStats {
  // Existing fields
  currentUsage: number
  limit: number
  percentUsed: number
  remaining: number
  periodStart: Date
  periodEnd: Date
  isAtLimit: boolean
  isNearLimit: boolean
  hasGraceWindow: boolean
  
  // New fields
  extraPacksAvailable: number
  extraPacksNearExpiration?: {
    count: number
    expiresAt: Date
  }
  totalAvailable: number // remaining + extraPacksAvailable
}
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After analyzing all acceptance criteria, the following redundancies were identified and consolidated:
- Properties 3.1 and 2.5 both test period boundary behavior → Combined into Property 5
- Properties 3.2 and 6.3 both test expired pack exclusion → Combined into Property 6
- Properties 3.4 and 7.2 both test nearest expiration display → Combined into Property 8

### Core Properties

**Property 1: Expiration date calculation**
*For any* extra pack purchase, the expiration date should always equal the purchase date plus exactly 6 months
**Validates: Requirements 1.4**

**Property 2: Independent purchase tracking**
*For any* user with multiple extra pack purchases, each purchase should have its own unique record with independent expiration dates
**Validates: Requirements 1.5**

**Property 3: Monthly quota priority**
*For any* quota check when monthly quota is available, the system should allow pack creation and consume from monthly quota before considering extra packs
**Validates: Requirements 2.1, 2.2**

**Property 4: Extra pack consumption order**
*For any* quota check when monthly quota is exhausted and extra packs are available, the system should allow pack creation and consume from extra packs
**Validates: Requirements 2.3**

**Property 5: Period boundary preservation**
*For any* billing period transition, monthly usage should reset to zero while extra pack balances remain unchanged
**Validates: Requirements 2.5, 3.1**

**Property 6: Expired pack exclusion**
*For any* balance calculation, all purchases with expiration dates before the current date should be excluded from the available balance
**Validates: Requirements 3.2, 6.3**

**Property 7: Expiration job marking**
*For any* purchase with expiration date before current date, the expiration job should mark it as expired
**Validates: Requirements 3.3, 6.2**

**Property 8: Balance display completeness**
*For any* user with extra packs, the balance display should show the total available packs and the nearest expiration date from all active purchases
**Validates: Requirements 3.4, 7.2**

**Property 9: Expiration warning threshold**
*For any* user with packs expiring within 30 days, the system should display a warning with the expiration date
**Validates: Requirements 3.5**

**Property 10: Refund eligibility rules**
*For any* purchase within 14 days of purchase date, refund should be allowed if and only if consumed equals zero
**Validates: Requirements 4.1, 4.2**

**Property 11: Refund balance adjustment**
*For any* refund processed, the user's available balance should decrease by exactly (quantity - consumed) from that purchase
**Validates: Requirements 4.3**

**Property 12: Refund recording**
*For any* completed refund, the purchase record should have status 'refunded', refunded_at timestamp, and refund_amount recorded
**Validates: Requirements 4.4, 4.5**

**Property 13: Plan-based modal priority**
*For any* paid plan user at quota limit, the paywall modal should display extra pack purchase options before plan upgrade options
**Validates: Requirements 5.5**

**Property 14: Expiration job identification**
*For any* set of purchases, the expiration job should identify exactly those purchases where expires_at < current_date
**Validates: Requirements 6.1**

**Property 15: Purchase history completeness**
*For any* user's purchase history, each purchase should display purchase date, quantity, amount paid, expiration date, and refund status
**Validates: Requirements 7.3**

**Property 16: Consumption source feedback**
*For any* successful pack creation, the response should indicate whether the pack was consumed from monthly quota or extra packs
**Validates: Requirements 7.4**

**Property 17: Idempotent consumption**
*For any* pack consumption operation with the same idempotency key, executing it multiple times should result in exactly one pack being consumed
**Validates: Requirements 8.3**

**Property 18: Unified availability response**
*For any* availability check, the response should include monthly remaining, extra packs available, and total available as separate fields
**Validates: Requirements 8.4**

## Error Handling

### Error Categories

**1. Payment Errors**
- Stripe API failures → Retry with exponential backoff, log for manual review
- Invalid payment amounts → Reject immediately with clear error message
- Webhook signature mismatch → Log security event, reject webhook
- Duplicate payment intents → Use idempotency, return existing purchase

**2. Balance Errors**
- Insufficient packs → Return quota_exceeded with purchase options
- Concurrent consumption → Use database transactions with row locking
- Negative balance → Prevent with CHECK constraints, log anomaly
- Expired pack usage attempt → Exclude expired packs from available balance

**3. Refund Errors**
- Refund outside 14-day window → Reject with clear policy message
- Refund with consumed packs → Reject with consumption details
- Stripe refund API failure → Retry, escalate to manual processing
- Partial refund requests → Not supported, reject with policy

**4. Expiration Errors**
- Expiration job failure → Retry up to 2 times, alert on persistent failure
- Database connection loss → Use Inngest retry mechanism
- Partial expiration → Use transactions to ensure atomicity

### Error Response Format

```typescript
interface ErrorResponse {
  error: string // Human-readable message
  code: ErrorCode // Machine-readable code
  details?: Record<string, any> // Additional context
  retryable: boolean // Can client retry?
}

enum ErrorCode {
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  REFUND_NOT_ALLOWED = 'REFUND_NOT_ALLOWED',
  PURCHASE_NOT_FOUND = 'PURCHASE_NOT_FOUND',
  INVALID_BUNDLE = 'INVALID_BUNDLE',
  WEBHOOK_VERIFICATION_FAILED = 'WEBHOOK_VERIFICATION_FAILED',
  DATABASE_ERROR = 'DATABASE_ERROR',
  STRIPE_API_ERROR = 'STRIPE_API_ERROR',
}
```

### Rollback Strategy

**Pack Consumption Rollback:**
```typescript
// Use database transaction
BEGIN TRANSACTION;
  -- Check availability
  -- Consume pack
  -- Update balance
  -- Log event
COMMIT; -- Or ROLLBACK on any error
```

**Payment Rollback:**
- Stripe payment succeeded but database credit failed → Retry credit operation
- If retry fails after 3 attempts → Store in failed_credits table for manual processing
- Alert admin for manual reconciliation

**Refund Rollback:**
- Database update succeeded but Stripe refund failed → Revert database, retry Stripe
- Stripe refund succeeded but database update failed → Retry database update
- Use idempotency keys to prevent duplicate refunds

## Testing Strategy

### Unit Testing

**Service Layer Tests:**
- ExtraPacksService.getBundles() returns correct bundle configurations
- ExtraPacksService.getAvailableBalance() correctly sums non-expired purchases
- ExtraPacksService.consumeExtraPacks() uses FIFO (oldest first) consumption
- ExtraPacksService.canRefund() correctly applies 14-day and consumption rules
- UsageService.canCreatePack() checks monthly quota before extra packs
- UsageService.consumePackQuota() consumes from correct source

**API Endpoint Tests:**
- POST /api/payments/extra-packs creates valid Stripe checkout session
- POST /api/webhooks/stripe verifies signature and processes payment
- GET /api/users/extra-packs returns correct balance and expiration info

**Database Function Tests:**
- consume_extra_pack() atomically decrements balance
- get_available_extra_packs() excludes expired purchases
- Transaction rollback on constraint violations

### Property-Based Testing

**Testing Framework:** fast-check (TypeScript property testing library)
**Minimum Iterations:** 100 per property

**Property Test Structure:**
```typescript
import fc from 'fast-check'

describe('Extra Packs Property Tests', () => {
  it('Property 1: Expiration date calculation', () => {
    fc.assert(
      fc.property(
        fc.date(), // Random purchase date
        (purchaseDate) => {
          const expiresAt = calculateExpiration(purchaseDate)
          const expectedExpiration = addMonths(purchaseDate, 6)
          return expiresAt.getTime() === expectedExpiration.getTime()
        }
      ),
      { numRuns: 100 }
    )
  })
})
```

**Generators Needed:**
- Purchase generator: random quantity, amount, dates
- User state generator: random monthly usage, extra pack balances
- Date generator: various relative dates (past, future, near expiration)
- Multi-purchase generator: 0-10 purchases with varying states

### Integration Testing

**Purchase Flow Integration:**
1. Create Stripe checkout session
2. Simulate webhook callback
3. Verify pack credit in database
4. Verify balance update in user account

**Consumption Flow Integration:**
1. Set up user with known monthly usage and extra packs
2. Create study pack
3. Verify correct source consumed (monthly vs extra)
4. Verify balance updates correctly

**Expiration Flow Integration:**
1. Create purchases with various expiration dates
2. Run expiration job
3. Verify expired purchases marked correctly
4. Verify balance excludes expired packs

### End-to-End Testing

**Happy Path:**
1. User exhausts monthly quota
2. User purchases 30-pack bundle
3. User creates 5 study packs (consumes extra packs)
4. User's next billing period starts
5. User has 25 extra packs remaining + full monthly quota

**Refund Path:**
1. User purchases 10-pack bundle
2. User requests refund within 14 days
3. User has not consumed any packs
4. Refund processes successfully
5. User's balance decreases by 10

**Expiration Path:**
1. User purchases packs 6 months ago
2. Expiration job runs
3. Expired packs marked as expired
4. User's available balance excludes expired packs
5. User sees expiration notice in UI

