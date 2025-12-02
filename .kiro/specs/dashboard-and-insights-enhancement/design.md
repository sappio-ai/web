# Design Document

## Overview

This design enhances the existing Dashboard and Pack Insights features by adding search/filtering/sorting capabilities, advanced analytics visualizations, and contextual Orb avatars. The implementation builds on top of the existing `DashboardClient.tsx` and `InsightsTab.tsx` components, adding new sub-components and API endpoints while maintaining the current dark-mode aesthetic and animation patterns.

## Architecture

### Component Structure

```
Dashboard Enhancement:
- DashboardClient.tsx (existing, enhanced)
  ├── PackSearchBar (new)
  ├── PackFilters (new)
  ├── PackSortDropdown (new)
  ├── PackGrid (extracted from DashboardClient)
  │   └── PackCard (extracted, enhanced)
  │       └── QuickActionsMenu (new)
  └── DashboardHeroOrb (new)

Insights Enhancement:
- InsightsTab.tsx (existing, enhanced)
  ├── DueLoadForecast (new)
  ├── LapseTracking (new)
  ├── PerformanceTrends (new)
  ├── SessionDepthAnalytics (new)
  ├── PackCompletenessScore (new)
  └── InsightsOrbContext (new)
```

### API Endpoints

```
New Endpoints:
- GET /api/study-packs
  Query params: search, filter, sort, limit, offset
  Returns: { packs: StudyPack[], total: number, hasMore: boolean }

- GET /api/study-packs/:id/insights
  Returns: {
    completeness: { score: number, items: CompletionItem[] },
    weakTopics: TopicPerformance[],
    lapseData: { cards: FlashcardWithLapses[], totalLapses: number },
    sessionStats: { total: number, avgDuration: number, avgCardsPerSession: number }
  }

- GET /api/study-packs/:id/analytics
  Query params: start_date, end_date
  Returns: {
    quizPerformance: { date: string, score: number, duration: number }[],
    dueLoadForecast: { date: string, count: number, packBreakdown: Record<string, number> }[],
    sessionPatterns: {
      byDayOfWeek: Record<string, number>,
      byHourOfDay: Record<string, number>
    }
  }
```

## Components and Interfaces

### 1. PackSearchBar Component

**Purpose:** Real-time search input for filtering packs by title and summary.

**Props:**
```typescript
interface PackSearchBarProps {
  value: string
  onChange: (value: string) => void
  packCount: number
}
```

**Design:**
- Floating search input with magnifying glass icon
- Debounced input (300ms) to avoid excessive re-renders
- Shows "X packs" count next to search
- Clear button (X) appears when text is entered
- Matches existing dashboard card styling (glass morphism)

**Implementation Notes:**
- Use `useState` for local input value
- Use `useDebounce` hook for onChange callback
- Filter logic happens in parent component (DashboardClient)

---

### 2. PackFilters Component

**Purpose:** Dropdown filter for common pack filtering scenarios.

**Props:**
```typescript
interface PackFiltersProps {
  activeFilter: 'all' | 'has_due' | 'recent' | 'needs_review'
  onChange: (filter: string) => void
  counts: {
    all: number
    has_due: number
    recent: number
    needs_review: number
  }
}
```

**Design:**
- Dropdown button with current filter label
- Shows count badge for each filter option
- Icons for each filter type (Clock for has_due, Calendar for recent, Target for needs_review)
- Matches existing UI button styling

**Filter Logic:**
- `all`: No filtering
- `has_due`: `pack.dueCount > 0`
- `recent`: `pack.updated_at >= Date.now() - 7 days`
- `needs_review`: `pack.stats_json.progress < 50`

---

### 3. PackSortDropdown Component

**Purpose:** Dropdown for sorting packs by different criteria.

**Props:**
```typescript
interface PackSortDropdownProps {
  activeSort: 'updated' | 'alphabetical' | 'due_cards' | 'progress'
  onChange: (sort: string) => void
}
```

**Design:**
- Dropdown button with sort icon and current sort label
- Checkmark next to active sort option
- Persists selection to localStorage

