# Implementation Plan

- [x] 1. Set up project dependencies and configuration


  - Install Supabase packages (@supabase/supabase-js, @supabase/ssr)
  - Install Resend package (resend)
  - Install React Email packages (@react-email/components, @react-email/render)
  - Configure environment variables (.env.local)
  - Disable email confirmation in Supabase Dashboard
  - Configure Google OAuth in Supabase Dashboard
  - _Requirements: All_

- [x] 2. Create Supabase client configuration



  - [x] 2.1 Implement browser Supabase client


    - Create `src/lib/supabase/client.ts` with cookie-based session management
    - Export `createBrowserClient()` function
    - _Requirements: 1.2, 1.3, 1.5, 1.6_
  

  - [x] 2.2 Implement server Supabase client

    - Create `src/lib/supabase/server.ts` for Server Components and API routes
    - Export `createServerClient()` function using Next.js cookies
    - _Requirements: 1.2, 1.3, 1.5, 1.6_
  

  - [x] 2.3 Implement middleware helper

    - Create `src/lib/supabase/middleware.ts` for session refresh
    - Handle token refresh and cookie updates
    - _Requirements: 1.6_

- [x] 3. Create database migration for password reset tokens




  - [x] 3.1 Create migration file

    - Create `password_reset_tokens` table with proper indexes
    - Add foreign key to `public.users`
    - _Requirements: 1.10_

- [x] 4. Set up email system with Resend


  - [x] 4.1 Configure Resend client


    - Create `src/lib/email/resend.ts` with Resend initialization
    - _Requirements: 1.11_
  
  - [x] 4.2 Create welcome email template



    - Create `src/lib/email/templates/WelcomeEmail.tsx` using React Email
    - Include Sappio Orb branding, personalized greeting, dashboard link
    - Ensure dark mode optimization and responsive design
    - _Requirements: 1.11_
  

  - [x] 4.3 Create password reset email template


    - Create `src/lib/email/templates/PasswordResetEmail.tsx` using React Email
    - Include reset button, expiration notice, security notice
    - Ensure dark mode optimization and responsive design
    - _Requirements: 1.10_
  
  - [x] 4.4 Implement email sending utilities



    - Create `src/lib/email/send.ts` with `sendWelcomeEmail()` and `sendPasswordResetEmail()` functions
    - Implement error handling and logging
    - Make email sending non-blocking
    - _Requirements: 1.10, 1.11_

- [x] 5. Create authentication utilities



  - [x] 5.1 Implement validation helpers

    - Create `src/lib/auth/validation.ts` with email, password, username validation
    - _Requirements: 1.1, 1.12_
  
  - [x] 5.2 Implement session utilities



    - Create `src/lib/auth/session.ts` with session management helpers
    - _Requirements: 1.3_
  
  - [x] 5.3 Implement password reset token utilities



    - Create `src/lib/auth/tokens.ts` with token generation and validation
    - Use JWT for secure tokens with 1-hour expiration
    - _Requirements: 1.10_

- [x] 6. Create TypeScript types



  - [x] 6.1 Generate Supabase database types


    - Run Supabase CLI to generate types from database schema
    - Save to `src/lib/types/database.ts`
    - _Requirements: All_
  
  - [x] 6.2 Create user-related types


    - Create `src/lib/types/user.ts` with UserProfile, Session, PasswordResetToken interfaces
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.10_

- [x] 7. Create Orb avatar component system



  - [x] 7.1 Create Orb component


    - Create `src/components/orb/Orb.tsx` with pose prop and size variants
    - Implement responsive sizing and accessibility
    - Respect prefers-reduced-motion
    - _Requirements: 1.8_
  

  - [x] 7.2 Define Orb poses

    - Create `src/components/orb/orb-poses.ts` with pose definitions
    - Map pose names to image paths and alt text
    - Define preload priority for critical poses
    - _Requirements: 1.8_
  
  - [x] 7.3 Create placeholder Orb images


    - Create placeholder WebP images for each pose (welcome-wave, success-celebrating, error-confused, processing-thinking, neutral)
    - Store in `public/orb/` directory
    - Optimize for web (WebP format, multiple sizes)





    - _Requirements: 1.8_




- [x] 8. Create reusable UI components


  - [x] 8.1 Create Button component

    - Create `src/components/ui/Button.tsx` with variants and loading states






    - Ensure accessibility (keyboard navigation, focus indicators)
    - _Requirements: 1.1, 1.2, 1.4, 1.12_
  
  - [x] 8.2 Create Input component

    - Create `src/components/ui/Input.tsx` with error states and validation


    - Ensure accessibility (labels, error announcements)
    - _Requirements: 1.1, 1.2, 1.4, 1.12_
  
  - [x] 8.3 Create Card component

    - Create `src/components/ui/Card.tsx` for consistent layout
    - _Requirements: 1.1, 1.2, 1.4_



