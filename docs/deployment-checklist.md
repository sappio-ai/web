# Deployment Checklist - Study Pack Creation Feature

## Pre-Deployment Checklist

### 1. Supabase Storage Configuration

#### Create Materials Bucket

```sql
-- Check if bucket exists
SELECT * FROM storage.buckets WHERE id = 'materials';
```

If not exists, create via Supabase Dashboard:

1. Go to **Storage** in Supabase Dashboard
2. Click **New bucket**
3. Settings:
   - **Name:** `materials`
   - **Public:** `false` (private)
   - **File size limit:** `52428800` (50MB)
   - **Allowed MIME types:** Leave empty (validated in application)

#### Verify RLS Policies

```sql
-- Check RLS policies for storage
SELECT * FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
AND policyname LIKE '%materials%';
```

Expected policies:
- ✅ `materials_upload_policy` - Users can upload their own files
- ✅ `materials_read_policy` - Users can read their own files
- ✅ `materials_update_policy` - Users can update their own files
- ✅ `materials_delete_policy` - Users can delete their own files

If missing, run migration:
```bash
# Already applied in development
# Migration: setup_materials_storage_rls_policies
```

#### Configure CORS (if needed)

If accessing storage from different domain:

1. Go to **Storage** → **Configuration** → **CORS**
2. Add allowed origins:
   ```
   https://your-production-domain.com
   ```

---

### 2. Database Verification

#### Check All Tables Exist

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'materials', 'chunks', 'study_packs', 
  'flashcards', 'quizzes', 'quiz_items',
  'mindmaps', 'mindmap_nodes', 'events',
  'plan_limits', 'usage_counters', 'usage_idempotency'
)
ORDER BY table_name;
```

Expected: 12 tables

#### Check All Indexes Exist

```sql
SELECT tablename, indexname 
FROM pg_indexes 
WHERE schemaname = 'public' 
AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;
```

Expected: 15+ indexes

#### Check pgvector Extension

```sql
SELECT * FROM pg_extension WHERE extname = 'vector';
```

Expected: vector v0.8.0 or higher

#### Verify RLS Policies

```sql
SELECT schemaname, tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

Expected policies for:
- materials (4 policies: SELECT, INSERT, UPDATE, DELETE)
- chunks (2 policies: SELECT, INSERT)
- study_packs (4 policies)
- flashcards (4 policies)
- quizzes (4 policies)
- quiz_items (4 policies)
- mindmaps (4 policies)
- mindmap_nodes (4 policies)

---

### 3. Environment Variables

#### Production Environment Variables

Set these in your deployment platform (Vercel, etc.):

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-prod-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_prod_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_prod_service_role_key

# App
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Resend
RESEND_API_KEY=your_prod_resend_key
EMAIL_FROM=noreply@your-domain.com
EMAIL_FROM_NAME=Sappio

# OpenAI
OPENAI_API_KEY=your_prod_openai_key
OPENAI_ORG_ID=your_org_id

# Storage
SUPABASE_STORAGE_BUCKET=materials

# Inngest
INNGEST_EVENT_KEY=your_prod_event_key
INNGEST_SIGNING_KEY=your_prod_signing_key
```

#### Verify Environment Variables

After deployment, check:

```bash
# In your deployment platform's console
echo $NEXT_PUBLIC_SUPABASE_URL
echo $OPENAI_API_KEY
# etc.
```

---

### 4. API Endpoints Testing

Test all endpoints in production:

#### Upload Material
```bash
curl -X POST https://your-domain.com/api/materials/upload \
  -H "Cookie: sb-access-token=..." \
  -F "file=@test.pdf"
```

#### Submit URL
```bash
curl -X POST https://your-domain.com/api/materials/url \
  -H "Cookie: sb-access-token=..." \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com", "type": "url"}'
```

#### Get Status
```bash
curl https://your-domain.com/api/materials/{id}/status \
  -H "Cookie: sb-access-token=..."
```

#### Get Study Pack
```bash
curl https://your-domain.com/api/study-packs/{id} \
  -H "Cookie: sb-access-token=..."
```

#### Delete Study Pack
```bash
curl -X DELETE https://your-domain.com/api/study-packs/{id} \
  -H "Cookie: sb-access-token=..."
```

---

### 5. Inngest Configuration

#### Development Setup

```bash
# Install Inngest CLI
npm install -g inngest-cli

# Run dev server
inngest dev
```

#### Production Setup

1. Sign up at [Inngest](https://www.inngest.com)
2. Create a new app
3. Get event key and signing key
4. Add to environment variables
5. Deploy your app
6. Verify webhook endpoint: `https://your-domain.com/api/inngest`

#### Verify Inngest Functions

