# Implementation Plan

- [x] 1. Create benefit services and utilities
  - Create `BenefitService` class with methods for applying and checking benefits
  - Create `WaitlistService` class with methods for querying and updating waitlist entries
  - Create utility functions for date calculations and price lock validation
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 3.1, 3.3, 7.1, 7.2_

- [x] 1.1 Write property test for waitlist detection
  - **Property 1: Waitlist detection accuracy**
  - **Validates: Requirements 2.1**

- [x] 1.2 Write property test for benefit application atomicity
  - **Property 2: Benefits are applied atomically**
  - **Validates: Requirements 2.2, 2.3, 2.4**

- [x] 2. Integrate benefits into signup flow
  - [x] 2.1 Modify signup API to check waitlist membership
    - Query waitlist table by email after user creation
    - Call `BenefitService.applyWaitlistBenefits` if found
    - Mark waitlist entry as converted
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 2.2 Write property test for non-waitlist signups
  - **Property 5: Non-waitlist users get standard accounts**
  - **Validates: Requirements 2.5**

- [x] 2.3 Write unit tests for signup integration
  - Test signup with waitlist email applies benefits
  - Test signup without waitlist email creates free account
  - Test error handling when benefit application fails
  - _Requirements: 2.1, 2.5_

- [x] 3. Implement price lock enforcement
  - [x] 3.1 Create price display logic with lock detection
    - Check if user has active founding price lock
    - Return locked prices if active, current prices if not
    - Add price lock badge component
    - _Requirements: 3.1, 3.3, 3.4_

- [x] 3.2 Write property test for price lock expiration
  - **Property 3: Price lock expiration is enforced**
  - **Validates: Requirements 3.1, 3.3**

- [x] 3.3 Update pricing components to show locked prices
  - Modify `PricingSection` component to fetch and display locked prices
  - Add visual indicator for price lock (badge with expiration date)
  - Update checkout flow to use locked prices
  - _Requirements: 3.1, 3.2, 3.4_

- [x] 3.4 Write unit tests for price display logic
  - Test locked prices displayed when lock is active
  - Test current prices displayed when lock is expired
  - Test badge shows correct expiration date
  - _Requirements: 3.1, 3.4_

- [x] 4. Implement trial system
  - [x] 4.1 Create trial management functions
    - Function to check if user is in trial
    - Function to get trial info (days remaining, plan)
    - Function to expire trial and revert to free tier
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 4.2 Write property test for trial time-bound access
  - **Property 4: Trial access is time-bound**
  - **Validates: Requirements 4.1, 4.2**

- [x] 4.3 Update plan access checks to respect trial
  - Modify feature access checks to grant Student Pro access during trial
  - Update dashboard to show trial status and days remaining
  - Add trial expiration handling
    - _Requirements: 4.1, 4.2, 4.4_

- [x] 4.4 Write unit tests for trial system
  - Test trial grants Student Pro access
  - Test trial expiration reverts to free tier
  - Test subscription during trial converts to paid
  - _Requirements: 4.1, 4.2, 4.3_

- [x] 5. Create admin waitlist management interface
  - [x] 5.1 Create admin waitlist page component
    - Display table of all waitlist entries
    - Show email, signup date, invite status, conversion status
    - Add filters and sorting
    - _Requirements: 5.1_

- [x] 5.2 Add invite management actions
  - Add checkbox selection for bulk actions
  - Add "Mark as Invited" button
  - Update invite status and timestamp
  - _Requirements: 5.2, 5.3_

- [x] 5.3 Implement waitlist export
  - Add "Export to CSV" button
  - Generate CSV with all waitlist data
  - Trigger download
  - _Requirements: 5.4_

- [x] 5.4 Write unit tests for admin actions
  - Test marking entries as invited updates status
  - Test CSV export includes all fields
  - Test filtering and sorting work correctly
  - _Requirements: 5.1, 5.2, 5.4_

- [x] 6. Implement invite email system
  - [x] 6.1 Create invite email template
    - Design email with benefits explanation
    - Include signup link
    - Add branding and styling
    - _Requirements: 6.2_

- [x] 6.2 Create email sending service
  - Function to send invite emails
    - Record sent timestamp
    - Handle send failures
    - Log errors
    - _Requirements: 6.1, 6.3, 6.4_

- [x] 6.3 Add email sending to admin interface
  - Add "Send Invites" button
  - Show sending progress
  - Display success/failure results
  - _Requirements: 6.1, 6.3, 6.4_

- [x] 6.4 Write unit tests for email system
  - Test email template renders correctly
  - Test send success records timestamp
  - Test send failure logs error
  - _Requirements: 6.1, 6.3, 6.4_

- [x] 7. Update waitlist success page
  - [x] 7.1 Add benefits explanation to success screen
    - List all three benefits clearly
    - Explain founding price lock duration
    - Explain trial duration
    - _Requirements: 1.1, 1.2_

- [x] 7.2 Update "What happens next" section
  - Add step about receiving invite email
  - Add step about benefits being applied automatically
  - _Requirements: 1.2_

- [x] 8. Create API endpoints
  - [x] 8.1 Create GET `/api/admin/waitlist` endpoint
    - Return all waitlist entries
    - Require admin authentication
    - _Requirements: 5.1_

- [x] 8.2 Create POST `/api/admin/waitlist/invite` endpoint
  - Mark selected entries as invited
  - Send invite emails
  - Return success/failure results
  - Require admin authentication
  - _Requirements: 5.2, 6.1_

- [x] 8.3 Create POST `/api/admin/waitlist/export` endpoint
  - Generate CSV of waitlist data
  - Return download URL or file
  - Require admin authentication
  - _Requirements: 5.4_

- [x] 8.4 Write integration tests for API endpoints
  - Test admin can fetch waitlist
  - Test non-admin cannot access endpoints
  - Test invite endpoint sends emails and updates status
  - Test export endpoint generates valid CSV
  - _Requirements: 5.1, 5.2, 5.4, 6.1_

- [ ] 9. Add database migrations if needed
  - Review if waitlist table needs new columns or if meta_json is sufficient
  - Create migration if new columns are needed
  - Update RLS policies if needed
  - _Requirements: 7.1, 7.2_

- [ ] 10. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
