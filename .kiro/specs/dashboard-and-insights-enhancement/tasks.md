# Implementation Plan

- [x] 1. Set up API endpoints and data layer


  - Create GET /api/study-packs endpoint with search, filter, sort, pagination support
  - Create GET /api/study-packs/:id/insights endpoint for pack-specific insights
  - Create GET /api/study-packs/:id/analytics endpoint for time-series analytics
  - Add caching layer with 60s TTL for pack list, 5min TTL for insights/analytics
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 12.1, 12.2, 12.3, 12.4, 12.5, 12.6_

- [x] 2. Implement dashboard search and filtering




- [x] 2.1 Create PackSearchBar component

  - Implement search input with magnifying glass icon and clear button
  - Add debounced onChange handler (300ms delay)
  - Display pack count next to search input
  - Match existing glass morphism card styling
  - _Requirements: 1.1, 1.2, 1.7_


- [x] 2.2 Create PackFilters component

  - Implement filter dropdown with options: All, Has Due Cards, Recently Updated, Needs Review
  - Add count badges for each filter option
  - Add icons for each filter type (Clock, Calendar, Target)
  - Implement filter logic in parent component
  - _Requirements: 1.3, 1.4, 1.5, 1.6_


- [x] 2.3 Create PackSortDropdown component

  - Implement sort dropdown with options: Recently Updated, Alphabetical, Most Due Cards, Progress
  - Add checkmark next to active sort option
  - Persist sort preference to localStorage
  - Implement sort logic in parent component
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_


- [x] 2.4 Refactor DashboardClient to use new components

  - Extract PackGrid component from DashboardClient
  - Extract PackCard component with enhanced styling
  - Integrate PackSearchBar, PackFilters, PackSortDropdown
  - Implement client-side filtering and sorting logic
  - Add empty state with empty-state-inviting Orb when no results
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 3. Implement quick actions menu



- [x] 3.1 Create QuickActionsMenu component

  - Add three-dot menu icon to pack cards
  - Implement dropdown menu with actions: Review Flashcards, Take Quiz, View Mind Map, Export, Delete
  - Add icons for each action
  - Implement navigation handlers for each action
  - Add confirmation dialog for delete action
  - Handle disabled states when actions not applicable
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7_



- [x] 4. Add dashboard Orb enhancements


- [x] 4.1 Generate new Orb pose images

  - Generate dashboard-hero.png (main orb with orbital rings)
  - Generate welcome-back-morning.png (with coffee cup)
  - Generate welcome-back-afternoon.png (with sun)
  - Generate welcome-back-evening.png (with moon)
  - Generate pack-card-alert.png (mini orb with alert expression)
  - Generate pack-card-happy.png (mini orb with happy expression)
  - Generate motivational.png (encouraging gesture)
  - Optimize all images as WebP format
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [x] 4.2 Update orb-poses.ts with new poses



  - Add new pose definitions to orbPoses object
  - Set appropriate preload flags
  - Add descriptive alt text for accessibility
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_




- [x] 4.3 Create OrbContext system

  - Create OrbContext provider with getWelcomeOrb, getPackCardOrb, getMotivationalMessage methods
  - Implement time-based welcome orb selection (morning/afternoon/evening)
  - Implement pack card orb selection based on due cards and pack status
  - Add motivational message rotation system
  - _Requirements: 9.2, 9.3, 9.5_





- [x] 4.4 Integrate Orbs into dashboard

  - Add DashboardHeroOrb to dashboard header
  - Add WelcomeBackOrb with time-based greeting
  - Add PackCardMiniOrb to each pack card
  - Add MotivationalOrb when all reviews complete
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [x] 5. Implement pack completeness score



- [x] 5.1 Create PackCompletenessScore component

  - Implement circular progress indicator showing completeness percentage
  - Create checklist UI for: Notes, Flashcards, Quiz, Mind Map
  - Add green checkmarks for completed items
  - Add gray icons for missing items
  - Display suggestions for missing items
  - Fetch data from GET /api/study-packs/:id/insights
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8_


- [ ] 5.2 Add completeness calculation to insights API
  - Calculate completeness score (25% per item: notes, flashcards, quiz, mindmap)
  - Check if notes exist in stats_json
  - Count flashcards for pack
  - Count quizzes for pack
  - Count mindmaps for pack
  - Return completeness data in insights endpoint
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

- [x] 6. Implement lapse tracking visualization




- [-] 6.1 Create LapseTracking component

  - Display list of cards with lapses >= 3
  - Show front text (truncated to 100 chars), topic badge, lapse count, last reviewed date
  - Sort cards by lapse count descending
  - Limit to top 10 cards
  - Implement click handler to navigate to flashcards tab with card pre-selected
  - Add empty state with success-celebrating Orb when no lapses
  - Fetch data from GET /api/study-packs/:id/insights
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_


- [ ] 6.2 Add lapse data to insights API
  - Query flashcards with lapses >= 3
  - Sort by lapses descending
  - Limit to 10 cards
  - Include: id, front, topic, lapses, due_at
  - Calculate total lapses across all cards
  - Return lapse data in insights endpoint
  - _Requirements: 5.1, 5.2, 5.3, 5.7_

- [x] 7. Implement due load forecast



- [x] 7.1 Create DueLoadForecast component

  - Create 7-column grid layout for next 7 days
  - Display day name, date, and due count for each day
  - Implement color coding: green (1-10), orange (11-30), red (31+)
  - Add hover tooltip showing pack breakdown
  - Handle low opacity for days with 0 due cards
  - Fetch data from GET /api/study-packs/:id/analytics
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8_


