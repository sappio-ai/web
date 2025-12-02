# Implementation Plan

## Overview

This implementation plan breaks down the Learning Systems feature (Phases 4 & 5) into discrete, manageable coding tasks. Each task builds incrementally on previous work, with early testing to validate core functionality. The plan prioritizes the study pack page foundation, then flashcard system, then quiz system.

## Task List

- [x] 1. Create study pack page foundation


  - Create `/study-packs/[id]/page.tsx` server component that fetches pack data
  - Create `/study-packs/[id]/loading.tsx` for loading state
  - Add 404 handling for missing packs
  - Verify page renders with pack title and basic info
  - _Requirements: 1.1, 1.2, 1.5, 1.6_

- [x] 2. Build study pack view client component



  - [x] 2.1 Create `StudyPackView.tsx` client component with tab state management

    - Implement tab navigation (Notes, Flashcards, Quiz, Insights)
    - Add Dashboard Hero Orb with orbital rings
    - Create responsive layout with dark mode styling
    - _Requirements: 1.1, 1.3, 1.4_
  
  - [x] 2.2 Create `PackHeader.tsx` component

    - Display pack title, summary, and creation date
    - Show pack statistics (card count, quiz questions, coverage)
    - Add material metadata display
    - _Requirements: 1.7_
  
  - [x] 2.3 Create `TabNavigation.tsx` component

    - Implement tab switching without page reload
    - Add active tab highlighting
    - Support keyboard navigation (arrow keys)
    - _Requirements: 1.4_

- [x] 3. Implement flashcard data types and services



  - [x] 3.1 Create flashcard TypeScript types

    - Define `Flashcard`, `FlashcardSession`, `SessionStats`, `Grade`, `GradeResult` interfaces in `src/lib/types/flashcards.ts`
    - Define `StreakData` and `CardProgress` types
    - _Requirements: 2.1, 3.1, 6.1_
  

  - [x] 3.2 Implement SRS Service

    - Create `SRSService.ts` with `calculateNextReview()` method
    - Implement SM-2 algorithm for all grade types (again, hard, good, easy)
    - Handle first review (reps=0), second review (reps=1), and subsequent reviews
    - Add `getDueCards()` method to fetch cards where due_at <= now
    - Add `calculateProgress()` method for card categorization
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 4.2, 9.2_
  

  - [x] 3.3 Implement Streak Service

    - Create `StreakService.ts` with `updateStreak()` method
    - Handle first review, same-day review, consecutive day, and missed day logic
    - Add `getStreak()` method to fetch user streak data
    - Store streak data in users.meta_json field
    - _Requirements: 6.1, 6.2, 6.3, 6.6_

- [x] 4. Build flashcard review API endpoints




  - [x] 4.1 Create GET `/api/study-packs/[id]/flashcards/due` endpoint

    - Fetch cards where due_at <= now for the study pack
    - Support optional topic filter query parameter
    - Verify user owns the study pack
    - Return cards ordered by due_at ASC
    - _Requirements: 4.1, 4.2, 7.3, 19.1_
  

  - [x] 4.2 Create POST `/api/flashcards/[id]/review` endpoint

    - Accept grade value (again, hard, good, easy)
    - Fetch current card and calculate new SRS values using SRSService
    - Update flashcard record with new ease, interval, due_at, reps, lapses
    - Update user streak using StreakService
    - Log "cards_reviewed" event
    - Return updated SRS values and streak data
    - _Requirements: 3.1, 3.7, 3.8, 6.1, 19.2_
  

  - [x] 4.3 Create GET `/api/flashcards/stats` endpoint

    - Calculate and return session statistics
    - Return streak data for current user
    - Return card progress distribution (new, learning, review, mastered)
    - _Requirements: 5.1, 6.3, 9.1, 9.2, 19.3_
  

  - [x] 4.4 Create PATCH `/api/flashcards/[id]` endpoint

    - Accept front and back text updates
    - Validate text lengths (front: 10-150, back: 20-500 chars)
    - Update flashcard record preserving SRS data
    - Return updated flashcard
    - _Requirements: 8.1, 8.2, 8.4, 8.5, 19.4_

