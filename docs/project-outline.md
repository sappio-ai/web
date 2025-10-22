# Sappio V2 – Ultra-Detailed Project Outline

## 0. North Star

**Promise:** "Upload once → get everything to learn."

**Win condition:** First pack feels exam-ready in <60s; users keep coming back to review (flashcards/quiz/mind-map loops).

**Brand:** Soft, friendly, smart (dark-mode-only site). Hero is the Sappio Orb.

---

## 1. Audiences & Jobs-to-Be-Done

- **Crammer Chris:** "I have an exam soon." → Fast summary + timed quiz + likely questions.
- **Methodical Maya:** "I want retention." → SRS flashcards + daily due queue + streaks.
- **Heavy Reader Hari:** "I digest long PDFs." → Mind map, references, exports (PDF, Anki).
- **Instructor Iva:** "I prep a class." → Bulk packs, sharing, light analytics.

---

## 2. Value/Plan Tiers

- **Free:** 3 packs/mo, 25 cards/pack, 10-Q quizzes, mini mind-map, exports limited.
- **Student Pro** (€7.99/mo or €24/semester): 300 packs/mo, 300 cards/pack, 30-Q quizzes, full map, Anki export, priority queue.
- **Pro+** (€11.99/mo): Bulk upload, custom quiz blueprints, higher caps.
- **Ambassador/edu coupons** for campuses.

---

## 3. Core Experiences

### 3.1 Upload → Study Pack (Day-1 Loop)

Drop PDF/DOCX/Images/URL/YouTube → processing toast → Ready screen with:

- **Smart Notes** (Overview, Key Concepts, Definitions/Formulas, Likely Exam Qs, Pitfalls)
- **Flashcards** (tagged; cloze + Q/A; SRS due immediately available)
- **Quiz** (MCQ + short answer; explanations; "retest weak topics")
- **Mind Map** (auto layout; editable; "make cards/quiz from branch")
- **Exports** (Notes→PDF; Cards→CSV/Anki; Map→PNG/SVG/MD)

### 3.2 Learning Modes (Retention Loop)

- **Flashcards:** Due queue, grading (Again/Hard/Good/Easy), session stats, streaks.
- **Quiz:** Practice/Timed, explanations, weak-topic review set.
- **Mind Map:** Drag/rename/re-parent; branch → cards/quiz.
- **Exam Coach** (text blitz): 10–15 high-yield Qs with a timer for crammers.

### 3.3 Pack Insights

Accuracy by topic, lapses, due load forecast, weak-topic heatmap, "coverage" meter (High/Med/Low) based on source chunk usage.

---

## 4. Paywalls & Monetization UX

- **Upgrade moments:** Export to Anki, hit caps, bulk upload, "Full Mind Map".
- **Checkout:** Stripe; semester bundle emphasized pre-exam seasons.
- **Receipts & plan management** visible under Account → Billing.

---

## 5. Information Architecture

- **Dashboard:** "+ New Pack", pack list (progress, due today, last score, coverage), global streak, quick actions.
- **Pack View:** Tabs — Notes / Flashcards / Quiz / Mind Map / Exports / Insights.
- **Account:** Profile, Plan, Usage meter, Data controls (delete materials, export data).
- **Onboarding:** 2 sample packs; 3-step coach marks; 30-second demo video loop.

---

## 6. Admin Dashboard (internal)

- **Overview:** Daily/weekly new users, new packs, completions, conversion, revenue, churn.
- **User Explorer:** Search users; view materials, packs, events; grant/revoke roles; ban/delete data on request.
- **Content Explorer:** Browse recent packs; flag low coverage; see OCR error rates.
- **Payments:** Purchases, refunds, failed payments.
- **Quality/Moderation:** Queue fed by "This is wrong/unclear"; mark resolved; attach notes.
- **System Health (ops):** Queue backlog, avg pack build time, model cost estimates.

---

## 7. Safety, Privacy, Compliance (product-side)

- Materials private by default; "Delete my data" self-serve.
- **GDPR:** data export/delete; retention notice on free dormant accounts.
- "Why this?" link showing source coverage concept.

---

## 8. Design & Accessibility

- **Dark-mode-only UI;** Orb glow plate; high contrast (≥4.5:1); keyboard-first flows.
- **Motion:** Slow ring rotation (8–12s), micro bob; reduced-motion preference respected.

---

## 9. Analytics & KPIs

**Events:** pack_created, notes_opened, cards_reviewed, quiz_completed, map_edited, export_triggered, upgrade_clicked, checkout_completed.

**North-star metrics:** D7/D30 retention (Pro cohorts), Free→Pro conversion, time-to-value, pack completeness, session depth.

---

## 10. QA & Launch

- **Fixtures:** 10 canonical materials (slides, chapters, scans, STEM formulas, code notes, YT transcript).
- **Manual scenarios** for each persona; load tests for concurrent pack builds.
- **Beta** with 10–20 students → quick fixes → public launch with semester promo.
