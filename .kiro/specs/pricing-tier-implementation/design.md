# Design Document

## Overview

This design implements a comprehensive tiered pricing model that properly differentiates Free, Student, and Pro plans through usage limits, feature gating, and priority processing. The system builds on existing infrastructure (`UsageService`, `plan_limits` table, Inngest) while adding consistent plan checking patterns across all features.

The core principle is limiting AI generation costs (pack creation) rather than study activities (reviewing cards, taking quizzes). This aligns platform costs with actual resource consumption while providing generous per-pack limits. The design ensures all pricing displays are accurate, all premium features are properly gated, and paid users receive priority processing.

## Architecture

The system consists of five main layers:

1. **Limit Configuration Layer**: Database-driven plan limits with caching
2. **Feature Gating Layer**: Consistent plan checking across exports, quiz modes, and analytics
3. **Pricing Display Layer**: Accurate pricing across all UI components
4. **Priority Processing Layer**: Queue prioritization based on plan tier
5. **Enforcement Layer**: API-level validation of plan access

Data flows: User action → Plan check → Feature gate/limit enforcement → Priority queue → Processing → Response

## Components and Interfaces

### 1. Plan Limits Configuration

**Database Schema (plan_limits table):**
```typescript
interface PlanLimitsRow {
  plan: 'free' | 'student_pro' | 'pro_plus'
  packs_per_month: number
  cards_per_pack: number
  questions_per_quiz: number
  max_pages_per_material: number
  max_tokens_per_material: number
  mindmap_nodes_limit: number
  priority_processing: boolean
  updated_at: string
}
```

**New Limit Values:**
```typescript
const NEW_PLAN_LIMITS = {
  free: {
    packs_per_month: 5,
    cards_per_pack: 40,
    questions_per_quiz: 15,
    mindmap_nodes_limit: 80,
    priority_processing: false
  },
  student_pro: {
    packs_per_month: 60,
    cards_per_pack: 120,
    questions_per_quiz: 30,
    mindmap_nodes_limit: 250,
    priority_processing: true
  },
  pro_plus: {
    packs_per_month: 300,
    cards_per_pack: 300,
    questions_per_quiz: 60,
    mindmap_nodes_limit: 800,
    priority_processing: true
  }
}
```

### 2. Feature Gating Service

```typescript
class FeatureGateService {
  /**
   * Check if user can access export features
   */
  static async canExport(userId: string): Promise<{
    allowed: boolean
    reason?: string
    currentPlan: PlanTier
    requiredPlan: PlanTier
  }>
  
  /**
   * Check if user can access timed quiz mode
   */
  static async canUseTimedMode(userId: string): Promise<{
    allowed: boolean
    reason?: string
    currentPlan: PlanTier
    requiredPlan: PlanTier
  }>
  
  /**
   * Check if user can access weak topics practice
   */
  static async canUseWeakTopics(userId: string): Promise<{
    allowed: boolean
    reason?: string
    currentPlan: PlanTier
    requiredPlan: PlanTier
  }>
  
  /**
   * Check if user can access advanced analytics
   */
  static async canAccessAdvancedAnalytics(userId: string): Promise<{
    allowed: boolean
    reason?: string
    currentPlan: PlanTier
    requiredPlan: PlanTier
  }>
  
  /**
   * Get user's plan tier
   */
  static async getUserPlan(userId: string): Promise<PlanTier>
}
```

### 3. Export API Pattern

All export endpoints will follow this pattern:

```typescript
// Example: /api/exports/notes-pdf/route.ts
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  
  // Authenticate
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  // Get study pack with user plan
  const { data: pack, error: packError } = await supabase
    .from('study_packs')
    .select('*, users!inner(id, auth_user_id, plan)')
    .eq('id', studyPackId)
    .eq('users.auth_user_id', user.id)
    .single()
  
  if (packError || !pack) {
    return NextResponse.json({ error: 'Study pack not found' }, { status: 404 })
  }
  
  // Check plan (Student Pro or Pro+ required for exports)
  const userPlan = pack.users.plan || 'free'
  if (userPlan === 'free') {
    return NextResponse.json({
      error: 'Export requires Student or Pro plan',
      code: 'PLAN_UPGRADE_REQUIRED',
      currentPlan: userPlan,
      requiredPlan: 'student_pro'
    }, { status: 403 })
  }
  
  // Generate and return export
  // ...
}
```

