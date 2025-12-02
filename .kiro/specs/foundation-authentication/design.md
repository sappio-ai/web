# Design Document

## Overview

Phase 1 establishes the authentication foundation for Sappio V2 using Next.js 15 (App Router), Supabase Auth, and TypeScript. The design follows a server-first approach with React Server Components (RSC) where possible, client components for interactive elements, and API routes for authentication operations.

The Orb avatar system is implemented as a reusable component that displays different static poses based on context. All Orb images are optimized WebP files with proper accessibility attributes.

## Architecture

### Technology Stack

- **Framework:** Next.js 15.5.6 (App Router with Turbopack)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 4
- **Authentication:** Supabase Auth (@supabase/supabase-js, @supabase/ssr) with Google OAuth (email confirmation disabled)
- **Email:** Resend (resend) for transactional emails
- **Email Templates:** React Email (@react-email/components) for email templates
- **Database:** Supabase PostgreSQL (already configured)
- **State Management:** React hooks + Server Components
- **Form Handling:** React Server Actions + client-side validation

### Directory Structure

```
src/
├── app/
│   ├── (auth)/                    # Auth route group (no layout)
│   │   ├── login/
│   │   │   └── page.tsx          # Login page
│   │   ├── signup/
│   │   │   └── page.tsx          # Signup page
│   │   ├── forgot-password/
│   │   │   └── page.tsx          # Forgot password page
│   │   └── reset-password/
│   │       └── page.tsx          # Reset password page (with token)
│   ├── (dashboard)/               # Protected route group
│   │   ├── layout.tsx            # Dashboard layout with auth check
│   │   ├── dashboard/
│   │   │   └── page.tsx          # Main dashboard
│   │   ├── profile/
│   │   │   └── page.tsx          # Profile management
│   │   └── settings/
│   │       └── page.tsx          # User settings
│   ├── api/
│   │   ├── auth/
│   │   │   ├── signup/
│   │   │   │   └── route.ts      # POST /api/auth/signup
│   │   │   ├── login/
│   │   │   │   └── route.ts      # POST /api/auth/login
│   │   │   ├── logout/
│   │   │   │   └── route.ts      # POST /api/auth/logout
│   │   │   ├── callback/
│   │   │   │   └── route.ts      # GET /api/auth/callback (OAuth callback)
│   │   │   ├── forgot-password/
│   │   │   │   └── route.ts      # POST /api/auth/forgot-password
│   │   │   └── reset-password/
│   │   │       └── route.ts      # POST /api/auth/reset-password
│   │   └── user/
│   │       └── profile/
│   │           └── route.ts      # GET/PATCH /api/user/profile
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Landing/redirect page
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx         # Client component for login
│   │   ├── SignupForm.tsx        # Client component for signup
│   │   └── AuthGuard.tsx         # Client component for route protection
│   ├── profile/
│   │   ├── ProfileForm.tsx       # Client component for profile editing
│   │   └── PlanBadge.tsx         # Display plan tier
│   ├── orb/
│   │   ├── Orb.tsx               # Main Orb component
│   │   └── orb-poses.ts          # Orb pose definitions
│   └── ui/
│       ├── Button.tsx            # Reusable button component
│       ├── Input.tsx             # Reusable input component
│       └── Card.tsx              # Reusable card component
├── lib/
│   ├── supabase/
│   │   ├── client.ts             # Browser Supabase client
│   │   ├── server.ts             # Server Supabase client
│   │   └── middleware.ts         # Middleware helper
│   ├── email/
│   │   ├── resend.ts             # Resend client configuration
│   │   ├── send.ts               # Email sending utilities
│   │   └── templates/
│   │       ├── WelcomeEmail.tsx  # Welcome email template
│   │       └── PasswordResetEmail.tsx  # Password reset email template
│   ├── auth/
│   │   ├── session.ts            # Session utilities
│   │   ├── validation.ts         # Auth validation helpers
│   │   └── tokens.ts             # Password reset token generation/validation
│   ├── types/
│   │   ├── database.ts           # Generated Supabase types
│   │   └── user.ts               # User-related types
│   └── utils/
│       ├── errors.ts             # Error handling utilities
│       └── validation.ts         # General validation helpers
└── middleware.ts                 # Next.js middleware for auth
```

## Components and Interfaces

### 1. Supabase Client Configuration

**File: `src/lib/supabase/client.ts`**
- Browser-side Supabase client using `@supabase/ssr`
- Handles cookie-based session management
- Used in client components

**File: `src/lib/supabase/server.ts`**
- Server-side Supabase client for Server Components and API routes
- Uses cookies from Next.js headers
- Provides `createClient()` function for each request

