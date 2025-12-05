# Requirements Document

## Introduction

This feature implements a waitlist benefits system that rewards early adopters who join the Sappio waitlist before public launch. Users who sign up on the waitlist will receive three key benefits: early access invitations, a founding price lock for 12 months, and a 7-day Pro trial when they create their account. The system must track these benefits, apply them automatically during signup, and enforce them throughout the user's journey.

## Glossary

- **Waitlist System**: The pre-launch signup mechanism that collects user emails and tracks referrals
- **Early Access**: Priority invitation to create an account before public launch
- **Founding Price Lock**: A guarantee that the user's subscription price will not increase for 12 months from signup
- **Pro Trial**: A 7-day period where the user has full access to Student Pro features without payment
- **Benefit Eligibility**: The state of a waitlist entry that determines which benefits the user receives
- **Admin Dashboard**: The internal interface for managing waitlist entries and sending invites

## Requirements

### Requirement 1

**User Story:** As a potential user, I want to join the waitlist and understand what benefits I'll receive, so that I'm motivated to sign up early.

#### Acceptance Criteria

1. WHEN a user views the waitlist page THEN the System SHALL display the three benefits: early access, founding price lock for 12 months, and 7-day Pro trial
2. WHEN a user successfully joins the waitlist THEN the System SHALL confirm their eligibility for all three benefits
3. WHEN a user shares their referral link THEN the System SHALL track referrals to measure viral growth

### Requirement 2

**User Story:** As a waitlist member, I want my benefits to be automatically applied when I create my account, so that I don't have to manually claim them.

#### Acceptance Criteria

1. WHEN a user signs up with an email that exists in the waitlist THEN the System SHALL automatically detect their waitlist membership
2. WHEN a waitlist member creates an account THEN the System SHALL apply the founding price lock with an expiration date 12 months from signup
3. WHEN a waitlist member creates an account THEN the System SHALL grant a 7-day Student Pro trial with the correct expiration date
4. WHEN a waitlist member creates an account THEN the System SHALL mark their waitlist entry as converted
5. WHEN a user signs up with an email not on the waitlist THEN the System SHALL create a regular free account without benefits

### Requirement 3

**User Story:** As a user with a founding price lock, I want to see my locked pricing when viewing subscription options, so that I know my price won't increase.

#### Acceptance Criteria

1. WHEN a user with an active founding price lock views pricing THEN the System SHALL display their locked prices instead of current prices
2. WHEN a user with an active founding price lock subscribes THEN the System SHALL charge the locked price
3. WHEN a user's founding price lock expires THEN the System SHALL display current market prices
4. WHEN displaying locked pricing THEN the System SHALL show a badge indicating the price lock and expiration date

### Requirement 4

**User Story:** As a user with a Pro trial, I want to access all Student Pro features during my trial period, so that I can evaluate the product before paying.

#### Acceptance Criteria

1. WHEN a user is within their 7-day trial period THEN the System SHALL grant access to all Student Pro features
2. WHEN a user's trial expires THEN the System SHALL revert their account to Free tier limits
3. WHEN a user subscribes during their trial THEN the System SHALL convert them to a paid Student Pro account
4. WHEN displaying the user's plan THEN the System SHALL show trial status and days remaining

### Requirement 5

**User Story:** As an admin, I want to view all waitlist signups and send early access invites, so that I can control the launch rollout.

#### Acceptance Criteria

1. WHEN an admin views the waitlist dashboard THEN the System SHALL display all waitlist entries with email, signup date, and invite status
2. WHEN an admin selects waitlist entries THEN the System SHALL provide an option to mark them as invited
3. WHEN an admin marks entries as invited THEN the System SHALL update the invite timestamp
4. WHEN an admin exports the waitlist THEN the System SHALL generate a CSV file with all waitlist data

### Requirement 6

**User Story:** As an admin, I want to send invite emails to waitlist members, so that they know they can create their account.

#### Acceptance Criteria

1. WHEN an admin sends invites to selected waitlist members THEN the System SHALL send an email to each recipient
2. WHEN sending an invite email THEN the System SHALL include a signup link and explanation of benefits
3. WHEN an invite email is sent THEN the System SHALL record the sent timestamp in the waitlist entry
4. WHEN an invite email fails to send THEN the System SHALL log the error and mark the entry as failed

### Requirement 7

**User Story:** As a system administrator, I want to store benefit data reliably, so that users don't lose their earned benefits.

#### Acceptance Criteria

1. WHEN storing founding price lock data THEN the System SHALL record the lock expiration date and locked prices in the user profile
2. WHEN storing trial data THEN the System SHALL record the trial start date and expiration date
3. WHEN a user's benefits are applied THEN the System SHALL ensure data consistency across all related tables
4. WHEN querying benefit status THEN the System SHALL return accurate information based on current timestamps

### Requirement 8

**User Story:** As a developer, I want clear separation between waitlist data and user data, so that the system is maintainable.

#### Acceptance Criteria

1. WHEN the waitlist table is modified THEN the System SHALL not affect existing user accounts
2. WHEN the users table is modified THEN the System SHALL not affect waitlist entries
3. WHEN linking waitlist to users THEN the System SHALL use email as the matching key
