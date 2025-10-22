# Requirements Document

## Introduction

This specification defines the Study Pack Creation feature for Sappio V2, which encompasses material upload, processing, and AI-powered study pack generation. The feature enables users to upload learning materials (PDF, DOCX, images, URLs, YouTube videos) and automatically generates comprehensive study packs containing smart notes, flashcards, quizzes, and mind maps. This is the core value proposition of Sappio: "Upload once → get everything to learn."

The system must process materials within 60 seconds to meet the "exam-ready in <60s" promise, while respecting plan-based usage limits (Free: 3 packs/month with 25 cards/pack; Student Pro: 300 packs/month with 300 cards/pack; Pro+: higher caps with bulk upload).

## Glossary

- **Material**: A source document or content uploaded by a user (PDF, DOCX, image, URL, or YouTube video)
- **Study Pack**: A generated learning package containing smart notes, flashcards, quiz, and mind map derived from a Material
- **Chunk**: A segmented portion of processed Material content with embeddings for semantic search
- **Smart Notes**: AI-generated structured notes containing Overview, Key Concepts, Definitions/Formulas, Likely Exam Questions, and Common Pitfalls
- **Flashcard**: A learning card with front/back content, supporting Q/A and cloze deletion types, with SRS (Spaced Repetition System) metadata
- **Quiz**: A set of generated questions (MCQ and short answer) with explanations and topic tagging
- **Mind Map**: A hierarchical visual representation of Material content with editable nodes
- **Coverage Meter**: A metric (High/Med/Low) indicating how thoroughly the source Material was utilized in generating study content
- **Processing Queue**: A background job system that handles Material extraction, chunking, and embedding generation
- **Generation Pipeline**: An AI-powered workflow that creates study pack components from processed Material chunks
- **Sappio Orb**: The friendly avatar character that provides visual feedback throughout the user experience
- **OCR**: Optical Character Recognition technology for extracting text from images and scanned PDFs
- **Embedding**: A vector representation of text content used for semantic similarity search
- **Plan Tier**: User subscription level (free, student_pro, pro_plus) that determines usage limits

## Requirements

### Requirement 1: Material Upload Interface

**User Story:** As a student, I want to upload my study materials through multiple methods, so that I can quickly start creating study packs from any content format.

#### Acceptance Criteria

1. WHEN THE User accesses the study pack creation interface, THE System SHALL display upload options for file upload, URL input, and YouTube link input
2. WHEN THE User drags a file over the upload zone, THE System SHALL display visual feedback with the Upload Orb in document-holding pose
3. WHEN THE User selects a file for upload, THE System SHALL validate the file type against allowed formats (PDF, DOCX, JPG, JPEG, PNG, WEBP, GIF)
4. WHEN THE User selects a file exceeding 50MB, THE System SHALL reject the upload and display an error message with the Error Orb
5. WHERE THE User has a free plan, WHEN THE User attempts to create more than 3 packs in the current month, THE System SHALL display a paywall prompt with the Upgrade Orb

### Requirement 2: File Storage and Security

**User Story:** As a user, I want my uploaded materials to be stored securely and privately, so that my study content remains confidential.

#### Acceptance Criteria

1. WHEN THE User uploads a Material file, THE System SHALL store the file in Supabase Storage with a unique path containing the user ID and material ID
2. THE System SHALL enforce Row Level Security policies ensuring users can only access their own Materials
3. WHEN THE User deletes a Material, THE System SHALL remove both the database record and the storage file within 5 seconds
4. THE System SHALL set Material visibility to private by default
5. WHEN THE User requests data deletion, THE System SHALL remove all associated Materials and storage files within 24 hours

### Requirement 3: Material Processing Pipeline

**User Story:** As a student, I want my uploaded materials to be processed automatically, so that I can see real-time progress and know when my study pack is ready.

#### Acceptance Criteria

1. WHEN THE User completes a Material upload, THE System SHALL create a Material record with status "processing" and display the Processing Orb with thinking pose
2. WHEN THE Material is a PDF or DOCX, THE System SHALL extract text content within 10 seconds for files under 100 pages
3. WHEN THE Material is an image or scanned PDF, THE System SHALL apply OCR to extract text content within 15 seconds per page
4. WHEN THE Material is a URL, THE System SHALL fetch and extract the main content within 10 seconds
5. WHEN THE Material is a YouTube URL, THE System SHALL extract the video transcript within 15 seconds
6. WHEN text extraction completes, THE System SHALL update the Material status to "chunking" and display progress to the user
7. IF text extraction fails after 2 retry attempts, THE System SHALL update Material status to "failed" and display the Error Orb with explanation

