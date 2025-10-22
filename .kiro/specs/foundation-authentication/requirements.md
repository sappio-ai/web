# Requirements Document

## Introduction

This document outlines the requirements for Phase 1 of Sappio V2: Foundation & Authentication. This phase establishes the core authentication system, user profile management, and the foundational infrastructure needed for the application. It includes integration with Supabase Auth (with email confirmation disabled), user profile creation, plan tier management, custom email sending via Resend, and the introduction of the Sappio Orb avatar system to create a friendly, engaging user experience.

The authentication system will support email/password authentication, Google OAuth, session management, and user settings. Email confirmation is disabled in Supabase to allow immediate access. Custom transactional emails (welcome emails, password reset) are sent via Resend. The Orb avatar will appear throughout the authentication flow to provide visual feedback and emotional connection with users.

## Requirements

### Requirement 1: User Registration

**User Story:** As a new user, I want to create an account with my email and password or Google account, so that I can access Sappio's study tools.

#### Acceptance Criteria

1. WHEN a user navigates to the signup page THEN the system SHALL display a registration form with email, password, and confirm password fields AND a "Sign up with Google" button
2. WHEN a user submits valid registration data THEN the system SHALL create an auth.users record via Supabase Auth
3. WHEN a user clicks "Sign up with Google" THEN the system SHALL initiate Google OAuth flow via Supabase Auth
4. WHEN Google OAuth is successful THEN the system SHALL create auth.users record with Google identity
5. WHEN auth.users record is created THEN the system SHALL automatically create a corresponding public.users profile record with default values (role='user', plan='free', locale='en')
6. WHEN registration is successful THEN the system SHALL send a welcome email via Resend
7. WHEN registration is successful THEN the system SHALL display a Success Orb (celebrating pose) and redirect to the onboarding flow
8. WHEN registration fails due to duplicate email THEN the system SHALL display an Error Orb (confused/sad pose) with a clear error message
9. WHEN password is less than 8 characters THEN the system SHALL display validation error before submission
10. WHEN password and confirm password do not match THEN the system SHALL display validation error before submission
11. WHEN email format is invalid THEN the system SHALL display validation error before submission
12. WHEN Google OAuth is cancelled THEN the system SHALL return user to signup page with no error message
13. WHEN welcome email fails to send THEN the system SHALL log the error but NOT block user registration

### Requirement 2: User Login

**User Story:** As a returning user, I want to log in with my email and password or Google account, so that I can access my study materials and progress.

#### Acceptance Criteria

1. WHEN a user navigates to the login page THEN the system SHALL display a Welcome Orb (friendly wave pose), a login form with email and password fields, AND a "Sign in with Google" button
2. WHEN a user submits valid credentials THEN the system SHALL authenticate via Supabase Auth and create a session
3. WHEN a user clicks "Sign in with Google" THEN the system SHALL initiate Google OAuth flow via Supabase Auth
4. WHEN Google OAuth is successful THEN the system SHALL create session and redirect to dashboard
5. WHEN login is successful THEN the system SHALL redirect to the dashboard
6. WHEN login fails due to invalid credentials THEN the system SHALL display an Error Orb (confused/sad pose) with message "Invalid email or password"
7. WHEN a user is already logged in THEN the system SHALL redirect to dashboard automatically
8. WHEN Google OAuth fails THEN the system SHALL display Error Orb with appropriate message

### Requirement 3: Session Management

**User Story:** As a logged-in user, I want my session to persist across browser refreshes, so that I don't have to log in repeatedly.

#### Acceptance Criteria

1. WHEN a user successfully logs in THEN the system SHALL create a persistent session using Supabase Auth
2. WHEN a user refreshes the page THEN the system SHALL maintain the authenticated state
3. WHEN a user's session expires THEN the system SHALL redirect to login page with appropriate message
4. WHEN a user logs out THEN the system SHALL clear the session and redirect to login page
5. WHEN a user accesses a protected route without authentication THEN the system SHALL redirect to login page

### Requirement 4: User Profile Management

**User Story:** As a user, I want to view and update my profile information, so that I can keep my account details current.

#### Acceptance Criteria

1. WHEN a user accesses their profile page THEN the system SHALL display current profile data (email, full_name, username, avatar_url, locale)
2. WHEN a user updates their full name THEN the system SHALL save the change to public.users table
3. WHEN a user updates their username THEN the system SHALL validate uniqueness and save if valid
4. WHEN a user attempts to use a duplicate username THEN the system SHALL display error message "Username already taken"
5. WHEN a user updates their locale preference THEN the system SHALL save the change and apply it to the UI
6. WHEN a user updates their avatar URL THEN the system SHALL save the change and display the new avatar
7. WHEN profile update is successful THEN the system SHALL display success confirmation

### Requirement 5: Plan Tier Management

**User Story:** As a user, I want to see my current plan tier and its expiration date, so that I know what features I have access to.

#### Acceptance Criteria

