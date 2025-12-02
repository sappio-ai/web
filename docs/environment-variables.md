# Environment Variables Documentation

## Overview

This document describes all environment variables required for Sappio V2. Variables are categorized by service and feature.

## Quick Start

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in the required values (see sections below)

3. Restart your development server

---

## Required Variables

### Supabase (Database & Auth)

#### `NEXT_PUBLIC_SUPABASE_URL`
- **Required:** Yes
- **Type:** Public
- **Description:** Your Supabase project URL
- **Example:** `https://abcdefghijklmnop.supabase.co`
- **How to get:**
  1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
  2. Select your project
  3. Go to Settings → API
  4. Copy "Project URL"

#### `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Required:** Yes
- **Type:** Public
- **Description:** Supabase anonymous/public API key
- **Example:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **How to get:**
  1. Go to Supabase Dashboard → Settings → API
  2. Copy "anon public" key
- **Security:** Safe to expose in client-side code (respects RLS policies)

#### `SUPABASE_SERVICE_ROLE_KEY`
- **Required:** Yes
- **Type:** Secret (Server-only)
- **Description:** Supabase service role key (bypasses RLS)
- **Example:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **How to get:**
  1. Go to Supabase Dashboard → Settings → API
  2. Copy "service_role" key
- **Security:** ⚠️ **NEVER expose this in client-side code!** Only use server-side.
- **Used for:** Background jobs, admin operations, bypassing RLS

---

### Application

#### `NEXT_PUBLIC_APP_URL`
- **Required:** Yes
- **Type:** Public
- **Description:** Base URL of your application
- **Development:** `http://localhost:3000`
- **Production:** `https://your-domain.com`
- **Used for:** Email links, redirects, OAuth callbacks

---

### Email (Resend)

