# Sappio V2 – Feature Checklist

This checklist breaks down the Sappio V2 project into logical phases. Each phase represents one Kiro spec that can be implemented independently.

---

## Phase 0: Waitlist & Launch Preparation ✓

**Status:** Database schema complete, waitlist active

**Database Tables:**
- ✓ `public.waitlist` - Waitlist signups with referral tracking

**Features:**
- ✓ Waitlist signup form
- ✓ Referral code generation
- ✓ Email collection
- ✓ Optional survey questions (studying, current tool)
- [ ] Waitlist benefits tracking
  - [ ] Early access flag (priority invite)
  - [ ] Founding price lock (12-month protection)
  - [ ] 7-day Pro trial eligibility at launch
- [ ] Admin waitlist management
  - [ ] View all signups
  - [ ] Export waitlist to CSV
  - [ ] Send invite emails
  - [ ] Track invite status
- [ ] Waitlist mode enforcement
  - [ ] Block auth pages for non-admins during waitlist
  - [ ] Admin bypass mechanism
  - [ ] Launch toggle to open platform

**API Endpoints:**
- ✓ POST `/api/waitlist` - Join waitlist
- [ ] GET `/api/admin/waitlist` - View all signups
- [ ] POST `/api/admin/waitlist/invite` - Send invites
- [ ] POST `/api/admin/waitlist/export` - Export to CSV

---

## Phase 1: Foundation & Authentication ✓

**Status:** Database schema complete

**Database Tables:**
- ✓ `auth.users` - Supabase auth system
- ✓ `public.users` - User profiles with plan/role management
- ✓ `public.admin_users` - Admin role assignments
- ✓ `public.events` - Analytics event tracking

**Features:**
- [ ] User registration and login (email/password)
- [ ] User profile management
- [ ] Plan tier assignment (free/student_pro/pro_plus)
- [ ] Waitlist benefits application
  - [ ] Check if user email is on waitlist
  - [ ] Apply founding price lock (store lock_expires_at in users.meta_json)
  - [ ] Grant 7-day Pro trial automatically
  - [ ] Track early access status
- [ ] Basic authentication middleware
- [ ] Session management
- [ ] User settings (locale, preferences)

**Orb Avatar Integration:**
- [ ] Welcome Orb on login page (friendly wave pose)
- [ ] Success Orb on signup completion (celebrating pose)
- [ ] Error Orb for auth failures (confused/sad pose)

**API Endpoints:**
- [ ] POST `/api/auth/signup`
- [ ] POST `/api/auth/login`
- [ ] POST `/api/auth/logout`
- [ ] GET `/api/user/profile`
- [ ] PATCH `/api/user/profile`

---

## Phase 2: Material Upload & Processing

**Database Tables:**
- ✓ `public.materials` - Uploaded source materials
- ✓ `public.chunks` - Processed content chunks with embeddings

**Features:**
- [ ] File upload UI (PDF, DOCX, images)
- [ ] URL/YouTube link input
- [ ] File storage integration (Supabase Storage)
- [ ] Material processing queue
- [ ] OCR for images/scanned PDFs
- [ ] Text extraction from documents
- [ ] Content chunking algorithm
- [ ] Embedding generation (vector storage)
- [ ] Processing status tracking
- [ ] Upload progress indicators

**Orb Avatar Integration:**
- [ ] Upload Orb on drag-drop zone (holding documents pose)
- [ ] Processing Orb (thinking with orbital rings)
- [ ] Reading Orb during text extraction (with book/glasses pose)
- [ ] Success Orb when processing complete (thumbs up pose)
- [ ] Error Orb for failed uploads (sad/confused with error symbol)

**API Endpoints:**
- [ ] POST `/api/materials/upload`
- [ ] POST `/api/materials/url`
- [ ] GET `/api/materials/:id/status`
- [ ] GET `/api/materials/:id`
- [ ] DELETE `/api/materials/:id`

**Background Jobs:**
- [ ] Material processing worker
- [ ] Chunk generation worker
- [ ] Embedding generation worker

---

## Phase 3: Study Pack Generation

**Database Tables:**
- ✓ `public.study_packs` - Generated study packs
- ✓ `public.flashcards` - Flashcard content with SRS data
- ✓ `public.quizzes` - Quiz configurations
- ✓ `public.quiz_items` - Individual quiz questions