- [x] 5. Create flashcard review components




  - [x] 5.1 Create `useFlashcardSession` custom hook

    - Manage session state (cards, currentIndex, isFlipped, sessionStats)
    - Implement `fetchDueCards()` to load cards from API
    - Implement `flip()` to toggle card visibility
    - Implement `grade()` with optimistic updates and API call
    - Track card timing for session stats
    - Calculate accuracy and progress
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 5.1, 5.2_
  
  - [x] 5.2 Create `FlashcardCard.tsx` component


    - Implement 3D flip animation using Framer Motion
    - Display front side with question text
    - Display back side with answer text
    - Support click to flip
    - Respect reduced-motion preferences (use fade instead of flip)
    - _Requirements: 2.1, 2.2, 2.3, 2.9, 18.5_
  
  - [x] 5.3 Create `GradingButtons.tsx` component


    - Display four grading buttons (Again, Hard, Good, Easy)
    - Show estimated next review interval for each grade
    - Implement keyboard shortcuts (1-4)
    - Style with color coding (red, orange, green, blue)
    - _Requirements: 2.4, 2.5, 2.8, 18.1_
  

  - [x] 5.4 Create `FlashcardReview.tsx` component

    - Display Study Orb (focused/studying pose)
    - Show progress indicator ("Card X of Y")
    - Render FlashcardCard with current card
    - Show "Show Answer" button when front is visible
    - Show GradingButtons when back is visible
    - Handle session completion and display SessionStats
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.7_
  

  - [x] 5.5 Create `SessionStats.tsx` component

    - Display session statistics (cards reviewed, accuracy, time)
    - Show breakdown by grade (Again, Hard, Good, Easy)
    - Display Success Orb (>80% accuracy) or Supportive Orb (<80%)
    - Show estimated time until next review
    - Add "Review Again" button to start new session
    - Log "cards_reviewed" event
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

- [x] 6. Build flashcards tab features




  - [x] 6.1 Create `FlashcardsTab.tsx` component

    - Display due card count with "Start Review" button
    - Show Empty State Orb when no cards due
    - Display next due date if no cards due today
    - Show topic filter dropdown
    - Display progress chart
    - Display streak counter
    - Add "Edit Cards" mode toggle
    - _Requirements: 4.1, 4.3, 4.4, 4.5, 7.1, 7.2, 9.1_
  

  - [x] 6.2 Create `DueQueue.tsx` component

    - Display list of due cards with front text preview
    - Show due date for each card
    - Add "Study Now" button
    - Support topic filtering
    - _Requirements: 4.1, 4.2, 7.3_
  
  - [x] 6.3 Create `TopicFilter.tsx` component


    - Display list of available topics with card counts
    - Support "All Topics" option
    - Highlight selected topic
    - Update due queue when topic changes
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_
  

  - [x] 6.4 Create `ProgressChart.tsx` component

    - Display horizontal bar chart with card distribution
    - Categorize cards: New (reps=0), Learning (reps<5), Review (reps>=5, interval<30), Mastered (interval>=30)
    - Color code categories
    - Show percentages and counts
    - Add tooltips on hover
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_
  

  - [x] 6.5 Create `StreakDisplay.tsx` component

    - Display Streak Orb with fire/lightning
    - Show current streak count
    - Show longest streak
    - Display celebration modal for milestones (7, 30, 100 days)
    - Show Achievement Orb for milestones
    - _Requirements: 6.3, 6.4, 6.5_
  
  - [x] 6.6 Create `CardEditor.tsx` modal component


    - Display edit form with front and back text fields
    - Validate text lengths
    - Save changes via PATCH API
    - Show success confirmation
    - Cancel and discard changes
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [x] 7. Implement long session support


  - Add break suggestion after 20 cards reviewed
  - Display Tired Orb (yawning pose) with break prompt
  - Offer "Take a Break" or "Continue Studying" options
  - Implement 5-minute break timer
  - Show notification when break completes
  - Add user preference to disable break suggestions
  - _Requirements: 17.1, 17.2, 17.3, 17.4, 17.5_

- [x] 8. Create quiz data types and services



  - [x] 8.1 Create quiz TypeScript types


    - Define `Quiz`, `QuizItem`, `QuizSession`, `QuizAnswer`, `QuizResult` interfaces in `src/lib/types/quiz.ts`
    - Define `TopicPerformance` and `QuizFeedback` types
    - _Requirements: 10.1, 13.1, 14.1_
  
  - [x] 8.2 Implement Quiz Grading Service


    - Create `QuizGradingService.ts` with `gradeAnswer()` method
    - Implement exact matching for MCQ
    - Implement fuzzy matching for short answers (case-insensitive, trim, remove articles)
    - Implement Levenshtein distance calculation (max 2 char difference)
    - Add `calculateResults()` method to grade all answers and calculate score
    - Calculate topic performance and identify weak topics (<70% accuracy)
    - _Requirements: 12.1, 12.2, 12.3, 14.1, 14.2_

