# Requirements Document

## Introduction

This specification defines the implementation of a comprehensive tiered pricing model for the study pack generation platform. The system currently has basic plan limits but lacks proper feature gating and optimized pricing tiers. This implementation will establish clear value differentiation between Free, Student, and Pro tiers by adjusting usage limits, gating premium features, updating pricing displays, and implementing priority processing for paid users.

The core principle is to limit "generation cost" (AI-powered pack creation) rather than "studying" (reviewing cards, taking quizzes). This aligns costs with actual resource consumption while providing generous per-pack limits to avoid nickel-and-diming users.

## Glossary

- **System**: The study pack generation platform
- **Plan Tier**: A subscription level (Free, Student, Pro)
- **Pack**: A generated study pack containing flashcards, quizzes, and mind maps
- **Usage Limit**: Monthly quota for pack generation
- **Per-Pack Limit**: Maximum content items within a single pack
- **Feature Gate**: Access control that restricts features based on plan tier
- **Priority Processing**: Faster queue processing for paid plan users
- **Export Format**: File format for downloading study materials (PDF, CSV, Anki, etc.)
- **Timed Mode**: Quiz feature that tracks completion time
- **Weak Topics**: Practice mode focusing on poorly-performing areas
- **Advanced Analytics**: Premium insights including due load forecasts and mastery tracking
- **Grace Window**: One additional pack allowed after reaching monthly limit
- **Founding Price Lock**: Guaranteed pricing for early adopters (12 months)

## Requirements

### Requirement 1: Plan Limit Configuration

**User Story:** As a platform administrator, I want to configure appropriate usage limits for each plan tier, so that costs align with value and users have clear upgrade incentives.

#### Acceptance Criteria

1. WHEN the System stores plan limits THEN the plan_limits table SHALL contain packs_per_month values of 5 for free, 60 for student_pro, and 300 for pro_plus
2. WHEN the System stores plan limits THEN the plan_limits table SHALL contain cards_per_pack values of 40 for free, 120 for student_pro, and 300 for pro_plus
3. WHEN the System stores plan limits THEN the plan_limits table SHALL contain questions_per_quiz values of 15 for free, 30 for student_pro, and 60 for pro_plus
4. WHEN the System stores plan limits THEN the plan_limits table SHALL contain mindmap_nodes_limit values of 80 for free, 250 for student_pro, and 800 for pro_plus
5. WHEN the System retrieves plan limits from the database THEN the System SHALL cache the limits for 5 minutes to reduce database queries
6. WHEN the System cannot retrieve plan limits from the database THEN the System SHALL use fallback limits from DEFAULT_PLAN_LIMITS constant

### Requirement 2: Export Feature Gating

**User Story:** As a free tier user, I want clear indication of which export features require an upgrade, so that I understand the value of paid plans.

#### Acceptance Criteria

1. WHEN a free tier user attempts to export flashcards to Anki format THEN the System SHALL return a 403 error with code PLAN_UPGRADE_REQUIRED
2. WHEN a free tier user attempts to export notes to PDF THEN the System SHALL return a 403 error with code PLAN_UPGRADE_REQUIRED
3. WHEN a free tier user attempts to export flashcards to CSV THEN the System SHALL return a 403 error with code PLAN_UPGRADE_REQUIRED
4. WHEN a free tier user attempts to export mind map to image THEN the System SHALL return a 403 error with code PLAN_UPGRADE_REQUIRED
5. WHEN a free tier user attempts to export mind map to Markdown THEN the System SHALL return a 403 error with code PLAN_UPGRADE_REQUIRED
6. WHEN a student_pro or pro_plus user attempts any export THEN the System SHALL generate and return the requested export file
7. WHEN an export API returns a plan upgrade error THEN the error response SHALL include the user's current plan and required plan

### Requirement 3: Quiz Feature Gating

**User Story:** As a student tier user, I want access to timed quiz mode and weak topics practice, so that I can prepare more effectively for exams.

#### Acceptance Criteria

1. WHEN a free tier user views the quiz interface THEN the System SHALL display timed mode toggle as disabled with an upgrade prompt
2. WHEN a free tier user views the quiz interface THEN the System SHALL display weak topics mode as disabled with an upgrade prompt
3. WHEN a student_pro or pro_plus user views the quiz interface THEN the System SHALL display timed mode toggle as enabled
4. WHEN a student_pro or pro_plus user views the quiz interface THEN the System SHALL display weak topics mode as enabled
5. WHEN a free tier user attempts to start a timed quiz via API THEN the System SHALL return a 403 error with code PLAN_UPGRADE_REQUIRED
6. WHEN a free tier user attempts to start weak topics practice via API THEN the System SHALL return a 403 error with code PLAN_UPGRADE_REQUIRED
7. WHEN a student_pro or pro_plus user starts a timed quiz THEN the System SHALL track and display elapsed time during the quiz

### Requirement 4: Analytics Feature Gating

**User Story:** As a pro tier user, I want access to advanced analytics features, so that I can gain deeper insights into my learning progress.

#### Acceptance Criteria

1. WHEN a free or student_pro user views the insights tab THEN the System SHALL display basic statistics only
2. WHEN a pro_plus user views the insights tab THEN the System SHALL display all analytics including due load forecast, lapse tracking, and topic mastery
3. WHEN a free or student_pro user views advanced analytics components THEN the System SHALL display an upgrade prompt overlay
4. WHEN the System determines which analytics to show THEN the System SHALL check the user's plan tier from the users table
5. WHEN a user's plan changes THEN the System SHALL immediately reflect the new analytics access level without requiring logout

