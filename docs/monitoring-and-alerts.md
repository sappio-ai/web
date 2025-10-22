# Monitoring and Alerts Setup

## Overview

This document describes how to set up monitoring and alerts for the Study Pack Creation feature to ensure reliability, performance, and cost control.

---

## 1. Built-in Monitoring (Already Implemented)

### Error Logging

The `ErrorLogger` service automatically logs all errors to the `events` table.

**What's logged:**
- Error type and code
- User ID
- Material ID / Study Pack ID
- Error message and stack trace
- Timestamp

**Query errors:**
```sql
SELECT * FROM events 
WHERE event = 'error_occurred' 
ORDER BY created_at DESC 
LIMIT 100;
```

**Error rate monitoring:**
```typescript
import { ErrorLogger } from '@/lib/services/ErrorLogger'

// Get error count in last hour
const errorCount = await ErrorLogger.getErrorRate()

// Check if error rate is high (>5%)
const isHigh = await ErrorLogger.isErrorRateHigh()
```

### Usage Tracking

The `UsageService` logs pack creation events.

**Query pack creation events:**
```sql
SELECT 
  user_id,
  props_json->>'materialKind' as material_kind,
  props_json->>'generationTime' as generation_time_ms,
  created_at
FROM events 
WHERE event = 'pack_created' 
ORDER BY created_at DESC;
```

**Analytics queries:**
```sql
-- Packs created per day
SELECT 
  DATE(created_at) as date,
  COUNT(*) as packs_created
FROM events 
WHERE event = 'pack_created'
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- Average generation time
SELECT 
  AVG((props_json->>'generationTime')::int) as avg_time_ms,
  AVG((props_json->>'generationTime')::int) / 1000 as avg_time_seconds
FROM events 
WHERE event = 'pack_created';

-- Packs by material type
SELECT 
  props_json->>'materialKind' as material_kind,
  COUNT(*) as count
FROM events 
WHERE event = 'pack_created'
GROUP BY material_kind
ORDER BY count DESC;
```

---

## 2. Supabase Dashboard Monitoring

### Database Metrics

Go to **Dashboard → Database → Reports**

Monitor:
- **Database size** - Track growth over time
- **Active connections** - Should stay under limit
- **Query performance** - Identify slow queries
- **Table sizes** - Monitor largest tables

### Storage Metrics

Go to **Dashboard → Storage**

Monitor:
- **Storage used** - Track file uploads
- **Bandwidth** - Monitor download traffic
- **File count** - Number of materials stored

### API Metrics

Go to **Dashboard → API → Logs**

Monitor:
- **Request count** - API usage
- **Error rate** - Failed requests
- **Response times** - Performance

---

## 3. Application Performance Monitoring (APM)

### Option 1: Vercel Analytics (Recommended for Vercel deployments)

**Setup:**
```bash
npm install @vercel/analytics
```

```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

**Metrics tracked:**
- Page views
- Web Vitals (LCP, FID, CLS)
- API route performance
- Error rates

### Option 2: Sentry (Recommended for error tracking)

**Setup:**
```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

**Configuration:**
```typescript
// sentry.client.config.ts
import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  environment: process.env.NODE_ENV,
  
  // Capture errors from specific services
  beforeSend(event, hint) {
    // Add custom context
    if (event.tags) {
      event.tags.feature = 'study-pack-creation'
    }
    return event
  },
})
```

**Track custom events:**
```typescript
import * as Sentry from "@sentry/nextjs"

// Track pack generation
Sentry.addBreadcrumb({
  category: 'pack-generation',
  message: 'Starting pack generation',
  level: 'info',
  data: { materialId, userId }
})

// Capture errors
try {
  await generatePack()
} catch (error) {
  Sentry.captureException(error, {
    tags: {
      feature: 'pack-generation',
      materialId,
    }
  })
}
```

### Option 3: Custom Logging Service

Create a monitoring dashboard using the events table:

