/**
 * Token estimation utilities for text chunking
 * Uses a simple approximation: ~4 characters per token (OpenAI's rule of thumb)
 */

// ============================================================================
// Constants
// ============================================================================

const CHARS_PER_TOKEN = 4

// ============================================================================
// Token Estimation Functions
// ============================================================================

/**
 * Estimates the number of tokens in a text string
 * This is an approximation based on character count
 */
export function estimateTokens(text: string): number {
  if (!text) return 0
  
  // Remove extra whitespace and count characters
  const cleanText = text.trim()
  const charCount = cleanText.length
  
  // Estimate tokens (roughly 4 chars per token)
  return Math.ceil(charCount / CHARS_PER_TOKEN)
}

/**
 * Gets the last N tokens from a text string (approximate)
 * Used for creating chunk overlap
 */
export function getLastNTokens(text: string, tokenCount: number): string {
  if (!text) return ''
  
  const charCount = tokenCount * CHARS_PER_TOKEN
  
  if (text.length <= charCount) {
    return text
  }
  
  // Get the last N characters (approximate tokens)
  const lastChars = text.slice(-charCount)
  
  // Try to start at a word boundary
  const firstSpaceIndex = lastChars.indexOf(' ')
  if (firstSpaceIndex > 0 && firstSpaceIndex < charCount * 0.2) {
    return lastChars.slice(firstSpaceIndex + 1)
  }
  
  return lastChars
}

/**
 * Gets the first N tokens from a text string (approximate)
 */
export function getFirstNTokens(text: string, tokenCount: number): string {
  if (!text) return ''
  
  const charCount = tokenCount * CHARS_PER_TOKEN
  
  if (text.length <= charCount) {
    return text
  }
  
  // Get the first N characters (approximate tokens)
  const firstChars = text.slice(0, charCount)
  
  // Try to end at a word boundary
  const lastSpaceIndex = firstChars.lastIndexOf(' ')
  if (lastSpaceIndex > charCount * 0.8) {
    return firstChars.slice(0, lastSpaceIndex)
  }
  
  return firstChars
}

/**
 * Checks if text exceeds a token limit
 */
export function exceedsTokenLimit(text: string, limit: number): boolean {
  return estimateTokens(text) > limit
}

/**
 * Truncates text to a maximum token count
 */
export function truncateToTokenLimit(text: string, limit: number): string {
  const estimatedTokens = estimateTokens(text)
  
  if (estimatedTokens <= limit) {
    return text
  }
  
  const charLimit = limit * CHARS_PER_TOKEN
  const truncated = text.slice(0, charLimit)
  
  // Try to end at a sentence boundary
  const lastPeriod = truncated.lastIndexOf('.')
  if (lastPeriod > charLimit * 0.8) {
    return truncated.slice(0, lastPeriod + 1)
  }
  
  // Try to end at a word boundary
  const lastSpace = truncated.lastIndexOf(' ')
  if (lastSpace > charLimit * 0.8) {
    return truncated.slice(0, lastSpace)
  }
  
  return truncated
}
