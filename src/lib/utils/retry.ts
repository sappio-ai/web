/**
 * Retry utilities with exponential backoff
 */

export interface RetryOptions {
  maxAttempts?: number
  initialDelayMs?: number
  maxDelayMs?: number
  backoffMultiplier?: number
  onRetry?: (attempt: number, error: Error) => void
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxAttempts: 3,
  initialDelayMs: 1000,
  maxDelayMs: 30000,
  backoffMultiplier: 2,
  onRetry: () => {},
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Calculate delay with exponential backoff
 */
function calculateDelay(
  attempt: number,
  initialDelay: number,
  maxDelay: number,
  multiplier: number
): number {
  const delay = initialDelay * Math.pow(multiplier, attempt - 1)
  return Math.min(delay, maxDelay)
}

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  let lastError: Error

  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error

      // Don't retry on last attempt
      if (attempt === opts.maxAttempts) {
        break
      }

      // Call retry callback
      opts.onRetry(attempt, lastError)

      // Calculate delay and wait
      const delay = calculateDelay(
        attempt,
        opts.initialDelayMs,
        opts.maxDelayMs,
        opts.backoffMultiplier
      )

      console.log(
        `[Retry] Attempt ${attempt}/${opts.maxAttempts} failed. Retrying in ${delay}ms...`
      )

      await sleep(delay)
    }
  }

  throw lastError!
}

/**
 * Retry configuration for material processing
 */
export const MATERIAL_PROCESSING_RETRY: RetryOptions = {
  maxAttempts: 2,
  initialDelayMs: 5000, // 5s
  maxDelayMs: 15000, // 15s
  backoffMultiplier: 3, // 5s, 15s
}

/**
 * Retry configuration for AI API calls
 */
export const AI_API_RETRY: RetryOptions = {
  maxAttempts: 3,
  initialDelayMs: 2000, // 2s
  maxDelayMs: 10000, // 10s
  backoffMultiplier: 2, // 2s, 4s, 8s
}

/**
 * Retry configuration for external API calls (URL fetch, YouTube, etc.)
 */
export const EXTERNAL_API_RETRY: RetryOptions = {
  maxAttempts: 3,
  initialDelayMs: 1000, // 1s
  maxDelayMs: 5000, // 5s
  backoffMultiplier: 2, // 1s, 2s, 4s
}

/**
 * Circuit breaker for external APIs
 */
export class CircuitBreaker {
  private failureCount = 0
  private lastFailureTime: number | null = null
  private state: 'closed' | 'open' | 'half-open' = 'closed'

  constructor(
    private failureThreshold: number = 5,
    private resetTimeoutMs: number = 60000 // 1 minute
  ) {}

  /**
   * Execute function with circuit breaker
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    // Check if circuit is open
    if (this.state === 'open') {
      const timeSinceLastFailure = Date.now() - (this.lastFailureTime || 0)

      if (timeSinceLastFailure < this.resetTimeoutMs) {
        throw new Error('Circuit breaker is open. Service temporarily unavailable.')
      }

      // Try half-open state
      this.state = 'half-open'
    }

    try {
      const result = await fn()

      // Success - reset circuit
      if (this.state === 'half-open') {
        this.reset()
      }

      return result
    } catch (error) {
      this.recordFailure()
      throw error
    }
  }

  /**
   * Record a failure
   */
  private recordFailure(): void {
    this.failureCount++
    this.lastFailureTime = Date.now()

    if (this.failureCount >= this.failureThreshold) {
      this.state = 'open'
      console.warn(
        `[CircuitBreaker] Circuit opened after ${this.failureCount} failures`
      )
    }
  }

  /**
   * Reset circuit breaker
   */
  private reset(): void {
    this.failureCount = 0
    this.lastFailureTime = null
    this.state = 'closed'
    console.log('[CircuitBreaker] Circuit closed')
  }

  /**
   * Get current state
   */
  getState(): 'closed' | 'open' | 'half-open' {
    return this.state
  }

  /**
   * Get failure count
   */
  getFailureCount(): number {
    return this.failureCount
  }
}

// Export singleton circuit breakers for different services
export const openAICircuitBreaker = new CircuitBreaker(5, 60000)
export const youtubeCircuitBreaker = new CircuitBreaker(3, 30000)
export const urlFetchCircuitBreaker = new CircuitBreaker(5, 60000)
