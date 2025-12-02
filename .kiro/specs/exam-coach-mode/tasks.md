# Implementation Plan

- [ ] 1. Update type definitions and tab navigation
  - Add 'exam-coach' to TabType union in StudyPackView.tsx
  - Add Exam Coach tab configuration to TabNavigation.tsx with Zap icon and distinctive styling
  - Position tab second in order (after Notes, before Flashcards)
  - Add orange/red gradient accent color for active state
  - Add lightning bolt badge to tab
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [ ] 2. Create ExamCoachTab main container component
  - Create src/components/study-packs/tabs/ExamCoachTab.tsx
  - Implement component with packId and userPlan props
  - Add state management for session flow (overview → active → results)
  - Fetch quiz data for the study pack on mount
  - Check if sufficient questions exist (minimum 5)
  - Render appropriate view based on state (overview, session, results, or empty state)
  - Handle loading and error states with appropriate Orb poses
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ] 3. Implement ExamCoachOverview component
  - Create src/components/exam-coach/ExamCoachOverview.tsx
  - Display Coach Orb with coach-whistle or exam-day pose
  - Show motivational headline "Test Your Exam Readiness"
  - Display session details card with question count and estimated time
  - Implement prominent "Start Exam Coach" button with orange/red gradient
  - Add brief description of what to expect
  - Add pulsing animation to Orb and button for attention
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

- [ ] 4. Create question selection logic
  - Create src/lib/services/ExamCoachService.ts
  - Implement selectHighYieldQuestions function to select 10-15 questions
  - Prioritize questions covering key concepts from study pack notes
  - Ensure topic diversity in selected questions
  - Randomize question order
  - Handle edge case when fewer than 10 questions available
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 5. Implement useExamCoachSession custom hook
  - Create src/lib/hooks/useExamCoachSession.ts
  - Manage session state (current question, answers, feedback, timer)
  - Implement timer logic with 30 seconds per question
  - Implement submitAnswer function with instant feedback
  - Implement nextQuestion function with auto-advance logic
  - Implement auto-submit when timer expires
  - Calculate results when session completes
  - Track session start time and duration
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_

- [ ] 6. Create SessionHeader component
  - Create src/components/exam-coach/SessionHeader.tsx
  - Display progress indicator (Question X of Y)
  - Display Timer Orb with focused pose
  - Display countdown timer with color coding (green/orange/red)
  - Implement timer color changes at 25% and 10% thresholds
  - Add progress bar showing completion percentage
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_

- [ ] 7. Implement ExamCoachSession component
  - Create src/components/exam-coach/ExamCoachSession.tsx
  - Integrate useExamCoachSession hook
  - Render SessionHeader with progress and timer
  - Reuse QuestionCard component for question display
  - Implement auto-advance countdown after answer submission (3 seconds)
  - Allow manual skip of countdown with "Next" button
  - Handle timer expiration with auto-submit
  - Display instant feedback after each answer
  - Show brief explanations (1-2 sentences)
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_

- [ ] 8. Create ExamCoachResults component
  - Create src/components/exam-coach/ExamCoachResults.tsx
  - Display Results Orb with pose based on score (celebrating/encouraging/supportive)
  - Show large score percentage display
  - Display correct count out of total questions
  - Show time taken to complete session
  - Display performance breakdown by topic
  - Highlight weak topics (< 70% accuracy)
  - Show motivational message based on score
  - Implement "Review Weak Topics" button (navigates to Flashcards tab with filter)
  - Implement "Retake Exam Coach" button
  - Implement "Back to Pack" button
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_

