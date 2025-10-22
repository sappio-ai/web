# Implementation Plan

This implementation plan breaks down the Study Pack Creation feature into discrete, manageable coding tasks. Each task builds incrementally on previous work, ensuring the system remains functional throughout development.

## Task Overview

The implementation follows this sequence:
1. Storage and infrastructure setup
2. Material upload and storage
3. Processing pipeline (extraction, chunking, embeddings)
4. AI content generation
5. Frontend components and user experience
6. Error handling and optimization

---

## Tasks

- [x] 1. Set up Supabase Storage and infrastructure



  - Create 'materials' storage bucket in Supabase
  - Configure Row Level Security policies for storage
  - Enable pgvector extension in database
  - Create vector similarity search index on chunks table
  - Add environment variables for OpenAI API and storage configuration
  - _Requirements: 2.1, 2.2, 2.3, 2.4_



- [x] 2. Create core type definitions and utilities
  - [x] 2.1 Define TypeScript interfaces for Material, Chunk, StudyPack, SmartNotes, Flashcard, Quiz, MindMap models

    - Create `src/lib/types/materials.ts` with all model interfaces
    - Export types matching database schema from design document
    - Include status enums and metadata types
    - _Requirements: 1.1, 18.1_
  
  - [x] 2.2 Create utility functions for file validation and token estimation

    - Create `src/lib/utils/files.ts` with file type validation, size checking
    - Create `src/lib/utils/tokens.ts` with token estimation function
    - Add MIME type constants and file size limits
    - _Requirements: 1.3, 1.4_
  

  - [x] 2.3 Create error handling utilities and custom error classes

    - Create `src/lib/utils/errors.ts` with custom error classes (UploadError, ProcessingError, GenerationError)
    - Add error code constants and user-friendly message mapping
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_

- [x] 3. Implement MaterialService for CRUD operations




  - [x] 3.1 Create MaterialService class with database operations

    - Create `src/lib/services/MaterialService.ts`
    - Implement createMaterial, getMaterial, updateMaterialStatus, deleteMaterial methods
    - Add ownership verification in getMaterial
    - _Requirements: 2.1, 2.2, 15.1, 15.3_
  
  - [x] 3.2 Implement storage operations in MaterialService

    - Add uploadToStorage method using Supabase Storage client
    - Add deleteFromStorage method with error handling
    - Generate unique storage paths: `materials/{userId}/{materialId}/{filename}`
    - _Requirements: 2.1, 2.3, 15.4_
  

  - [x] 3.3 Implement usage tracking methods

    - Add getUserMaterialCount method to query monthly pack creation
    - Add helper to check if user is within plan limits
    - _Requirements: 14.1, 14.2, 14.3_

- [x] 4. Implement UsageService for plan limit enforcement




  - [x] 4.1 Create database schema for usage tracking

    - Create migration for plan_limits table with editable limits
    - Create migration for usage_counters table (fast lookups)
    - Create migration for usage_idempotency table (prevent double-counting)
    - Add billing_anchor and timezone columns to users table
    - Create PostgreSQL function increment_usage_counter for atomic operations
    - Insert default plan limits into plan_limits table
    - _Requirements: 1.5, 5.4, 5.5, 14.1, 14.2, 14.3, 14.4_
  

  - [x] 4.2 Create UsageService with core methods

    - Create `src/lib/services/UsageService.ts`
    - Implement getPlanLimits method with 5-minute cache
    - Implement calculatePeriodStart method using billing_anchor
    - Implement getUsageForPeriod method querying usage_counters
    - Define DEFAULT_PLAN_LIMITS constant as fallback
    - _Requirements: 1.5, 5.4, 5.5_
  

  - [x] 4.3 Implement quota checking and consumption

    - Implement canCreatePack method with grace window logic
    - Implement consumePackQuota method with idempotency
    - Implement getUsageStats method returning detailed usage info
    - Add 80% warning threshold check
    - Add grace window (1 extra pack) for better conversion
    - _Requirements: 14.1, 14.2, 14.3, 14.4_
  

  - [x] 4.4 Add helper methods and utilities

    - Implement getUserProfile helper to fetch user with plan
    - Implement cache management for plan limits
    - Add error handling for quota exceeded scenarios
    - Add logging for usage events
    - _Requirements: 14.1, 14.2, 14.3_