- [x] 9. Build quiz API endpoints





  - [x] 9.1 Create GET `/api/quizzes/[id]` endpoint
    - Fetch quiz with all quiz items
    - Verify user owns the study pack
    - Return quiz with items array
    - _Requirements: 10.1, 19.5_
  
  - [x] 9.2 Create POST `/api/quizzes/[id]/submit` endpoint


    - Accept answers array and start time
    - Fetch quiz with items
    - Grade all answers using QuizGradingService
    - Calculate final score and topic performance
    - Save quiz_result record with detail_json
    - Log "quiz_completed" event
    - Return graded results with topic breakdown
    - _Requirements: 12.1, 12.2, 12.3, 13.1, 13.4, 13.7, 14.1, 14.2, 19.6_


  
  - [x] 9.3 Create GET `/api/quiz-results/history` endpoint
    - Fetch past quiz attempts for user
    - Support pagination
    - Order by taken_at DESC

    - Return results with score, duration, and topics
    - _Requirements: 15.1, 15.2, 15.4, 19.7_

- [x] 10. Create quiz session components

  - [x] 10.1 Create `useQuizSession` custom hook


    - Manage session state (mode, currentIndex, userAnswers, feedback)
    - Implement `fetchQuiz()` to load quiz from API
    - Implement `selectMode()` to set practice or timed mode
    - Implement timer countdown for timed mode (2 min per question)
    - Implement `submitAnswer()` to grade and show feedback
    - Implement `nextQuestion()` to advance or complete quiz
    - Implement `submitQuiz()` to send results to API
    - _Requirements: 10.1, 10.2, 10.3, 11.1, 11.2, 11.3, 11.4, 11.5_
  
  - [x] 10.2 Create `ModeSelector.tsx` component


    - Display "Practice Mode" and "Timed Mode" options
    - Show mode descriptions
    - Call selectMode on user choice
    - _Requirements: 11.1, 11.2, 11.3_
  
  - [x] 10.3 Create `TimerDisplay.tsx` component


    - Display Timer Orb (focused countdown pose)
    - Show remaining time in MM:SS format
    - Change color when time is low (<2 minutes)
    - Auto-submit quiz when timer reaches 0
    - _Requirements: 11.4, 11.5_
  
  - [x] 10.4 Create `QuestionCard.tsx` component


    - Display question text
    - Render MCQOptions for multiple choice questions
    - Render ShortAnswerInput for short answer questions
    - Show "Submit Answer" button when answer is selected
    - Display feedback after submission (correct/incorrect with explanation)
    - Show Encouraging Orb for correct or Supportive Orb for incorrect
    - Display correct answer if user was wrong
    - _Requirements: 10.2, 10.3, 10.4, 10.5, 12.4, 12.5_
  
  - [x] 10.5 Create `MCQOptions.tsx` component


    - Display 4 answer options as clickable cards
    - Highlight selected option
    - Show correct (green) and incorrect (red) after submission
    - Disable options after answer is submitted
    - Support keyboard shortcuts (1-4)
    - _Requirements: 10.2, 10.3, 10.8, 18.1_
  
  - [x] 10.6 Create `ShortAnswerInput.tsx` component


    - Display text input field
    - Disable input after submission
    - Support Enter key to submit
    - _Requirements: 10.2, 10.3, 10.8_
  
  - [x] 10.7 Create `QuizInterface.tsx` component


    - Display Quiz Host Orb (professional/teacher pose)
    - Show ModeSelector if mode not selected
    - Show progress indicator ("Question X of Y")
    - Show TimerDisplay for timed mode
    - Render QuestionCard with current question
    - Show "Next Question" button after answer submission
    - Display QuizResults when complete
    - _Requirements: 10.1, 10.2, 10.6, 10.7, 11.4, 11.6_

- [x] 11. Build quiz results and analytics


  - [x] 11.1 Create `QuizResults.tsx` component


    - Display final score as percentage
    - Show time taken
    - Display questions correct/incorrect count
    - Show High Score Orb (>80%) or Low Score Orb (<80%)
    - Display topic performance breakdown
    - Show "Review Incorrect Answers" button
    - Show "Retake Quiz" button
    - _Requirements: 13.1, 13.2, 13.3, 13.5, 13.6_
  
  - [x] 11.2 Create `WeakTopics.tsx` component


    - Display topics with <70% accuracy
    - Show Weak Area Orb (supportive, pointing to focus areas)
    - Display "Study Weak Topics" button that filters flashcards
    - Show topic accuracy percentages
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5_
  
  - [x] 11.3 Create `QuizHistory.tsx` component


    - Display list of past quiz attempts
    - Show date, score, duration for each attempt
    - Display trend chart showing score improvement
    - Support clicking attempt to view detailed results
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5_