### Requirement 4: Content Chunking and Embedding

**User Story:** As a system, I need to segment and vectorize material content, so that I can perform semantic search and generate contextually relevant study content.

#### Acceptance Criteria

1. WHEN THE Material text extraction completes, THE System SHALL segment the content into Chunks of 500-1000 tokens with 100-token overlap
2. WHEN creating Chunks, THE System SHALL preserve semantic boundaries by avoiding splits mid-sentence
3. WHEN Chunks are created, THE System SHALL generate vector Embeddings for each Chunk within 30 seconds for materials under 50 pages
4. THE System SHALL store Chunks with order_index to maintain original sequence
5. WHEN all Chunks are processed, THE System SHALL update Material status to "ready"

### Requirement 5: Study Pack Generation Initiation

**User Story:** As a student, I want to initiate study pack generation immediately after material upload, so that I can start learning without additional steps.

#### Acceptance Criteria

1. WHEN THE Material status changes to "ready", THE System SHALL automatically initiate Study Pack generation
2. WHEN Study Pack generation begins, THE System SHALL create a Study Pack record with the Material ID and display the Generating Orb with sparkles
3. THE System SHALL display generation progress with stages: "Analyzing content", "Creating notes", "Generating flashcards", "Building quiz", "Mapping concepts"
4. WHEN THE User has a free plan, THE System SHALL limit flashcard generation to 25 cards maximum
5. WHEN THE User has a student_pro plan, THE System SHALL limit flashcard generation to 300 cards maximum

### Requirement 6: Smart Notes Generation

**User Story:** As a student, I want AI-generated structured notes from my materials, so that I can quickly understand the key concepts without reading the entire source.

#### Acceptance Criteria

1. WHEN generating Smart Notes, THE System SHALL create an Overview section summarizing the Material in 150-300 words within 10 seconds
2. WHEN generating Smart Notes, THE System SHALL extract 5-15 Key Concepts with brief explanations within 15 seconds
3. WHEN generating Smart Notes, THE System SHALL identify and format Definitions and Formulas as a structured list within 10 seconds
4. WHEN generating Smart Notes, THE System SHALL generate 3-10 Likely Exam Questions based on the Material content within 10 seconds
5. WHEN generating Smart Notes, THE System SHALL identify 3-8 Common Pitfalls or misconceptions within 10 seconds
6. WHEN Smart Notes generation completes, THE System SHALL display the Teacher Orb with pointer pose

### Requirement 7: Flashcard Generation

**User Story:** As a student, I want automatically generated flashcards with topic tags, so that I can start reviewing immediately using spaced repetition.

#### Acceptance Criteria

1. WHEN generating Flashcards, THE System SHALL create both Q/A type and cloze deletion type cards based on Material content
2. WHEN generating Flashcards, THE System SHALL assign topic tags to each card based on content themes
3. WHEN generating Flashcards, THE System SHALL set initial SRS values (ease: 2.50, interval_days: 0, reps: 0, lapses: 0, due_at: now)
4. WHEN generating Flashcards, THE System SHALL respect plan-based card limits (25 for free, 300 for student_pro)
5. WHEN Flashcard generation completes, THE System SHALL display the Flashcard Orb holding cards pose
6. THE System SHALL ensure each Flashcard front is 10-150 characters and back is 20-500 characters

### Requirement 8: Quiz Generation

**User Story:** As a student, I want automatically generated quiz questions with explanations, so that I can test my understanding of the material.

#### Acceptance Criteria

1. WHEN generating a Quiz, THE System SHALL create 10 questions for free plan users and 30 questions for student_pro users
2. WHEN generating Quiz items, THE System SHALL create a mix of 70% multiple-choice questions and 30% short answer questions
3. WHEN generating multiple-choice questions, THE System SHALL provide 4 answer options with exactly one correct answer
4. WHEN generating Quiz items, THE System SHALL include an explanation for each question within 100-300 characters
5. WHEN generating Quiz items, THE System SHALL assign topic tags for weak area identification
6. WHEN Quiz generation completes, THE System SHALL display the Quiz Master Orb with question mark bubble

### Requirement 9: Mind Map Generation

**User Story:** As a student, I want an automatically generated mind map of my material, so that I can visualize the hierarchical structure of concepts.

#### Acceptance Criteria

1. WHEN generating a Mind Map, THE System SHALL create a hierarchical node structure with 1 root node and 3-7 main branches
2. WHEN generating Mind Map nodes, THE System SHALL create 2-5 child nodes per main branch based on content depth
3. WHEN generating Mind Map nodes, THE System SHALL store references to source Chunk IDs for traceability
4. WHEN generating Mind Map nodes, THE System SHALL set order_index for consistent rendering
5. WHEN Mind Map generation completes, THE System SHALL calculate and store layout_json with node positions
6. WHERE THE User has a free plan, THE System SHALL limit the Mind Map to 20 nodes maximum (mini mind-map)

