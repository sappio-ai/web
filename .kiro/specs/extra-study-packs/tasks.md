# Implementation Plan

- [ ] 1. Database schema and migrations
- [ ] 1.1 Create extra_pack_purchases table with all fields and constraints
  - Create table with id, user_id, quantity, amount_paid, currency, stripe_payment_intent_id, purchased_at, expires_at, consumed, status, refunded_at, refund_amount, created_at, updated_at
  - Add CHECK constraints for quantity > 0, consumed >= 0 AND consumed <= quantity, status IN ('active', 'expired', 'refunded')
  - Add indexes on user_id, expires_at, status
  - Add foreign key to users table with ON DELETE CASCADE
  - _Requirements: 1.4, 1.5_

- [ ] 1.2 Create database function for atomic extra pack consumption
  - Write consume_extra_pack(p_user_id, p_count, p_idempotency_key) function
  - Use FIFO logic (oldest purchase first) for consumption
  - Return new balance and consumption source
  - Handle idempotency to prevent duplicate consumption
  - _Requirements: 2.3, 8.3_

- [ ] 1.3 Create database function for available balance calculation
  - Write get_available_extra_packs(p_user_id) function
  - Exclude expired purchases (expires_at < NOW())
  - Exclude refunded purchases (status = 'refunded')
  - Sum (quantity - consumed) for active purchases
  - _Requirements: 3.2, 6.3_

- [ ] 1.4 Write property test for expiration date calculation
  - **Property 1: Expiration date calculation**
  - **Validates: Requirements 1.4**

- [ ] 2. ExtraPacksService implementation
- [ ] 2.1 Implement ExtraPacksService.getBundles()
  - Return array of 3 bundles: 10/€2.99, 30/€6.99, 75/€14.99
  - Calculate pricePerPack for each bundle
  - Mark 30-pack bundle as popular
  - _Requirements: 1.1_

- [ ] 2.2 Implement ExtraPacksService.getAvailableBalance()
  - Query extra_pack_purchases for user
  - Filter out expired and refunded purchases
  - Calculate total available (quantity - consumed)
  - Find nearest expiration date
  - Return balance object with total and purchases array
  - _Requirements: 3.2, 3.4, 7.2_

- [ ] 2.3 Write property test for independent purchase tracking
  - **Property 2: Independent purchase tracking**
  - **Validates: Requirements 1.5**

- [ ] 2.4 Write property test for expired pack exclusion
  - **Property 6: Expired pack exclusion**
  - **Validates: Requirements 3.2, 6.3**

- [ ] 2.5 Write property test for balance display completeness
  - **Property 8: Balance display completeness**
  - **Validates: Requirements 3.4, 7.2**

- [ ] 2.6 Implement ExtraPacksService.createPurchase()
  - Insert new record into extra_pack_purchases
  - Set expires_at to purchased_at + 6 months
  - Set status to 'active', consumed to 0
  - Return created purchase object
  - _Requirements: 1.3, 1.4_

- [ ] 2.7 Implement ExtraPacksService.consumeExtraPacks()
  - Call consume_extra_pack database function
  - Use FIFO consumption (oldest first)
  - Handle idempotency with unique key
  - Return success status and new balance
  - _Requirements: 2.3, 8.3_

- [ ] 2.8 Write property test for idempotent consumption
  - **Property 17: Idempotent consumption**
  - **Validates: Requirements 8.3**

- [ ] 2.9 Implement ExtraPacksService.canRefund()
  - Check purchase is within 14 days of purchase date
  - Check consumed === 0
  - Return allowed boolean and reason if not allowed
  - _Requirements: 4.1, 4.2_

- [ ] 2.10 Write property test for refund eligibility rules
  - **Property 10: Refund eligibility rules**
  - **Validates: Requirements 4.1, 4.2**

- [ ] 2.11 Implement ExtraPacksService.processRefund()
  - Update purchase status to 'refunded'
  - Set refunded_at to current timestamp
  - Set refund_amount
  - Remove unused packs from balance
  - _Requirements: 4.3, 4.4_

- [ ] 2.12 Write property test for refund balance adjustment
  - **Property 11: Refund balance adjustment**
  - **Validates: Requirements 4.3**

- [ ] 2.13 Write property test for refund recording
  - **Property 12: Refund recording**
  - **Validates: Requirements 4.4, 4.5**