**Sort Logic:**
- `updated`: Sort by `updated_at` descending
- `alphabetical`: Sort by `title` ascending
- `due_cards`: Sort by `dueCount` descending
- `progress`: Sort by `stats_json.progress` descending

---

### 4. QuickActionsMenu Component

**Purpose:** Context menu for quick pack actions.

**Props:**
```typescript
interface QuickActionsMenuProps {
  packId: string
  packTitle: string
  hasDueCards: boolean
  onDelete: () => void
}
```

**Design:**
- Three-dot menu icon on pack card (top right)
- Dropdown menu with icons for each action
- Confirmation dialog for delete action
- Disabled states for actions when not applicable

**Actions:**
- Review Flashcards (navigate to `/review?packId=...`)
- Take Quiz (navigate to `/study-packs/:id?tab=quiz`)
- View Mind Map (navigate to `/study-packs/:id?tab=mindmap`)
- Export (open ExportMenu modal)
- Delete (show confirmation, then call DELETE endpoint)

---

### 5. DueLoadForecast Component

**Purpose:** 7-day calendar showing upcoming due cards.

**Props:**
```typescript
interface DueLoadForecastProps {
  packId: string
}
```

**Design:**
- Grid layout: 7 columns (one per day)
- Each cell shows: day name, date, due count
- Color coding: green (1-10), orange (11-30), red (31+)
- Hover tooltip shows pack breakdown
- Matches existing card styling

**Data Structure:**
```typescript
interface DayForecast {
  date: string // ISO date
  dayName: string // Mon, Tue, etc.
  dueCount: number
  packBreakdown: Record<string, number> // packId -> count
}
```

**Implementation:**
- Fetch from GET `/api/study-packs/:id/analytics`
- Calculate due dates from flashcards table: `SELECT due_at, COUNT(*) FROM flashcards WHERE study_pack_id = :id AND due_at BETWEEN :start AND :end GROUP BY DATE(due_at)`
- Cache for 5 minutes

---

### 6. LapseTracking Component

**Purpose:** Shows cards with high lapse counts that need attention.

**Props:**
```typescript
interface LapseTrackingProps {
  packId: string
}
```

**Design:**
- List of cards with lapses >= 3
- Each card shows: front text (truncated to 100 chars), topic badge, lapse count, last reviewed date
- Sorted by lapse count descending
- Click to navigate to flashcards tab with card pre-selected
- Empty state with success-celebrating Orb when no lapses

**Data Structure:**
```typescript
interface FlashcardWithLapses {
  id: string
  front: string
  topic: string
  lapses: number
  lastReviewed: string | null
}
```

**Implementation:**
- Fetch from GET `/api/study-packs/:id/insights`
- Query: `SELECT id, front, topic, lapses, due_at FROM flashcards WHERE study_pack_id = :id AND lapses >= 3 ORDER BY lapses DESC LIMIT 10`

---

### 7. PerformanceTrends Component

**Purpose:** Line chart showing quiz performance over time.

**Props:**
```typescript
interface PerformanceTrendsProps {
  packId: string
}
```

**Design:**
- Line chart with gradient fill
- X-axis: dates
- Y-axis: score percentage (0-100%)
- Hover tooltip shows: date, score, duration
- Gradient line color: red (low) to green (high)
- Empty state when < 2 quiz attempts

**Data Structure:**
```typescript
interface QuizPerformancePoint {
  date: string
  score: number
  duration: number
}
```

**Implementation:**
- Fetch from GET `/api/study-packs/:id/analytics`
- Query: `SELECT taken_at, score, duration_s FROM quiz_results WHERE quiz_id IN (SELECT id FROM quizzes WHERE study_pack_id = :id) ORDER BY taken_at ASC`
- Use lightweight charting library (recharts or chart.js)

---

### 8. SessionDepthAnalytics Component

**Purpose:** Visualizes study session patterns.

**Props:**
```typescript
interface SessionDepthAnalyticsProps {
  packId: string
}
```

**Design:**
- Three stat cards: total sessions, avg duration, avg cards/session
- Two bar charts: sessions by day of week, sessions by hour of day
- Matches existing stats card styling