```typescript
// lib/services/MonitoringService.ts
export class MonitoringService {
  static async getMetrics(timeRange: '1h' | '24h' | '7d' | '30d') {
    const supabase = createServiceRoleClient()
    
    const since = {
      '1h': new Date(Date.now() - 60 * 60 * 1000),
      '24h': new Date(Date.now() - 24 * 60 * 60 * 1000),
      '7d': new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      '30d': new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    }[timeRange]
    
    // Get pack creation count
    const { count: packCount } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true })
      .eq('event', 'pack_created')
      .gte('created_at', since.toISOString())
    
    // Get error count
    const { count: errorCount } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true })
      .eq('event', 'error_occurred')
      .gte('created_at', since.toISOString())
    
    // Get average generation time
    const { data: genTimes } = await supabase
      .from('events')
      .select('props_json')
      .eq('event', 'pack_created')
      .gte('created_at', since.toISOString())
    
    const avgGenTime = genTimes?.reduce((sum, e) => 
      sum + (e.props_json?.generationTime || 0), 0
    ) / (genTimes?.length || 1)
    
    return {
      packCount: packCount || 0,
      errorCount: errorCount || 0,
      errorRate: (errorCount || 0) / (packCount || 1),
      avgGenerationTime: avgGenTime,
    }
  }
}
```

---

## 4. Alert Configuration

### Critical Alerts (Immediate Action Required)

#### 1. High Error Rate (>5%)

**Check:**
```typescript
const isHigh = await ErrorLogger.isErrorRateHigh()
if (isHigh) {
  // Send alert
}
```

**Alert channels:**
- Email to dev team
- Slack notification
- PagerDuty (if using)

**Implementation:**
```typescript
// lib/services/AlertService.ts
export class AlertService {
  static async checkAndAlert() {
    const isHigh = await ErrorLogger.isErrorRateHigh()
    
    if (isHigh) {
      await this.sendAlert({
        severity: 'critical',
        title: 'High Error Rate Detected',
        message: 'Error rate exceeded 5% in the last hour',
        action: 'Check error logs immediately',
      })
    }
  }
  
  static async sendAlert(alert: Alert) {
    // Send email via Resend
    await resend.emails.send({
      from: 'alerts@sappio.com',
      to: 'dev-team@sappio.com',
      subject: `[${alert.severity.toUpperCase()}] ${alert.title}`,
      html: `
        <h2>${alert.title}</h2>
        <p>${alert.message}</p>
        <p><strong>Action:</strong> ${alert.action}</p>
      `
    })
    
    // Send to Slack (if configured)
    if (process.env.SLACK_WEBHOOK_URL) {
      await fetch(process.env.SLACK_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `🚨 ${alert.title}`,
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `*${alert.title}*\n${alert.message}\n\n*Action:* ${alert.action}`
              }
            }
          ]
        })
      })
    }
  }
}
```

**Cron job (run every 5 minutes):**
```typescript
// app/api/cron/check-alerts/route.ts
export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }
  
  await AlertService.checkAndAlert()
  
  return Response.json({ success: true })
}
```

#### 2. Slow Pack Generation (>180s)

**Monitor in Inngest:**
```typescript
// In generate-pack function
const startTime = Date.now()

// ... generation logic ...

const duration = Date.now() - startTime
if (duration > 180000) { // 3 minutes
  await AlertService.sendAlert({
    severity: 'warning',
    title: 'Slow Pack Generation',
    message: `Pack generation took ${duration/1000}s (>180s threshold)`,
    action: 'Investigate performance bottleneck',
  })
}
```

#### 3. OpenAI API Failures

**Monitor API calls:**
```typescript
// In openai.ts
export async function generateChatCompletion(...) {
  try {
    const response = await openai.chat.completions.create(...)
    return response
  } catch (error) {
    // Log error
    await ErrorLogger.logError({
      errorType: 'ai_api_error',
      errorCode: 'AI_API_ERROR',
      errorMessage: error.message,
    })
    
    // Check if multiple failures
    const recentErrors = await ErrorLogger.getErrorRate()
    if (recentErrors > 10) {
      await AlertService.sendAlert({
        severity: 'critical',
        title: 'OpenAI API Failures',
        message: `${recentErrors} OpenAI API errors in last hour`,
        action: 'Check OpenAI status and API key',
      })
    }
    
    throw error
  }
}
```

### Warning Alerts (Monitor Closely)

#### 1. High Storage Usage (>80%)

**Check Supabase storage:**
```typescript
const { data } = await supabase.storage.getBucket('materials')
const usagePercent = (data.file_size_limit_used / data.file_size_limit) * 100

if (usagePercent > 80) {
  await AlertService.sendAlert({
    severity: 'warning',
    title: 'High Storage Usage',
    message: `Storage is ${usagePercent.toFixed(1)}% full`,
    action: 'Consider upgrading storage or cleaning old files',
  })
}
```