**File: `src/lib/supabase/middleware.ts`**
- Helper for Next.js middleware
- Refreshes session tokens automatically
- Updates cookies

### 2. Authentication Components

**LoginForm Component (`components/auth/LoginForm.tsx`)**
- Client component with form state management
- Fields: email, password
- "Sign in with Google" button
- Client-side validation before submission
- Calls `/api/auth/login` endpoint for email/password
- Calls `supabase.auth.signInWithOAuth({ provider: 'google' })` for Google
- Displays Welcome Orb at top
- Shows Error Orb on failure
- Handles loading states with Processing Orb

**SignupForm Component (`components/auth/SignupForm.tsx`)**
- Client component with form state management
- Fields: email, password, confirmPassword
- "Sign up with Google" button
- Client-side validation (email format, password strength, password match)
- Calls `/api/auth/signup` endpoint for email/password
- Calls `supabase.auth.signInWithOAuth({ provider: 'google' })` for Google
- Displays Welcome Orb at top
- Shows Success Orb on successful registration
- Shows Error Orb on failure

**AuthGuard Component (`components/auth/AuthGuard.tsx`)**
- Client component that wraps protected content
- Checks authentication status
- Redirects to login if not authenticated
- Shows loading state while checking

### 3. Profile Components

**ProfileForm Component (`components/profile/ProfileForm.tsx`)**
- Client component for editing profile
- Fields: full_name, username, avatar_url, locale
- Optimistic updates for better UX
- Calls `/api/user/profile` PATCH endpoint
- Displays validation errors inline

**PlanBadge Component (`components/profile/PlanBadge.tsx`)**
- Displays current plan tier with styling
- Shows expiration date for paid plans
- Color-coded: free (gray), student_pro (blue), pro_plus (purple)

### 4. Orb Avatar System

**Orb Component (`components/orb/Orb.tsx`)**
```typescript
interface OrbProps {
  pose: OrbPose;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

type OrbPose = 
  | 'welcome-wave'
  | 'success-celebrating'
  | 'error-confused'
  | 'processing-thinking'
  | 'neutral';
```

- Renders optimized WebP image based on pose
- Responsive sizing
- Includes alt text for accessibility
- Respects `prefers-reduced-motion`
- Lazy loads non-critical poses

**Orb Pose Definitions (`components/orb/orb-poses.ts`)**
- Maps pose names to image paths
- Includes alt text for each pose
- Defines preload priority for critical poses

### 5. Email System

**Resend Client (`lib/email/resend.ts`)**
- Initialize Resend client with API key
- Export configured client for use in API routes

