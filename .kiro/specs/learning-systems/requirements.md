# Requirements Document

## Introduction

This specification defines the Flashcard Learning System (Phase 4) and Quiz System (Phase 5) for Sappio V2. These features transform generated study content into interactive learning experiences that drive retention and mastery. The flashcard system implements Spaced Repetition (SRS) using a modified SM-2 algorithm, while the quiz system provides practice and timed modes with detailed performance tracking.

**Current State:** Flashcards and quizzes are already being generated during study pack creation (Phase 3). This spec focuses on building the interactive learning interfaces and algorithms that allow users to review flashcards and take quizzes.

**Target Personas:**
- **Methodical Maya**: Wants SRS flashcards with daily due queues and streak tracking for long-term retention
- **Crammer Chris**: Needs timed quizzes with instant feedback for exam preparation

## Glossary

- **SRS (Spaced Repetition System)**: An evidence-based learning technique that schedules reviews at increasing intervals
- **SM-2 Algorithm**: A specific SRS algorithm that adjusts review intervals based on user performance
- **Ease Factor**: A multiplier (default 2.5) that determines how quickly intervals grow
- **Interval**: Number of days until a card is due for review again
- **Lapse**: When a user fails to recall a card (grades it "Again")
- **Due Queue**: Collection of flashcards scheduled for review today
- **Streak**: Consecutive days of completing flashcard reviews
- **Practice Mode**: Untimed quiz mode for learning without pressure
- **Timed Mode**: Quiz mode with countdown timer for exam simulation
- **Weak Topics**: Quiz topics where user performance is below 70%

## Requirements

### Requirement 1: Study Pack View Page

**User Story:** As a user, I want to view my complete study pack with all generated content, so that I can access notes, flashcards, quizzes, and mind maps in one place.

#### Acceptance Criteria

1. WHEN a user navigates to `/study-packs/[id]` THEN the system SHALL display the study pack page with tabs for Notes, Flashcards, Quiz, Mind Map, and Insights
2. WHEN the study pack page loads THEN the system SHALL fetch and display the pack title, summary, and material metadata
3. WHEN the study pack page loads THEN the system SHALL display the Dashboard Hero Orb with orbital rings
4. WHEN the user clicks a tab THEN the system SHALL switch to that tab's content without page reload
5. WHEN the study pack does not exist or user lacks permission THEN the system SHALL display 404 error with Error Orb
6. WHEN the study pack is loading THEN the system SHALL display the Processing Orb with loading indicator
7. THE system SHALL display pack statistics: card count, quiz question count, coverage meter, and creation date

### Requirement 2: Flashcard Review Interface

**User Story:** As a student, I want to review flashcards one at a time with a flip animation, so that I can test my recall before seeing the answer.

#### Acceptance Criteria

1. WHEN a user clicks "Study Flashcards" THEN the system SHALL display the flashcard review interface with the Study Orb (focused/studying pose)
2. WHEN the flashcard review starts THEN the system SHALL show the first due card's front side
3. WHEN the user clicks "Show Answer" or presses Space THEN the system SHALL flip the card to show the back side with smooth animation
4. WHEN the back side is visible THEN the system SHALL display four grading buttons: "Again", "Hard", "Good", "Easy"
5. WHEN the user grades a card THEN the system SHALL apply the SRS algorithm and show the next card
6. WHEN there are no more cards in the session THEN the system SHALL display session statistics with Success Orb
7. THE system SHALL display session progress: "Card X of Y" at the top
8. THE system SHALL support keyboard shortcuts: Space (flip), 1-4 (grade)
9. WHEN the user has reduced motion preferences THEN the system SHALL use fade transitions instead of flip animations

### Requirement 3: SRS Algorithm Implementation (SM-2 Modified)

**User Story:** As a system, I need to calculate optimal review intervals based on user performance, so that cards are reviewed at the right time for maximum retention.

#### Acceptance Criteria

1. WHEN a user grades a card "Again" THEN the system SHALL set interval_days to 0, increment lapses, reduce ease by 0.2 (min 1.3), and set due_at to now
2. WHEN a user grades a card "Hard" THEN the system SHALL set interval_days to max(1, interval * 1.2), reduce ease by 0.15 (min 1.3), increment reps, and calculate due_at
3. WHEN a user grades a card "Good" THEN the system SHALL set interval_days to interval * ease, increment reps, and calculate due_at
4. WHEN a user grades a card "Easy" THEN the system SHALL set interval_days to interval * ease * 1.3, increase ease by 0.15 (max 2.5), increment reps, and calculate due_at
5. WHEN a card is reviewed for the first time (reps = 0) THEN the system SHALL use intervals: Again=0, Hard=1, Good=1, Easy=4
6. WHEN a card is reviewed for the second time (reps = 1) THEN the system SHALL use intervals: Again=0, Hard=1, Good=6, Easy=10
7. THE system SHALL store all SRS values (ease, interval_days, due_at, reps, lapses) in the flashcards table
8. THE system SHALL calculate due_at as current_timestamp + interval_days