### 4. Quiz Feature Gating

**Frontend Component Pattern:**
```typescript
// QuizInterface.tsx
interface QuizInterfaceProps {
  studyPackId: string
  userPlan: PlanTier
}

function QuizInterface({ studyPackId, userPlan }: QuizInterfaceProps) {
  const canUseTimedMode = userPlan !== 'free'
  const canUseWeakTopics = userPlan !== 'free'
  
  return (
    <div>
      <ModeSelector
        timedModeEnabled={canUseTimedMode}
        weakTopicsEnabled={canUseWeakTopics}
        onUpgradeClick={() => setShowPaywall(true)}
      />
      {/* ... */}
    </div>
  )
}
```

**Backend API Pattern:**
```typescript
// /api/quiz/start/route.ts
export async function POST(request: NextRequest) {
  const { studyPackId, mode, timed } = await request.json()
  
  // Get user and plan
  const user = await getUserProfile(userId)
  
  // Check timed mode access
  if (timed && user.plan === 'free') {
    return NextResponse.json({
      error: 'Timed mode requires Student or Pro plan',
      code: 'PLAN_UPGRADE_REQUIRED',
      currentPlan: user.plan,
      requiredPlan: 'student_pro'
    }, { status: 403 })
  }
  
  // Check weak topics access
  if (mode === 'weak_topics' && user.plan === 'free') {
    return NextResponse.json({
      error: 'Weak topics practice requires Student or Pro plan',
      code: 'PLAN_UPGRADE_REQUIRED',
      currentPlan: user.plan,
      requiredPlan: 'student_pro'
    }, { status: 403 })
  }
  
  // Start quiz
  // ...
}
```

### 5. Analytics Feature Gating

**Component Structure:**
```typescript
// InsightsTab.tsx
interface InsightsTabProps {
  studyPackId: string
  userPlan: PlanTier
}

function InsightsTab({ studyPackId, userPlan }: InsightsTabProps) {
  const showAdvancedAnalytics = userPlan === 'pro_plus'
  
  return (
    <div>
      {/* Basic analytics - always visible */}
      <BasicStats />
      <ProgressChart />
      
      {/* Advanced analytics - Pro only */}
      {showAdvancedAnalytics ? (
        <>
          <DueLoadForecast />
          <LapseTracking />
          <TopicMasteryHeatmap />
        </>
      ) : (
        <UpgradePrompt
          feature="Advanced Analytics"
          requiredPlan="pro_plus"
          benefits={[
            'Due load forecasting',
            'Lapse tracking and patterns',
            'Topic mastery heatmaps',
            'Predicted exam readiness'
          ]}
        />
      )}
    </div>
  )
}
```

### 6. Priority Processing with Inngest

**Queue Priority Configuration:**
```typescript
// inngest/functions/generate-pack.ts
export const generatePack = inngest.createFunction(
  {
    id: 'generate-pack',
    name: 'Generate Study Pack',
    retries: 1,
    priority: {
      run: async (event) => {
        // Get user plan
        const user = await UsageService.getUserProfile(event.data.userId)
        const limits = await UsageService.getPlanLimits(user.plan)
        
        // Return priority based on plan
        return limits.priorityProcessing ? 100 : 0
      }
    }
  },
  { event: 'pack/generate' },
  async ({ event, step }) => {
    // ... existing generation logic
  }
)
```

**Event Triggering:**
```typescript
// When creating a pack
await inngest.send({
  name: 'pack/generate',
  data: {
    materialId: material.id,
    userId: userId
  }
  // Priority is determined by the function's priority.run callback
})
```

### 7. Pricing Display Updates

**PricingService Updates:**
```typescript
// src/lib/services/PricingService.ts
const CURRENT_PRICES = {
  student_pro_monthly: 7.99,
  student_pro_semester: 24.00,
  student_pro_annual: 69.00,
  pro_plus_monthly: 11.99,
  pro_plus_annual: 129.00
}
```