**Features:**
- [ ] AI-powered smart notes generation
  - [ ] Overview section
  - [ ] Key concepts extraction
  - [ ] Definitions & formulas
  - [ ] Likely exam questions
  - [ ] Common pitfalls
- [ ] Flashcard generation (Q/A and cloze types)
- [ ] Topic tagging for flashcards
- [ ] Quiz question generation (MCQ + short answer)
- [ ] Quiz explanations
- [ ] Pack metadata and stats
- [ ] Coverage meter calculation

**Orb Avatar Integration:**
- [ ] Generating Orb (intense thinking pose with sparkles)
- [ ] Teacher Orb for notes section (with pointer/chalkboard background)
- [ ] Flashcard Orb (holding cards pose)
- [ ] Quiz Master Orb (with question mark bubble)
- [ ] Progress Orb showing generation stages

**API Endpoints:**
- [ ] POST `/api/study-packs/generate`
- [ ] GET `/api/study-packs/:id`
- [ ] GET `/api/study-packs/:id/notes`
- [ ] GET `/api/study-packs/:id/flashcards`
- [ ] GET `/api/study-packs/:id/quiz`
- [ ] PATCH `/api/study-packs/:id`

**Background Jobs:**
- [ ] Study pack generation worker
- [ ] AI content generation pipeline

---

## Phase 4: Flashcard Learning System

**Database Tables:**
- ✓ `public.flashcards` - SRS fields (ease, interval, due_at, reps, lapses)

**Features:**
- [ ] Flashcard review interface
- [ ] SRS algorithm implementation (SM-2 or similar)
- [ ] Grading buttons (Again/Hard/Good/Easy)
- [ ] Due queue calculation
- [ ] Session statistics
- [ ] Streak tracking
- [ ] Topic filtering
- [ ] Card editing
- [ ] Progress visualization

**Orb Avatar Integration:**
- [ ] Study Orb on flashcard screen (focused/studying pose)
- [ ] Encouraging Orb for correct answers (happy/celebrating)
- [ ] Supportive Orb for incorrect answers (gentle/encouraging)
- [ ] Streak Orb with fire/lightning for streaks (energetic pose)
- [ ] Tired Orb when session is long (yawning, suggesting break)
- [ ] Empty state Orb when no cards due (relaxed/sleeping pose)

**API Endpoints:**
- [ ] GET `/api/flashcards/due`
- [ ] POST `/api/flashcards/:id/review`
- [ ] GET `/api/flashcards/stats`
- [ ] PATCH `/api/flashcards/:id`

---

## Phase 5: Quiz System

**Database Tables:**
- ✓ `public.quizzes` - Quiz configurations
- ✓ `public.quiz_items` - Questions with answers
- ✓ `public.quiz_results` - User quiz attempts

**Features:**
- [ ] Quiz taking interface
- [ ] Practice mode (untimed)
- [ ] Timed mode with countdown
- [ ] Answer submission and grading
- [ ] Explanation display
- [ ] Weak topic identification
- [ ] Retest weak topics feature
- [ ] Quiz history
- [ ] Score tracking
- [ ] Topic-based performance analytics

**Orb Avatar Integration:**
- [ ] Quiz Host Orb (professional/teacher pose with clipboard)
- [ ] Timer Orb for timed mode (with clock/hourglass)
- [ ] Thinking Orb during quiz (pondering pose)
- [ ] Results Orb showing score (holding report card)
- [ ] High Score Orb (trophy/medal celebration)
- [ ] Low Score Orb (encouraging, not sad - growth mindset)
- [ ] Explanation Orb (teaching/pointing pose)

**API Endpoints:**
- [ ] GET `/api/quizzes/:id`
- [ ] POST `/api/quizzes/:id/start`
- [ ] POST `/api/quizzes/:id/submit`
- [ ] GET `/api/quizzes/:id/results`
- [ ] GET `/api/quiz-results/history`

---

## Phase 6: Mind Map System

**Database Tables:**
- ✓ `public.mindmaps` - Mind map metadata
- ✓ `public.mindmap_nodes` - Hierarchical nodes