- [x] 5. Create file upload API endpoint



  - [x] 5.1 Implement POST /api/materials/upload route

    - Create `src/app/api/materials/upload/route.ts`
    - Parse multipart/form-data using Next.js request.formData()
    - Authenticate user and get user ID from session
    - Validate file type (PDF, DOCX, JPG, JPEG, PNG, WEBP, GIF) and size (<50MB)
    - _Requirements: 1.3, 1.4, 18.1_
  

  - [x] 5.2 Implement upload flow with storage and database


    - Check plan limits using UsageService.checkPackLimit
    - Generate material ID and storage path
    - Upload file to Supabase Storage using MaterialService
    - Create material record with status "processing"
    - Return material ID and status in response
    - _Requirements: 1.5, 2.1, 5.1, 18.1_
  



  - [x] 5.3 Add error handling and HTTP status codes
    - Return 401 for unauthenticated requests
    - Return 403 for plan limit exceeded with upgrade message
    - Return 413 for file too large


    - Return 415 for unsupported file type
    - Return 500 for storage/database failures
    - _Requirements: 13.1, 13.2, 18.7_

- [x] 6. Create URL/YouTube submission API endpoint


  - [x] 6.1 Implement POST /api/materials/url route

    - Create `src/app/api/materials/url/route.ts`
    - Parse JSON body with url and type fields
    - Authenticate user and validate URL format
    - _Requirements: 1.1, 18.2_
  

  - [x] 6.2 Implement URL material creation flow

    - Check plan limits using UsageService
    - Create material record with source_url and kind (url or youtube)
    - Set status to "processing"
    - Return material ID
    - _Requirements: 5.1, 18.2_
  
  - [x] 6.3 Add URL validation and error handling


    - Validate URL format using URL constructor
    - Check for YouTube URL patterns
    - Return appropriate error codes (400, 401, 403)
    - _Requirements: 13.4, 18.7_

- [x] 7. Implement ProcessingService for text extraction



  - [x] 7.1 Create ProcessingService class structure

    - Create `src/lib/services/ProcessingService.ts`
    - Add method stubs for extractText, extractPdfText, extractDocxText, extractImageText, extractUrlContent, extractYoutubeTranscript
    - _Requirements: 3.2, 3.3, 3.4, 3.5_
  

  - [x] 7.2 Implement PDF text extraction

    - Install and configure pdf-parse library
    - Implement extractPdfText method that downloads from storage and extracts text
    - Handle multi-page documents and preserve structure
    - Update material page_count field
    - _Requirements: 3.2, 3.6_
  

  - [x] 7.3 Implement DOCX text extraction


    - Install and configure mammoth library
    - Implement extractDocxText method
    - Preserve basic formatting markers
    - _Requirements: 3.2_
  
  - [x] 7.4 Implement image OCR extraction

    - Choose OCR solution (Tesseract.js or Google Cloud Vision API)
    - Implement extractImageText method
    - Handle OCR errors gracefully
    - _Requirements: 3.3, 13.3_
  
  - [x] 7.5 Implement URL content extraction

    - Install cheerio for HTML parsing
    - Implement extractUrlContent method that fetches and parses HTML
    - Extract main content, remove navigation/ads
    - Handle fetch errors and timeouts
    - _Requirements: 3.4, 13.4_
  

  - [x] 7.6 Implement YouTube transcript extraction


    - Install youtube-transcript package
    - Implement extractYoutubeTranscript method
    - Parse video ID from various YouTube URL formats
    - Handle missing transcripts gracefully
    - _Requirements: 3.5, 13.5_

- [x] 8. Implement content chunking algorithm



  - [x] 8.1 Create chunking utility function


    - Create `src/lib/utils/chunking.ts`
    - Implement chunkContent function following design algorithm
    - Split by paragraphs, respect semantic boundaries
    - Use 500-1000 token chunks with 100-token overlap
    - _Requirements: 4.1, 4.2_
  

  - [x] 8.2 Implement chunk creation in ProcessingService



    - Add chunkContent method to ProcessingService
    - Create chunk records in database with order_index
    - Store token_count for each chunk
    - Update material status to "chunking" then "ready"
    - _Requirements: 4.3, 4.4, 4.5_