#### 2. High OpenAI Costs

**Monitor daily costs:**
```typescript
// Track costs in events
const { data: todayPacks } = await supabase
  .from('events')
  .select('props_json')
  .eq('event', 'pack_created')
  .gte('created_at', new Date().setHours(0,0,0,0))

const estimatedCost = todayPacks.length * 0.01 // $0.01 per pack

if (estimatedCost > 50) { // $50/day threshold
  await AlertService.sendAlert({
    severity: 'warning',
    title: 'High OpenAI Costs',
    message: `Estimated cost today: $${estimatedCost.toFixed(2)}`,
    action: 'Review usage patterns',
  })
}
```

---

## 5. Dashboard Setup

### Create Admin Monitoring Dashboard

```typescript
// app/admin/monitoring/page.tsx
export default async function MonitoringPage() {
  const metrics = await MonitoringService.getMetrics('24h')
  
  return (
    <div>
      <h1>System Monitoring</h1>
      
      <div className="grid grid-cols-4 gap-4">
        <MetricCard
          title="Packs Created (24h)"
          value={metrics.packCount}
          trend="+12%"
        />
        
        <MetricCard
          title="Error Rate"
          value={`${(metrics.errorRate * 100).toFixed(2)}%`}
          alert={metrics.errorRate > 0.05}
        />
        
        <MetricCard
          title="Avg Generation Time"
          value={`${(metrics.avgGenerationTime / 1000).toFixed(1)}s`}
          alert={metrics.avgGenerationTime > 60000}
        />
        
        <MetricCard
          title="Active Users"
          value={metrics.activeUsers}
        />
      </div>
      
      <ErrorLogTable />
      <PerformanceChart />
    </div>
  )
}
```

---

## 6. Monitoring Checklist

### Daily Checks

- [ ] Error rate < 5%
- [ ] Average generation time < 60s
- [ ] No critical alerts
- [ ] OpenAI API working
- [ ] Storage usage normal

### Weekly Checks

- [ ] Review error logs
- [ ] Check slow queries
- [ ] Monitor OpenAI costs
- [ ] Review user feedback
- [ ] Check storage growth

### Monthly Checks

- [ ] Performance trends
- [ ] Cost optimization
- [ ] Security audit
- [ ] Capacity planning
- [ ] Update dependencies

---

## 7. Incident Response

### When Alert Fires

1. **Acknowledge** - Confirm you've seen the alert
2. **Assess** - Check severity and impact
3. **Investigate** - Review logs and metrics
4. **Fix** - Apply hotfix or rollback
5. **Monitor** - Verify fix worked
6. **Document** - Write post-mortem

### Escalation Path

1. **Level 1:** On-call developer
2. **Level 2:** Tech lead
3. **Level 3:** CTO/Engineering manager

---

## 8. Useful Queries

### Performance Analysis

```sql
-- Slowest pack generations
SELECT 
  props_json->>'materialId' as material_id,
  props_json->>'materialKind' as kind,
  (props_json->>'generationTime')::int / 1000 as seconds,
  created_at
FROM events 
WHERE event = 'pack_created'
ORDER BY (props_json->>'generationTime')::int DESC
LIMIT 20;

-- Error breakdown by type
SELECT 
  props_json->>'errorType' as error_type,
  props_json->>'errorCode' as error_code,
  COUNT(*) as count
FROM events 
WHERE event = 'error_occurred'
AND created_at > NOW() - INTERVAL '24 hours'
GROUP BY error_type, error_code
ORDER BY count DESC;

-- User activity
SELECT 
  user_id,
  COUNT(*) as packs_created,
  AVG((props_json->>'generationTime')::int) / 1000 as avg_time_seconds
FROM events 
WHERE event = 'pack_created'
AND created_at > NOW() - INTERVAL '7 days'
GROUP BY user_id
ORDER BY packs_created DESC
LIMIT 20;
```

---

## Summary

✅ **Monitoring Setup Complete:**
- Error logging to events table
- Usage tracking for analytics
- Performance metrics collection
- Alert system for critical issues

🔔 **Alerts Configured:**
- High error rate (>5%)
- Slow generation (>180s)
- OpenAI API failures
- High storage usage
- High costs

📊 **Dashboards Available:**
- Supabase built-in metrics
- Custom admin dashboard
- Error logs and analytics

🚨 **Incident Response:**
- Clear escalation path
- Documented procedures
- Post-mortem process