**Features:**
- [ ] Auto-generated mind map from content
- [ ] Interactive mind map viewer
- [ ] Node drag & drop
- [ ] Node editing (rename, re-parent)
- [ ] Branch expansion/collapse
- [ ] Layout persistence
- [ ] Zoom and pan controls
- [ ] Source chunk references

**Orb Avatar Integration:**
- [ ] Mind Map Orb (connected to nodes with orbital rings)
- [ ] Explorer Orb (with magnifying glass for zooming)
- [ ] Organizing Orb (arranging/connecting pose)
- [ ] Mini Orbs on each major node (contextual expressions)
- [ ] Generating Orb when creating cards/quiz from branch

**API Endpoints:**
- [ ] GET `/api/mindmaps/:id`
- [ ] PATCH `/api/mindmaps/:id/nodes/:nodeId`
- [ ] POST `/api/mindmaps/:id/nodes`
- [ ] DELETE `/api/mindmaps/:id/nodes/:nodeId`
- [ ] POST `/api/mindmaps/:id/branch/:nodeId/generate-cards`
- [ ] POST `/api/mindmaps/:id/branch/:nodeId/generate-quiz`

---

## Phase 7: Export System

**Features:**
- [ ] Notes export to PDF
- [ ] Flashcards export to CSV
- [ ] Flashcards export to Anki format (.apkg)
- [ ] Mind map export to PNG
- [ ] Mind map export to SVG
- [ ] Mind map export to Markdown
- [ ] Export queue management
- [ ] Download link generation
- [ ] Plan-based export restrictions

**Orb Avatar Integration:**
- [ ] Packaging Orb (wrapping/preparing files pose)
- [ ] Download Orb (holding download arrow)
- [ ] Format Orb variations (PDF, CSV, Anki icons)
- [ ] Paywall Orb for restricted exports (gentle upsell pose)
- [ ] Success Orb when export ready (delivery/gift pose)

**API Endpoints:**
- [ ] POST `/api/exports/notes-pdf`
- [ ] POST `/api/exports/flashcards-csv`
- [ ] POST `/api/exports/flashcards-anki`
- [ ] POST `/api/exports/mindmap-image`
- [ ] POST `/api/exports/mindmap-markdown`
- [ ] GET `/api/exports/:id/download`

---

## Phase 8: Dashboard & Pack Management

**Features:**
- [ ] Dashboard layout
- [ ] "+ New Pack" creation flow
- [ ] Pack list with filters/sorting
- [ ] Pack progress indicators
- [ ] Due today counter
- [ ] Last score display
- [ ] Coverage meter display
- [ ] Global streak display
- [ ] Quick actions menu
- [ ] Pack deletion
- [ ] Pack search

**Orb Avatar Integration:**
- [ ] Dashboard Hero Orb (main orb with orbital rings)
- [ ] Welcome Back Orb (greeting pose based on time of day)
- [ ] Empty State Orb (inviting/encouraging to create first pack)
- [ ] Pack Card Mini Orbs (showing pack status/mood)
- [ ] Streak Orb (fire/energy for active streaks)
- [ ] Motivational Orb (random encouraging messages)

**API Endpoints:**
- [ ] GET `/api/dashboard`
- [ ] GET `/api/study-packs`
- [ ] DELETE `/api/study-packs/:id`

---

## Phase 9: Pack Insights & Analytics

**Features:**
- [ ] Accuracy by topic visualization
- [ ] Lapse tracking
- [ ] Due load forecast (calendar view)
- [ ] Weak topic heatmap
- [ ] Coverage meter details
- [ ] Session depth tracking
- [ ] Time-to-value metrics
- [ ] Pack completeness score
- [ ] Performance trends

**Orb Avatar Integration:**
- [ ] Analytics Orb (with graphs/charts background)
- [ ] Detective Orb (magnifying glass, analyzing data)
- [ ] Progress Orb (showing growth/improvement)
- [ ] Weak Area Orb (supportive, pointing to areas to focus)
- [ ] Achievement Orb (celebrating milestones)

**API Endpoints:**
- [ ] GET `/api/study-packs/:id/insights`
- [ ] GET `/api/study-packs/:id/analytics`

---

## Phase 10: Exam Coach Mode