- [x] 9. Implement embedding generation




  - [x] 9.1 Create OpenAI client wrapper

    - Create `src/lib/ai/openai.ts` with OpenAI client initialization
    - Add method for generating embeddings using text-embedding-3-small
    - Handle batching (max 100 texts per call)
    - _Requirements: 4.3_
  


  - [x] 9.2 Implement embedding generation in ProcessingService
    - Add generateEmbeddings method to ProcessingService
    - Fetch chunks for material


    - Generate embeddings in batches
    - Update chunk records with vector field
    - _Requirements: 4.3_


- [x] 10. Create material processing worker/job



  - [x] 10.1 Set up job queue infrastructure


    - Choose queue solution (Vercel Queue or custom with Supabase)
    - Create job queue configuration
    - _Requirements: 19.1, 19.2_
  
  - [x] 10.2 Implement MaterialProcessor worker

    - Create worker that processes material based on kind
    - Call appropriate extraction method from ProcessingService
    - Call chunking method
    - Call embedding generation
    - Update material status throughout pipeline
    - _Requirements: 3.1, 3.6, 3.7, 19.3_
  
  - [x] 10.3 Add retry logic and error handling

    - Implement exponential backoff for retries (5s, 15s)
    - Update material status to "failed" after 2 failed attempts
    - Log errors in material meta_json
    - _Requirements: 3.7, 19.4, 19.5_
  

  - [x] 10.4 Trigger worker from upload endpoints


    - Add job queue trigger in POST /api/materials/upload after material creation
    - Add job queue trigger in POST /api/materials/url
    - _Requirements: 5.2_

- [x] 11. Implement GenerationService for AI content creation




  - [x] 11.1 Create GenerationService class with AI prompt templates

    - Create `src/lib/services/GenerationService.ts`
    - Define prompt templates for notes, flashcards, quiz, mind map
    - Add OpenAI client integration
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 8.1, 8.2, 8.3, 8.4, 8.5, 9.1, 9.2, 9.3, 9.4, 9.5_
  

  - [x] 11.2 Implement smart notes generation


    - Implement generateSmartNotes method
    - Select relevant chunks (use embeddings for semantic search if needed)
    - Call OpenAI API with notes prompt
    - Parse JSON response into SmartNotes structure
    - Validate response has all required sections
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_
  



  - [x] 11.3 Implement flashcard generation


    - Implement generateFlashcards method
    - Accept card limit parameter based on user plan
    - Call OpenAI API with flashcards prompt
    - Parse response and create flashcard records
    - Set initial SRS values (ease: 2.50, interval: 0, due_at: now, reps: 0, lapses: 0)

    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_


  
  - [x] 11.4 Implement quiz generation


    - Implement generateQuiz method
    - Accept question limit based on user plan
    - Generate 70% MCQ and 30% short answer mix
    - Create quiz record and quiz_items records

    - Validate MCQ options have exactly one correct answer

    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_
  
  - [x] 11.5 Implement mind map generation

    - Implement generateMindMap method
    - Call OpenAI API with mind map prompt
    - Parse hierarchical structure
    - Create mindmap record and mindmap_nodes records with parent_id relationships
    - Store source_chunk_ids for traceability
    - Calculate layout_json with node positions
    - Respect plan-based node limits (20 for free, 100 for student_pro)
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_
  
  - [x] 11.6 Implement coverage meter calculation

    - Implement calculateCoverage method
    - Track which chunks were referenced in generated content
    - Calculate percentage of chunks used
    - Return "high" (≥80%), "med" (50-79%), or "low" (<50%)
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [x] 12. Create study pack generation worker




  - [x] 12.1 Implement PackGenerator worker

    - Create worker that orchestrates pack generation
    - Fetch all chunks for material
    - Get user plan to determine limits
    - Call GenerationService methods in parallel using Promise.all
    - _Requirements: 5.1, 5.2, 11.4_
  
  - [x] 12.2 Implement pack assembly and storage

    - Create study_pack record with material_id
    - Store generated notes in stats_json or separate notes table
    - Create flashcard records
    - Create quiz and quiz_items records
    - Create mindmap and mindmap_nodes records
    - Calculate and store coverage meter in stats_json
    - Store generation time in stats_json
    - _Requirements: 5.3, 10.5, 20.1, 20.2, 20.3_
  

  - [x] 12.3 Add error handling and rollback


    - Wrap all operations in database transaction
    - Rollback on any failure
    - Log errors for admin review
    - Update material status appropriately
    - _Requirements: 13.5, 20.2_
  


  - [x] 12.4 Trigger pack generation after material processing



    - Add job queue trigger in MaterialProcessor after embeddings complete
    - Pass material_id and user_id to PackGenerator
    - _Requirements: 5.1_
  


  - [x] 12.5 Log analytics event on completion

    - Create event record with event "pack_created"
    - Store material kind, generation time, coverage in props_json
    - Increment user's monthly pack count
    - _Requirements: 14.1, 14.5_