**Data Structure:**
```typescript
interface SessionStats {
  total: number
  avgDuration: number
  avgCardsPerSession: number
  byDayOfWeek: Record<string, number> // Mon: 5, Tue: 3, etc.
  byHourOfDay: Record<string, number> // 9: 2, 10: 5, etc.
}
```

**Implementation:**
- Fetch from GET `/api/study-packs/:id/analytics`
- Calculate from events table: `SELECT event, props_json, created_at FROM events WHERE user_id = :userId AND event = 'cards_reviewed' AND props_json->>'studyPackId' = :packId AND created_at >= NOW() - INTERVAL '30 days'`
- Group by session (consecutive reviews within 30 minutes)

---

### 9. PackCompletenessScore Component

**Purpose:** Shows what content is available in the pack.

**Props:**
```typescript
interface PackCompletenessScoreProps {
  packId: string
}
```

**Design:**
- Circular progress indicator showing completeness percentage
- Checklist of items: Notes, Flashcards, Quiz, Mind Map
- Green checkmark for completed items
- Gray icon for missing items
- Suggestions for missing items

**Data Structure:**
```typescript
interface CompletenessData {
  score: number // 0-100
  items: {
    notes: boolean
    flashcards: boolean
    quiz: boolean
    mindmap: boolean
  }
}
```

**Implementation:**
- Fetch from GET `/api/study-packs/:id/insights`
- Calculate from study pack data:
  - Notes: `stats_json.notes !== null`
  - Flashcards: `COUNT(flashcards) > 0`
  - Quiz: `COUNT(quizzes) > 0`
  - Mind Map: `COUNT(mindmaps) > 0`

---

### 10. Orb Pose System Enhancement

**New Poses to Add:**

```typescript
// Dashboard poses
'dashboard-hero': {
  imagePath: '/orb/dashboard-hero.png',
  altText: 'Sappio Orb with orbital rings on dashboard',
  preload: true,
}
'welcome-back-morning': {
  imagePath: '/orb/welcome-back-morning.png',
  altText: 'Sappio Orb greeting with coffee cup',
  preload: false,
}
'welcome-back-afternoon': {
  imagePath: '/orb/welcome-back-afternoon.png',
  altText: 'Sappio Orb greeting with sun',
  preload: false,
}
'welcome-back-evening': {
  imagePath: '/orb/welcome-back-evening.png',
  altText: 'Sappio Orb greeting with moon',
  preload: false,
}
'pack-card-alert': {
  imagePath: '/orb/pack-card-alert.png',
  altText: 'Mini Orb with alert expression',
  preload: false,
}
'pack-card-happy': {
  imagePath: '/orb/pack-card-happy.png',
  altText: 'Mini Orb with happy expression',
  preload: false,
}
'motivational': {
  imagePath: '/orb/motivational.png',
  altText: 'Sappio Orb with encouraging gesture',
  preload: false,
}

// Insights poses
'analytics-dashboard': {
  imagePath: '/orb/analytics-dashboard.png',
  altText: 'Sappio Orb with graphs and charts',
  preload: false,
}
'progress-growth': {
  imagePath: '/orb/progress-growth.png',
  altText: 'Sappio Orb showing growth with upward arrow',
  preload: false,
}
'weak-area-supportive': {
  imagePath: '/orb/weak-area-supportive.png',
  altText: 'Sappio Orb with supportive expression',
  preload: false,
}
'achievement-celebration': {
  imagePath: '/orb/achievement-celebration.png',
  altText: 'Sappio Orb celebrating achievement with trophy',
  preload: false,
}
'detective-analyzing': {
  imagePath: '/orb/detective-analyzing.png',
  altText: 'Sappio Orb with magnifying glass analyzing data',
  preload: false,
}
```

**Orb Context System:**

Create a context provider for dynamic Orb selection based on state:

```typescript
interface OrbContextValue {
  getWelcomeOrb: () => OrbPose
  getPackCardOrb: (hasDueCards: boolean, isNew: boolean) => OrbPose
  getMotivationalMessage: () => { pose: OrbPose, message: string }
}
```

---

## Data Models

### StudyPackListItem

