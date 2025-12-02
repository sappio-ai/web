# Requirements Document

## Introduction

This spec enhances the existing Dashboard (Phase 8) and Pack Insights & Analytics (Phase 9) features by adding missing functionality identified during analysis. The dashboard already has core features like pack display, stats cards, and streak tracking. The insights tab already shows basic analytics like quiz performance by topic and learning progress. This spec focuses on adding the remaining features from the original feature checklist: pack search/filtering/sorting, advanced analytics visualizations (due load forecast, lapse tracking, performance trends), and additional Orb avatar poses for better user engagement.

## Requirements

### Requirement 1: Pack Search and Filtering

**User Story:** As a user with multiple study packs, I want to search and filter my packs, so that I can quickly find the material I need to study.

#### Acceptance Criteria

1. WHEN the user has 3 or more study packs THEN the dashboard SHALL display a search input above the pack grid
2. WHEN the user types in the search input THEN the system SHALL filter packs by title and summary in real-time
3. WHEN the user clicks a filter dropdown THEN the system SHALL display filter options: "All Packs", "Has Due Cards", "Recently Updated", "Needs Review"
4. WHEN the user selects "Has Due Cards" THEN the system SHALL show only packs with dueCount > 0
5. WHEN the user selects "Recently Updated" THEN the system SHALL show packs updated in the last 7 days
6. WHEN the user selects "Needs Review" THEN the system SHALL show packs with progress < 50%
7. WHEN no packs match the search/filter THEN the system SHALL display an empty state with the empty-state-inviting Orb

### Requirement 2: Pack Sorting

**User Story:** As a user, I want to sort my study packs by different criteria, so that I can prioritize my study sessions effectively.

#### Acceptance Criteria

1. WHEN the user clicks the sort dropdown THEN the system SHALL display sort options: "Recently Updated", "Alphabetical", "Most Due Cards", "Progress"
2. WHEN the user selects "Recently Updated" THEN the system SHALL sort packs by updated_at descending
3. WHEN the user selects "Alphabetical" THEN the system SHALL sort packs by title ascending
4. WHEN the user selects "Most Due Cards" THEN the system SHALL sort packs by dueCount descending
5. WHEN the user selects "Progress" THEN the system SHALL sort packs by progress percentage descending
6. WHEN the sort order changes THEN the system SHALL persist the preference in localStorage

### Requirement 3: Pack List API Endpoint

**User Story:** As a developer, I want a dedicated API endpoint for fetching study packs, so that the dashboard can efficiently load pack data with proper caching.

#### Acceptance Criteria

1. WHEN GET /api/study-packs is called THEN the system SHALL return all study packs for the authenticated user
2. WHEN the endpoint is called THEN the system SHALL include pack metadata: id, title, summary, created_at, updated_at, stats_json
3. WHEN the endpoint is called THEN the system SHALL calculate and include dueCount for each pack
4. WHEN the endpoint is called THEN the system SHALL support query parameters: search, filter, sort, limit, offset
5. WHEN search parameter is provided THEN the system SHALL filter by title and summary using case-insensitive matching
6. WHEN filter parameter is "has_due" THEN the system SHALL return only packs with due cards
7. WHEN sort parameter is provided THEN the system SHALL order results accordingly
8. WHEN the response is generated THEN the system SHALL cache it for 60 seconds

### Requirement 4: Due Load Forecast Visualization

**User Story:** As a user, I want to see a forecast of my upcoming due cards, so that I can plan my study schedule ahead of time.

#### Acceptance Criteria

1. WHEN the user views the Insights tab THEN the system SHALL display a "Due Load Forecast" section
2. WHEN the forecast is displayed THEN the system SHALL show the next 7 days in a calendar-style grid
3. WHEN each day is displayed THEN the system SHALL show the count of cards due on that day
4. WHEN a day has 0 due cards THEN the system SHALL display it with low opacity
5. WHEN a day has 1-10 due cards THEN the system SHALL display it with green color
6. WHEN a day has 11-30 due cards THEN the system SHALL display it with orange color
7. WHEN a day has 31+ due cards THEN the system SHALL display it with red color
8. WHEN the user hovers over a day THEN the system SHALL show a tooltip with the exact count and breakdown by pack

### Requirement 5: Lapse Tracking Visualization

**User Story:** As a user, I want to see which cards I'm struggling with, so that I can focus my review efforts on difficult material.

#### Acceptance Criteria

1. WHEN the user views the Insights tab THEN the system SHALL display a "Cards Needing Attention" section
2. WHEN the section is displayed THEN the system SHALL show cards with lapses >= 3
3. WHEN cards are displayed THEN the system SHALL show: front text (truncated), topic, lapse count, last reviewed date
4. WHEN cards are displayed THEN the system SHALL sort by lapse count descending
5. WHEN the user clicks a card THEN the system SHALL navigate to the flashcards tab with that card pre-selected
6. WHEN no cards have lapses >= 3 THEN the system SHALL display a success message with the success-celebrating Orb
7. WHEN the section is displayed THEN the system SHALL limit to top 10 cards with most lapses

### Requirement 6: Performance Trends Chart

**User Story:** As a user, I want to see my quiz performance over time, so that I can track my improvement and identify patterns.

#### Acceptance Criteria