### Requirement 5: Pricing Display Updates

**User Story:** As a potential customer, I want to see accurate pricing and feature information, so that I can make an informed purchase decision.

#### Acceptance Criteria

1. WHEN the System displays pricing in PricingService THEN the student_pro_monthly price SHALL be €7.99
2. WHEN the System displays pricing in PricingService THEN the student_pro_semester price SHALL be €24.00
3. WHEN the System displays pricing in PricingService THEN the pro_plus_monthly price SHALL be €11.99
4. WHEN the PaywallModal displays plan features THEN the free tier SHALL show "5 packs per month, 40 cards per pack, 15-question quizzes, 80 mind map nodes, No exports"
5. WHEN the PaywallModal displays plan features THEN the student_pro tier SHALL show "60 packs per month, 120 cards per pack, 30-question quizzes, 250 mind map nodes, All exports, Timed mode, Weak topics practice, Priority processing"
6. WHEN the PaywallModal displays plan features THEN the pro_plus tier SHALL show "300 packs per month, 300 cards per pack, 60-question quizzes, 800 mind map nodes, All exports, Advanced analytics, Priority processing"
7. WHEN the PricingSection marketing page displays plans THEN the feature lists SHALL match the actual system capabilities
8. WHEN the System applies founding price locks THEN the locked prices SHALL match the current FOUNDING_PRICES constant values

### Requirement 6: Priority Processing Implementation

**User Story:** As a paid tier user, I want my study packs to generate faster than free tier users, so that I receive better service for my subscription.

#### Acceptance Criteria

1. WHEN the System enqueues a pack generation job THEN the System SHALL check the user's plan tier from the users table
2. WHEN a free tier user creates a pack THEN the System SHALL enqueue the generation job with priority "low"
3. WHEN a student_pro or pro_plus user creates a pack THEN the System SHALL enqueue the generation job with priority "high"
4. WHEN Inngest processes the job queue THEN the System SHALL process high priority jobs before low priority jobs
5. WHEN the System retrieves plan limits THEN the priority_processing field SHALL be false for free tier and true for paid tiers
6. WHEN multiple jobs are queued THEN the System SHALL maintain FIFO order within each priority level

### Requirement 7: Grace Window Behavior

**User Story:** As a user approaching my monthly limit, I want one additional pack after reaching my limit, so that I can complete urgent work before upgrading.

#### Acceptance Criteria

1. WHEN a user has created exactly their monthly limit of packs THEN the System SHALL allow creation of one additional pack
2. WHEN a user has created their monthly limit plus one pack THEN the System SHALL return a 403 error with code QUOTA_EXCEEDED
3. WHEN the System allows a grace window pack THEN the usage response SHALL include hasGraceWindow: true
4. WHEN the System displays usage in PaywallModal THEN the System SHALL show a grace window message when currentUsage exceeds limit
5. WHEN the System logs usage events THEN the System SHALL log a grace_window_used event when the grace pack is created

### Requirement 8: Consistent Plan Checking

**User Story:** As a developer, I want a consistent pattern for checking user plans across all features, so that the codebase is maintainable and secure.

#### Acceptance Criteria

1. WHEN any API endpoint checks user plan THEN the System SHALL query the users table joining on auth_user_id
2. WHEN any API endpoint denies access due to plan limits THEN the System SHALL return HTTP 403 with a structured error including code, error message, and required plan
3. WHEN any component checks user plan THEN the System SHALL use the same plan tier type definitions from usage.ts
4. WHEN the System checks plan access THEN the System SHALL treat null or undefined plan values as "free" tier
5. WHEN the System validates plan access THEN the System SHALL use the PlanTier type to ensure type safety

### Requirement 9: Founding Price Lock Compatibility

**User Story:** As an early adopter with a founding price lock, I want the new pricing to respect my locked rates, so that I receive the promised benefit.

#### Acceptance Criteria

1. WHEN the System updates pricing constants THEN the founding price lock values in BenefitService SHALL remain at €7.99 monthly, €24.00 semester, €11.99 pro monthly
2. WHEN a user with an active price lock views pricing THEN the System SHALL display their locked prices instead of current market prices
3. WHEN a user with an active price lock upgrades THEN the System SHALL apply their locked pricing to the subscription
4. WHEN the System checks for price locks THEN the System SHALL verify the lock has not expired by comparing current date to expires_at
5. WHEN a price lock expires THEN the System SHALL automatically use current market prices for that user

### Requirement 10: Database Migration Safety

**User Story:** As a platform administrator, I want plan limit updates to be applied safely, so that existing users are not disrupted.

#### Acceptance Criteria

1. WHEN the System updates plan_limits table THEN the System SHALL use UPDATE statements with WHERE clauses to target specific plans
2. WHEN plan limits are updated THEN the System SHALL clear the plan limits cache to ensure new values are used immediately
3. WHEN the System cannot update plan_limits THEN the System SHALL continue using cached or fallback limits without crashing
4. WHEN plan limits are updated THEN the System SHALL log the changes for audit purposes
5. WHEN the System starts up THEN the System SHALL verify plan_limits table contains all three plan tiers
