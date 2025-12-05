import { NextRequest, NextResponse } from 'next/server'
import { UsageService } from '@/lib/services/UsageService'

/**
 * Test endpoint to verify period-based quota behavior
 * Usage: GET /api/admin/test/check-usage-period?userId=xxx&simulateDate=2025-01-05
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const simulateDate = searchParams.get('simulateDate')

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 })
    }

    // Get user profile
    const user = await UsageService.getUserProfile(userId)

    // Calculate period for current date
    const currentPeriodStart = UsageService.calculatePeriodStart(
      user.billingAnchor,
      user.timezone
    )
    const currentPeriodEnd = UsageService.calculatePeriodEnd(
      currentPeriodStart,
      user.billingAnchor
    )
    const currentUsage = await UsageService.getUsageForPeriod(
      userId,
      currentPeriodStart
    )

    // If simulating a future date, calculate what the period would be
    let simulatedPeriodStart, simulatedPeriodEnd, simulatedUsage
    if (simulateDate) {
      // Temporarily override Date.now() logic by calculating period for simulated date
      const simDate = new Date(simulateDate)
      const simYear = simDate.getFullYear()
      const simMonth = simDate.getMonth()
      const simDay = simDate.getDate()

      let periodYear = simYear
      let periodMonth = simMonth

      if (simDay < user.billingAnchor) {
        periodMonth -= 1
        if (periodMonth < 0) {
          periodMonth = 11
          periodYear -= 1
        }
      }

      const daysInMonth = new Date(periodYear, periodMonth + 1, 0).getDate()
      const anchorDay = Math.min(user.billingAnchor, daysInMonth)

      simulatedPeriodStart = new Date(periodYear, periodMonth, anchorDay, 0, 0, 0, 0)
      
      let nextMonth = periodMonth + 1
      let nextYear = periodYear
      if (nextMonth > 11) {
        nextMonth = 0
        nextYear += 1
      }
      const daysInNextMonth = new Date(nextYear, nextMonth + 1, 0).getDate()
      const nextAnchorDay = Math.min(user.billingAnchor, daysInNextMonth)
      simulatedPeriodEnd = new Date(nextYear, nextMonth, nextAnchorDay, 0, 0, 0, 0)
      simulatedPeriodEnd.setDate(simulatedPeriodEnd.getDate() - 1)
      simulatedPeriodEnd.setHours(23, 59, 59, 999)

      simulatedUsage = await UsageService.getUsageForPeriod(
        userId,
        simulatedPeriodStart
      )
    }

    return NextResponse.json({
      userId,
      billingAnchor: user.billingAnchor,
      currentDate: new Date().toISOString(),
      currentPeriod: {
        start: currentPeriodStart.toISOString(),
        end: currentPeriodEnd.toISOString(),
        usage: currentUsage,
      },
      ...(simulateDate && {
        simulatedDate: simulateDate,
        simulatedPeriod: {
          start: simulatedPeriodStart?.toISOString(),
          end: simulatedPeriodEnd?.toISOString(),
          usage: simulatedUsage,
        },
        explanation: simulatedUsage === 0 
          ? '✅ Usage would reset to 0 in the new period (no records exist for that period)'
          : `⚠️ Usage would be ${simulatedUsage} (records exist for that period)`,
      }),
    })
  } catch (error) {
    console.error('Error checking usage period:', error)
    return NextResponse.json(
      { error: 'Failed to check usage period', details: String(error) },
      { status: 500 }
    )
  }
}
