/**
 * Benefit utility functions
 * 
 * Helper functions for date calculations and benefit validation
 */

/**
 * Calculate date N months from now
 */
export function addMonths(date: Date, months: number): Date {
  const result = new Date(date)
  result.setMonth(result.getMonth() + months)
  return result
}

/**
 * Calculate date N days from now
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

/**
 * Check if a date is in the past
 */
export function isExpired(dateString: string): boolean {
  const date = new Date(dateString)
  const now = new Date()
  return date < now
}

/**
 * Get days between two dates
 */
export function daysBetween(start: Date, end: Date): number {
  const diffMs = end.getTime() - start.getTime()
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24))
}

/**
 * Format date for display (e.g., "Dec 3, 2025")
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

/**
 * Validate price lock structure
 */
export function isValidPriceLock(priceLock: any): boolean {
  if (!priceLock || typeof priceLock !== 'object') {
    return false
  }
  
  return (
    typeof priceLock.enabled === 'boolean' &&
    typeof priceLock.expires_at === 'string' &&
    priceLock.locked_prices &&
    typeof priceLock.locked_prices.student_pro_monthly === 'number' &&
    typeof priceLock.locked_prices.student_pro_semester === 'number' &&
    typeof priceLock.locked_prices.pro_plus_monthly === 'number'
  )
}

/**
 * Validate trial structure
 */
export function isValidTrial(trial: any): boolean {
  if (!trial || typeof trial !== 'object') {
    return false
  }
  
  return (
    (trial.plan === 'student_pro' || trial.plan === 'pro_plus') &&
    typeof trial.started_at === 'string' &&
    typeof trial.expires_at === 'string'
  )
}
