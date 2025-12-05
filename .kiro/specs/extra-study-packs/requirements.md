# Requirements Document

## Introduction

This document specifies the requirements for implementing a one-time purchase system for extra study packs. Users who reach their monthly pack limit can purchase additional packs in bundles (10, 30, or 75 packs) that roll over across months but expire after 6 months. The system prioritizes consuming monthly quota before extra packs to provide a fair user experience.

## Glossary

- **System**: The Sappio study pack generation platform
- **User**: Any authenticated person using the platform
- **Monthly Quota**: The number of study packs included in a user's subscription plan per billing period
- **Extra Pack**: A study pack purchased as a one-time add-on outside of the monthly subscription
- **Pack Bundle**: A collection of extra packs sold together (10, 30, or 75 packs)
- **Consumption Order**: The sequence in which different pack types are used when creating study packs
- **Expiration Date**: The date 6 months from purchase when unused extra packs become invalid
- **Billing Period**: The monthly cycle based on the user's billing anchor date
- **Quota Check**: The validation process that determines if a user can create a new study pack
- **Paywall Modal**: The UI component that displays upgrade and purchase options when quota is exceeded
- **Stripe**: The payment processing service used for one-time purchases
- **Inngest**: The background job processing system used for scheduled tasks

## Requirements

### Requirement 1

**User Story:** As a user who has exhausted my monthly quota, I want to purchase extra study packs in bundles, so that I can continue creating study materials without upgrading my subscription.

#### Acceptance Criteria

1. WHEN a user views the extra packs purchase options THEN the System SHALL display three bundle options: 10 packs for €2.99, 30 packs for €6.99, and 75 packs for €14.99
2. WHEN a user selects a pack bundle THEN the System SHALL initiate a Stripe one-time payment flow with the correct amount
3. WHEN a Stripe payment completes successfully THEN the System SHALL credit the purchased pack quantity to the user's account within 30 seconds
4. WHEN extra packs are credited THEN the System SHALL record the purchase date and calculate an expiration date of 6 months from purchase
5. WHEN a user has multiple extra pack purchases THEN the System SHALL track each purchase separately with its own expiration date

### Requirement 2

**User Story:** As a user creating a study pack, I want the system to consume my monthly quota before using my purchased extra packs, so that I maximize the value of my subscription.

#### Acceptance Criteria

1. WHEN the System performs a quota check THEN the System SHALL first calculate remaining monthly quota based on the current billing period
2. WHEN monthly quota is available THEN the System SHALL allow pack creation and increment the monthly usage counter
3. WHEN monthly quota is exhausted and extra packs are available THEN the System SHALL allow pack creation and decrement the extra packs balance
4. WHEN both monthly quota and extra packs are exhausted THEN the System SHALL block pack creation and display the purchase modal
5. WHEN a new billing period begins THEN the System SHALL reset monthly usage to zero without affecting extra packs balance

### Requirement 3

**User Story:** As a user with purchased extra packs, I want my packs to roll over across months but expire after 6 months, so that I have flexibility while preventing indefinite accumulation.

#### Acceptance Criteria

1. WHEN a billing period ends THEN the System SHALL preserve all extra packs balances across the period boundary
2. WHEN the System checks pack availability THEN the System SHALL exclude expired extra packs from the available balance
3. WHEN extra packs reach their 6-month expiration date THEN the System SHALL mark those packs as expired and remove them from the available balance
4. WHEN displaying extra packs balance THEN the System SHALL show the total available packs and the nearest expiration date
5. WHEN a user has packs expiring within 30 days THEN the System SHALL display a warning message with the expiration date

### Requirement 4

**User Story:** As a user who purchased extra packs, I want clear refund policies, so that I understand when refunds are available.

#### Acceptance Criteria

1. WHEN a user requests a refund within 14 days of purchase THEN the System SHALL allow full refund if no packs from that purchase have been consumed
2. WHEN a user has consumed any packs from a purchase THEN the System SHALL mark that purchase as non-refundable
3. WHEN processing a refund THEN the System SHALL remove all unused packs from that specific purchase from the user's balance
4. WHEN a refund is completed THEN the System SHALL record the refund event in the payments table with the refund amount and timestamp
5. WHEN displaying purchase history THEN the System SHALL indicate refund status for each purchase

### Requirement 5

**User Story:** As a user who has exhausted my monthly quota, I want to see purchase options tailored to my situation, so that I can make an informed decision about buying extra packs or upgrading.

#### Acceptance Criteria

1. WHEN a user reaches monthly quota limit during pack creation THEN the System SHALL display a modified paywall modal specific to quota exhaustion
2. WHEN the quota exhaustion modal displays THEN the System SHALL show the 30-pack bundle as the primary option with prominent placement
3. WHEN the quota exhaustion modal displays THEN the System SHALL show the upgrade to paid plan option as a secondary choice
4. WHEN the quota exhaustion modal displays THEN the System SHALL show the billing period reset date so users know when quota renews
5. WHEN a user is on a paid plan and exhausts quota THEN the System SHALL prioritize extra pack purchase over plan upgrade in the modal layout

### Requirement 6

**User Story:** As a system administrator, I want expired extra packs to be automatically removed, so that the database remains accurate without manual intervention.

#### Acceptance Criteria

1. WHEN the System runs the daily expiration job THEN the System SHALL identify all extra pack purchases with expiration dates before the current date
2. WHEN expired purchases are identified THEN the System SHALL mark those purchases as expired in the database
3. WHEN calculating available extra packs THEN the System SHALL exclude all expired purchases from the balance
4. WHEN the expiration job completes THEN the System SHALL log the number of purchases expired and users affected
5. WHEN the expiration job encounters errors THEN the System SHALL retry up to 2 times before logging the failure

### Requirement 7

**User Story:** As a user, I want to see my extra packs balance and expiration information, so that I can track my purchased packs.

#### Acceptance Criteria

1. WHEN a user views their account dashboard THEN the System SHALL display the total available extra packs balance
2. WHEN a user has extra packs THEN the System SHALL display the expiration date of the earliest expiring purchase
3. WHEN a user views purchase history THEN the System SHALL list all extra pack purchases with purchase date, quantity, amount paid, and expiration date
4. WHEN a user creates a study pack THEN the System SHALL display updated balance information showing which pack type was consumed
5. WHEN a user has no extra packs THEN the System SHALL display zero balance without showing expiration information

### Requirement 8

**User Story:** As a developer, I want the extra packs system to integrate seamlessly with existing quota tracking, so that the implementation is maintainable and consistent.

#### Acceptance Criteria

1. WHEN the System checks if a user can create a pack THEN the System SHALL use the existing UsageService.canCreatePack method with extended logic for extra packs
2. WHEN the System consumes a pack THEN the System SHALL use atomic database operations to prevent race conditions
3. WHEN extra pack balance changes THEN the System SHALL use the same idempotency patterns as monthly quota tracking
4. WHEN the System calculates available packs THEN the System SHALL return a unified response including monthly quota, extra packs, and total available
5. WHEN errors occur during pack consumption THEN the System SHALL roll back any partial changes and return a clear error message