- [x] 9. Implement signup functionality


  - [x] 9.1 Create signup API route

    - Create `src/app/api/auth/signup/route.ts`
    - Handle email/password signup via Supabase Auth
    - Send welcome email via Resend (non-blocking)
    - Return success/error responses
    - _Requirements: 1.1, 1.9, 1.11_
  
  - [x] 9.2 Create SignupForm component

    - Create `src/components/auth/SignupForm.tsx` with email, password, confirmPassword fields
    - Add "Sign up with Google" button
    - Implement client-side validation
    - Handle form submission and error display
    - Display appropriate Orb poses (Welcome, Processing, Success, Error)
    - _Requirements: 1.1, 1.8, 1.12_
  
  - [x] 9.3 Create signup page

    - Create `src/app/(auth)/signup/page.tsx`
    - Render SignupForm component
    - Redirect if already authenticated
    - _Requirements: 1.1_

- [x] 10. Implement login functionality



  - [x] 10.1 Create login API route



    - Create `src/app/api/auth/login/route.ts`
    - Handle email/password login via Supabase Auth
    - Fetch user profile from public.users
    - Return success/error responses
    - _Requirements: 1.2, 1.9_
  
  - [x] 10.2 Create LoginForm component


    - Create `src/components/auth/LoginForm.tsx` with email and password fields
    - Add "Sign in with Google" button
    - Add "Forgot password?" link
    - Implement client-side validation
    - Handle form submission and error display
    - Display appropriate Orb poses (Welcome, Processing, Error)
    - _Requirements: 1.2, 1.8, 1.12_
  
  - [x] 10.3 Create login page

    - Create `src/app/(auth)/login/page.tsx`
    - Render LoginForm component
    - Redirect if already authenticated
    - _Requirements: 1.2_

- [x] 11. Implement OAuth callback handling

  - [x] 11.1 Create OAuth callback route

    - Create `src/app/api/auth/callback/route.ts`
    - Handle Google OAuth callback
    - Exchange code for session
    - Send welcome email for new users (non-blocking)
    - Redirect to dashboard
    - _Requirements: 1.1, 1.2, 1.11_

- [x] 12. Implement logout functionality



  - [x] 12.1 Create logout API route

    - Create `src/app/api/auth/logout/route.ts`
    - Call Supabase signOut()
    - Clear cookies
    - Return success response
    - _Requirements: 1.3, 1.9_

- [x] 13. Implement password reset functionality



  - [x] 13.1 Create forgot password API route


    - Create `src/app/api/auth/forgot-password/route.ts`
    - Generate secure reset token
    - Store token hash in database
    - Send password reset email via Resend
    - Always return success to prevent email enumeration
    - _Requirements: 1.10_
  
  - [x] 13.2 Create reset password API route


    - Create `src/app/api/auth/reset-password/route.ts`
    - Validate reset token (not expired, not used)
    - Update password via Supabase Auth
    - Mark token as used
    - Return success/error responses
    - _Requirements: 1.10_
  
  - [x] 13.3 Create forgot password page


    - Create `src/app/(auth)/forgot-password/page.tsx`
    - Email input form
    - Display appropriate Orb poses
    - Show success message after submission
    - _Requirements: 1.10_
  
  - [x] 13.4 Create reset password page


    - Create `src/app/(auth)/reset-password/page.tsx`
    - New password input form
    - Validate token from URL query parameter
    - Display appropriate Orb poses
    - Redirect to login on success
    - _Requirements: 1.10_

- [x] 14. Implement profile management




  - [x] 14.1 Create profile API routes

    - Create `src/app/api/user/profile/route.ts` with GET and PATCH handlers
    - GET: Return user profile data
    - PATCH: Update profile fields (full_name, username, avatar_url, locale)
    - Validate username uniqueness
    - _Requirements: 1.4, 1.7, 1.9_
  

  - [x] 14.2 Create ProfileForm component

    - Create `src/components/profile/ProfileForm.tsx`
    - Fields for full_name, username, avatar_url, locale
    - Implement optimistic updates
    - Display validation errors inline
    - _Requirements: 1.4, 1.7, 1.12_
  
  - [x] 14.3 Create PlanBadge component


    - Create `src/components/profile/PlanBadge.tsx`
    - Display plan tier with color coding
    - Show expiration date for paid plans
    - _Requirements: 1.5_
  
  - [x] 14.4 Create profile page


    - Create `src/app/(dashboard)/profile/page.tsx`
    - Render ProfileForm and PlanBadge components
    - Require authentication
    - _Requirements: 1.4, 1.5_