```typescript
interface StudyPackListItem {
  id: string
  title: string
  summary: string | null
  created_at: string
  updated_at: string
  stats_json: {
    coverage: 'low' | 'med' | 'high'
    cardCount: number
    quizQuestionCount: number
    mindMapNodeCount: number
    progress: number
  }
  dueCount: number // calculated
}
```

### PackInsights

```typescript
interface PackInsights {
  completeness: {
    score: number
    items: {
      notes: boolean
      flashcards: boolean
      quiz: boolean
      mindmap: boolean
    }
  }
  weakTopics: TopicPerformance[]
  lapseData: {
    cards: FlashcardWithLapses[]
    totalLapses: number
  }
  sessionStats: {
    total: number
    avgDuration: number
    avgCardsPerSession: number
  }
}
```

### PackAnalytics

```typescript
interface PackAnalytics {
  quizPerformance: QuizPerformancePoint[]
  dueLoadForecast: DayForecast[]
  sessionPatterns: {
    byDayOfWeek: Record<string, number>
    byHourOfDay: Record<string, number>
  }
}
```

---

## Error Handling

### Client-Side Errors

1. **Search/Filter/Sort Errors:**
   - If filtering fails, show all packs with error toast
   - If sorting fails, maintain current order

2. **Analytics Loading Errors:**
   - Show error state with error-confused Orb
   - Provide "Retry" button
   - Log error to console for debugging

3. **API Errors:**
   - 401: Redirect to login
   - 404: Show "Pack not found" message
   - 500: Show generic error with retry option

### Server-Side Errors

1. **Database Query Errors:**
   - Log error with context (user_id, pack_id, query)
   - Return 500 with generic message
   - Don't expose internal details

2. **Cache Errors:**
   - If cache read fails, fetch from database
   - If cache write fails, log but continue
   - Don't block user experience

---

## Testing Strategy

### Unit Tests

1. **Component Tests:**
   - PackSearchBar: debounce behavior, clear button
   - PackFilters: filter logic, count calculations
   - PackSortDropdown: sort logic, localStorage persistence
   - QuickActionsMenu: action handlers, confirmation dialog
   - DueLoadForecast: date calculations, color coding
   - LapseTracking: sorting, empty state
   - PerformanceTrends: chart rendering, empty state
   - SessionDepthAnalytics: session grouping, time calculations
   - PackCompletenessScore: score calculation, checklist rendering

2. **API Tests:**
   - GET /api/study-packs: query params, filtering, sorting, pagination
   - GET /api/study-packs/:id/insights: data structure, calculations
   - GET /api/study-packs/:id/analytics: date range filtering, aggregations

### Integration Tests

1. **Dashboard Flow:**
   - Search packs → filter results → sort results → view pack
   - Create pack → appears in list → search for it → find it
   - Delete pack → confirm → pack removed from list

2. **Insights Flow:**
   - View insights → see completeness → see weak topics → see forecast
   - Take quiz → performance trends update → weak topics update
   - Review cards → session stats update → lapse data updates

### E2E Tests

1. **User Journey:**
   - Login → dashboard → search packs → filter by due cards → review → return to dashboard
   - Login → pack insights → view forecast → plan study session → review cards

---

## Performance Considerations

### Caching Strategy

1. **Study Packs List:**
   - Cache for 60 seconds
   - Invalidate on pack creation/deletion/update
   - Use user-specific cache keys

2. **Pack Insights:**
   - Cache for 5 minutes
   - Invalidate on quiz completion, card review
   - Use pack-specific cache keys

3. **Pack Analytics:**
   - Cache for 5 minutes
   - Invalidate on new events
   - Use pack-specific + date-range cache keys

### Query Optimization

1. **Study Packs List:**
   - Index on user_id, updated_at
   - Use pagination (limit 50 per page)
   - Calculate dueCount in single query with JOIN

2. **Due Load Forecast:**
   - Index on study_pack_id, due_at
   - Use date range filter to limit results
   - Group by date in database, not in code

3. **Session Analytics:**
   - Index on user_id, event, created_at
   - Use time range filter (last 30 days)
   - Aggregate in database using GROUP BY