1. WHEN the user views the Insights tab THEN the system SHALL display a "Performance Trends" section
2. WHEN the user has taken 2+ quizzes THEN the system SHALL display a line chart showing score over time
3. WHEN the chart is displayed THEN the system SHALL show quiz scores on the Y-axis (0-100%)
4. WHEN the chart is displayed THEN the system SHALL show dates on the X-axis
5. WHEN the chart is displayed THEN the system SHALL use a gradient line from red (low scores) to green (high scores)
6. WHEN the user hovers over a data point THEN the system SHALL show a tooltip with: date, score, duration
7. WHEN the user has taken < 2 quizzes THEN the system SHALL display an empty state encouraging quiz taking

### Requirement 7: Session Depth Analytics

**User Story:** As a user, I want to see my study session patterns, so that I can understand my learning habits and optimize my schedule.

#### Acceptance Criteria

1. WHEN the user views the Insights tab THEN the system SHALL display a "Study Sessions" section
2. WHEN the section is displayed THEN the system SHALL show total sessions in the last 30 days
3. WHEN the section is displayed THEN the system SHALL show average session duration
4. WHEN the section is displayed THEN the system SHALL show average cards reviewed per session
5. WHEN the section is displayed THEN the system SHALL show a bar chart of sessions by day of week
6. WHEN the section is displayed THEN the system SHALL show a bar chart of sessions by hour of day
7. WHEN the user has no session data THEN the system SHALL display an empty state with the processing-thinking Orb

### Requirement 8: Pack Completeness Score

**User Story:** As a user, I want to see how complete my study pack is, so that I know what content is available and what might be missing.

#### Acceptance Criteria

1. WHEN the user views the Insights tab THEN the system SHALL display a "Pack Completeness" section
2. WHEN the section is displayed THEN the system SHALL show a completeness score (0-100%)
3. WHEN calculating completeness THEN the system SHALL award 25% for having notes
4. WHEN calculating completeness THEN the system SHALL award 25% for having flashcards
5. WHEN calculating completeness THEN the system SHALL award 25% for having a quiz
6. WHEN calculating completeness THEN the system SHALL award 25% for having a mind map
7. WHEN the section is displayed THEN the system SHALL show checkmarks for completed items
8. WHEN the section is displayed THEN the system SHALL show suggestions for missing items

### Requirement 9: Dashboard Orb Enhancements

**User Story:** As a user, I want to see contextual Orb avatars throughout the dashboard, so that the interface feels more engaging and friendly.

#### Acceptance Criteria

1. WHEN the dashboard loads THEN the system SHALL display a Dashboard Hero Orb with orbital rings animation
2. WHEN the user returns to the dashboard THEN the system SHALL display a Welcome Back Orb with time-based greeting (morning/afternoon/evening)
3. WHEN a pack card is displayed THEN the system SHALL show a Pack Card Mini Orb reflecting pack status (due cards = alert pose, all caught up = happy pose, new = neutral pose)
4. WHEN the user has no packs THEN the system SHALL display the empty-state-inviting Orb
5. WHEN the user has completed all reviews THEN the system SHALL display a Motivational Orb with random encouraging message

### Requirement 10: Insights Orb Enhancements

**User Story:** As a user, I want to see contextual Orb avatars in the insights tab, so that analytics feel more approachable and less intimidating.

#### Acceptance Criteria

1. WHEN the Insights tab loads THEN the system SHALL display an Analytics Orb with graphs/charts background
2. WHEN viewing performance trends THEN the system SHALL display a Progress Orb showing growth/improvement
3. WHEN viewing weak topics THEN the system SHALL display a Weak Area Orb with supportive expression
4. WHEN the user achieves a milestone THEN the system SHALL display an Achievement Orb with celebration animation
5. WHEN analyzing data THEN the system SHALL display a Detective Orb with magnifying glass

### Requirement 11: Quick Actions Menu

**User Story:** As a user, I want quick access to common actions from the dashboard, so that I can efficiently navigate to my most-used features.

#### Acceptance Criteria

1. WHEN the user clicks a pack card's menu icon THEN the system SHALL display a quick actions dropdown
2. WHEN the dropdown is displayed THEN the system SHALL show options: "Review Flashcards", "Take Quiz", "View Mind Map", "Export", "Delete"
3. WHEN the user selects "Review Flashcards" THEN the system SHALL navigate to /review with packId filter
4. WHEN the user selects "Take Quiz" THEN the system SHALL navigate to the pack's quiz tab
5. WHEN the user selects "View Mind Map" THEN the system SHALL navigate to the pack's mind map tab
6. WHEN the user selects "Export" THEN the system SHALL open the export menu modal
7. WHEN the user selects "Delete" THEN the system SHALL show a confirmation dialog before deleting

### Requirement 12: Analytics API Endpoints

**User Story:** As a developer, I want dedicated API endpoints for analytics data, so that the insights tab can efficiently load complex analytics without blocking the UI.

#### Acceptance Criteria

1. WHEN GET /api/study-packs/:id/insights is called THEN the system SHALL return pack-specific insights
2. WHEN the insights endpoint is called THEN the system SHALL include: completeness score, weak topics, lapse data, session stats
3. WHEN GET /api/study-packs/:id/analytics is called THEN the system SHALL return time-series analytics data
4. WHEN the analytics endpoint is called THEN the system SHALL include: quiz performance over time, due load forecast, session patterns
5. WHEN the analytics endpoint is called THEN the system SHALL support date range parameters: start_date, end_date
6. WHEN the response is generated THEN the system SHALL cache it for 5 minutes