**PaywallModal Plan Definitions:**
```typescript
const PLANS = {
  free: {
    name: 'Free',
    monthlyPrice: '€0',
    features: [
      '5 packs per month',
      '40 cards per pack',
      '15-question quizzes',
      '80 mind map nodes',
      'No exports'
    ]
  },
  student_pro: {
    name: 'Student',
    monthlyPrice: '€7.99',
    semesterPrice: '€24',
    annualPrice: '€69',
    features: [
      '60 packs per month',
      '120 cards per pack',
      '30-question quizzes',
      '250 mind map nodes',
      'All export formats',
      'Timed quiz mode',
      'Weak topics practice',
      'Priority processing'
    ]
  },
  pro_plus: {
    name: 'Pro',
    monthlyPrice: '€11.99',
    annualPrice: '€129',
    features: [
      '300 packs per month',
      '300 cards per pack',
      '60-question quizzes',
      '800 mind map nodes',
      'All export formats',
      'Advanced analytics',
      'Priority processing',
      'API access (coming soon)'
    ]
  }
}
```

## Data Models

### Plan Limits

```typescript
interface PlanLimits {
  plan: PlanTier
  packsPerMonth: number
  cardsPerPack: number
  questionsPerQuiz: number
  maxPagesPerMaterial: number
  maxTokensPerMaterial: number
  mindmapNodesLimit: number
  priorityProcessing: boolean
}
```

### Feature Gate Response

```typescript
interface FeatureGateResponse {
  allowed: boolean
  reason?: 'plan_required' | 'error'
  currentPlan: PlanTier
  requiredPlan: PlanTier
  message?: string
}
```

### Plan Upgrade Error