- [x] 15. Implement authentication middleware




  - [x] 15.1 Create Next.js middleware

    - Create `src/middleware.ts`
    - Check session on protected routes
    - Refresh tokens automatically
    - Redirect to login if unauthenticated
    - _Requirements: 1.3, 1.6_
  

  - [x] 15.2 Create AuthGuard component

    - Create `src/components/auth/AuthGuard.tsx`
    - Client-side authentication check
    - Show loading state while checking
    - Redirect to login if not authenticated
    - _Requirements: 1.6_

- [x] 16. Create dashboard layout and pages



  - [x] 16.1 Create dashboard layout


    - Create `src/app/(dashboard)/layout.tsx`
    - Include AuthGuard
    - Add navigation (profile, settings, logout)
    - _Requirements: 1.3, 1.6_
  
  - [x] 16.2 Create dashboard page


    - Create `src/app/(dashboard)/dashboard/page.tsx`
    - Display welcome message with user name
    - Show Dashboard Hero Orb
    - Placeholder for future pack list
    - _Requirements: 1.2, 1.8_
  
  - [x] 16.3 Create settings page







    - Create `src/app/(dashboard)/settings/page.tsx`
    - Locale selection
    - Settings form
    - _Requirements: 1.7_

- [x] 17. Create root layout and landing page



  - [x] 17.1 Update root layout



    - Update `src/app/layout.tsx`
    - Add dark mode theme configuration
    - Include global styles
    - _Requirements: All_
  
  - [x] 17.2 Create landing/redirect page



    - Update `src/app/page.tsx`
    - Redirect authenticated users to dashboard
    - Redirect unauthenticated users to login
    - _Requirements: 1.2, 1.3_







- [x] 18. Implement error handling



  - [x] 18.1 Create error utilities

    - Create `src/lib/utils/errors.ts` with error code enum and message mapping
    - Implement error translation functions
    - _Requirements: 1.12_
  
  - [x] 18.2 Add error handling to all API routes

    - Wrap API route logic in try-catch blocks
    - Return structured error responses
    - Log errors appropriately
    - _Requirements: 1.12_
  
  - [x] 18.3 Add error handling to all forms
    - Display field-specific errors
    - Show Error Orb on failures
    - Preserve user input on errors
    - _Requirements: 1.12_

- [x] 19. Add accessibility features


  - [x] 19.1 Ensure keyboard navigation

    - Test all forms with keyboard only
    - Ensure logical tab order
    - Add visible focus indicators
    - _Requirements: 1.8, 1.12_
  

  - [x] 19.2 Add ARIA labels and semantic HTML


    - Add ARIA labels where needed
    - Use semantic HTML elements
    - Ensure error messages are announced
    - _Requirements: 1.8, 1.12_

  


  - [ ] 19.3 Implement reduced motion support
    - Respect prefers-reduced-motion in Orb component
    - Remove animations for users who prefer reduced motion
    - _Requirements: 1.8_

- [x] 20. Testing and validation



  - [x] 20.1 Test signup flows

    - Test email/password signup
    - Test Google OAuth signup
    - Test duplicate email handling
    - Test weak password validation
    - Verify welcome email is sent
    - _Requirements: 1.1, 1.11_
  

  - [x] 20.2 Test login flows



    - Test email/password login
    - Test Google OAuth login
    - Test invalid credentials handling
    - Test OAuth cancellation
    - _Requirements: 1.2_
  
  - [x] 20.3 Test password reset flow

    - Test forgot password request
    - Verify reset email is sent
    - Test password reset with valid token
    - Test password reset with expired token
    - Test password reset with used token
    - _Requirements: 1.10_
  


  - [x] 20.4 Test profile management



    - Test profile updates
    - Test username uniqueness validation
    - Test locale changes
    - _Requirements: 1.4, 1.7_

  



  - [x] 20.5 Test session management

    - Test session persistence across refreshes
    - Test automatic token refresh
    - Test logout functionality

    - _Requirements: 1.3_


  

  - [x] 20.6 Test Orb displays

    - Verify correct Orb poses in all states
    - Test Orb accessibility (alt text)

    - Test reduced motion support


    - _Requirements: 1.8_
  

  - [x] 20.7 Test email templates

    - Verify welcome email renders correctly

    - Verify password reset email renders correctly
    - Test email links work correctly

    - _Requirements: 1.10, 1.11_
  
  - [x] 20.8 Test accessibility

    - Test keyboard navigation on all pages
    - Test with screen reader
    - Verify focus indicators are visible
    - _Requirements: 1.8, 1.12_