- [ ] 9. Add API endpoint for exam coach questions
  - Create src/app/api/study-packs/[id]/exam-coach/questions/route.ts
  - Fetch quiz items for the study pack
  - Apply question selection logic using ExamCoachService
  - Return selected questions and estimated duration
  - Handle authentication and authorization
  - Handle error cases (no quiz, insufficient questions)
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 10. Add API endpoint for exam coach submission
  - Create src/app/api/study-packs/[id]/exam-coach/submit/route.ts
  - Accept answers array and timing data
  - Grade answers using existing QuizGradingService
  - Calculate score and identify weak topics
  - Store result in quiz_results table (or create exam_coach_results table)
  - Return structured ExamCoachResult
  - Handle authentication and authorization
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 11. Integrate ExamCoachTab into StudyPackView
  - Update src/components/study-packs/StudyPackView.tsx
  - Add exam-coach case to tab rendering logic
  - Pass packId and userPlan props to ExamCoachTab
  - Ensure tab switching works correctly
  - Test URL parameter support for direct navigation (?tab=exam-coach)
  - _Requirements: 1.1, 1.2, 1.3_

- [ ] 12. Implement analytics event tracking
  - Add event tracking to ExamCoachTab for session start
  - Add event tracking to ExamCoachSession for session completion
  - Add event tracking for session abandonment
  - Add event tracking for "Review Flashcards" button click
  - Add event tracking for "Retake" button click
  - Include relevant properties (study_pack_id, score, duration, weak_topics)
  - Use existing events API endpoint
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ] 13. Implement accessibility features
  - Add keyboard navigation support (Tab, Enter, Escape)
  - Add ARIA labels to all interactive elements
  - Implement screen reader announcements for timer warnings
  - Implement screen reader announcements for question changes
  - Add focus indicators with proper contrast
  - Ensure minimum touch target size of 44×44px on mobile
  - Test with keyboard-only navigation
  - Test with screen reader (NVDA or JAWS)
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

- [ ] 14. Implement responsive design
  - Test ExamCoachOverview on mobile (320px minimum)
  - Test ExamCoachSession on mobile with timer visibility
  - Test ExamCoachResults on mobile with proper layout
  - Ensure buttons are accessible on touch devices
  - Test on tablet viewport (768px)
  - Adjust spacing and font sizes for mobile
  - Test landscape orientation on mobile
  - _Requirements: 8.4_

- [ ] 15. Add reduced motion support
  - Respect prefers-reduced-motion for auto-advance animations
  - Respect prefers-reduced-motion for Orb animations
  - Respect prefers-reduced-motion for button pulse effects
  - Respect prefers-reduced-motion for timer warning animations
  - Provide alternative visual cues when animations are disabled
  - _Requirements: 8.5_

- [ ] 16. Implement error handling and edge cases
  - Handle insufficient questions with empty state
  - Handle timer expiration with auto-submit
  - Handle network errors with retry logic
  - Handle session abandonment with confirmation dialog
  - Store answers in localStorage as backup during network issues
  - Display appropriate error messages with Orb poses
  - Test all error scenarios
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ] 17. Add Orb pose assets
  - Ensure coach-whistle Orb pose exists in public/orb directory
  - Ensure exam-day Orb pose exists
  - Ensure timer/focused Orb pose exists
  - Ensure success-celebrating Orb pose exists
  - Ensure encouraging Orb pose exists
  - Ensure supportive Orb pose exists
  - Optimize Orb images as WebP format
  - Add alt text for all Orb poses
  - _Requirements: 2.6, 4.7, 5.6, 6.6, 9.4_

- [ ] 18. Create ExamCoachResult type definition
  - Add ExamCoachResult interface to src/lib/types/quiz.ts
  - Add ExamCoachSession interface
  - Add API response types for exam coach endpoints
  - Ensure compatibility with existing quiz types
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 19. Implement flashcards navigation with topic filter
  - Update ExamCoachResults to navigate to flashcards tab
  - Pass weak topics as URL parameters or state
  - Update FlashcardsTab to accept topic filter from navigation
  - Test navigation flow from results to flashcards
  - Ensure topic filter is applied correctly
  - _Requirements: 6.5_

- [ ] 20. Test complete user flow
  - Test full flow: tab click → overview → start → answer questions → results
  - Test with different question counts (5, 10, 15)
  - Test timer expiration scenario
  - Test retake functionality
  - Test navigation to flashcards with weak topics
  - Test session abandonment
  - Test on multiple browsers (Chrome, Firefox, Safari)
  - Test on mobile devices (iOS and Android)
  - _Requirements: All requirements_