- [ ] 7.2 Add due load forecast to analytics API
  - Query flashcards with due_at in next 7 days
  - Group by date and count cards per day
  - Include pack breakdown for tooltip
  - Return array of DayForecast objects
  - _Requirements: 4.1, 4.2, 4.8_

- [x] 8. Implement performance trends chart




- [x] 8.1 Create PerformanceTrends component

  - Implement line chart using recharts library
  - Configure X-axis for dates, Y-axis for score percentage (0-100%)
  - Add gradient line color from red (low) to green (high)
  - Implement hover tooltip showing date, score, duration
  - Add empty state when < 2 quiz attempts
  - Fetch data from GET /api/study-packs/:id/analytics
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_


- [ ] 8.2 Add quiz performance to analytics API
  - Query quiz_results for pack's quizzes
  - Order by taken_at ascending
  - Return array of QuizPerformancePoint objects with date, score, duration
  - _Requirements: 6.1, 6.2_

- [x] 9. Implement session depth analytics





- [x] 9.1 Create SessionDepthAnalytics component

  - Create three stat cards: total sessions, avg duration, avg cards/session
  - Implement bar chart for sessions by day of week
  - Implement bar chart for sessions by hour of day
  - Add empty state with processing-thinking Orb when no data
  - Fetch data from GET /api/study-packs/:id/analytics
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7_

- [x] 9.2 Add session analytics to analytics API



  - Query events table for cards_reviewed events in last 30 days
  - Group consecutive reviews within 30 minutes as single session
  - Calculate total sessions, avg duration, avg cards per session
  - Aggregate sessions by day of week (Mon-Sun)
  - Aggregate sessions by hour of day (0-23)
  - Return SessionStats object
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

- [x] 10. Add insights Orb enhancements



- [x] 10.1 Generate new insights Orb pose images

  - Generate analytics-dashboard.png (with graphs/charts)
  - Generate progress-growth.png (with upward arrow)
  - Generate weak-area-supportive.png (supportive expression)
  - Generate achievement-celebration.png (with trophy)
  - Generate detective-analyzing.png (with magnifying glass)
  - Optimize all images as WebP format
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_


- [x] 10.2 Update orb-poses.ts with insights poses


  - Add new insights pose definitions to orbPoses object
  - Set appropriate preload flags
  - Add descriptive alt text for accessibility
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_


- [x] 10.3 Integrate Orbs into InsightsTab


  - Add Analytics Orb to insights tab header
  - Add Progress Orb to performance trends section
  - Add Weak Area Orb to weak topics section
  - Add Achievement Orb for milestone celebrations
  - Add Detective Orb to session analytics section
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_


- [x] 11. Integrate new components into InsightsTab




  - Add PackCompletenessScore component to insights tab
  - Add LapseTracking component to insights tab
  - Add DueLoadForecast component to insights tab
  - Add PerformanceTrends component to insights tab
  - Add SessionDepthAnalytics component to insights tab
  - Organize sections with proper spacing and visual hierarchy
  - Add loading states for each section
  - Add error states with retry buttons
  - _Requirements: 4.1, 5.1, 6.1, 7.1, 8.1_

- [x] 12. Add error handling and loading states


  - Implement loading skeletons for all new components
  - Add error boundaries for component failures
  - Implement retry logic for failed API calls
  - Add toast notifications for user actions (delete, export, etc.)
  - Handle 401 errors with redirect to login
  - Handle 404 errors with "Pack not found" message
  - Handle 500 errors with generic error message and retry option
  - _Requirements: All requirements (error handling is cross-cutting)_

- [x] 13. Optimize performance and caching



  - Implement response caching for GET /api/study-packs (60s TTL)
  - Implement response caching for GET /api/study-packs/:id/insights (5min TTL)
  - Implement response caching for GET /api/study-packs/:id/analytics (5min TTL)
  - Add cache invalidation on pack creation, deletion, update
  - Add database indexes: (user_id, updated_at), (study_pack_id, due_at), (user_id, event, created_at)
  - Implement pagination for pack list (limit 50 per page)
  - Add lazy loading for chart libraries using React.lazy()
  - Memoize filter/sort functions with useMemo
  - Memoize pack cards with React.memo
  - _Requirements: All requirements (performance is cross-cutting)_

- [ ] 14. Add accessibility features
  - Add keyboard navigation for search, filter, sort controls
  - Add ARIA labels for all interactive elements
  - Add screen reader announcements for search results and filter changes
  - Ensure color contrast meets WCAG AA (4.5:1) for all text and UI elements
  - Add data table alternatives for charts
  - Add descriptive alt text for all Orb poses
  - Test with keyboard-only navigation
  - Test with screen reader (NVDA or JAWS)
  - _Requirements: All requirements (accessibility is cross-cutting)_

- [x] 15. Add analytics event tracking



  - Track pack_searched event with search query
  - Track pack_filtered event with filter type
  - Track pack_sorted event with sort type
  - Track quick_action_used event with action type
  - Track insights_viewed event with pack_id
  - Track forecast_viewed event with pack_id
  - Track lapse_card_clicked event with card_id
  - Track performance_chart_viewed event with pack_id
  - Track session_analytics_viewed event with pack_id
  - _Requirements: All requirements (analytics tracking is cross-cutting)_