**Email Sending Utility (`lib/email/send.ts`)**
- `sendWelcomeEmail(to: string, name?: string)` - Sends welcome email
- `sendPasswordResetEmail(to: string, resetLink: string)` - Sends password reset email
- Error handling and logging
- Non-blocking (doesn't throw on failure)

**Welcome Email Template (`lib/email/templates/WelcomeEmail.tsx`)**
- React Email component
- Includes Sappio Orb branding
- Personalized greeting
- Link to dashboard
- Dark mode optimized
- Responsive design

**Password Reset Email Template (`lib/email/templates/PasswordResetEmail.tsx`)**
- React Email component
- Includes Sappio Orb branding
- Clear reset button/link
- Expiration notice (1 hour)
- Security notice
- Dark mode optimized
- Responsive design

### 6. API Routes

**POST /api/auth/signup**
```typescript
Request: {
  email: string;
  password: string;
}

Response: {
  success: boolean;
  user?: {
    id: string;
    email: string;
  };
  error?: string;
}
```

**POST /api/auth/login**
```typescript
Request: {
  email: string;
  password: string;
}

Response: {
  success: boolean;
  user?: {
    id: string;
    email: string;
    profile: UserProfile;
  };
  error?: string;
}
```

**POST /api/auth/logout**
```typescript
Response: {
  success: boolean;
}
```

**GET /api/user/profile**
```typescript
Response: {
  id: string;
  email: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  role: string;
  plan: 'free' | 'student_pro' | 'pro_plus';
  plan_expires_at: string | null;
  locale: string;
  created_at: string;
}
```

**PATCH /api/user/profile**
```typescript
Request: {
  full_name?: string;
  username?: string;
  avatar_url?: string;
  locale?: string;
}

Response: {
  success: boolean;
  profile?: UserProfile;
  error?: string;
}
```

**POST /api/auth/forgot-password**
```typescript
Request: {
  email: string;
}

Response: {
  success: boolean;
  message: string; // Always returns success to prevent email enumeration
}
```

**POST /api/auth/reset-password**
```typescript
Request: {
  token: string;
  password: string;
}

Response: {
  success: boolean;
  error?: string;
}
```

## Data Models

### User Profile Type

```typescript
interface UserProfile {
  id: string;
  auth_user_id: string;
  email: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  role: 'user' | 'admin';
  plan: 'free' | 'student_pro' | 'pro_plus';
  plan_expires_at: string | null;
  locale: string;
  created_at: string;
}
```

### Session Type

```typescript
interface Session {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  user: {
    id: string;
    email: string;
  };
}
```

### Password Reset Token (New Table)

```sql
CREATE TABLE IF NOT EXISTS public.password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_password_reset_tokens_user_id ON public.password_reset_tokens(user_id);
CREATE INDEX idx_password_reset_tokens_token_hash ON public.password_reset_tokens(token_hash);
CREATE INDEX idx_password_reset_tokens_expires_at ON public.password_reset_tokens(expires_at);
```

```typescript
interface PasswordResetToken {
  id: string;
  user_id: string;
  token_hash: string;
  expires_at: string;
  used_at: string | null;
  created_at: string;
}
```

## Authentication Flow

### Signup Flow (Email/Password)

1. User fills out signup form
2. Client-side validation runs
3. Form submits to `/api/auth/signup`
4. API route calls `supabase.auth.signUp({ email, password, options: { emailRedirectTo: null } })`
5. Supabase creates `auth.users` record (no email confirmation required)
6. Database trigger creates `public.users` profile record
7. API sends welcome email via Resend (non-blocking)
8. API returns success
9. Success Orb displays
10. User redirected to dashboard (immediate access)

### Signup Flow (Google OAuth)

1. User clicks "Sign up with Google"
2. Client calls `supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: '/api/auth/callback' } })`
3. User redirected to Google consent screen
4. User authorizes application
5. Google redirects to `/api/auth/callback` with code
6. Supabase exchanges code for session
7. Supabase creates `auth.users` record with Google identity
8. Database trigger creates `public.users` profile record
9. Callback route sends welcome email via Resend (non-blocking)
10. User redirected to dashboard

### Login Flow (Email/Password)

1. User fills out login form
2. Client-side validation runs
3. Form submits to `/api/auth/login`
4. API route calls `supabase.auth.signInWithPassword()`
5. Supabase validates credentials and creates session
6. Session stored in HTTP-only cookies
7. API fetches user profile from `public.users`
8. API returns success with user data
9. User redirected to dashboard

### Login Flow (Google OAuth)

1. User clicks "Sign in with Google"
2. Client calls `supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: '/api/auth/callback' } })`
3. User redirected to Google consent screen
4. User authorizes application
5. Google redirects to `/api/auth/callback` with code
6. Supabase exchanges code for session
7. Session stored in HTTP-only cookies
8. User redirected to dashboard

### Session Refresh Flow

1. Middleware intercepts request
2. Checks if session exists in cookies
3. If session near expiration, calls `supabase.auth.refreshSession()`
4. Updates cookies with new tokens
5. Request proceeds

### Logout Flow

1. User clicks logout
2. Request sent to `/api/auth/logout`
3. API calls `supabase.auth.signOut()`
4. Cookies cleared
5. User redirected to login

### Password Reset Flow

1. User clicks "Forgot password?" on login page
2. User enters email on forgot password page
3. Form submits to `/api/auth/forgot-password`
4. API generates secure reset token (JWT with 1-hour expiration)
5. API stores token hash in database (new table: password_reset_tokens)
6. API sends password reset email via Resend with reset link
7. User clicks link in email (redirects to `/reset-password?token=...`)
8. User enters new password
9. Form submits to `/api/auth/reset-password`
10. API validates token (not expired, not used)
11. API calls `supabase.auth.updateUser({ password: newPassword })`
12. API marks token as used
13. Success Orb displays
14. User redirected to login

## Error Handling

### Error Types

```typescript
enum AuthErrorCode {
  INVALID_CREDENTIALS = 'invalid_credentials',
  EMAIL_EXISTS = 'email_exists',
  WEAK_PASSWORD = 'weak_password',
  INVALID_EMAIL = 'invalid_email',
  USERNAME_TAKEN = 'username_taken',
  SESSION_EXPIRED = 'session_expired',
  NETWORK_ERROR = 'network_error',
  UNKNOWN_ERROR = 'unknown_error',
}
```

### Error Handling Strategy

1. **Client-side validation:** Catch errors before API calls
2. **API error responses:** Return structured error objects
3. **User-friendly messages:** Translate technical errors to readable messages
4. **Error Orb display:** Show Error Orb with appropriate message
5. **Logging:** Log errors to console (dev) and monitoring service (prod)

### Error Message Mapping

```typescript
const errorMessages: Record<AuthErrorCode, string> = {
  invalid_credentials: 'Invalid email or password. Please try again.',
  email_exists: 'An account with this email already exists.',
  weak_password: 'Password must be at least 8 characters long.',
  invalid_email: 'Please enter a valid email address.',
  username_taken: 'This username is already taken.',
  session_expired: 'Your session has expired. Please log in again.',
  network_error: 'Network error. Please check your connection.',
  unknown_error: 'Something went wrong. Please try again.',
};
```

## Testing Strategy

### Unit Tests

- Validation functions (email, password, username)
- Error message mapping
- Orb pose selection logic
- Type guards and utilities

### Integration Tests

- Signup flow (mock Supabase)
- Login flow (mock Supabase)
- Profile update flow
- Session refresh logic

### E2E Tests (Future)

- Complete signup → login → profile update flow
- Error handling scenarios
- Session persistence across page refreshes

### Manual Testing Checklist

- [ ] Signup with valid email/password
- [ ] Signup with Google OAuth
- [ ] Signup with duplicate email
- [ ] Signup with weak password
- [ ] Welcome email received after signup
- [ ] Login with valid email/password credentials
- [ ] Login with Google OAuth
- [ ] Login with invalid credentials
- [ ] Google OAuth cancellation handling
- [ ] Forgot password flow
- [ ] Password reset email received
- [ ] Password reset with valid token
- [ ] Password reset with expired token
- [ ] Password reset with used token
- [ ] Profile update with valid data
- [ ] Profile update with duplicate username
- [ ] Session persistence after refresh
- [ ] Logout functionality
- [ ] Orb displays correctly in all states
- [ ] Email templates render correctly
- [ ] Accessibility (keyboard navigation, screen readers)
- [ ] Reduced motion preference respected

## Security Considerations

1. **Password Security:**
   - Minimum 8 characters enforced
   - Supabase handles hashing (bcrypt)
   - Never log or expose passwords

2. **Session Security:**
   - HTTP-only cookies prevent XSS attacks
   - Secure flag in production (HTTPS only)
   - SameSite=Lax prevents CSRF

3. **API Security:**
   - All protected routes verify session
   - Rate limiting on auth endpoints (future)
   - Input validation on all endpoints

4. **Data Privacy:**
   - Email addresses stored securely
   - User data isolated by RLS policies
   - No sensitive data in client-side code

## Performance Considerations

1. **Orb Images:**
   - WebP format for smaller file sizes
   - Lazy load non-critical poses
   - Preload critical poses (welcome, processing)
   - Responsive images for different screen sizes

2. **Code Splitting:**
   - Auth components loaded only on auth pages
   - Profile components loaded only on profile pages
   - Supabase client code split by usage (client vs server)

3. **Server Components:**
   - Use RSC for static content
   - Minimize client-side JavaScript
   - Stream content where possible

4. **Caching:**
   - Cache user profile data in memory (short TTL)
   - Revalidate on mutations
   - Use SWR pattern for profile fetching

## Accessibility

1. **Keyboard Navigation:**
   - All forms fully keyboard accessible
   - Logical tab order
   - Focus indicators visible

2. **Screen Readers:**
   - Semantic HTML elements
   - ARIA labels where needed
   - Alt text for all Orb images
   - Error messages announced

3. **Visual:**
   - High contrast (≥4.5:1) for dark mode
   - Focus indicators
   - Error states clearly visible

4. **Motion:**
   - Respect `prefers-reduced-motion`
   - No auto-playing animations
   - Orb transitions subtle

## Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon-key]

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Resend
RESEND_API_KEY=[resend-api-key]

# Email
EMAIL_FROM=noreply@sappio.app
EMAIL_FROM_NAME=Sappio

# Note: Supabase Auth Configuration
# - Email confirmation is DISABLED in Supabase Dashboard
# - Authentication > Settings > Enable email confirmations = OFF
# - Google OAuth credentials configured in Authentication > Providers > Google
#   - Client ID and Client Secret from Google Cloud Console
#   - Authorized redirect URI: https://[project-ref].supabase.co/auth/v1/callback
```

## Database Triggers (Already Exists)

The database should have a trigger that automatically creates a `public.users` record when an `auth.users` record is created. If not present, we'll need to create it:

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (auth_user_id, email, role, plan, locale)
  VALUES (NEW.id, NEW.email, 'user', 'free', 'en');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

## Next Steps After Phase 1

Once Phase 1 is complete, the following will be ready:
- Users can sign up and log in
- Sessions persist across refreshes
- Users can manage their profiles
- Protected routes are secured
- Orb avatar system is established
- Foundation ready for Phase 2 (Material Upload & Processing)