### Client-Side Optimization

1. **Search Debouncing:**
   - 300ms debounce to avoid excessive re-renders
   - Cancel pending searches on unmount

2. **Lazy Loading:**
   - Load analytics components only when Insights tab is active
   - Use React.lazy() for chart libraries

3. **Memoization:**
   - Memoize filter/sort functions with useMemo
   - Memoize pack cards with React.memo

---

## Accessibility

### Keyboard Navigation

1. **Search/Filter/Sort:**
   - Tab to focus search input
   - Tab to focus filter dropdown
   - Arrow keys to navigate dropdown options
   - Enter to select option

2. **Pack Cards:**
   - Tab to focus pack card
   - Enter to open pack
   - Tab to focus quick actions menu
   - Arrow keys to navigate menu options

3. **Charts:**
   - Provide keyboard-accessible data tables as alternative
   - Tab to focus chart
   - Arrow keys to navigate data points

### Screen Readers

1. **Announce search results:**
   - "Showing X packs matching 'search term'"
   - "Filtered to X packs with due cards"

2. **Announce chart data:**
   - Provide aria-label with summary
   - Provide data table with full details

3. **Announce Orb poses:**
   - Use descriptive alt text
   - Announce context changes (e.g., "Welcome back, good morning!")

### Color Contrast

1. **Due Load Forecast:**
   - Ensure color coding meets WCAG AA (4.5:1)
   - Provide text labels in addition to colors

2. **Performance Trends:**
   - Use patterns in addition to colors for gradient
   - Provide data table alternative

---

## Security Considerations

### Authorization

1. **Pack Access:**
   - Verify user owns pack before returning data
   - Use RLS policies on Supabase tables
   - Check ownership in API routes

2. **Analytics Access:**
   - Only return analytics for user's own packs
   - Don't expose other users' data in aggregations

### Input Validation

1. **Search Input:**
   - Sanitize search query to prevent SQL injection
   - Limit search query length (max 100 chars)
   - Use parameterized queries

2. **Query Parameters:**
   - Validate filter values against whitelist
   - Validate sort values against whitelist
   - Validate date ranges (max 1 year)

### Rate Limiting

1. **API Endpoints:**
   - Limit to 60 requests per minute per user
   - Return 429 Too Many Requests if exceeded
   - Use Redis for rate limit tracking

---

## Migration Strategy

### Phase 1: Dashboard Enhancements (Week 1)

1. Add GET /api/study-packs endpoint
2. Extract PackGrid and PackCard components
3. Add PackSearchBar, PackFilters, PackSortDropdown
4. Add QuickActionsMenu
5. Add new Orb poses for dashboard

### Phase 2: Basic Insights (Week 2)

1. Add GET /api/study-packs/:id/insights endpoint
2. Add PackCompletenessScore component
3. Add LapseTracking component
4. Add new Orb poses for insights

### Phase 3: Advanced Analytics (Week 3)

1. Add GET /api/study-packs/:id/analytics endpoint
2. Add DueLoadForecast component
3. Add PerformanceTrends component
4. Add SessionDepthAnalytics component

### Phase 4: Polish & Testing (Week 4)

1. Add loading states and error handling
2. Add unit tests for all components
3. Add integration tests for API endpoints
4. Performance optimization and caching
5. Accessibility audit and fixes

---

## Open Questions

1. **Chart Library:** Should we use recharts, chart.js, or build custom SVG charts?
   - **Recommendation:** Use recharts for consistency with React patterns and good accessibility support

2. **Session Definition:** How do we define a "session"? Consecutive reviews within X minutes?
   - **Recommendation:** 30 minutes of inactivity ends a session

3. **Orb Image Generation:** Should we generate all new Orb poses at once or incrementally?
   - **Recommendation:** Generate all poses upfront to ensure consistent style

4. **Pagination:** Should we paginate the pack list or load all packs?
   - **Recommendation:** Paginate after 50 packs to maintain performance

5. **Real-time Updates:** Should analytics update in real-time or require page refresh?
   - **Recommendation:** Refresh on tab focus, not real-time (to reduce server load)
