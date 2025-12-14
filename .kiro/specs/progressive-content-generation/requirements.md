# Progressive Content Generation - Requirements

## Introduction

This specification defines the implementation of progressive content generation for study packs. Currently, all content (flashcards, quiz questions, and mind map nodes) is generated upfront based on plan limits, resulting in long wait times (1.3 minutes for free users, 5-10+ minutes for paid users). This creates a poor user experience where users cannot access their study pack until all content is fully generated.

The new system will generate a baseline amount of content quickly for all users, then allow paid users to generate additional content on-demand up to their plan limits. This provides immediate access to study materials while maintaining clear value differentiation between plan tiers.

## Glossary

- **Initial Generation**: The baseline content generated when a study pack is first created (fast, ~30 seconds)
- **On-Demand Generation**: Additional content generated when user clicks "Generate More" button
- **Batch Size**: The number of items generated per "Generate More" click
- **Content Limit**: Maximum number of items allowed per pack based on user's plan
- **Generation Quota**: Remaining items that can be generated (limit - current count)

## Goals

1. **Improve User Experience**: Reduce initial pack creation time from 1-10 minutes to ~30 seconds
2. **Provide Immediate Access**: Users can start studying with initial content while more generates
3. **Clear Value Proposition**: Paid users see tangible "Generate More" options showing their plan benefits
4. **Cost Optimization**: Only generate content users actually want, reducing unnecessary API costs
5. **User Control**: Let users decide if they need more content rather than forcing maximum generation

## Non-Goals

- Automatic background generation of remaining content
- Real-time streaming of content as it generates
- Changing the underlying AI generation quality or algorithms
- Modifying existing study packs created before this feature

## User Stories

### Story 1: Fast Pack Creation for All Users
**As a** user creating a study pack  
**I want** to access my study materials within 30 seconds  
**So that** I can start studying immediately without long wait times

### Story 2: On-Demand Content for Paid Users
**As a** paid user viewing my study pack  
**I want** to generate additional flashcards/quizzes/mindmap nodes when I need them  
**So that** I have control over how much content I create and can see the value of my plan

### Story 3: Clear Limit Visibility
**As a** user viewing content tabs  
**I want** to see how many items I currently have vs. my plan limit  
**So that** I understand what I can generate and when I need to upgrade

### Story 4: Upgrade Prompts for Free Users
**As a** free user who has reached my content limit  
**I want** to see what I could get with a paid plan  
**So that** I can make an informed decision about upgrading

## Requirements

### Requirement 1: Updated Plan Limits

**User Story:** Story 1, Story 3

The system SHALL implement new plan limits with separate initial and maximum values:

#### 1.1 Free Plan Limits
- WHEN a free user creates a study pack
- THEN the system SHALL generate:
  - 20 flashcards (initial and maximum)
  - 8 quiz questions (initial and maximum)
  - 40 mind map nodes (initial and maximum)
- AND the system SHALL allow 3 packs per month
- AND the system SHALL NOT show "Generate More" buttons

#### 1.2 Student Pro Plan Limits
- WHEN a Student Pro user creates a study pack
- THEN the system SHALL generate initially:
  - 20 flashcards
  - 10 quiz questions
  - 50 mind map nodes
- AND the system SHALL allow generation up to:
  - 120 flashcards maximum
  - 30 quiz questions maximum
  - 250 mind map nodes maximum
- AND the system SHALL allow 50 packs per month
- AND the system SHALL show "Generate More" buttons with batch sizes:
  - +30 flashcards per click
  - +10 quiz questions per click
  - +60 mind map nodes per click

#### 1.3 Pro Plus Plan Limits
- WHEN a Pro Plus user creates a study pack
- THEN the system SHALL generate initially:
  - 25 flashcards
  - 15 quiz questions
  - 60 mind map nodes
- AND the system SHALL allow generation up to:
  - 200 flashcards maximum
  - 60 quiz questions maximum
  - 800 mind map nodes maximum
- AND the system SHALL allow 150 packs per month
- AND the system SHALL show "Generate More" buttons with batch sizes:
  - +50 flashcards per click
  - +15 quiz questions per click
  - +100 mind map nodes per click

### Requirement 2: Initial Pack Generation

**User Story:** Story 1

#### 2.1 Fast Initial Generation
- WHEN a user creates a study pack
- THEN the system SHALL generate only the initial content amounts based on their plan
- AND the generation SHALL complete within 45 seconds
- AND the user SHALL be redirected to the study pack page immediately after generation

#### 2.2 Initial Content Quality
- WHEN generating initial content
- THEN the system SHALL maintain the same quality standards as current generation
- AND the system SHALL use the same AI prompts and validation
- AND the system SHALL distribute content across all material chunks

### Requirement 3: On-Demand Content Generation

