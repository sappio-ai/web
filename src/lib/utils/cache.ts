/**
 * Simple in-memory cache utility for API responses
 */

interface CacheEntry<T> {
  data: T
  timestamp: number
}

class ResponseCache {
  private cache = new Map<string, CacheEntry<unknown>>()

  /**
   * Get cached data if it exists and hasn't expired
   */
  get<T>(key: string, ttlMs: number): T | null {
    const entry = this.cache.get(key)
    if (!entry) return null

    const age = Date.now() - entry.timestamp
    if (age > ttlMs) {
      this.cache.delete(key)
      return null
    }

    return entry.data as T
  }

  /**
   * Set cached data
   */
  set<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    })
  }

  /**
   * Invalidate cached data
   */
  invalidate(key: string): void {
    this.cache.delete(key)
  }

  /**
   * Invalidate all keys matching a pattern
   */
  invalidatePattern(pattern: RegExp): void {
    for (const key of this.cache.keys()) {
      if (pattern.test(key)) {
        this.cache.delete(key)
      }
    }
  }

  /**
   * Clear all cached data
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size
  }
}

// Export singleton instance
export const responseCache = new ResponseCache()

// Cache TTL constants
export const CACHE_TTL = {
  STUDY_PACK: 5 * 60 * 1000, // 5 minutes
  MATERIAL_STATUS: 10 * 1000, // 10 seconds
  PLAN_LIMITS: 5 * 60 * 1000, // 5 minutes
} as const