#### `RESEND_API_KEY`
- **Required:** Yes (for email features)
- **Type:** Secret
- **Description:** Resend API key for sending emails
- **Example:** `re_123456789abcdefghijklmnop`
- **How to get:**
  1. Sign up at [Resend](https://resend.com)
  2. Go to API Keys
  3. Create a new API key
- **Used for:** Password reset emails, notifications

#### `EMAIL_FROM`
- **Required:** Yes (for email features)
- **Type:** Configuration
- **Description:** Sender email address
- **Example:** `noreply@sappio.app`
- **Requirements:**
  - Must be a verified domain in Resend
  - Use a no-reply address for transactional emails

#### `EMAIL_FROM_NAME`
- **Required:** No
- **Type:** Configuration
- **Description:** Sender display name
- **Default:** `Sappio`
- **Example:** `Sappio - AI Study Assistant`

---

### OpenAI (AI Features)

#### `OPENAI_API_KEY`
- **Required:** Yes (for study pack generation)
- **Type:** Secret
- **Description:** OpenAI API key for GPT-4 and embeddings
- **Example:** `sk-proj-abc123...`
- **How to get:**
  1. Sign up at [OpenAI Platform](https://platform.openai.com)
  2. Go to API Keys
  3. Create a new secret key
- **Used for:**
  - Smart notes generation (GPT-4o-mini)
  - Flashcard generation (GPT-4o-mini)
  - Quiz generation (GPT-4o-mini)
  - Mind map generation (GPT-4o-mini)
  - Text embeddings (text-embedding-3-small)
- **Cost:** Pay-per-use (see [OpenAI Pricing](https://openai.com/pricing))

#### `OPENAI_ORG_ID`
- **Required:** No
- **Type:** Secret
- **Description:** OpenAI organization ID (for organization accounts)
- **Example:** `org-abc123...`
- **How to get:**
  1. Go to OpenAI Platform → Settings → Organization
  2. Copy Organization ID
- **When needed:** Only if you have an organization account

---

### Storage

#### `SUPABASE_STORAGE_BUCKET`
- **Required:** Yes (for file uploads)
- **Type:** Configuration
- **Description:** Name of the Supabase Storage bucket for materials
- **Default:** `materials`
- **Example:** `materials`
- **Setup:**
  1. Go to Supabase Dashboard → Storage
  2. Create a bucket named `materials`
  3. Set to private (RLS policies handle access)
  4. Set file size limit to 50MB

---

### Inngest (Background Jobs)

#### `INNGEST_EVENT_KEY`
- **Required:** No (development), Yes (production)
- **Type:** Secret
- **Description:** Inngest event key for sending events
- **Example:** `test` (development) or actual key (production)
- **How to get:**
  1. Sign up at [Inngest](https://www.inngest.com)
  2. Create a new app
  3. Copy the event key
- **Development:** Use `test` for local development with Inngest Dev Server
- **Production:** Use actual event key from Inngest dashboard

#### `INNGEST_SIGNING_KEY`
- **Required:** No (development), Yes (production)
- **Type:** Secret
- **Description:** Inngest signing key for webhook verification
- **Example:** `signkey-prod-abc123...`
- **How to get:**
  1. Go to Inngest Dashboard → Settings → Keys
  2. Copy the signing key
- **Development:** Not needed with Inngest Dev Server
- **Production:** Required for webhook security

---

## Optional Variables

### Development

#### `NODE_ENV`
- **Type:** System
- **Description:** Node environment
- **Values:** `development`, `production`, `test`
- **Default:** `development`
- **Set by:** Next.js automatically

#### `PORT`
- **Type:** Configuration
- **Description:** Port for development server
- **Default:** `3000`
- **Example:** `PORT=3001 npm run dev`

---

## Environment-Specific Setup

### Development (.env.local)

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Resend
RESEND_API_KEY=re_your_test_key
EMAIL_FROM=noreply@sappio.app
EMAIL_FROM_NAME=Sappio

# OpenAI
OPENAI_API_KEY=sk-proj-your_key
OPENAI_ORG_ID=org-your_org_id

# Storage
SUPABASE_STORAGE_BUCKET=materials

# Inngest (use 'test' for local dev)
INNGEST_EVENT_KEY=test
```

### Production (Vercel/Platform)

Set these in your deployment platform's environment variables:

1. **Vercel:**
   - Go to Project Settings → Environment Variables
   - Add each variable
   - Select "Production" environment

2. **Other platforms:**
   - Follow platform-specific instructions
   - Ensure secrets are encrypted
   - Never commit production values to git

---

## Security Best Practices

### ✅ DO:
- Use `.env.local` for local development (gitignored)
- Store production secrets in your deployment platform
- Rotate API keys regularly
- Use different keys for development and production
- Limit OpenAI API key permissions if possible

### ❌ DON'T:
- Commit `.env.local` or `.env.production` to git
- Share API keys in public channels
- Use production keys in development
- Expose `SUPABASE_SERVICE_ROLE_KEY` in client code
- Hard-code secrets in source code

---

## Verification

### Check Required Variables

Run this command to verify all required variables are set:

```bash
npm run check-env
```

(Note: This script needs to be created)

### Manual Verification

```bash
# Check if variables are loaded
node -e "console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)"
```

---

## Troubleshooting

### "Supabase client error"
- **Cause:** Missing or invalid Supabase credentials
- **Fix:** Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### "OpenAI API error"
- **Cause:** Missing or invalid OpenAI API key
- **Fix:** Verify `OPENAI_API_KEY` is set and valid
- **Check:** Ensure you have credits in your OpenAI account

### "Storage upload failed"
- **Cause:** Storage bucket not configured
- **Fix:** 
  1. Create `materials` bucket in Supabase
  2. Set `SUPABASE_STORAGE_BUCKET=materials`
  3. Configure RLS policies (see docs/supabase-storage-setup.md)

### "Email sending failed"
- **Cause:** Missing or invalid Resend API key
- **Fix:** Verify `RESEND_API_KEY` and `EMAIL_FROM`
- **Check:** Ensure domain is verified in Resend

### "Background jobs not running"
- **Cause:** Inngest not configured
- **Fix (Development):** 
  1. Run `npx inngest-cli@latest dev`
  2. Set `INNGEST_EVENT_KEY=test`
- **Fix (Production):**
  1. Set up Inngest app
  2. Add `INNGEST_EVENT_KEY` and `INNGEST_SIGNING_KEY`

---

## Cost Estimates

### OpenAI API (per study pack)

**Assumptions:**
- 50-page document
- ~20 chunks
- 1 pack generation

**Costs:**
- Embeddings: ~$0.0003 (20 chunks × $0.00002/1K tokens)
- Smart Notes: ~$0.002 (GPT-4o-mini)
- Flashcards: ~$0.003 (GPT-4o-mini)
- Quiz: ~$0.002 (GPT-4o-mini)
- Mind Map: ~$0.002 (GPT-4o-mini)

**Total per pack:** ~$0.01 (1 cent)

**Monthly estimates:**
- Free plan (3 packs): ~$0.03/month
- Student Pro (300 packs): ~$3/month
- Pro+ (1000 packs): ~$10/month

### Supabase

- **Free tier:** 500MB database, 1GB storage, 2GB bandwidth
- **Pro tier:** $25/month (8GB database, 100GB storage, 250GB bandwidth)

### Resend

- **Free tier:** 100 emails/day, 3,000 emails/month
- **Pro tier:** $20/month (50,000 emails/month)

### Inngest

- **Free tier:** 50,000 function runs/month
- **Pro tier:** $20/month (1M function runs/month)

---

## Support

For environment setup help:
- Email: support@sappio.com
- Documentation: https://docs.sappio.com
- Discord: https://discord.gg/sappio