### Requirement 4: Due Queue Calculation

**User Story:** As a student, I want to see how many cards are due today, so that I can plan my study sessions.

#### Acceptance Criteria

1. WHEN a user views the Flashcards tab THEN the system SHALL display the count of cards due today (due_at <= now)
2. WHEN a user starts a review session THEN the system SHALL fetch only cards where due_at <= now, ordered by due_at ASC
3. WHEN there are no cards due THEN the system SHALL display the Empty State Orb (relaxed/sleeping pose) with message "No cards due today! Come back tomorrow."
4. WHEN there are cards due THEN the system SHALL display "X cards due" with a "Start Review" button
5. THE system SHALL show the next due date if no cards are due today

### Requirement 5: Session Statistics and Feedback

**User Story:** As a student, I want to see my performance after a review session, so that I can track my progress and identify areas needing work.

#### Acceptance Criteria

1. WHEN a review session completes THEN the system SHALL display session statistics: cards reviewed, accuracy rate, average response time, and cards by grade
2. WHEN session statistics are displayed THEN the system SHALL show the Encouraging Orb for >80% accuracy or Supportive Orb for <80%
3. WHEN a user completes a session THEN the system SHALL log a "cards_reviewed" event with session details
4. THE system SHALL display a breakdown: X Again, Y Hard, Z Good, W Easy
5. THE system SHALL show estimated time until next review session
6. THE system SHALL provide a "Review Again" button to start a new session

### Requirement 6: Streak Tracking

**User Story:** As a student, I want to maintain a daily review streak, so that I stay motivated to study consistently.

#### Acceptance Criteria

1. WHEN a user completes at least one flashcard review in a day THEN the system SHALL increment their streak counter
2. WHEN a user misses a day of reviews THEN the system SHALL reset their streak to 0
3. WHEN the user has an active streak THEN the system SHALL display the Streak Orb with fire/lightning and the current streak count
4. WHEN the user reaches streak milestones (7, 30, 100 days) THEN the system SHALL display a celebration modal with Achievement Orb
5. THE system SHALL store streak data in the users table or a separate streaks table
6. THE system SHALL use the user's timezone for accurate day calculations

### Requirement 7: Topic Filtering

**User Story:** As a student, I want to filter flashcards by topic, so that I can focus on specific areas of study.

#### Acceptance Criteria

1. WHEN a user views the Flashcards tab THEN the system SHALL display a list of available topics with card counts
2. WHEN a user selects a topic filter THEN the system SHALL show only cards with that topic tag
3. WHEN a user starts a review session with a topic filter THEN the system SHALL include only filtered cards in the due queue
4. WHEN a user clears the topic filter THEN the system SHALL show all cards
5. THE system SHALL display "All Topics" as the default filter option

### Requirement 8: Card Editing

**User Story:** As a student, I want to edit flashcard content, so that I can fix errors or add personal notes.

#### Acceptance Criteria

1. WHEN a user clicks "Edit" on a flashcard THEN the system SHALL display an edit modal with front and back text fields
2. WHEN a user saves edits THEN the system SHALL update the flashcard record and display success confirmation
3. WHEN a user cancels editing THEN the system SHALL discard changes and close the modal
4. THE system SHALL validate that front is 10-150 characters and back is 20-500 characters
5. THE system SHALL preserve SRS data (ease, interval, etc.) when editing content

### Requirement 9: Progress Visualization

**User Story:** As a student, I want to see my flashcard progress visually, so that I can understand my learning trajectory.

#### Acceptance Criteria

1. WHEN a user views the Flashcards tab THEN the system SHALL display a progress chart showing: New, Learning, Review, Mastered cards
2. WHEN a user views progress THEN the system SHALL categorize cards: New (reps=0), Learning (reps<5), Review (reps>=5, interval<30), Mastered (interval>=30)
3. THE system SHALL display the distribution as a horizontal bar chart with color coding
4. THE system SHALL show total cards and percentage in each category
5. WHEN a user hovers over a category THEN the system SHALL display detailed tooltip information

### Requirement 10: Quiz Taking Interface

**User Story:** As a student, I want to take quizzes with multiple-choice and short answer questions, so that I can test my understanding of the material.

#### Acceptance Criteria