**User Story:** Story 2

#### 3.1 Generate More Flashcards
- WHEN a paid user clicks "Generate More Flashcards"
- THEN the system SHALL:
  - Calculate remaining quota (max limit - current count)
  - Generate min(batch size, remaining quota) new flashcards
  - Append new flashcards to existing ones
  - Update the UI to show new count
  - Disable the button if at maximum limit

#### 3.2 Generate More Quiz Questions
- WHEN a paid user clicks "Generate More Questions"
- THEN the system SHALL:
  - Calculate remaining quota (max limit - current count)
  - Generate min(batch size, remaining quota) new quiz questions
  - Append new questions to existing quiz
  - Update the UI to show new count
  - Disable the button if at maximum limit

#### 3.3 Generate More Mind Map Nodes
- WHEN a paid user clicks "Generate More Nodes"
- THEN the system SHALL:
  - Calculate remaining quota (max limit - current count)
  - Generate min(batch size, remaining quota) new mind map nodes
  - Integrate new nodes into existing mind map structure
  - Update the UI to show new count
  - Disable the button if at maximum limit

#### 3.4 Smart Quota Calculation
- WHEN calculating items to generate
- AND remaining quota < batch size
- THEN the system SHALL generate exactly remaining quota items
- AND the button SHALL show "Generate X more" where X = remaining quota
- EXAMPLE: User has 100/120 cards, batch size is 30
  - System generates 20 cards (not 30)
  - Button shows "Generate 20 more flashcards"