- [x] 13. Create status polling API endpoint




  - [x] 13.1 Implement GET /api/materials/:id/status route

    - Create `src/app/api/materials/[id]/status/route.ts`
    - Authenticate user and verify material ownership
    - Fetch material record with current status
    - _Requirements: 12.1, 18.3_
  
  - [x] 13.2 Calculate and return progress information

    - Map status to progress percentage (processing: 25%, chunking: 50%, generating: 75%, ready: 100%)
    - Return current stage name
    - Estimate time remaining based on material size and historical data
    - If ready, include pack_id in response
    - _Requirements: 12.2, 12.3, 18.3_
  

  - [x] 13.3 Add error status handling


    - If status is "failed", include error message from meta_json
    - Return appropriate HTTP status codes
    - _Requirements: 12.5, 18.7_




- [x] 14. Create study pack retrieval API endpoint


  - [x] 14.1 Implement GET /api/study-packs/:id route


    - Create `src/app/api/study-packs/[id]/route.ts`
    - Authenticate user and verify pack ownership
    - _Requirements: 18.5_
  


  - [x] 14.2 Fetch and assemble complete pack data



    - Query study_pack with material
    - Query all flashcards for pack
    - Query quiz with quiz_items
    - Query mindmap with mindmap_nodes (hierarchical)
    - Extract notes from stats_json or separate storage
    - Assemble into complete response matching design interface
    - _Requirements: 18.5_
  


  - [x] 14.3 Optimize query performance

    - Use select to fetch only needed columns
    - Use joins to minimize round trips
    - Consider caching pack data for 5 minutes
    - _Requirements: 18.5_

- [x] 15. Create pack deletion API endpoint


  - [x] 15.1 Implement DELETE /api/study-packs/:id route

    - Create `src/app/api/study-packs/[id]/route.ts` with DELETE method
    - Authenticate user and verify pack ownership
    - _Requirements: 15.2, 18.6_
  

  - [x] 15.2 Implement cascading deletion
    - Delete in transaction: flashcards, quiz_items, quiz, mindmap_nodes, mindmap, study_pack
    - Fetch associated material_id before deleting pack
    - Delete material record
    - Delete file from Supabase Storage
    - _Requirements: 2.3, 15.3, 15.5, 18.6_

  
  - [x] 15.3 Add deletion safeguards
    - Prevent deletion if material status is "processing"
    - Return success message on completion
    - Log deletion event
    - _Requirements: 15.4, 15.5_

- [x] 16. Create OrbAvatar component



  - [x] 16.1 Design and generate Orb pose images

    - Create or generate 20+ Orb pose variations (upload, processing, reading, generating, success, error, etc.)
    - Optimize images as WebP format
    - Store in `public/orb/` directory with descriptive names
    - _Requirements: 16.1, 16.2, 16.3, 16.4, 16.5, 16.6_
  
  - [x] 16.2 Implement OrbAvatar React component

    - Create `src/components/orb/OrbAvatar.tsx`
    - Accept props: pose, size, animated, message
    - Map pose to image file
    - Add alt text for accessibility
    - Support size variants (sm, md, lg)
    - _Requirements: 16.1, 16.2, 16.3, 16.4, 16.5, 16.6, 17.2_
  

  - [ ] 16.3 Add reduced-motion support
    - Check prefers-reduced-motion media query

    - Disable animations when user prefers reduced motion

    - _Requirements: 17.5_

