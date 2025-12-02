# Requirements Document

## Introduction

The Exam Coach Mode is a focused, high-intensity learning feature designed specifically for "Crammer Chris" - students who have an exam soon and need to quickly test their knowledge on the most important concepts. This mode provides a rapid-fire quiz experience with 10-15 high-yield questions, a countdown timer, and instant feedback to help students identify gaps in their knowledge under time pressure.

Unlike the regular Quiz mode which is comprehensive and educational, Exam Coach Mode is optimized for speed and efficiency, simulating exam conditions to help students assess their readiness quickly.

## Glossary

- **Exam Coach Mode**: A timed, rapid-fire quiz feature that presents 10-15 high-yield questions to simulate exam conditions
- **Study Pack**: A generated collection of learning materials including notes, flashcards, quizzes, and mind maps
- **High-Yield Question**: A quiz question that covers critical concepts most likely to appear on an exam
- **Quiz Item**: An individual question within a quiz, stored in the quiz_items table
- **Sappio Orb**: The friendly AI avatar that appears throughout the application to provide visual feedback and encouragement
- **Tab Navigation**: The horizontal navigation component that allows users to switch between different study pack views
- **Coach Session**: A single attempt at the Exam Coach Mode, tracked with timing and performance metrics

## Requirements

### Requirement 1: Prominent Tab Access

**User Story:** As a student preparing for an exam, I want to easily find and access the Exam Coach Mode so that I can quickly test my readiness without searching through the interface.

#### Acceptance Criteria

1. WHEN a user views a study pack detail page, THE Tab Navigation SHALL display an "Exam Coach" tab that is visually distinct from other tabs
2. THE "Exam Coach" tab SHALL use a unique visual treatment including a distinctive icon, accent color, and optional badge to indicate its importance
3. THE "Exam Coach" tab SHALL be positioned prominently in the tab navigation, either first or second in the tab order
4. WHEN a user hovers over the "Exam Coach" tab, THE system SHALL display a tooltip explaining "Quick exam prep: 10-15 high-yield questions"
5. THE "Exam Coach" tab SHALL be accessible via keyboard navigation with appropriate ARIA labels

### Requirement 2: Coach Overview Screen

**User Story:** As a student, I want to see an overview of what Exam Coach Mode offers before starting so that I understand what to expect and can prepare mentally.

#### Acceptance Criteria

1. WHEN a user navigates to the Exam Coach tab, THE system SHALL display an overview screen with the Coach Orb avatar
2. THE overview screen SHALL display the number of high-yield questions available for the session (10-15 questions)
3. THE overview screen SHALL show the estimated time duration for the session (e.g., "~5-8 minutes")
4. THE overview screen SHALL include a prominent "Start Exam Coach" button with energetic styling
5. THE overview screen SHALL display motivational text such as "Test your exam readiness" or "Quick knowledge check"
6. THE Coach Orb SHALL use the "coach-whistle" or "exam-day" pose to convey motivation and focus

### Requirement 3: High-Yield Question Selection

**User Story:** As a student cramming for an exam, I want the Exam Coach to show me the most important questions so that I can focus on critical concepts in limited time.

#### Acceptance Criteria

1. WHEN a user starts an Exam Coach session, THE system SHALL select 10-15 questions from the study pack's quiz items
2. THE system SHALL prioritize questions that cover key concepts identified in the study pack's notes
3. IF the study pack has fewer than 10 questions available, THE system SHALL use all available questions
4. THE system SHALL ensure selected questions cover diverse topics from the study pack when possible
5. THE system SHALL randomize the order of selected questions to prevent memorization of question sequence

### Requirement 4: Timed Session Interface

**User Story:** As a student, I want to complete the Exam Coach session under time pressure so that I can simulate real exam conditions and assess my speed.

#### Acceptance Criteria

1. WHEN an Exam Coach session starts, THE system SHALL display a countdown timer showing remaining time
2. THE timer SHALL be prominently displayed at the top of the screen throughout the session
3. THE timer SHALL calculate total time as (number of questions × 30 seconds) to allow approximately 30 seconds per question
4. WHEN the timer reaches 25% of remaining time, THE timer display SHALL change color to orange as a warning
5. WHEN the timer reaches 10% of remaining time, THE timer display SHALL change color to red as an urgent warning
6. WHEN the timer reaches zero, THE system SHALL automatically submit the session and show results
7. THE Timer Orb SHALL appear next to the countdown with an appropriate "focused" or "timer" pose