### Requirement 10: Coverage Meter Calculation

**User Story:** As a student, I want to see how thoroughly my source material was used, so that I can assess the completeness of my study pack.

#### Acceptance Criteria

1. WHEN Study Pack generation completes, THE System SHALL calculate a Coverage Meter based on Chunk utilization
2. WHEN 80% or more Chunks are referenced in generated content, THE System SHALL set Coverage Meter to "High"
3. WHEN 50-79% of Chunks are referenced in generated content, THE System SHALL set Coverage Meter to "Med"
4. WHEN less than 50% of Chunks are referenced in generated content, THE System SHALL set Coverage Meter to "Low"
5. THE System SHALL store the Coverage Meter value in the Study Pack stats_json field

### Requirement 11: Generation Performance

**User Story:** As a student, I want my study pack to be ready in under 60 seconds, so that I can start learning immediately without long waits.

#### Acceptance Criteria

1. WHEN THE User uploads a Material under 50 pages, THE System SHALL complete Study Pack generation within 60 seconds from upload completion
2. WHEN THE User uploads a Material between 50-100 pages, THE System SHALL complete Study Pack generation within 120 seconds
3. IF Study Pack generation exceeds 180 seconds, THE System SHALL log a performance warning for admin review
4. THE System SHALL process generation tasks in parallel where possible (notes, flashcards, quiz, mind map)
5. WHERE THE User has a student_pro plan, THE System SHALL prioritize their generation jobs in the queue

### Requirement 12: Generation Status and Feedback

**User Story:** As a student, I want to see real-time progress during study pack generation, so that I know the system is working and can estimate completion time.

#### Acceptance Criteria

1. WHEN Study Pack generation is in progress, THE System SHALL display the current stage name to the user
2. WHEN each generation stage completes, THE System SHALL update the progress indicator within 2 seconds
3. WHEN Study Pack generation completes successfully, THE System SHALL display the Success Orb with thumbs up pose
4. WHEN Study Pack generation completes, THE System SHALL navigate the user to the Study Pack view within 3 seconds
5. IF any generation stage fails, THE System SHALL display the Error Orb with a user-friendly error message

### Requirement 13: Error Handling and Recovery

**User Story:** As a student, I want clear error messages when something goes wrong, so that I can understand the issue and take corrective action.

#### Acceptance Criteria

1. WHEN Material upload fails due to file size, THE System SHALL display "File too large. Maximum size is 50MB." with the Error Orb
2. WHEN Material upload fails due to invalid format, THE System SHALL display "Unsupported file type. Please upload PDF, DOCX, or images." with the Error Orb
3. WHEN OCR fails on an image, THE System SHALL display "Unable to extract text from image. Please ensure the image contains readable text." with the Error Orb
4. WHEN URL content extraction fails, THE System SHALL display "Unable to access URL. Please check the link and try again." with the Error Orb
5. WHEN AI generation fails, THE System SHALL display "Generation failed. Please try again or contact support." with the Error Orb and log the error for admin review

### Requirement 14: Plan-Based Usage Tracking

**User Story:** As a user, I want the system to track my usage against my plan limits, so that I know when I'm approaching my monthly quota.

#### Acceptance Criteria

1. WHEN THE User creates a Study Pack, THE System SHALL increment their monthly pack count atomically to prevent double-counting
2. WHEN THE User reaches 80% of their monthly pack limit, THE System SHALL display a warning notification
3. WHEN THE User reaches 100% of their monthly pack limit, THE System SHALL allow 1 grace pack and display the Limit Reached Orb with upgrade prompt
4. THE System SHALL reset monthly pack counts based on the user's billing anchor date (not calendar month)
5. THE System SHALL track pack creation in the events table with event "pack_created" for analytics
6. THE System SHALL maintain usage counters for fast quota checks without querying the events table
7. THE System SHALL use idempotency keys to prevent duplicate counting on retries or network failures

### Requirement 15: Cost Protection and Material Limits

**User Story:** As a system administrator, I need to protect against excessive API costs, so that large materials don't cause unexpected expenses.

#### Acceptance Criteria