**Features:**
- [ ] Exam coach interface
- [ ] 10-15 high-yield question selection
- [ ] Timer countdown
- [ ] Instant feedback
- [ ] Score summary
- [ ] Weak area recommendations

**Orb Avatar Integration:**
- [ ] Coach Orb (whistle/stopwatch, motivational pose)
- [ ] Timer Orb (focused countdown pose)
- [ ] Rapid Fire Orb (energetic, fast-paced pose)
- [ ] Exam Day Orb (confident, "you got this" pose)
- [ ] Results Coach Orb (analyzing performance, giving tips)

**API Endpoints:**
- [ ] POST `/api/exam-coach/start`
- [ ] POST `/api/exam-coach/submit`
- [ ] GET `/api/exam-coach/results`

---

## Phase 11: Monetization & Paywalls

**Database Tables:**
- ✓ `public.payments` - Payment records

**Features:**
- [ ] Usage tracking (packs/month, cards/pack, quiz questions)
- [ ] **Daily pacing limits**
  - [ ] Daily due cap (100/300/500 by tier)
  - [ ] New cards/day limit (10/25/40 by tier)
  - [ ] Per-pack card budget (80/150/250 by tier)
  - [ ] Soft daily pack creation limits (10/20 by tier)
- [ ] Paywall triggers
  - [ ] Pack creation limit (Free: 5/month)
  - [ ] Flashcard limit per pack (80/150/250)
  - [ ] Quiz question limit (10-15/20-30/30-40)
  - [ ] Export restrictions (Anki for Pro+)
  - [ ] Full mind map access (Free: 50 nodes)
  - [ ] Multi-source packs (Pro+ only)
  - [ ] Bulk upload (Pro+ only)
  - [ ] Priority processing (Pro+ only)
- [ ] Stripe integration
- [ ] Checkout flow
- [ ] Plan selection UI
- [ ] Semester bundle pricing (€24 for Student Pro)
- [ ] Upgrade prompts
- [ ] Billing page
- [ ] Receipt generation
- [ ] Subscription management
- [ ] Payment webhooks
- [ ] Fair use enforcement
  - [ ] File size limits (50MB/100MB by tier)
  - [ ] Page count limits (100/200 by tier)
  - [ ] Friendly messaging when limits approached

**Orb Avatar Integration:**
- [ ] Upgrade Orb (friendly upsell, showing premium features)
- [ ] Plan Comparison Orbs (Free/Pro/Pro+ versions with different accessories)
- [ ] Limit Reached Orb (gentle, understanding pose)
- [ ] Premium Orb (wearing crown/VIP badge)
- [ ] Thank You Orb (grateful pose after purchase)
- [ ] Billing Orb (with receipt/invoice)

**API Endpoints:**
- [ ] GET `/api/billing/usage`
- [ ] POST `/api/billing/checkout`
- [ ] POST `/api/billing/create-subscription`
- [ ] POST `/api/billing/cancel-subscription`
- [ ] GET `/api/billing/invoices`
- [ ] POST `/api/webhooks/stripe`

---

## Phase 12: Account Management & GDPR

**Features:**
- [ ] Account settings page
- [ ] Profile editing
- [ ] Plan display
- [ ] Usage meter
- [ ] Data export (GDPR)
- [ ] Data deletion (GDPR)
- [ ] Material deletion
- [ ] Account deletion
- [ ] Privacy controls
- [ ] Retention notices

**Orb Avatar Integration:**
- [ ] Profile Orb (customizable with user preferences)
- [ ] Settings Orb (with gear/tools)
- [ ] Privacy Orb (with shield/lock)
- [ ] Sad Goodbye Orb (if user deletes account)
- [ ] Data Export Orb (organizing files pose)

**API Endpoints:**
- [ ] GET `/api/account`
- [ ] PATCH `/api/account`
- [ ] POST `/api/account/export-data`
- [ ] POST `/api/account/delete-data`
- [ ] DELETE `/api/account`

---

## Phase 13: Onboarding Experience

**Features:**
- [ ] Welcome screen
- [ ] 2 sample packs (pre-generated)
- [ ] 3-step coach marks
- [ ] 30-second demo video
- [ ] Interactive tutorial
- [ ] First pack creation guide
- [ ] Feature discovery prompts

