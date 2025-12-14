# Progressive Content Generation - Tasks

## Phase 1: Core Infrastructure (Backend)

### Task 1.1: Update Plan Limits Type Definition
**Requirement:** 1.1, 1.2, 1.3

- [ ] Update `PlanLimits` interface in `src/lib/types/usage.ts`
  - Add `initialCardsPerPack: number`
  - Add `initialQuestionsPerQuiz: number`
  - Add `initialMindmapNodes: number`
  - Add `batchCardsSize: number | null`
  - Add `batchQuestionsSize: number | null`
  - Add `batchNodesSize: number | null`

- [ ] Update `DEFAULT_PLAN_LIMITS` constant with new values:
  - **Free plan:**
    - `packsPerMonth: 3`
    - `cardsPerPack: 20`, `initialCardsPerPack: 20`, `batchCardsSize: null`
    - `questionsPerQuiz: 8`, `initialQuestionsPerQuiz: 8`, `batchQuestionsSize: null`
    - `mindmapNodesLimit: 40`, `initialMindmapNodes: 40`, `batchNodesSize: null`
  - **Student Pro plan:**
    - `packsPerMonth: 50`
    - `cardsPerPack: 120`, `initialCardsPerPack: 20`, `batchCardsSize: 30`
    - `questionsPerQuiz: 30`, `initialQuestionsPerQuiz: 10`, `batchQuestionsSize: 10`
    - `mindmapNodesLimit: 250`, `initialMindmapNodes: 50`, `batchNodesSize: 60`
  - **Pro Plus plan:**
    - `packsPerMonth: 150`
    - `cardsPerPack: 200`, `initialCardsPerPack: 25`, `batchCardsSize: 50`
    - `questionsPerQuiz: 60`, `initialQuestionsPerQuiz: 15`, `batchQuestionsSize: 15`
    - `mindmapNodesLimit: 800`, `initialMindmapNodes: 60`, `batchNodesSize: 100`

**Acceptance Criteria:**
- Type definitions compile without errors
- All plan tiers have complete limit definitions
- Free plan has null batch sizes
- Paid plans have positive batch sizes

---

### Task 1.2: Update Initial Pack Generation
**Requirement:** 2.1, 2.2

- [ ] Modify `src/lib/inngest/functions/generate-pack.ts`
  - Change flashcard generation to use `limits.initialCardsPerPack`
  - Change quiz generation to use `limits.initialQuestionsPerQuiz`
  - Change mindmap generation to use `limits.initialMindmapNodes`
  - Verify generation completes in <45 seconds

**Acceptance Criteria:**
- Initial generation uses new initial limits
- Pack creation time reduced to ~30-45 seconds
- All existing functionality still works
- Stats JSON correctly reflects initial counts

---

### Task 1.3: Create Incremental Flashcard Generation Method
**Requirement:** 3.1, 7.1

- [x] Add `generateFlashcardsIncremental()` to `src/lib/services/GenerationService.ts`
  - Accept parameters: `studyPackId`, `chunks`, `targetCount`
  - Fetch existing flashcards to understand context
  - Extract existing topics for consistency
  - Generate new cards with context about existing ones
  - Avoid duplicate content
  - Insert new cards with proper SRS initialization
  - Return number of cards generated

**Acceptance Criteria:**
- Method generates requested number of cards (or less if quota reached)
- New cards complement existing ones (no duplicates)
- Topics are consistent with existing cards
- SRS values properly initialized
- Method handles errors gracefully

---

### Task 1.4: Create Incremental Quiz Generation Method
**Requirement:** 3.2, 7.2

- [x] Add `generateQuizIncremental()` to `src/lib/services/GenerationService.ts`
  - Accept parameters: `studyPackId`, `chunks`, `targetCount`
  - Fetch existing quiz questions
  - Identify covered topics/concepts
  - Generate new questions covering different aspects
  - Insert into quiz_items table
  - Return number of questions generated

**Acceptance Criteria:**
- Method generates requested number of questions
- New questions cover different material than existing ones
- Questions maintain difficulty distribution
- Properly linked to existing quiz record

---

### Task 1.5: Create Incremental Mind Map Generation Method
**Requirement:** 3.3, 7.3