1. WHEN a user clicks "Take Quiz" THEN the system SHALL display the quiz interface with the Quiz Host Orb (professional/teacher pose)
2. WHEN the quiz starts THEN the system SHALL display the first question with its options (for MCQ) or text input (for short answer)
3. WHEN a user selects an answer THEN the system SHALL highlight the selection and enable the "Submit" button
4. WHEN a user submits an answer THEN the system SHALL show immediate feedback: correct (green) or incorrect (red) with explanation
5. WHEN a user clicks "Next Question" THEN the system SHALL advance to the next question
6. WHEN the quiz completes THEN the system SHALL display results with score, time taken, and topic breakdown
7. THE system SHALL display question progress: "Question X of Y"
8. THE system SHALL support keyboard navigation: number keys for MCQ, Enter to submit

### Requirement 11: Practice vs Timed Mode

**User Story:** As a student, I want to choose between practice mode (untimed) and timed mode (exam simulation), so that I can learn at my own pace or simulate exam conditions.

#### Acceptance Criteria

1. WHEN a user starts a quiz THEN the system SHALL display mode selection: "Practice Mode" or "Timed Mode"
2. WHEN a user selects Practice Mode THEN the system SHALL start the quiz without a timer
3. WHEN a user selects Timed Mode THEN the system SHALL display a countdown timer based on question count (2 minutes per question)
4. WHEN the timer reaches 0 in Timed Mode THEN the system SHALL auto-submit the quiz and display results
5. WHEN the timer is running THEN the system SHALL display the Timer Orb (focused countdown pose) with remaining time
6. THE system SHALL allow users to pause/resume in Practice Mode but not in Timed Mode
7. THE system SHALL display different Orb poses: Thinking Orb during quiz, Results Orb showing score after completion

### Requirement 12: Answer Submission and Grading

**User Story:** As a student, I want my quiz answers to be graded automatically, so that I receive instant feedback on my performance.

#### Acceptance Criteria

1. WHEN a user submits an MCQ answer THEN the system SHALL compare it to the correct answer and mark as correct/incorrect
2. WHEN a user submits a short answer THEN the system SHALL use fuzzy matching (case-insensitive, trim whitespace) to grade
3. WHEN an answer is correct THEN the system SHALL display the Encouraging Orb (happy/celebrating) with green checkmark
4. WHEN an answer is incorrect THEN the system SHALL display the Supportive Orb (gentle/encouraging) with the correct answer
5. THE system SHALL always display the explanation after answer submission
6. THE system SHALL track: question_id, user_answer, is_correct, time_spent for each question

### Requirement 13: Quiz Results and Analytics

**User Story:** As a student, I want to see detailed quiz results, so that I can identify my strengths and weaknesses.

#### Acceptance Criteria

1. WHEN a quiz completes THEN the system SHALL display: final score (percentage), time taken, questions correct/incorrect
2. WHEN quiz results are displayed THEN the system SHALL show the High Score Orb (trophy/medal) for >80% or Low Score Orb (encouraging) for <80%
3. WHEN quiz results are displayed THEN the system SHALL show topic-based performance breakdown
4. WHEN quiz results are displayed THEN the system SHALL save a quiz_result record with score, duration_s, and detail_json
5. THE system SHALL display a "Review Incorrect Answers" button to see missed questions with explanations
6. THE system SHALL display a "Retake Quiz" button to start a new attempt
7. THE system SHALL log a "quiz_completed" event with quiz_id and score

### Requirement 14: Weak Topic Identification

**User Story:** As a student, I want to identify topics where I'm struggling, so that I can focus my study efforts effectively.

#### Acceptance Criteria

1. WHEN quiz results are displayed THEN the system SHALL calculate accuracy per topic
2. WHEN a topic has <70% accuracy THEN the system SHALL mark it as a "Weak Topic"
3. WHEN weak topics are identified THEN the system SHALL display them with the Weak Area Orb (supportive, pointing to areas to focus)
4. THE system SHALL provide a "Study Weak Topics" button that filters flashcards to those topics
5. THE system SHALL display weak topics prominently on the Insights tab

### Requirement 15: Quiz History

**User Story:** As a student, I want to see my quiz attempt history, so that I can track my improvement over time.

#### Acceptance Criteria

1. WHEN a user views the Quiz tab THEN the system SHALL display a "History" section with past attempts
2. WHEN quiz history is displayed THEN the system SHALL show: date, score, duration, and topics covered for each attempt
3. WHEN a user clicks on a past attempt THEN the system SHALL display detailed results for that attempt
4. THE system SHALL order quiz history by taken_at DESC (most recent first)
5. THE system SHALL display a trend chart showing score improvement over time

### Requirement 16: Retest Weak Topics Feature

**User Story:** As a student, I want to retake quizzes focusing only on my weak topics, so that I can improve in specific areas.

#### Acceptance Criteria