- [ ] 2.14 Implement ExtraPacksService.expirePurchases()
  - Query purchases where expires_at < NOW() AND status = 'active'
  - Update status to 'expired' for matched purchases
  - Count affected purchases and users
  - Return statistics object
  - _Requirements: 3.3, 6.1, 6.2_

- [ ] 2.15 Write property test for expiration job identification
  - **Property 14: Expiration job identification**
  - **Validates: Requirements 6.1**

- [ ] 2.16 Write property test for expiration job marking
  - **Property 7: Expiration job marking**
  - **Validates: Requirements 3.3, 6.2**

- [ ] 3. Extend UsageService for extra packs
- [ ] 3.1 Extend UsageService.canCreatePack() to include extra packs
  - Get monthly quota remaining (existing logic)
  - Get extra packs available via ExtraPacksService
  - Calculate total available (monthly + extra)
  - Return extended usage stats with extraPacksAvailable and totalAvailable
  - Determine if grace window applies
  - _Requirements: 2.1, 2.2, 8.4_

- [ ] 3.2 Write property test for monthly quota priority
  - **Property 3: Monthly quota priority**
  - **Validates: Requirements 2.1, 2.2**

- [ ] 3.3 Write property test for unified availability response
  - **Property 18: Unified availability response**
  - **Validates: Requirements 8.4**

- [ ] 3.4 Extend UsageService.consumePackQuota() to handle extra packs
  - Check if monthly quota available
  - If yes: consume from monthly (existing logic)
  - If no: consume from extra packs via ExtraPacksService
  - Return consumption source ('monthly' or 'extra')
  - Return updated usage stats
  - _Requirements: 2.2, 2.3, 7.4_

- [ ] 3.5 Write property test for extra pack consumption order
  - **Property 4: Extra pack consumption order**
  - **Validates: Requirements 2.3**

- [ ] 3.6 Write property test for consumption source feedback
  - **Property 16: Consumption source feedback**
  - **Validates: Requirements 7.4**

- [ ] 3.7 Add helper method UsageService.getExpirationWarning()
  - Get user's extra pack purchases
  - Find purchases expiring within 30 days
  - Return warning object with count and expiration date if applicable
  - _Requirements: 3.5_

- [ ] 3.8 Write property test for expiration warning threshold
  - **Property 9: Expiration warning threshold**
  - **Validates: Requirements 3.5**

- [ ] 3.9 Write property test for period boundary preservation
  - **Property 5: Period boundary preservation**
  - **Validates: Requirements 2.5, 3.1**

- [ ] 4. Stripe integration
- [ ] 4.1 Install and configure Stripe SDK
  - Add stripe npm package
  - Create .env variables for STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET
  - Initialize Stripe client in lib/stripe/client.ts
  - _Requirements: 1.2_

- [ ] 4.2 Implement StripeService.createExtraPacksCheckout()
  - Create Stripe checkout session with line items
  - Set mode to 'payment' (one-time)
  - Include metadata: userId, quantity, bundleType
  - Set success_url and cancel_url
  - Return session ID and URL
  - _Requirements: 1.2_

- [ ] 4.3 Implement StripeService.verifyWebhookSignature()
  - Use Stripe.webhooks.constructEvent()
  - Verify signature matches STRIPE_WEBHOOK_SECRET
  - Return boolean for valid/invalid
  - _Requirements: 1.3_

- [ ] 4.4 Implement StripeService.handlePaymentSuccess()
  - Extract payment intent ID and metadata
  - Call ExtraPacksService.createPurchase()
  - Log success event
  - Handle errors with retry logic
  - _Requirements: 1.3_

- [ ] 4.5 Implement StripeService.createRefund()
  - Create Stripe refund for payment intent
  - Specify amount to refund
  - Return refund object
  - _Requirements: 4.3_

- [ ] 5. API endpoints
- [ ] 5.1 Create POST /api/payments/extra-packs endpoint
  - Validate user authentication
  - Validate bundle selection (10, 30, or 75)
  - Get bundle price from ExtraPacksService
  - Create Stripe checkout session
  - Return session URL for redirect
  - _Requirements: 1.1, 1.2_