- [x] Add `generateMindMapIncremental()` to `src/lib/services/GenerationService.ts`
  - Accept parameters: `studyPackId`, `chunks`, `targetCount`
  - Fetch existing mind map nodes and structure
  - Identify gaps in coverage
  - Generate new nodes that integrate with existing hierarchy
  - Update parent-child relationships
  - Maintain visual layout coherence
  - Return number of nodes generated

**Acceptance Criteria:**
- Method generates requested number of nodes
- New nodes integrate with existing structure
- Parent-child relationships are valid
- Layout remains coherent

---

## Phase 2: API Endpoints

### Task 2.1: Create Generate More Flashcards Endpoint
**Requirement:** 3.1, 3.4, 5.1

- [x] Create `src/app/api/study-packs/[id]/flashcards/generate-more/route.ts`
  - Implement POST handler
  - Authenticate user (verify session)
  - Verify pack ownership
  - Get user's plan limits
  - Verify user has paid plan (`batchCardsSize !== null`)
  - Count existing flashcards
  - Calculate remaining quota: `max - current`
  - If remaining === 0, return 409 error
  - Calculate actual generation: `min(batchSize, remaining)`
  - Call `GenerationService.generateFlashcardsIncremental()`
  - Update `stats_json.cardCount` in study_packs table
  - Return success response with counts

**Acceptance Criteria:**
- Endpoint requires authentication
- Only pack owner can generate content
- Free users get 403 error
- Users at limit get 409 error
- Generated count never exceeds remaining quota
- Stats JSON updated correctly
- Returns proper error codes and messages

---

### Task 2.2: Create Generate More Quiz Questions Endpoint
**Requirement:** 3.2, 3.4, 5.2

- [x] Create `src/app/api/study-packs/[id]/quiz/generate-more/route.ts`
  - Same structure as Task 2.1 but for quiz questions
  - Use `batchQuestionsSize` and `questionsPerQuiz` limits
  - Call `GenerationService.generateQuizIncremental()`
  - Update `stats_json.quizQuestionCount`

**Acceptance Criteria:**
- Same as Task 2.1 but for quiz questions

---

### Task 2.3: Create Generate More Mind Map Nodes Endpoint
**Requirement:** 3.3, 3.4, 5.3

- [x] Create `src/app/api/study-packs/[id]/mindmap/generate-more/route.ts`
  - Same structure as Task 2.1 but for mind map nodes
  - Use `batchNodesSize` and `mindmapNodesLimit` limits
  - Call `GenerationService.generateMindMapIncremental()`
  - Update `stats_json.mindMapNodeCount`

**Acceptance Criteria:**
- Same as Task 2.1 but for mind map nodes

---

## Phase 3: UI Components

### Task 3.1: Create GenerateMoreButton Component
**Requirement:** 4.2, 4.3, 4.5

- [ ] Create `src/components/study-packs/GenerateMoreButton.tsx`
  - Accept props: `contentType`, `studyPackId`, `currentCount`, `maxLimit`, `batchSize`, `userPlan`, `onGenerated`
  - Calculate remaining quota
  - Calculate items to generate: `min(batchSize, remaining)`
  - Show success message if at limit (with checkmark)
  - Show button with icon (Sparkles for Student Pro, Crown for Pro Plus)
  - Display: "Generate +X more (Y remaining)"
  - Handle click: call appropriate API endpoint
  - Show loading state while generating
  - Disable button during generation
  - Show toast notification on success/error
  - Call `onGenerated` callback with new count

**Acceptance Criteria:**
- Button shows correct text and icon based on plan
- Calculates remaining quota correctly
- Never tries to generate more than remaining
- Shows loading state during generation
- Handles errors gracefully
- Updates parent component on success

---

### Task 3.2: Update FlashcardsTab Component
**Requirement:** 4.1, 4.2, 4.4

- [ ] Modify `src/components/study-packs/tabs/FlashcardsTab.tsx`
  - Add state for `cardCount` and `limits`
  - Fetch current card count on mount
  - Fetch plan limits on mount
  - Display progress indicator: "X / Y flashcards"
  - Show `GenerateMoreButton` if paid user and not at limit
  - Show `UpgradePrompt` if free user
  - Pass `onGenerated` callback to update count

**Acceptance Criteria:**
- Progress indicator shows current/max counts
- Generate More button appears for paid users
- Upgrade prompt appears for free users
- Count updates after successful generation
- Existing flashcard functionality unchanged

---

### Task 3.3: Update QuizTab Component
**Requirement:** 4.1, 4.2, 4.4