- [x] 12. Build quiz tab features



  - Create `QuizTab.tsx` component
  - Display quiz metadata (question count, topics covered)
  - Show "Take Quiz" button to start QuizInterface
  - Display QuizHistory section
  - Show "Retest Weak Topics" button if weak topics exist
  - _Requirements: 10.1, 15.1, 16.1_

- [x] 13. Implement weak topic retest feature



  - Add logic to generate custom quiz from weak topics
  - Filter quiz items to only include weak topic questions
  - Limit to 5-10 questions per weak topic
  - Display Explanation Orb (teaching/pointing pose) during review
  - Update topic performance after completion
  - _Requirements: 16.1, 16.2, 16.3, 16.4_

- [x] 14. Create notes tab


  - Create `NotesTab.tsx` component
  - Display smart notes from pack.stats_json.notes
  - Render Overview section
  - Render Key Concepts list
  - Render Definitions & Formulas
  - Render Likely Exam Questions
  - Render Common Pitfalls
  - Display Teacher Orb (with pointer/chalkboard)
  - _Requirements: 1.1_

- [x] 15. Create insights tab



  - Create `InsightsTab.tsx` component
  - Display Analytics Orb (with graphs/charts background)
  - Show flashcard progress chart
  - Show quiz performance by topic
  - Display weak topics section
  - Show streak information
  - Display pack coverage meter
  - _Requirements: 1.1, 9.1, 14.5_

- [x] 16. Implement keyboard shortcuts

  - Create `useKeyboardShortcuts` custom hook
  - Support Space (flip card), 1-4 (grade), Enter (submit), Escape (exit)
  - Ignore shortcuts when user is typing in input fields
  - Add keyboard shortcut hints to UI
  - _Requirements: 2.8, 10.8, 18.1, 18.2_

- [x] 17. Add accessibility features


  - Add ARIA live regions for flashcard and quiz announcements
  - Provide alt text for all Orb avatar images
  - Ensure visible focus indicators on all interactive elements
  - Implement focus management (auto-focus grading buttons after flip)
  - Verify color contrast ratio ≥4.5:1 for all text
  - Test with screen reader (NVDA or JAWS)
  - _Requirements: 18.2, 18.3, 18.4, 18.5_

- [x] 18. Implement mobile responsiveness



  - Add touch gesture support for flashcards (swipe up to flip, swipe left/right to grade)
  - Optimize layout for mobile viewports (single column, larger touch targets)
  - Implement bottom sheet for grading buttons on mobile
  - Adjust Orb sizes for mobile screens
  - Test on iOS and Android devices
  - _Requirements: 22.1, 22.2, 22.3, 22.4, 22.5_

- [x] 19. Add performance optimizations


  - Implement optimistic updates for flashcard grading
  - Add prefetching for next 3 cards in review session
  - Cache study pack data for 5 minutes
  - Implement retry queue for failed API calls
  - Optimize bundle size (code splitting for quiz/flashcard components)
  - _Requirements: 20.1, 20.2, 20.3, 20.4, 20.5_

- [x] 20. Implement error handling



  - Create `LearningErrorBoundary` component
  - Add error states for all API calls
  - Display Error Orb with user-friendly messages
  - Implement network error detection and retry logic
  - Preserve user state on errors (don't lose quiz answers)
  - Log errors for debugging
  - _Requirements: 21.1, 21.2, 21.3, 21.4, 21.5_

- [x] 21. Add loading states



  - Create loading skeleton for study pack page
  - Add loading spinner for flashcard session
  - Show loading state for quiz fetch
  - Display Processing Orb during data fetches
  - Implement smooth transitions between loading and loaded states
  - _Requirements: 1.6_

- [x] 22. Wire everything together





  - Update ProcessingStatus to redirect to `/study-packs/[id]` instead of 404
  - Add navigation from dashboard to study packs
  - Test complete flow: Upload → Process → Study Pack → Flashcards → Quiz
  - Verify all tabs work correctly
  - Test keyboard navigation throughout
  - Verify mobile responsiveness
  - Test with different plan tiers (free vs student_pro limits)
  - _Requirements: All_

