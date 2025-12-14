# Progressive Content Generation - Design

## Overview

This design implements progressive content generation for study packs, replacing the current "generate everything upfront" approach with a two-phase system: fast initial generation followed by on-demand content expansion for paid users.

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     User Interface Layer                     │
├─────────────────────────────────────────────────────────────┤
│  FlashcardsTab  │  QuizTab  │  MindMapTab                   │
│  - Progress UI  │  - Progress UI  │  - Progress UI          │
│  - Generate More│  - Generate More│  - Generate More        │
│  - Upgrade Prompt│ - Upgrade Prompt│ - Upgrade Prompt       │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Routes Layer                        │
├─────────────────────────────────────────────────────────────┤
│  POST /api/study-packs/[id]/flashcards/generate-more        │
│  POST /api/study-packs/[id]/quiz/generate-more              │
│  POST /api/study-packs/[id]/mindmap/generate-more           │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   Generation Service Layer                   │
├─────────────────────────────────────────────────────────────┤
│  GenerationService.generateFlashcardsIncremental()          │
│  GenerationService.generateQuizIncremental()                │
│  GenerationService.generateMindMapIncremental()             │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      Database Layer                          │
├─────────────────────────────────────────────────────────────┤
│  study_packs (stats_json tracking)                          │
│  flashcards, quiz_items, mindmap_nodes                      │
│  plan_limits (updated with initial/batch values)            │
└─────────────────────────────────────────────────────────────┘
```

## Data Model

### Updated Plan Limits Type

```typescript
// src/lib/types/usage.ts

export interface PlanLimits {
  plan: PlanTier
  packsPerMonth: number
  
  // Maximum limits (unchanged)
  cardsPerPack: number
  questionsPerQuiz: number
  mindmapNodesLimit: number
  
  // NEW: Initial generation amounts
  initialCardsPerPack: number
  initialQuestionsPerQuiz: number
  initialMindmapNodes: number
  
  // NEW: Batch sizes for on-demand generation (null for free plan)
  batchCardsSize: number | null
  batchQuestionsSize: number | null
  batchNodesSize: number | null
  
  maxPagesPerMaterial: number
  maxTokensPerMaterial: number
  priorityProcessing: boolean
}

export const DEFAULT_PLAN_LIMITS: Record<PlanTier, PlanLimits> = {
  free: {
    plan: 'free',
    packsPerMonth: 3,
    cardsPerPack: 20,
    questionsPerQuiz: 8,
    mindmapNodesLimit: 40,
    initialCardsPerPack: 20,
    initialQuestionsPerQuiz: 8,
    initialMindmapNodes: 40,
    batchCardsSize: null,
    batchQuestionsSize: null,
    batchNodesSize: null,
    maxPagesPerMaterial: 50,
    maxTokensPerMaterial: 50000,
    priorityProcessing: false,
  },
  student_pro: {
    plan: 'student_pro',
    packsPerMonth: 50,
    cardsPerPack: 120,
    questionsPerQuiz: 30,
    mindmapNodesLimit: 250,
    initialCardsPerPack: 20,
    initialQuestionsPerQuiz: 10,
    initialMindmapNodes: 50,
    batchCardsSize: 30,
    batchQuestionsSize: 10,
    batchNodesSize: 60,
    maxPagesPerMaterial: 200,
    maxTokensPerMaterial: 200000,
    priorityProcessing: true,
  },
  pro_plus: {
    plan: 'pro_plus',
    packsPerMonth: 150,
    cardsPerPack: 200,
    questionsPerQuiz: 60,
    mindmapNodesLimit: 800,
    initialCardsPerPack: 25,
    initialQuestionsPerQuiz: 15,
    initialMindmapNodes: 60,
    batchCardsSize: 50,
    batchQuestionsSize: 15,
    batchNodesSize: 100,
    maxPagesPerMaterial: 500,
    maxTokensPerMaterial: 500000,
    priorityProcessing: true,
  },
}
```

### Study Pack Stats JSON

```typescript
// Existing structure in study_packs.stats_json
export interface StudyPackStats {
  coverage: CoverageLevel
  generationTime: number
  cardCount: number              // Current flashcard count
  quizQuestionCount: number      // Current quiz question count
  mindMapNodeCount: number       // Current mind map node count
  chunkUtilization: number
}
```

## API Design

### Generate More Flashcards

**Endpoint:** `POST /api/study-packs/[id]/flashcards/generate-more`

**Request:**
```typescript
{
  batchSize?: number  // Optional override, defaults to plan's batchCardsSize
}
```

**Response:**
```typescript
{
  success: boolean
  generated: number      // Number of cards actually generated
  total: number         // New total count
  remaining: number     // How many more can be generated
  message?: string      // Error message if success = false
}
```

**Flow:**
1. Authenticate user and verify pack ownership
2. Get user's plan limits
3. Verify user has paid plan (batchCardsSize !== null)
4. Count existing flashcards for this pack
5. Calculate remaining quota: `max - current`
6. Calculate actual generation amount: `min(batchSize, remaining)`
7. If remaining === 0, return error
8. Call `GenerationService.generateFlashcardsIncremental()`
9. Update `stats_json.cardCount` in study_packs table
10. Return success response

**Error Codes:**
- 401: Unauthorized
- 403: Forbidden (free plan or not pack owner)
- 404: Study pack not found
- 409: Already at maximum limit
- 500: Generation failed

### Generate More Quiz Questions

**Endpoint:** `POST /api/study-packs/[id]/quiz/generate-more`

Same structure as flashcards endpoint, but for quiz questions.

### Generate More Mind Map Nodes

**Endpoint:** `POST /api/study-packs/[id]/mindmap/generate-more`

Same structure as flashcards endpoint, but for mind map nodes.

## Generation Service Updates

### Incremental Flashcard Generation

```typescript
// src/lib/services/GenerationService.ts