```typescript
interface PlanUpgradeError {
  error: string
  code: 'PLAN_UPGRADE_REQUIRED'
  currentPlan: PlanTier
  requiredPlan: PlanTier
  feature?: string
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Plan limits are enforced consistently
*For any* user and plan tier, the system should enforce the same limits across all pack creation endpoints (upload, URL, text)
**Validates: Requirements 1.1, 1.2, 1.3, 1.4**

### Property 2: Export access matches plan tier
*For any* export request, access should be granted if and only if the user's plan is student_pro or pro_plus
**Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 2.6**

### Property 3: Quiz features are gated correctly
*For any* quiz mode request, timed mode and weak topics should be accessible if and only if the user's plan is not free
**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6**

### Property 4: Analytics access is tier-specific
*For any* analytics request, advanced features should be visible if and only if the user's plan is pro_plus
**Validates: Requirements 4.1, 4.2, 4.3**

### Property 5: Pricing displays are accurate
*For any* pricing display component, the shown prices and features should match the current CURRENT_PRICES constant and actual system capabilities
**Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7**

### Property 6: Priority processing is plan-based
*For any* pack generation job, the priority should be high if and only if the user's plan has priority_processing set to true
**Validates: Requirements 6.1, 6.2, 6.3, 6.4, 6.5**

### Property 7: Grace window allows exactly one extra pack
*For any* user at their monthly limit, exactly one additional pack creation should succeed before quota_exceeded error
**Validates: Requirements 7.1, 7.2, 7.3**

### Property 8: Plan checks are consistent
*For any* feature requiring plan validation, the check should query users table and return structured error with code PLAN_UPGRADE_REQUIRED when access is denied
**Validates: Requirements 8.1, 8.2, 8.3, 8.4**

### Property 9: Price locks are respected
*For any* user with an active founding price lock, displayed prices should match locked_prices if and only if current date is before expires_at
**Validates: Requirements 9.1, 9.2, 9.3, 9.4**

### Property 10: Cache invalidation works
*For any* plan limit update, clearing the cache should cause the next retrieval to fetch updated values from the database
**Validates: Requirements 1.5, 10.2**

## Error Handling

### Plan Check Failures

- **User not found**: Return 404 with clear message
- **Database query fails**: Log error, return 500, use fallback limits if available
- **Plan field is null**: Treat as 'free' tier (safe default)

### Export Failures

- **Plan check fails**: Return 403 with PLAN_UPGRADE_REQUIRED code
- **Generation fails**: Return 500 with error details
- **File too large**: Return 413 with size limit information

### Feature Gate Failures

- **Frontend**: Show disabled UI with upgrade prompt overlay
- **Backend**: Return 403 with structured error including current and required plan
- **Network error**: Show retry option, don't block UI

### Priority Processing Failures

- **Priority calculation fails**: Default to low priority (safe fallback)
- **Queue full**: Return 503 with retry-after header
- **Job timeout**: Retry with exponential backoff

### Database Migration Failures

- **UPDATE fails**: Log error, rollback transaction, alert admin
- **Cache clear fails**: Log warning, continue (cache will expire naturally)
- **Verification fails**: Alert admin, use fallback limits

## Testing Strategy

### Unit Tests

1. **UsageService.getPlanLimits**
   - Returns correct limits for each tier
   - Uses cache when available
   - Falls back to defaults on error

2. **FeatureGateService.canExport**
   - Returns true for student_pro and pro_plus
   - Returns false for free
   - Handles missing plan gracefully

3. **FeatureGateService.canUseTimedMode**
   - Returns true for paid tiers
   - Returns false for free tier
   - Includes correct required plan in response

4. **FeatureGateService.canAccessAdvancedAnalytics**
   - Returns true only for pro_plus
   - Returns false for free and student_pro
   - Provides clear upgrade path

5. **Priority calculation**
   - Returns 100 for paid tiers
   - Returns 0 for free tier
   - Handles errors gracefully

### Property-Based Tests

Property-based tests will use **fast-check** (JavaScript/TypeScript PBT library) with a minimum of 100 iterations per test.

1. **Property 1: Consistent limit enforcement**
   - Generate random user profiles with different plans
   - Verify same limits enforced across all endpoints
   - **Feature: pricing-tier-implementation, Property 1: Plan limits are enforced consistently**
   - **Validates: Requirements 1.1, 1.2, 1.3, 1.4**

2. **Property 2: Export access correctness**
   - Generate random plan tiers
   - Verify export access matches plan tier rules
   - **Feature: pricing-tier-implementation, Property 2: Export access matches plan tier**
   - **Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 2.6**

3. **Property 3: Quiz feature gating**
   - Generate random quiz mode requests with different plans
   - Verify access granted only for paid tiers
   - **Feature: pricing-tier-implementation, Property 3: Quiz features are gated correctly**
   - **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6**

4. **Property 4: Analytics tier specificity**
   - Generate random plan tiers
   - Verify advanced analytics visible only for pro_plus
   - **Feature: pricing-tier-implementation, Property 4: Analytics access is tier-specific**
   - **Validates: Requirements 4.1, 4.2, 4.3**

5. **Property 5: Pricing display accuracy**
   - Generate random pricing contexts
   - Verify displayed prices match constants
   - **Feature: pricing-tier-implementation, Property 5: Pricing displays are accurate**
   - **Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7**

6. **Property 6: Priority processing correlation**
   - Generate random user plans
   - Verify priority matches priority_processing flag
   - **Feature: pricing-tier-implementation, Property 6: Priority processing is plan-based**
   - **Validates: Requirements 6.1, 6.2, 6.3, 6.4, 6.5**

7. **Property 7: Grace window boundary**
   - Generate random usage counts at limit
   - Verify exactly one extra pack allowed
   - **Feature: pricing-tier-implementation, Property 7: Grace window allows exactly one extra pack**
   - **Validates: Requirements 7.1, 7.2, 7.3**

8. **Property 8: Plan check consistency**
   - Generate random feature access requests
   - Verify all return same error structure
   - **Feature: pricing-tier-implementation, Property 8: Plan checks are consistent**
   - **Validates: Requirements 8.1, 8.2, 8.3, 8.4**

### Integration Tests

1. **Full export flow with plan check**
   - Create free user
   - Attempt export
   - Verify 403 with correct error structure
   - Upgrade to student_pro
   - Verify export succeeds

2. **Quiz mode with feature gating**
   - Create free user
   - Attempt timed quiz
   - Verify blocked with upgrade prompt
   - Upgrade to student_pro
   - Verify timed quiz works

3. **Analytics visibility by tier**
   - Create users of each tier
   - Load insights tab
   - Verify correct analytics shown for each

4. **Priority processing verification**
   - Create free and paid users
   - Submit pack generation jobs
   - Verify paid jobs process first

5. **Price lock compatibility**
   - Create user with founding price lock
   - Verify locked prices displayed
   - Verify limits still enforced correctly

6. **Database limit updates**
   - Update plan_limits table
   - Clear cache
   - Verify new limits used immediately

7. **Grace window behavior**
   - Create user at monthly limit
   - Create one more pack (should succeed)
   - Attempt another (should fail)
   - Verify correct error messages