- [x] 17. Create UploadZone component


  - [x] 17.1 Implement drag-and-drop file upload component

    - Create `src/components/materials/UploadZone.tsx`
    - Implement drag-over visual feedback
    - Show Upload Orb during drag-over
    - Handle file drop and click-to-browse
    - _Requirements: 1.1, 1.2_
  
  - [x] 17.2 Add file validation in component

    - Validate file type and size before upload
    - Show error messages with Error Orb
    - Disable upload button during processing
    - _Requirements: 1.3, 1.4_
  
  - [x] 17.3 Implement accessibility features

    - Add keyboard navigation support
    - Add ARIA labels and roles
    - Ensure focus indicators are visible
    - _Requirements: 17.1, 17.2, 17.4_

- [x] 18. Create CreatePackModal component



  - [x] 18.1 Implement modal dialog structure


    - Create `src/components/materials/CreatePackModal.tsx`
    - Add tabs for file/url/youtube upload methods
    - Integrate UploadZone component
    - Add URL input field with validation
    - _Requirements: 1.1_
  

  - [x] 18.2 Implement file upload flow


    - Call POST /api/materials/upload on file selection
    - Show upload progress bar
    - Display Processing Orb during upload
    - Handle upload errors with Error Orb
    - _Requirements: 1.2, 1.3, 1.4, 16.1, 16.6_
  


  - [x] 18.3 Implement URL submission flow



    - Validate URL format client-side
    - Call POST /api/materials/url on submission
    - Show appropriate Orb for URL vs YouTube
    - _Requirements: 1.1_
  
  - [x] 18.4 Add plan limit checking and paywall

    - Check user's current usage before allowing upload
    - Show Limit Reached Orb when at 100% of plan
    - Display upgrade prompt with Upgrade Orb
    - Show warning at 80% of limit
    - _Requirements: 1.5, 14.2, 14.3_

- [x] 19. Create ProcessingStatus component




  - [x] 19.1 Implement status polling component

    - Create `src/components/materials/ProcessingStatus.tsx`
    - Poll GET /api/materials/:id/status every 2 seconds
    - Display current stage and progress percentage
    - _Requirements: 12.1, 12.2_
  
  - [x] 19.2 Implement stage-specific Orb display

    - Show Processing Orb during "processing" stage
    - Show Reading Orb during text extraction
    - Show Generating Orb during pack generation
    - Show Success Orb when complete
    - Show Error Orb on failure
    - _Requirements: 16.2, 16.3, 16.4, 16.5, 16.6_
  
  - [x] 19.3 Add progress visualization

    - Display progress bar with stage indicators
    - Show estimated time remaining
    - Update UI smoothly without flickering
    - _Requirements: 12.2, 12.3_
  
  - [x] 19.4 Implement completion handling

    - Auto-navigate to study pack view when ready
    - Stop polling on completion or error
    - Show error message with retry option on failure
    - _Requirements: 12.4, 12.5_
  
  - [x] 19.5 Add accessibility announcements

    - Use ARIA live regions to announce progress updates
    - Ensure screen readers receive status changes
    - _Requirements: 17.3_

- [x] 20. Integrate components into dashboard


  - [x] 20.1 Add "Create Pack" button to dashboard

    - Update dashboard page to include CreatePackModal trigger
    - Show modal on button click
    - _Requirements: 1.1_
  
  - [x] 20.2 Create pack creation flow page
    - Create route for pack creation if not using modal
    - Integrate all upload and processing components
    - Handle navigation after completion
    - _Requirements: 5.3_