**Orb Avatar Integration:**
- [ ] Welcome Orb (excited, waving hello)
- [ ] Tour Guide Orb (pointing to features)
- [ ] Tutorial Orb (teaching pose for each step)
- [ ] Sample Pack Orbs (different subjects/themes)
- [ ] Celebration Orb (completing onboarding)
- [ ] Orb in demo video (star of the show)

**API Endpoints:**
- [ ] GET `/api/onboarding/sample-packs`
- [ ] POST `/api/onboarding/complete`

---

## Phase 14: Admin Dashboard - Overview

**Features:**
- [ ] Admin authentication & authorization
- [ ] Overview dashboard
- [ ] Daily/weekly metrics
  - [ ] New users
  - [ ] New packs
  - [ ] Completions
  - [ ] Conversion rate
  - [ ] Revenue
  - [ ] Churn rate
- [ ] Charts and visualizations
- [ ] Date range filters

**Orb Avatar Integration:**
- [ ] Admin Orb (with admin badge/hat)
- [ ] Metrics Orb (with dashboard/analytics background)
- [ ] Professional Orb (business attire variant)

**API Endpoints:**
- [ ] GET `/api/admin/overview`
- [ ] GET `/api/admin/metrics`

---

## Phase 15: Admin Dashboard - User Management

**Features:**
- [ ] User search
- [ ] User detail view
- [ ] View user materials
- [ ] View user packs
- [ ] View user events
- [ ] Grant/revoke admin role
- [ ] Ban user
- [ ] Delete user data (GDPR request)
- [ ] User activity timeline

**Orb Avatar Integration:**
- [ ] Admin Orb (with clipboard/management tools)
- [ ] User Card Mini Orbs (showing user status/activity)

**API Endpoints:**
- [ ] GET `/api/admin/users`
- [ ] GET `/api/admin/users/:id`
- [ ] POST `/api/admin/users/:id/grant-admin`
- [ ] POST `/api/admin/users/:id/revoke-admin`
- [ ] POST `/api/admin/users/:id/ban`
- [ ] DELETE `/api/admin/users/:id/data`

---

## Phase 16: Admin Dashboard - Content & Moderation

**Database Tables:**
- ✓ `public.moderation_queue` - User-reported issues

**Features:**
- [ ] Content explorer
- [ ] Browse recent packs
- [ ] Flag low coverage packs
- [ ] OCR error rate tracking
- [ ] Moderation queue
- [ ] Review reported issues
- [ ] Mark issues resolved
- [ ] Attach admin notes
- [ ] Issue filtering and search

**Orb Avatar Integration:**
- [ ] Moderator Orb (with magnifying glass/inspector badge)
- [ ] Quality Check Orb (with checklist)
- [ ] Issue Orb (flagging problems pose)
- [ ] Resolved Orb (checkmark/approval pose)

**API Endpoints:**
- [ ] GET `/api/admin/content`
- [ ] GET `/api/admin/moderation-queue`
- [ ] PATCH `/api/admin/moderation-queue/:id`
- [ ] POST `/api/moderation/report`

---

## Phase 17: Admin Dashboard - Payments & System Health

**Features:**
- [ ] Payment list
- [ ] Refund processing
- [ ] Failed payment tracking
- [ ] System health monitoring
- [ ] Queue backlog metrics
- [ ] Average pack build time
- [ ] Model cost estimates
- [ ] Error rate tracking
- [ ] Performance alerts

**Orb Avatar Integration:**
- [ ] Finance Orb (with money/calculator)
- [ ] Health Monitor Orb (with stethoscope/heartbeat)
- [ ] Alert Orb (warning pose for issues)
- [ ] Healthy System Orb (happy/green checkmark)

**API Endpoints:**
- [ ] GET `/api/admin/payments`
- [ ] POST `/api/admin/payments/:id/refund`
- [ ] GET `/api/admin/system-health`

---

## Phase 18: UI/UX - Design System & Orb

**Features:**
- [ ] Dark mode theme
- [ ] Color palette (high contrast ≥4.5:1)
- [ ] Typography system
- [ ] Component library
- [ ] Reduced motion support
- [ ] Keyboard navigation
- [ ] Focus indicators
- [ ] Responsive layouts
- [ ] Loading states
- [ ] Error states
- [ ] Empty states