- [ ] 5.2 Create POST /api/webhooks/stripe endpoint
  - Verify webhook signature
  - Handle checkout.session.completed event
  - Extract metadata and credit packs
  - Return 200 OK to Stripe
  - Log errors without failing webhook
  - _Requirements: 1.3_

- [ ] 5.3 Create GET /api/users/extra-packs endpoint
  - Authenticate user
  - Get available balance via ExtraPacksService
  - Get expiration warning via UsageService
  - Return balance, purchases, and warnings
  - _Requirements: 3.4, 3.5, 7.1, 7.2_

- [ ] 5.4 Create GET /api/users/extra-packs/history endpoint
  - Authenticate user
  - Query all purchases for user (including refunded)
  - Return purchase history with all fields
  - _Requirements: 7.3_

- [ ] 5.5 Write property test for purchase history completeness
  - **Property 15: Purchase history completeness**
  - **Validates: Requirements 7.3**

- [ ] 5.6 Create POST /api/payments/extra-packs/refund endpoint
  - Authenticate user
  - Validate purchase ID
  - Check refund eligibility via ExtraPacksService
  - Process Stripe refund
  - Update database via ExtraPacksService
  - Return refund confirmation
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ] 6. Frontend components
- [ ] 6.1 Create QuotaExhaustedPaywall component
  - Display when quota exceeded during pack creation
  - Show current usage stats
  - Show 30-pack bundle as primary option
  - Show upgrade option as secondary
  - Show billing period reset date
  - Handle bundle selection and redirect to Stripe
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ] 6.2 Write property test for plan-based modal priority
  - **Property 13: Plan-based modal priority**
  - **Validates: Requirements 5.5**

- [ ] 6.3 Modify CreatePackModal to use QuotaExhaustedPaywall
  - Replace generic PaywallModal with QuotaExhaustedPaywall when trigger is 'upload'
  - Pass usage stats to new modal
  - Pass user's current plan
  - _Requirements: 5.1_

- [ ] 6.4 Create ExtraPacksBalance component
  - Display total available extra packs
  - Display nearest expiration date if packs exist
  - Display warning if packs expire within 30 days
  - Show "0 extra packs" when balance is zero
  - _Requirements: 7.1, 7.2, 7.5_

- [ ] 6.5 Create ExtraPacksPurchaseHistory component
  - Fetch and display purchase history
  - Show purchase date, quantity, amount, expiration, status
  - Indicate refunded purchases
  - Allow refund request for eligible purchases
  - _Requirements: 7.3, 4.5_

- [ ] 6.6 Add ExtraPacksBalance to user dashboard
  - Place near monthly quota display
  - Show both monthly and extra packs balances
  - Link to purchase history
  - _Requirements: 7.1_

- [ ] 6.7 Update pack creation success message
  - Show which source was consumed (monthly or extra)
  - Show updated balances for both sources
  - _Requirements: 7.4_

- [ ] 7. Background jobs
- [ ] 7.1 Create Inngest function expire-extra-packs
  - Set up cron schedule: '0 1 * * *' (daily at 1 AM UTC)
  - Call ExtraPacksService.expirePurchases()
  - Log results (purchases expired, users affected)
  - Set retries to 2
  - _Requirements: 6.1, 6.2, 6.4, 6.5_

- [ ] 7.2 Register expire-extra-packs in Inngest serve endpoint
  - Import function in app/api/inngest/route.ts
  - Add to functions array
  - Test cron trigger locally
  - _Requirements: 6.1_

- [ ] 8. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 9. Integration and end-to-end testing
- [ ] 9.1 Write integration test for purchase flow
  - Test: Create checkout → Simulate webhook → Verify credit
  - Verify pack balance increases correctly
  - Verify expiration date is set correctly

- [ ] 9.2 Write integration test for consumption flow
  - Test: Set up user state → Create pack → Verify consumption
  - Test monthly priority (consume monthly first)
  - Test extra pack consumption (when monthly exhausted)
  - Verify balance updates correctly

- [ ] 9.3 Write integration test for refund flow
  - Test: Purchase → Request refund → Verify refund
  - Test refund eligibility checks
  - Test balance adjustment after refund

- [ ] 9.4 Write integration test for expiration flow
  - Test: Create expired purchases → Run job → Verify expiration
  - Verify expired packs excluded from balance
  - Verify expiration warnings display correctly

- [ ] 10. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