/**
 * Generates additional flashcards for an existing study pack
 * Maintains consistency with existing cards
 */
static async generateFlashcardsIncremental(
  studyPackId: string,
  chunks: Chunk[],
  targetCount: number
): Promise<number> {
  const supabase = createServiceRoleClient()
  
  // 1. Fetch existing flashcards to understand context
  const { data: existingCards } = await supabase
    .from('flashcards')
    .select('front, back, topic')
    .eq('study_pack_id', studyPackId)
  
  // 2. Extract existing topics for consistency
  const existingTopics = [...new Set(existingCards?.map(c => c.topic) || [])]
  
  // 3. Generate new cards with context
  const prompt = `You are generating ADDITIONAL flashcards for an existing study pack.

EXISTING TOPICS: ${existingTopics.join(', ')}
EXISTING CARD COUNT: ${existingCards?.length || 0}

Generate ${targetCount} NEW flashcards that:
- Complement existing cards (don't duplicate)
- Use existing topics where appropriate
- Cover different aspects of the material
- Maintain consistent difficulty level

Content:
${chunks.map(c => c.content).join('\n\n')}

[Rest of prompt similar to original generateFlashcards...]`

  // 4. Generate and insert new cards
  // (Similar logic to existing generateFlashcards but with context)
  
  return generatedCount
}
```

### Incremental Quiz Generation

Similar approach to flashcards:
1. Fetch existing quiz questions
2. Identify covered topics/concepts
3. Generate new questions covering different areas
4. Insert into quiz_items table

### Incremental Mind Map Generation

More complex due to hierarchical structure:
1. Fetch existing mind map nodes and structure
2. Identify gaps in coverage
3. Generate new nodes that integrate with existing hierarchy
4. Update parent-child relationships
5. Maintain visual layout coherence

## UI Components

### Generate More Button Component

```typescript
// src/components/study-packs/GenerateMoreButton.tsx

interface GenerateMoreButtonProps {
  contentType: 'flashcards' | 'quiz' | 'mindmap'
  studyPackId: string
  currentCount: number
  maxLimit: number
  batchSize: number
  userPlan: PlanTier
  onGenerated: (newCount: number) => void
}