**Orb Avatar System:**
- [ ] Base Orb component (reusable across app)
- [ ] Orb pose library (50+ static image variations)
  - [ ] Emotions: happy, sad, excited, thinking, confused, celebrating
  - [ ] Actions: reading, writing, teaching, analyzing, organizing
  - [ ] Accessories: glasses, hat, crown, tools, badges
  - [ ] Contexts: studying, testing, uploading, exporting, admin
- [ ] Orb background variations
  - [ ] Subject themes (math, science, history, etc.)
  - [ ] Mood lighting (energetic, calm, focused)
  - [ ] Contextual backgrounds (classroom, library, space)
- [ ] Orb accessibility
  - [ ] Alt text for all poses
  - [ ] High contrast versions
- [ ] Orb asset management
  - [ ] AI-generated pose library
  - [ ] Naming convention system
  - [ ] Asset optimization (WebP, lazy loading)
  - [ ] Preload critical poses

---

## Phase 19: Analytics & Event Tracking

**Database Tables:**
- ✓ `public.events` - Event logging

**Features:**
- [ ] Event tracking implementation
  - [ ] pack_created
  - [ ] notes_opened
  - [ ] cards_reviewed
  - [ ] quiz_completed
  - [ ] map_edited
  - [ ] export_triggered
  - [ ] upgrade_clicked
  - [ ] checkout_completed
  - [ ] orb_interaction (track which orb poses users engage with)
- [ ] Analytics dashboard
- [ ] Retention cohort analysis
- [ ] Conversion funnel
- [ ] Time-to-value tracking
- [ ] Session depth metrics

**Orb Avatar Integration:**
- [ ] Analytics Orb (with data visualization background)
- [ ] Trend Orb (showing up/down arrows)
- [ ] Insight Orb (lightbulb moment pose)

**API Endpoints:**
- [ ] POST `/api/events`
- [ ] GET `/api/analytics/retention`
- [ ] GET `/api/analytics/conversion`

---

## Phase 20: Testing, QA & Launch

**Features:**
- [ ] 10 canonical test materials
  - [ ] Lecture slides
  - [ ] Textbook chapters
  - [ ] Scanned notes
  - [ ] STEM formulas
  - [ ] Code documentation
  - [ ] YouTube transcripts
- [ ] Manual test scenarios for each persona
  - [ ] Crammer Chris flow
  - [ ] Methodical Maya flow
  - [ ] Heavy Reader Hari flow
  - [ ] Instructor Iva flow
- [ ] Load testing for concurrent pack builds
- [ ] Beta program (10-20 students)
- [ ] Bug tracking and fixes
- [ ] Performance optimization
- [ ] Semester promo preparation
- [ ] Public launch

**Orb Avatar Integration:**
- [ ] Launch Orb (rocket/celebration pose)
- [ ] Beta Tester Orb (with test badge)
- [ ] Bug Hunter Orb (with magnifying glass/net)
- [ ] Success Orb (confetti/party pose for launch day)

---

## Summary

**Total Phases:** 20
**Database Status:** ✓ Complete (all tables created)
**Orb Avatar:** Integrated across all user-facing features
**Next Steps:** Begin with Phase 1 (Foundation & Authentication)

Each phase can be implemented as a separate Kiro spec, allowing for incremental development and testing.

---

## Orb Avatar Strategy

The Sappio Orb is the friendly face of the app and should appear throughout the user journey:

**Core Principles:**
- Orb reflects user emotions and app states
- Consistent character but adaptable to context
- Soft, friendly, encouraging personality
- Never judgmental or negative
- Celebrates wins, supports struggles

**Pose Categories:**
1. **Emotional States:** Happy, excited, thinking, confused, tired, celebrating
2. **Actions:** Reading, studying, teaching, analyzing, organizing, creating
3. **Contexts:** Upload, processing, learning, testing, exporting, admin
4. **Accessories:** Glasses, hat, crown, tools, badges, subject-specific items
5. **Backgrounds:** Subject themes, mood lighting, contextual environments

**Technical Implementation:**
- AI-generate 50+ static pose variations
- Optimize as WebP with lazy loading
- Preload critical poses (dashboard, upload, processing)
- Simple image swaps between poses (no animations)
- Provide alt text for accessibility
 