1. WHEN a user views their profile THEN the system SHALL display their current plan (free, student_pro, or pro_plus)
2. WHEN a user has a paid plan THEN the system SHALL display the plan_expires_at date
3. WHEN a user's plan expires THEN the system SHALL automatically revert to 'free' plan
4. WHEN an admin updates a user's plan THEN the system SHALL update the public.users.plan field
5. WHEN a user's plan is updated THEN the system SHALL log an event to the events table

### Requirement 6: Authentication Middleware

**User Story:** As a developer, I want authentication middleware to protect routes, so that unauthorized users cannot access protected resources.

#### Acceptance Criteria

1. WHEN a request is made to a protected API route THEN the system SHALL verify the Supabase session token
2. WHEN the session token is valid THEN the system SHALL allow the request to proceed
3. WHEN the session token is invalid or missing THEN the system SHALL return 401 Unauthorized
4. WHEN a user accesses a protected page route without authentication THEN the system SHALL redirect to login
5. WHEN middleware detects an expired session THEN the system SHALL attempt to refresh the token automatically

### Requirement 7: User Settings

**User Story:** As a user, I want to configure my preferences, so that the application works the way I prefer.

#### Acceptance Criteria

1. WHEN a user accesses settings THEN the system SHALL display current locale preference
2. WHEN a user changes locale THEN the system SHALL update public.users.locale
3. WHEN locale is changed THEN the system SHALL apply the new locale to the UI immediately
4. WHEN a user saves settings THEN the system SHALL display success confirmation

### Requirement 8: Orb Avatar Integration in Authentication

**User Story:** As a user, I want to see the friendly Sappio Orb throughout my authentication experience, so that I feel welcomed and guided.

#### Acceptance Criteria

1. WHEN a user visits the login page THEN the system SHALL display a Welcome Orb (friendly wave pose)
2. WHEN a user successfully signs up THEN the system SHALL display a Success Orb (celebrating pose)
3. WHEN authentication fails THEN the system SHALL display an Error Orb (confused/sad pose)
4. WHEN a user is processing login/signup THEN the system SHALL display a Processing Orb (thinking pose with orbital rings)
5. WHEN Orb images are displayed THEN the system SHALL include appropriate alt text for accessibility
6. WHEN a user has reduced motion preferences THEN the system SHALL respect those preferences for Orb animations

### Requirement 9: API Endpoints

**User Story:** As a frontend developer, I want well-defined API endpoints for authentication operations, so that I can build the user interface.

#### Acceptance Criteria

1. WHEN POST /api/auth/signup is called with valid data THEN the system SHALL create user and return success response
2. WHEN POST /api/auth/login is called with valid credentials THEN the system SHALL create session and return user data
3. WHEN POST /api/auth/logout is called THEN the system SHALL clear session and return success
4. WHEN GET /api/user/profile is called with valid session THEN the system SHALL return user profile data
5. WHEN PATCH /api/user/profile is called with valid data THEN the system SHALL update profile and return updated data
6. WHEN any API endpoint receives invalid data THEN the system SHALL return appropriate error response with clear message

### Requirement 10: Password Reset

**User Story:** As a user who forgot my password, I want to reset it via email, so that I can regain access to my account.

#### Acceptance Criteria

1. WHEN a user clicks "Forgot password?" on login page THEN the system SHALL display password reset form
2. WHEN a user submits email for password reset THEN the system SHALL generate a secure reset token
3. WHEN reset token is generated THEN the system SHALL send password reset email via Resend with reset link
4. WHEN user clicks reset link THEN the system SHALL validate token and display new password form
5. WHEN user submits new password THEN the system SHALL update password via Supabase Auth
6. WHEN password reset is successful THEN the system SHALL display Success Orb and redirect to login
7. WHEN reset token is expired or invalid THEN the system SHALL display error message
8. WHEN reset email fails to send THEN the system SHALL display error to user

### Requirement 11: Welcome Email

**User Story:** As a new user, I want to receive a welcome email after signing up, so that I feel welcomed and have confirmation of my account.

#### Acceptance Criteria

1. WHEN a user successfully signs up with email/password THEN the system SHALL send a welcome email via Resend
2. WHEN a user successfully signs up with Google OAuth THEN the system SHALL send a welcome email via Resend
3. WHEN welcome email is sent THEN it SHALL include user's name (if provided) or email
4. WHEN welcome email is sent THEN it SHALL include a link to the dashboard
5. WHEN welcome email is sent THEN it SHALL include the Sappio Orb branding
6. WHEN welcome email fails to send THEN the system SHALL log error but NOT block registration

### Requirement 12: Error Handling and Validation

**User Story:** As a user, I want clear error messages when something goes wrong, so that I know how to fix the issue.

#### Acceptance Criteria

1. WHEN validation fails THEN the system SHALL display field-specific error messages
2. WHEN a network error occurs THEN the system SHALL display a user-friendly error message
3. WHEN Supabase Auth returns an error THEN the system SHALL translate it to a user-friendly message
4. WHEN an unexpected error occurs THEN the system SHALL display a generic error message and log details for debugging
5. WHEN form submission fails THEN the system SHALL preserve user input so they don't have to re-enter everything