- [x] 21. Implement performance optimizations



  - [x] 21.1 Add database indexes

    - Create indexes on materials(user_id, status)
    - Create indexes on chunks(material_id, order_index)
    - Create vector similarity index on chunks(vector)
    - Create indexes on flashcards, quiz_items, mindmap_nodes foreign keys
    - _Requirements: 4.5_
  

  - [x] 21.2 Implement response caching


    - Cache study pack data for 5 minutes
    - Invalidate cache on pack updates
    - Cache material status for 10 seconds
    - _Requirements: 11.1_
  

  - [x] 21.3 Optimize AI API calls
    - Batch embedding generation (100 per call)
    - Implement response caching for identical prompts
    - Use GPT-4-mini for simpler tasks (flashcards, quiz)
    - Monitor and log API costs
    - _Requirements: 11.2, 11.3_


- [x] 22. Add comprehensive error handling



  - [x] 22.1 Implement user-friendly error messages
    - Map error codes to friendly messages
    - Display appropriate Orb for each error type
    - Provide actionable suggestions (e.g., "Try a smaller file")
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_
  

  - [x] 22.2 Add error logging and monitoring

    - Log all errors to Supabase or external service
    - Include context (user_id, material_id, error type)
    - Set up alerts for high error rates
    - _Requirements: 19.5_
  
  - [x] 22.3 Implement retry mechanisms

    - Add retry logic in workers with exponential backoff
    - Allow users to retry failed uploads
    - Implement circuit breaker for external APIs
    - _Requirements: 3.7, 19.4_

- [ ]* 23. Create test fixtures and test suite
  - [ ]* 23.1 Create 10 canonical test materials
    - Prepare test files: lecture slides, textbook chapter, scanned notes, STEM formulas, code docs, etc.
    - Upload to test storage bucket
    - Document expected outputs for each
    - _Requirements: 11.1_
  
  - [ ]* 23.2 Write unit tests for services
    - Test MaterialService CRUD operations
    - Test ProcessingService text extraction methods
    - Test GenerationService AI prompt construction
    - Test UsageService limit checking
    - Test chunking algorithm accuracy
    - _Requirements: 4.1, 4.2_
  
  - [ ]* 23.3 Write integration tests for API routes
    - Test upload flow end-to-end
    - Test URL processing flow
    - Test status polling
    - Test pack retrieval
    - Test deletion flow
    - _Requirements: 18.1, 18.2, 18.3, 18.5, 18.6_
  
  - [ ]* 23.4 Write E2E tests for user flows
    - Test: Upload PDF → Wait for processing → View study pack
    - Test: Submit YouTube URL → See progress → Review flashcards
    - Test: Upload image → OCR extraction → Generate quiz
    - Test: Hit plan limit → See paywall → Upgrade prompt
    - _Requirements: 11.1, 11.2_
  
  - [ ]* 23.5 Perform performance testing
    - Test 50-page PDF processing time (target <60s)
    - Test concurrent uploads (10 users)
    - Test database query performance under load
    - Identify and fix bottlenecks
    - _Requirements: 11.1, 11.2, 11.3_

- [x] 24. Documentation and deployment preparation




  - [x] 24.1 Document API endpoints

    - Create API documentation with request/response examples
    - Document error codes and messages
    - Add usage examples
    - _Requirements: 18.1, 18.2, 18.3, 18.5, 18.6, 18.7_
  

  - [x] 24.2 Set up environment variables

    - Document all required environment variables
    - Create .env.example with placeholders
    - Set up production environment variables
    - _Requirements: 1.1_
  
  - [x] 24.3 Configure Supabase Storage

b 
    - Create materials bucket in production
    - Set up RLS policies
    - Configure CORS if needed
    - _Requirements: 2.1, 2.2_
  

  - [x] 24.4 Set up monitoring and alerts

    - Configure error tracking (Sentry or similar)
    - Set up performance monitoring
    - Create alerts for processing time > 180s, error rate > 5%
    - Monitor AI API costs
    - _Requirements: 11.3, 19.5_

---

## Notes

- Tasks marked with `*` are optional testing tasks that can be skipped for faster MVP delivery
- Each task references specific requirements from the requirements document
- Tasks should be completed in order as they build on each other
- The parallel generation in task 12.1 is critical for meeting the <60s performance target
- Consider using feature flags to gradually roll out the feature to users