Check functions are registered:
- `generate-pack` - Study pack generation
- `process-material` - Material processing

---

### 6. OpenAI API Setup

#### Verify API Key

```bash
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

#### Set Usage Limits

1. Go to [OpenAI Platform](https://platform.openai.com)
2. Settings → Limits
3. Set monthly budget (recommended: $100-500 depending on usage)
4. Set up email alerts at 50%, 75%, 90%

#### Monitor Costs

Check usage regularly:
- Dashboard → Usage
- Set up cost alerts
- Monitor per-endpoint costs

---

### 7. Monitoring & Alerts

#### Error Tracking

Option 1: Use built-in ErrorLogger
```typescript
// Already implemented
await ErrorLogger.logError(...)
```

Option 2: Add Sentry (recommended for production)

```bash
npm install @sentry/nextjs
```

```typescript
// sentry.client.config.ts
import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  environment: process.env.NODE_ENV,
})
```

#### Performance Monitoring

Monitor these metrics:
- Pack generation time (target: <60s)
- API response times
- Database query performance
- Storage upload/download speeds

#### Set Up Alerts

Create alerts for:
- Error rate > 5%
- Pack generation time > 180s
- API response time > 5s
- OpenAI API errors
- Storage quota > 80%

---

### 8. Security Checklist

#### API Security

- ✅ All endpoints require authentication
- ✅ RLS policies enforce data access
- ✅ File upload validation (type, size)
- ✅ Rate limiting via plan quotas
- ✅ Service role key not exposed to client

#### Storage Security

- ✅ Bucket is private
- ✅ RLS policies control access
- ✅ File size limits enforced
- ✅ MIME type validation

#### Secrets Management

- ✅ No secrets in git
- ✅ Environment variables encrypted
- ✅ Different keys for dev/prod
- ✅ API keys rotated regularly

---

### 9. Performance Optimization

#### Database

- ✅ All indexes created
- ✅ RLS policies optimized
- ✅ Connection pooling enabled

#### Caching

- ✅ Study pack responses cached (5 min)
- ✅ Material status cached (10 sec)
- ✅ Plan limits cached (5 min)

#### API

- ✅ Embedding generation batched (100/call)
- ✅ GPT-4o-mini used for cost efficiency
- ✅ Parallel generation (notes, cards, quiz, map)

---

### 10. Backup & Recovery

#### Database Backups

Supabase Pro includes:
- Daily backups (7 days retention)
- Point-in-time recovery

Enable in: Dashboard → Settings → Backups

#### Storage Backups

Consider:
- Regular exports of materials bucket
- Backup to S3 or similar
- Document recovery procedures

---

## Post-Deployment Verification

### Smoke Tests

1. **User Registration**
   - Create new account
   - Verify email works
   - Login successful

2. **Pack Creation - PDF**
   - Upload PDF file
   - Wait for processing
   - Verify pack generated
   - Check all content (notes, cards, quiz, map)

3. **Pack Creation - URL**
   - Submit URL
   - Wait for processing
   - Verify pack generated

4. **Pack Creation - YouTube**
   - Submit YouTube URL
   - Wait for processing
   - Verify transcript extracted
   - Verify pack generated

5. **Pack Deletion**
   - Delete a pack
   - Verify database cleaned up
   - Verify storage file deleted

6. **Quota Limits**
   - Create packs until limit
   - Verify warning at 80%
   - Verify block at 100%
   - Verify grace window works

### Load Testing

Test with realistic load:
- 10 concurrent uploads
- 100 status polls/second
- 50 pack retrievals/second

Monitor:
- Response times
- Error rates
- Database connections
- Memory usage

---

## Rollback Plan

If issues occur:

1. **Revert deployment**
   ```bash
   # Vercel
   vercel rollback
   ```

2. **Database rollback**
   - Use Supabase point-in-time recovery
   - Or restore from backup

3. **Notify users**
   - Status page update
   - Email notification if needed

---

## Maintenance

### Weekly

- Check error logs
- Review OpenAI costs
- Monitor storage usage
- Check performance metrics

### Monthly

- Review and optimize slow queries
- Clean up old events (>1 year)
- Rotate API keys
- Update dependencies

### Quarterly

- Security audit
- Performance review
- Cost optimization
- Feature usage analysis

---

## Support Contacts

- **Supabase Support:** support@supabase.com
- **OpenAI Support:** support@openai.com
- **Inngest Support:** support@inngest.com
- **Resend Support:** support@resend.com

---

## Deployment Complete! 🎉

Once all items are checked:
- ✅ Storage configured
- ✅ Database verified
- ✅ Environment variables set
- ✅ APIs tested
- ✅ Monitoring enabled
- ✅ Smoke tests passed

Your Study Pack Creation feature is ready for production!