- [ ] Modify `src/components/study-packs/tabs/QuizTab.tsx`
  - Same changes as Task 3.2 but for quiz questions
  - Display: "X / Y questions"
  - Use quiz-specific limits and batch sizes

**Acceptance Criteria:**
- Same as Task 3.2 but for quiz questions

---

### Task 3.4: Update MindMapTab Component
**Requirement:** 4.1, 4.2, 4.4

- [ ] Modify `src/components/study-packs/tabs/MindMapTab.tsx`
  - Same changes as Task 3.2 but for mind map nodes
  - Display: "X / Y nodes"
  - Use mindmap-specific limits and batch sizes

**Acceptance Criteria:**
- Same as Task 3.2 but for mind map nodes

---

## Phase 4: Pricing Display Updates

### Task 4.1: Update PaywallModal
**Requirement:** 8.1

- [ ] Modify `src/components/paywall/PaywallModal.tsx`
  - Update `PLANS.free.features`:
    - "3 packs per month"
    - "20 flashcards per pack"
    - "8 quiz questions"
    - "40 mind map nodes"
    - "No exports"
  - Update `PLANS.student_pro.features`:
    - "50 packs per month"
    - "Up to 120 flashcards per pack"
    - "Up to 30 quiz questions"
    - "Up to 250 mind map nodes"
    - "Generate more content on-demand"
    - (keep existing features)
  - Update `PLANS.pro_plus.features`:
    - "150 packs per month"
    - "Up to 200 flashcards per pack"
    - "Up to 60 quiz questions"
    - "Up to 800 mind map nodes"
    - "Generate more content on-demand"
    - (keep existing features)

**Acceptance Criteria:**
- All plan features accurately reflect new limits
- "Up to X" language used for paid plans
- "Generate more on-demand" feature highlighted

---

### Task 4.2: Update PricingSection Marketing Page
**Requirement:** 8.2

- [ ] Modify `src/components/marketing/PricingSection.tsx`
  - Update feature lists to match PaywallModal
  - Use "up to X" language for paid plans
  - Highlight on-demand generation as a feature

**Acceptance Criteria:**
- Marketing page matches PaywallModal features
- Clear value differentiation between tiers
- On-demand generation positioned as premium feature

---

## Phase 5: Testing

### Task 5.1: Update Plan Limits Tests
**Requirement:** 1.1, 1.2, 1.3

- [ ] Update `src/lib/services/__tests__/PlanLimits.property.test.ts`
  - Update expected values for all plan tiers
  - Add tests for new initial/batch limit fields
  - Verify free plan has null batch sizes
  - Verify paid plans have positive batch sizes
  - Verify initial limits <= max limits

**Acceptance Criteria:**
- All tests pass with new limit values
- New fields properly tested
- Hierarchical limits still enforced

---

### Task 5.2: Create Incremental Generation Tests
**Requirement:** 7.1, 7.2, 7.3

- [ ] Create `src/lib/services/__tests__/IncrementalGeneration.test.ts`
  - Test `generateFlashcardsIncremental()` with existing cards
  - Test `generateQuizIncremental()` with existing questions
  - Test `generateMindMapIncremental()` with existing nodes
  - Verify no duplicate content
  - Verify topic consistency
  - Verify quota limits respected

**Acceptance Criteria:**
- All incremental generation methods tested
- Edge cases covered (at limit, near limit, etc.)
- Quality maintained (no duplicates, consistent topics)

---

### Task 5.3: Create API Endpoint Tests
**Requirement:** 5.1, 5.2, 5.3

- [ ] Create `src/app/api/study-packs/__tests__/generate-more.test.ts`
  - Test authentication requirements
  - Test authorization (pack ownership, paid plan)
  - Test quota calculations
  - Test error responses (403, 404, 409, 500)
  - Test successful generation
  - Test stats JSON updates

**Acceptance Criteria:**
- All endpoints properly tested
- Auth/authz enforced
- Error cases handled
- Stats updated correctly

---

### Task 5.4: Create UI Component Tests
**Requirement:** 4.1, 4.2, 4.3, 4.4, 4.5

- [ ] Create `src/components/study-packs/__tests__/GenerateMoreButton.test.tsx`
  - Test button rendering for different states
  - Test quota calculations
  - Test loading states
  - Test error handling
  - Test success callbacks