#### 3.5 Generation State Management
- WHEN content is being generated
- THEN the system SHALL:
  - Show loading state on the "Generate More" button
  - Disable the button to prevent duplicate requests
  - Keep other tabs functional (don't disable entire interface)
  - Show a toast notification when generation completes
  - Handle errors gracefully with user-friendly messages

### Requirement 4: UI/UX for Content Tabs

**User Story:** Story 2, Story 3, Story 4

#### 4.1 Progress Indicator
- WHEN a user views any content tab (Flashcards, Quiz, Mind Map)
- THEN the system SHALL display current count vs. maximum
- FORMAT: "X / Y items" where X = current, Y = plan maximum
- EXAMPLE: "20 / 120 flashcards"

#### 4.2 Generate More Button (Paid Users)
- WHEN a paid user views a content tab
- AND current count < maximum limit
- THEN the system SHALL show a "Generate More" button
- AND the button SHALL display:
  - Icon (Sparkles for Student Pro, Crown for Pro Plus)
  - Text: "Generate +X more" where X = min(batch size, remaining quota)
  - Remaining count: "(Y remaining)" where Y = max - current
- EXAMPLE: "✨ Generate +30 more flashcards (100 remaining)"

#### 4.3 Generate More Button (At Limit)
- WHEN a paid user has reached their content limit
- THEN the system SHALL:
  - Hide the "Generate More" button
  - Show a success message: "You've generated all X items for this pack"
  - Display a checkmark icon

#### 4.4 Upgrade Prompt (Free Users)
- WHEN a free user views a content tab
- THEN the system SHALL show an UpgradePrompt component
- AND the prompt SHALL display:
  - Feature name: "Generate More [Content Type]"
  - Required plan: "student_pro"
  - Benefits list showing what they could generate
  - "Upgrade to Student Pro" button
- AND clicking the button SHALL open PaywallModal

#### 4.5 Loading State
- WHEN content is being generated
- THEN the affected tab SHALL show:
  - Disabled "Generate More" button with spinner
  - Loading text: "Generating X items..."
  - Existing content remains visible and functional

### Requirement 5: API Endpoints

**User Story:** Story 2

#### 5.1 Generate More Flashcards Endpoint
- ENDPOINT: `POST /api/study-packs/[id]/flashcards/generate-more`
- REQUEST BODY: `{ batchSize?: number }`
- RESPONSE: `{ success: boolean, generated: number, total: number, remaining: number }`
- AUTHENTICATION: Required (user must own the study pack)
- AUTHORIZATION: User must have paid plan (student_pro or pro_plus)
- VALIDATION:
  - Study pack exists and belongs to user
  - User has paid plan
  - Current count < maximum limit
  - Batch size doesn't exceed remaining quota

#### 5.2 Generate More Quiz Questions Endpoint
- ENDPOINT: `POST /api/study-packs/[id]/quiz/generate-more`
- REQUEST BODY: `{ batchSize?: number }`
- RESPONSE: `{ success: boolean, generated: number, total: number, remaining: number }`
- AUTHENTICATION: Required (user must own the study pack)
- AUTHORIZATION: User must have paid plan (student_pro or pro_plus)
- VALIDATION: Same as 5.1

#### 5.3 Generate More Mind Map Nodes Endpoint
- ENDPOINT: `POST /api/study-packs/[id]/mindmap/generate-more`
- REQUEST BODY: `{ batchSize?: number }`
- RESPONSE: `{ success: boolean, generated: number, total: number, remaining: number }`
- AUTHENTICATION: Required (user must own the study pack)
- AUTHORIZATION: User must have paid plan (student_pro or pro_plus)
- VALIDATION: Same as 5.1

### Requirement 6: Database Schema Updates

**User Story:** Story 2, Story 3

#### 6.1 Plan Limits Table Updates
- WHEN storing plan limits
- THEN the system SHALL add new columns to plan_limits or update DEFAULT_PLAN_LIMITS:
  - `initial_cards_per_pack` (integer)
  - `initial_questions_per_quiz` (integer)
  - `initial_mindmap_nodes` (integer)
  - `batch_cards_size` (integer, nullable for free plan)
  - `batch_questions_size` (integer, nullable for free plan)
  - `batch_nodes_size` (integer, nullable for free plan)

#### 6.2 Study Pack Stats Tracking
- WHEN a study pack is created or content is generated
- THEN the system SHALL update `stats_json` in study_packs table:
  - `cardCount`: current number of flashcards
  - `quizQuestionCount`: current number of quiz questions
  - `mindMapNodeCount`: current number of mind map nodes
- AND these counts SHALL be used to calculate remaining quota

### Requirement 7: Generation Service Updates

**User Story:** Story 2

#### 7.1 Incremental Flashcard Generation
- WHEN GenerationService.generateFlashcards() is called with existing cards
- THEN the system SHALL:
  - Fetch existing flashcard topics to maintain consistency
  - Generate new cards that complement existing ones
  - Avoid duplicate content
  - Maintain topic distribution
  - Insert new cards with proper SRS initialization

#### 7.2 Incremental Quiz Generation
- WHEN GenerationService.generateQuiz() is called with existing questions
- THEN the system SHALL:
  - Fetch existing quiz questions to avoid duplicates
  - Generate new questions covering different aspects
  - Append to existing quiz_items table
  - Maintain difficulty distribution

#### 7.3 Incremental Mind Map Generation
- WHEN GenerationService.generateMindMap() is called with existing nodes
- THEN the system SHALL:
  - Fetch existing mind map structure
  - Generate new nodes that integrate with existing hierarchy
  - Update parent-child relationships appropriately
  - Maintain visual layout coherence

### Requirement 8: Pricing Display Updates

**User Story:** Story 3, Story 4

#### 8.1 PaywallModal Updates
- WHEN displaying plan features in PaywallModal
- THEN the system SHALL update feature lists:
  - Free: "3 packs/month, 20 cards, 8 questions, 40 nodes"
  - Student Pro: "50 packs/month, up to 120 cards, up to 30 questions, up to 250 nodes"
  - Pro Plus: "150 packs/month, up to 200 cards, up to 60 questions, up to 800 nodes"

#### 8.2 PricingSection Updates
- WHEN displaying pricing on marketing page
- THEN the system SHALL update feature lists to match new limits
- AND use "up to X" language for paid plans

### Requirement 9: Backward Compatibility

**User Story:** N/A (Technical requirement)

#### 9.1 Existing Study Packs
- WHEN a user views a study pack created before this feature
- THEN the system SHALL:
  - Display content as-is without modification
  - NOT show "Generate More" buttons
  - Calculate stats_json if missing
  - Allow normal studying functionality

#### 9.2 Migration Strategy
- WHEN deploying this feature
- THEN the system SHALL:
  - NOT modify existing study pack content
  - Update plan limits in code (DEFAULT_PLAN_LIMITS)
  - Add new API endpoints without breaking existing ones
  - Maintain backward compatibility with old generation flow

## Success Metrics

1. **Pack Creation Time**: Average time from upload to pack access < 45 seconds (down from 1-10 minutes)
2. **User Satisfaction**: Reduced bounce rate during pack creation by 50%
3. **Feature Adoption**: 60%+ of paid users use "Generate More" at least once
4. **Cost Efficiency**: 30% reduction in AI API costs from avoided unnecessary generation
5. **Upgrade Conversion**: 10% increase in free-to-paid conversion from clear value visibility

## Open Questions

None - all questions answered by user.

## Dependencies

- OpenAI API for content generation
- Supabase database for storage
- Inngest for initial pack generation (existing)
- Next.js API routes for new endpoints

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Users expect all content upfront | Medium | Clear UI showing "Generate More" as a premium feature |
| Incremental generation produces lower quality | High | Use same prompts, maintain context from existing content |
| Database performance with frequent updates | Low | Use efficient queries, index on study_pack_id |
| Race conditions from multiple generate clicks | Medium | Implement request debouncing and server-side locking |