export default function GenerateMoreButton({
  contentType,
  studyPackId,
  currentCount,
  maxLimit,
  batchSize,
  userPlan,
  onGenerated
}: GenerateMoreButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const remaining = maxLimit - currentCount
  const toGenerate = Math.min(batchSize, remaining)
  
  if (remaining === 0) {
    return (
      <div className="flex items-center gap-2 text-green-600">
        <CheckCircle className="w-5 h-5" />
        <span>You've generated all {maxLimit} items for this pack</span>
      </div>
    )
  }
  
  const handleGenerate = async () => {
    setIsGenerating(true)
    try {
      const endpoint = `/api/study-packs/${studyPackId}/${contentType}/generate-more`
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batchSize: toGenerate })
      })
      
      if (!response.ok) throw new Error('Generation failed')
      
      const data = await response.json()
      onGenerated(data.total)
      toast.success(`Generated ${data.generated} new items!`)
    } catch (error) {
      toast.error('Failed to generate content')
    } finally {
      setIsGenerating(false)
    }
  }
  
  const Icon = userPlan === 'student_pro' ? Sparkles : Crown
  const colorClass = userPlan === 'student_pro' 
    ? 'bg-blue-600 hover:bg-blue-700' 
    : 'bg-orange-500 hover:bg-orange-600'
  
  return (
    <button
      onClick={handleGenerate}
      disabled={isGenerating}
      className={`${colorClass} text-white px-6 py-3 rounded-lg font-semibold text-[14px] transition-all shadow-sm hover:shadow-md active:scale-[0.98] flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {isGenerating ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Generating...</span>
        </>
      ) : (
        <>
          <Icon className="w-4 h-4" />
          <span>Generate +{toGenerate} more</span>
          <span className="text-white/80 text-[12px]">({remaining} remaining)</span>
        </>
      )}
    </button>
  )
}
```

### Updated FlashcardsTab

```typescript
// src/components/study-packs/tabs/FlashcardsTab.tsx

export default function FlashcardsTab({ packId, userPlan = 'free' }: FlashcardsTabProps) {
  const [cardCount, setCardCount] = useState(0)
  const [limits, setLimits] = useState<PlanLimits | null>(null)
  
  useEffect(() => {
    // Fetch current card count and plan limits
    fetchCardCountAndLimits()
  }, [packId])
  
  const canGenerateMore = 
    limits?.batchCardsSize !== null && 
    cardCount < limits.cardsPerPack
  
  return (
    <div className="space-y-6">
      {/* Progress Indicator */}
      <div className="flex items-center justify-between">
        <div className="text-[14px] text-[#64748B]">
          {cardCount} / {limits?.cardsPerPack} flashcards
        </div>
        <ExportMenu studyPackId={packId} exportType="flashcards" userPlan={userPlan} />
      </div>
      
      {/* Generate More Button (Paid Users) */}
      {canGenerateMore && (
        <GenerateMoreButton
          contentType="flashcards"
          studyPackId={packId}
          currentCount={cardCount}
          maxLimit={limits.cardsPerPack}
          batchSize={limits.batchCardsSize!}
          userPlan={userPlan}
          onGenerated={setCardCount}
        />
      )}
      
      {/* Upgrade Prompt (Free Users) */}
      {userPlan === 'free' && (
        <UpgradePrompt
          featureName="Generate More Flashcards"
          requiredPlan="student_pro"
          benefits={[
            'Generate up to 120 flashcards per pack',
            'Add +30 cards at a time',
            'Customize content depth',
            'Priority processing'
          ]}
          currentPlan={userPlan}
        />
      )}
      
      {/* Rest of flashcards UI... */}
    </div>
  )
}
```

## Database Queries

### Count Current Content

```sql
-- Count flashcards
SELECT COUNT(*) FROM flashcards WHERE study_pack_id = $1;

-- Count quiz questions
SELECT COUNT(*) FROM quiz_items 
WHERE quiz_id = (SELECT id FROM quizzes WHERE study_pack_id = $1);

-- Count mind map nodes
SELECT COUNT(*) FROM mindmap_nodes 
WHERE mindmap_id = (SELECT id FROM mindmaps WHERE study_pack_id = $1);
```

### Update Stats JSON

```sql
-- Update study pack stats after generation
UPDATE study_packs 
SET stats_json = jsonb_set(
  stats_json, 
  '{cardCount}', 
  to_jsonb($2::int)
)
WHERE id = $1;
```

## Modified Initial Generation Flow

### Updated Inngest Function

```typescript
// src/lib/inngest/functions/generate-pack.ts

export const generatePack = inngest.createFunction(
  { id: 'generate-pack', name: 'Generate Study Pack', retries: 1 },
  { event: 'pack/generate' },
  async ({ event, step }) => {
    // ... existing setup ...
    
    // Step 4: Get plan limits
    const limits = await step.run('get-plan-limits', async () => {
      return await UsageService.getPlanLimits(userPlan)
    })
    
    // Step 5: Generate INITIAL content only (CHANGED)
    const results = await step.run('generate-content', async () => {
      try {
        const [notes, learningData, , , ] = await Promise.all([
          GenerationService.generateSmartNotes(materialId, chunks),
          GenerationService.generateLearningObjectivesAndTags(chunks),
          GenerationService.generateFlashcards(
            studyPackId,
            chunks,
            limits.initialCardsPerPack  // CHANGED: use initial limit
          ),
          GenerationService.generateQuiz(
            studyPackId,
            chunks,
            limits.initialQuestionsPerQuiz  // CHANGED: use initial limit
          ),
          GenerationService.generateMindMap(
            studyPackId,
            chunks,
            limits.initialMindmapNodes  // CHANGED: use initial limit
          ),
        ])
        
        return { notes, learningData }
      } catch (error: any) {
        throw new GenerationError(
          MaterialErrorCode.AI_API_ERROR,
          `Content generation failed: ${error.message}`
        )
      }
    })
    
    // ... rest of function unchanged ...
  }
)
```

## Updated Pricing Displays

### PaywallModal

```typescript
// src/components/paywall/PaywallModal.tsx

const PLANS = {
  free: {
    name: 'Free',
    monthlyPrice: '€0',
    features: [
      '3 packs per month',
      '20 flashcards per pack',
      '8 quiz questions',
      '40 mind map nodes',
      'No exports',
    ],
  },
  student_pro: {
    name: 'Student Pro',
    monthlyPrice: '€7.99',
    yearlyPrice: '€69',
    semesterPrice: '€24',
    savingsText: 'Save €17/year',
    features: [
      '50 packs per month',
      'Up to 120 flashcards per pack',
      'Up to 30 quiz questions',
      'Up to 250 mind map nodes',
      'Generate more content on-demand',
      'All export formats',
      'Timed quiz mode',
      'Weak topics practice',
      'Priority processing',
    ],
  },
  pro_plus: {
    name: 'Pro',
    monthlyPrice: '€11.99',
    yearlyPrice: '€129',
    savingsText: '€25/year',
    features: [
      '150 packs per month',
      'Up to 200 flashcards per pack',
      'Up to 60 quiz questions',
      'Up to 800 mind map nodes',
      'Generate more content on-demand',
      'All export formats',
      'Advanced analytics',
      'Priority processing',
      'API access (coming soon)',
    ],
  },
}
```

## Error Handling

### Client-Side

```typescript
// Handle generation errors gracefully
try {
  const response = await fetch(endpoint, { method: 'POST', ... })
  
  if (!response.ok) {
    const error = await response.json()
    
    switch (response.status) {
      case 403:
        toast.error('Upgrade to a paid plan to generate more content')
        break
      case 409:
        toast.info('You've already generated the maximum content for this pack')
        break
      case 500:
        toast.error('Generation failed. Please try again.')
        break
      default:
        toast.error(error.message || 'Something went wrong')
    }
  }
} catch (error) {
  toast.error('Network error. Please check your connection.')
}
```

### Server-Side

```typescript
// API route error handling
try {
  // ... generation logic ...
} catch (error) {
  if (error instanceof GenerationError) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    )
  }
  
  console.error('Unexpected error:', error)
  return NextResponse.json(
    { success: false, message: 'Internal server error' },
    { status: 500 }
  )
}
```

## Performance Considerations

### Caching Strategy

- Cache plan limits in memory (existing 5-minute cache)
- Cache current content counts in component state
- Invalidate counts after successful generation

### Database Optimization

- Add indexes on `study_pack_id` for flashcards, quiz_items, mindmap_nodes (likely already exist)
- Use `COUNT(*)` queries efficiently
- Batch insert new content items

### Rate Limiting

- Implement per-user rate limiting on generate-more endpoints
- Max 1 request per 30 seconds per content type
- Prevent spam clicking

## Testing Strategy

### Unit Tests

1. Test plan limits calculations
2. Test quota calculations (remaining, toGenerate)
3. Test incremental generation functions
4. Test API endpoint validation

### Integration Tests

1. Test full generation flow (initial + incremental)
2. Test UI state updates after generation
3. Test error handling paths
4. Test upgrade prompts for free users

### Property-Based Tests

1. Verify generated count never exceeds max limit
2. Verify batch size respects remaining quota
3. Verify stats_json stays in sync with actual counts

## Migration Plan

### Phase 1: Code Deployment (No Breaking Changes)
1. Deploy updated plan limits with initial/batch values
2. Deploy new API endpoints (not yet used)
3. Deploy updated GenerationService methods
4. Update initial generation to use `initialCardsPerPack` etc.

### Phase 2: UI Rollout
1. Deploy updated FlashcardsTab with Generate More button
2. Deploy updated QuizTab with Generate More button
3. Deploy updated MindMapTab with Generate More button
4. Deploy updated PaywallModal and PricingSection

### Phase 3: Monitoring
1. Monitor pack creation times (should be <45s)
2. Monitor "Generate More" usage rates
3. Monitor error rates on new endpoints
4. Collect user feedback

## Rollback Plan

If issues arise:
1. Revert UI changes (hide Generate More buttons)
2. Revert initial generation limits to old maximums
3. Keep new API endpoints (they won't be called)
4. Investigate and fix issues
5. Re-deploy when ready

## Security Considerations

- Verify pack ownership before allowing generation
- Verify user has paid plan before allowing on-demand generation
- Rate limit generation requests to prevent abuse
- Validate batch sizes don't exceed plan limits
- Log all generation attempts for audit trail