1. THE System SHALL enforce maximum page limits per material based on plan tier (free: 50 pages, student_pro: 200 pages, pro_plus: 500 pages)
2. THE System SHALL enforce maximum token limits per material based on plan tier (free: 50k tokens, student_pro: 200k tokens, pro_plus: 500k tokens)
3. WHEN THE User uploads a material exceeding page limits, THE System SHALL display an error message with the limit and suggest upgrading
4. WHEN THE User uploads a material exceeding token limits, THE System SHALL display an error message with the limit and suggest upgrading
5. THE System SHALL estimate token count during text extraction and reject materials that exceed limits before processing

### Requirement 16: Material Management

**User Story:** As a user, I want to manage my uploaded materials, so that I can delete old content and free up storage space.

#### Acceptance Criteria

1. WHEN THE User views a Study Pack, THE System SHALL display the associated Material metadata (filename, upload date, file size)
2. WHEN THE User deletes a Study Pack, THE System SHALL prompt for confirmation before deletion
3. WHEN THE User confirms Study Pack deletion, THE System SHALL delete the Study Pack, associated Material, and storage file within 5 seconds
4. THE System SHALL prevent deletion of Materials while processing is in progress
5. WHEN Material deletion completes, THE System SHALL display a success message

### Requirement 17: Orb Avatar Integration

**User Story:** As a user, I want to see the Sappio Orb throughout the creation process, so that I have a friendly, encouraging experience.

#### Acceptance Criteria

1. WHEN THE User accesses the upload interface, THE System SHALL display the Upload Orb in document-holding pose
2. WHEN Material processing begins, THE System SHALL display the Processing Orb with thinking pose and orbital rings
3. WHEN text extraction is in progress, THE System SHALL display the Reading Orb with book/glasses pose
4. WHEN Study Pack generation is in progress, THE System SHALL display the Generating Orb with sparkles
5. WHEN Study Pack generation completes, THE System SHALL display the Success Orb with thumbs up pose
6. WHEN any error occurs, THE System SHALL display the Error Orb with sad/confused pose and error symbol

### Requirement 18: Accessibility and Responsiveness

**User Story:** As a user with accessibility needs, I want the upload and generation interface to be keyboard-navigable and screen-reader friendly, so that I can use the feature independently.

#### Acceptance Criteria

1. THE System SHALL provide keyboard navigation for all upload interface controls with visible focus indicators
2. THE System SHALL provide alt text for all Orb avatar images describing the current state
3. THE System SHALL announce progress updates to screen readers using ARIA live regions
4. THE System SHALL maintain color contrast ratio of at least 4.5:1 for all text and interactive elements
5. THE System SHALL respect user's reduced-motion preferences by disabling Orb animations when requested

### Requirement 19: API Endpoints

**User Story:** As a developer, I need well-defined API endpoints for material upload and study pack generation, so that I can integrate the feature into the frontend application.

#### Acceptance Criteria

1. THE System SHALL provide POST /api/materials/upload endpoint accepting multipart/form-data with file field
2. THE System SHALL provide POST /api/materials/url endpoint accepting JSON with url field
3. THE System SHALL provide GET /api/materials/:id/status endpoint returning processing status and progress
4. THE System SHALL provide POST /api/study-packs/generate endpoint accepting material_id
5. THE System SHALL provide GET /api/study-packs/:id endpoint returning complete study pack data with notes, flashcards, quiz, and mind map
6. THE System SHALL provide DELETE /api/study-packs/:id endpoint for pack deletion
7. THE System SHALL return appropriate HTTP status codes (200, 201, 400, 401, 403, 404, 500) with error messages

### Requirement 20: Background Job Processing

**User Story:** As a system administrator, I need reliable background job processing for material and study pack generation, so that the system can handle concurrent requests efficiently.

#### Acceptance Criteria

1. THE System SHALL implement a job queue for Material processing tasks
2. THE System SHALL implement a job queue for Study Pack generation tasks
3. THE System SHALL process jobs in FIFO order with priority boost for student_pro users
4. THE System SHALL retry failed jobs up to 2 times with exponential backoff (5s, 15s)
5. THE System SHALL log all job executions with timestamps, duration, and status for monitoring

### Requirement 21: Data Persistence and Integrity

**User Story:** As a user, I want my study packs to be saved reliably, so that I don't lose my generated content.

#### Acceptance Criteria

1. THE System SHALL use database transactions when creating Study Pack records with associated content
2. IF any part of Study Pack generation fails, THE System SHALL roll back all partial changes
3. THE System SHALL store all generated content (notes, flashcards, quiz items, mind map nodes) before marking Study Pack as complete
4. THE System SHALL update Study Pack updated_at timestamp whenever content is modified
5. THE System SHALL maintain referential integrity between Study Packs, Materials, Flashcards, Quizzes, and Mind Maps