### Requirement 5: Rapid Question Flow

**User Story:** As a student in Exam Coach Mode, I want to move quickly through questions so that I can complete my knowledge check efficiently.

#### Acceptance Criteria

1. WHEN a user views a question in Exam Coach Mode, THE system SHALL display the question text, answer options, and a submit button
2. WHEN a user selects an answer and clicks submit, THE system SHALL immediately show whether the answer is correct or incorrect
3. THE system SHALL display a brief explanation (1-2 sentences maximum) for each answer
4. WHEN a user views feedback, THE system SHALL automatically advance to the next question after 3 seconds OR when the user clicks "Next"
5. THE system SHALL display progress as "Question X of Y" throughout the session
6. THE Rapid Fire Orb SHALL appear during questions with an energetic, fast-paced pose

### Requirement 6: Session Results and Insights

**User Story:** As a student who completed Exam Coach Mode, I want to see my performance results so that I can understand my strengths and weaknesses before the exam.

#### Acceptance Criteria

1. WHEN an Exam Coach session completes, THE system SHALL display a results screen showing the final score as a percentage
2. THE results screen SHALL display the time taken to complete the session
3. THE results screen SHALL show the number of correct answers out of total questions
4. THE results screen SHALL identify weak topics where the user answered incorrectly
5. THE results screen SHALL provide action buttons: "Review Weak Topics" (links to flashcards), "Retake Coach", and "Back to Pack"
6. THE Results Coach Orb SHALL appear with a pose reflecting performance (celebrating for high scores, encouraging for low scores)
7. THE system SHALL track the session completion in the events table with event type "exam_coach_completed"

### Requirement 7: Integration with Existing Quiz System

**User Story:** As a developer, I want Exam Coach Mode to reuse existing quiz infrastructure so that we maintain consistency and avoid code duplication.

#### Acceptance Criteria

1. THE Exam Coach Mode SHALL use the existing quiz_items table to source questions
2. THE Exam Coach Mode SHALL reuse the QuestionCard component for displaying questions
3. THE Exam Coach Mode SHALL store session results in a format compatible with the quiz_results table
4. THE Exam Coach Mode SHALL use the existing quiz API endpoints where applicable
5. THE Exam Coach Mode SHALL maintain the same question format and answer validation logic as the regular Quiz mode

### Requirement 8: Accessibility and Responsive Design

**User Story:** As a student using assistive technology or a mobile device, I want Exam Coach Mode to be fully accessible and responsive so that I can use it on any device.

#### Acceptance Criteria

1. THE Exam Coach interface SHALL be fully keyboard navigable with appropriate tab order
2. THE timer SHALL announce time warnings to screen readers at 25% and 10% remaining time
3. THE Exam Coach interface SHALL provide ARIA labels for all interactive elements
4. THE Exam Coach interface SHALL be responsive and usable on mobile devices (320px minimum width)
5. THE Exam Coach interface SHALL respect the user's reduced-motion preferences for animations
6. THE Exam Coach interface SHALL maintain color contrast ratios of at least 4.5:1 for all text

### Requirement 9: Empty State Handling

**User Story:** As a student viewing a study pack with insufficient quiz questions, I want to see a helpful message explaining why Exam Coach Mode is unavailable so that I understand the limitation.

#### Acceptance Criteria

1. WHEN a study pack has fewer than 5 quiz questions, THE Exam Coach tab SHALL display an empty state message
2. THE empty state SHALL explain that Exam Coach Mode requires at least 5 questions
3. THE empty state SHALL suggest using the regular Quiz mode instead
4. THE empty state SHALL display the Supportive Orb with an encouraging pose
5. THE empty state SHALL provide a button to navigate to the Quiz tab

### Requirement 10: Performance Tracking

**User Story:** As a product manager, I want to track how students use Exam Coach Mode so that we can measure its effectiveness and improve the feature.

#### Acceptance Criteria

1. WHEN a user starts an Exam Coach session, THE system SHALL log an "exam_coach_started" event
2. WHEN a user completes an Exam Coach session, THE system SHALL log an "exam_coach_completed" event with score and duration
3. WHEN a user abandons an Exam Coach session, THE system SHALL log an "exam_coach_abandoned" event
4. THE events SHALL include properties: study_pack_id, question_count, score, duration_seconds, weak_topics
5. THE system SHALL track conversion from Exam Coach results to flashcard review sessions