1. WHEN a user clicks "Retest Weak Topics" THEN the system SHALL generate a custom quiz with only questions from weak topics
2. WHEN a weak topic quiz is generated THEN the system SHALL include 5-10 questions per weak topic
3. WHEN a weak topic quiz completes THEN the system SHALL update topic performance metrics
4. THE system SHALL display the Explanation Orb (teaching/pointing pose) during weak topic review

### Requirement 17: Long Session Support

**User Story:** As a student, I want the system to suggest breaks during long study sessions, so that I maintain focus and avoid burnout.

#### Acceptance Criteria

1. WHEN a user has reviewed 20+ flashcards in one session THEN the system SHALL display the Tired Orb (yawning, suggesting break) with a break suggestion
2. WHEN a break suggestion is displayed THEN the system SHALL offer "Take a Break" or "Continue Studying" options
3. WHEN a user takes a break THEN the system SHALL pause the session and display a 5-minute timer
4. WHEN the break timer completes THEN the system SHALL display a notification to resume studying
5. THE system SHALL respect user preference to disable break suggestions

### Requirement 18: Accessibility and Keyboard Navigation

**User Story:** As a user with accessibility needs, I want full keyboard navigation and screen reader support, so that I can use the learning features independently.

#### Acceptance Criteria

1. THE system SHALL support keyboard shortcuts: Space (flip card), 1-4 (grade flashcard), Enter (submit quiz answer), Arrow keys (navigate)
2. THE system SHALL provide visible focus indicators for all interactive elements
3. THE system SHALL announce flashcard content and quiz questions to screen readers using ARIA live regions
4. THE system SHALL provide alt text for all Orb avatar images describing the current state
5. THE system SHALL maintain color contrast ratio of at least 4.5:1 for all text
6. THE system SHALL respect user's reduced-motion preferences for animations

### Requirement 19: API Endpoints

**User Story:** As a developer, I need well-defined API endpoints for flashcard and quiz operations, so that I can build the learning interfaces.

#### Acceptance Criteria

1. THE system SHALL provide GET `/api/study-packs/[id]/flashcards/due` returning cards where due_at <= now
2. THE system SHALL provide POST `/api/flashcards/[id]/review` accepting grade ("again", "hard", "good", "easy") and returning updated SRS values
3. THE system SHALL provide GET `/api/flashcards/stats` returning session statistics and streak data
4. THE system SHALL provide PATCH `/api/flashcards/[id]` for editing card content
5. THE system SHALL provide GET `/api/quizzes/[id]` returning quiz with all items
6. THE system SHALL provide POST `/api/quizzes/[id]/submit` accepting answers array and returning graded results
7. THE system SHALL provide GET `/api/quiz-results/history` returning past quiz attempts with pagination
8. THE system SHALL return appropriate HTTP status codes (200, 201, 400, 401, 403, 404, 500) with error messages

### Requirement 20: Performance and Caching

**User Story:** As a user, I want flashcard and quiz interfaces to load instantly, so that I can start studying without delays.

#### Acceptance Criteria

1. WHEN a user loads the study pack page THEN the system SHALL cache the pack data for 5 minutes
2. WHEN a user starts a flashcard session THEN the system SHALL prefetch the next 3 cards
3. WHEN a user takes a quiz THEN the system SHALL load all questions at once (no pagination)
4. THE system SHALL use optimistic updates for flashcard grading (update UI immediately, sync in background)
5. THE system SHALL invalidate cache when user edits flashcards or retakes quizzes

### Requirement 21: Error Handling and Edge Cases

**User Story:** As a user, I want clear error messages when something goes wrong, so that I know how to proceed.

#### Acceptance Criteria

1. WHEN a flashcard review fails to load THEN the system SHALL display Error Orb with "Unable to load flashcards. Please try again."
2. WHEN a quiz submission fails THEN the system SHALL preserve user answers and allow retry
3. WHEN network connection is lost during review THEN the system SHALL queue updates and sync when connection returns
4. WHEN a user tries to review a deleted study pack THEN the system SHALL redirect to dashboard with error message
5. THE system SHALL log all errors for debugging while displaying user-friendly messages

### Requirement 22: Mobile Responsiveness

**User Story:** As a mobile user, I want to review flashcards and take quizzes on my phone, so that I can study anywhere.

#### Acceptance Criteria

1. THE system SHALL display flashcards in a mobile-optimized layout with touch-friendly buttons
2. THE system SHALL support swipe gestures: swipe up (flip card), swipe left (Again), swipe right (Good)
3. THE system SHALL display quiz questions in a single-column layout on mobile devices
4. THE system SHALL use responsive font sizes for readability on small screens
5. THE system SHALL optimize Orb avatar sizes for mobile viewports