- [ ] Update tab component tests
  - Test progress indicator display
  - Test Generate More button visibility
  - Test Upgrade prompt visibility
  - Test count updates after generation

**Acceptance Criteria:**
- All UI components have test coverage
- Different user states tested (free, paid, at limit)
- Loading and error states tested

---

## Phase 6: Documentation & Deployment

### Task 6.1: Update Documentation
**Requirement:** All

- [ ] Update `docs/feature-checklist.md` with new limits
- [ ] Update `docs/api-documentation.md` with new endpoints
- [ ] Create user guide for "Generate More" feature
- [ ] Update README if needed

**Acceptance Criteria:**
- All documentation reflects new limits
- New endpoints documented
- User-facing documentation clear and helpful

---

### Task 6.2: Deploy to Staging
**Requirement:** All

- [ ] Deploy all changes to staging environment
- [ ] Test full flow: create pack → generate more content
- [ ] Test all three content types (flashcards, quiz, mindmap)
- [ ] Test as free user (see upgrade prompts)
- [ ] Test as paid user (generate more works)
- [ ] Verify pack creation time <45 seconds
- [ ] Check error handling

**Acceptance Criteria:**
- All features work in staging
- No regressions in existing functionality
- Performance targets met
- Error handling works correctly

---

### Task 6.3: Production Deployment
**Requirement:** All

- [ ] Deploy to production
- [ ] Monitor pack creation times
- [ ] Monitor "Generate More" usage rates
- [ ] Monitor error rates on new endpoints
- [ ] Check Sentry for any new errors
- [ ] Verify Inngest function performance

**Acceptance Criteria:**
- Successful deployment with no downtime
- Pack creation times <45 seconds
- No critical errors
- Feature adoption tracking in place

---

### Task 6.4: Post-Launch Monitoring
**Requirement:** All

- [ ] Monitor for 48 hours post-launch
- [ ] Track pack creation time metrics
- [ ] Track "Generate More" button clicks
- [ ] Track upgrade prompt interactions
- [ ] Collect user feedback
- [ ] Address any issues that arise

**Acceptance Criteria:**
- Metrics collected and analyzed
- User feedback reviewed
- Any critical issues resolved quickly
- Success metrics trending positively

---

## Optional Enhancements (Future)

### Task 7.1: Add Rate Limiting
- [ ] Implement rate limiting on generate-more endpoints
- [ ] Max 1 request per 30 seconds per content type
- [ ] Return 429 error if rate limit exceeded

### Task 7.2: Add Analytics Events
- [ ] Track "generate_more_clicked" event
- [ ] Track "generate_more_completed" event
- [ ] Track "upgrade_prompt_shown" event
- [ ] Track "upgrade_prompt_clicked" event

### Task 7.3: Add Progress Notifications
- [ ] Show progress bar during generation
- [ ] Send browser notification when complete
- [ ] Add sound effect on completion (optional)

### Task 7.4: Add Batch Size Customization
- [ ] Allow users to choose custom batch size
- [ ] Add slider or input field
- [ ] Validate against remaining quota
- [ ] Save preference for future generations

---

## Task Dependencies

```
Phase 1 (Backend) → Phase 2 (API) → Phase 3 (UI) → Phase 4 (Pricing)
                                                   ↓
                                              Phase 5 (Testing)
                                                   ↓
                                              Phase 6 (Deploy)
```

**Critical Path:**
1.1 → 1.2 → 1.3, 1.4, 1.5 → 2.1, 2.2, 2.3 → 3.1 → 3.2, 3.3, 3.4 → 6.2 → 6.3

**Parallel Work:**
- Phase 4 can be done alongside Phase 3
- Phase 5 tests can be written alongside implementation
- Documentation (6.1) can be done anytime after design is finalized

---

## Estimated Timeline

- **Phase 1:** 2-3 days
- **Phase 2:** 2-3 days
- **Phase 3:** 3-4 days
- **Phase 4:** 1 day
- **Phase 5:** 2-3 days
- **Phase 6:** 2-3 days

**Total:** 12-17 days (2.5-3.5 weeks)

---

## Success Criteria

- [ ] Pack creation time reduced to <45 seconds for all users
- [ ] Paid users can generate additional content on-demand
- [ ] Free users see clear upgrade prompts
- [ ] No regressions in existing functionality
- [ ] All tests passing
- [ ] Documentation updated
- [ ] Successfully deployed to production
- [ ] Positive user feedback
