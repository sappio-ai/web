/**
 * Content chunking utilities for material processing
 */

export interface ChunkResult {
  content: string
  tokenCount: number
  orderIndex: number
}

/**
 * Estimates token count for text (rough approximation: 1 token ≈ 4 characters)
 */
export function estimateTokenCount(text: string): number {
  return Math.ceil(text.length / 4)
}

/**
 * Splits text into sentences while preserving structure
 */
function splitIntoSentences(text: string): string[] {
  // Split on sentence boundaries (., !, ?) followed by space and capital letter
  // Also handle common abbreviations
  const sentences: string[] = []
  let current = ''

  const lines = text.split('\n')

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) {
      if (current) {
        sentences.push(current.trim())
        current = ''
      }
      continue
    }

    // Split line into potential sentences
    const parts = trimmed.split(/([.!?]+\s+)/)

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]
      current += part

      // Check if this is a sentence boundary
      if (part.match(/[.!?]+\s+$/)) {
        // Check if next part starts with capital letter (likely new sentence)
        const nextPart = parts[i + 1]
        if (nextPart && nextPart.match(/^[A-Z]/)) {
          sentences.push(current.trim())
          current = ''
        }
      }
    }

    // If we have accumulated content, add newline
    if (current && !current.endsWith('\n')) {
      current += '\n'
    }
  }

  // Add any remaining content
  if (current.trim()) {
    sentences.push(current.trim())
  }

  return sentences.filter((s) => s.length > 0)
}

/**
 * Chunks content into segments of 500-1000 tokens with 100-token overlap
 * Respects semantic boundaries (paragraphs, sentences)
 */
export function chunkContent(text: string): ChunkResult[] {
  const MIN_CHUNK_TOKENS = 500
  const MAX_CHUNK_TOKENS = 1000
  const OVERLAP_TOKENS = 100

  // Clean up text
  const cleanedText = text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()

  if (!cleanedText) {
    return []
  }

  // Split into sentences
  const sentences = splitIntoSentences(cleanedText)

  if (sentences.length === 0) {
    return []
  }

  const chunks: ChunkResult[] = []
  let currentChunk: string[] = []
  let currentTokens = 0
  let orderIndex = 0

  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i]
    const sentenceTokens = estimateTokenCount(sentence)

    // If adding this sentence would exceed max tokens, finalize current chunk
    if (
      currentTokens + sentenceTokens > MAX_CHUNK_TOKENS &&
      currentTokens >= MIN_CHUNK_TOKENS
    ) {
      // Finalize current chunk
      const chunkText = currentChunk.join(' ')
      chunks.push({
        content: chunkText,
        tokenCount: estimateTokenCount(chunkText),
        orderIndex: orderIndex++,
      })

      // Create overlap: keep last few sentences for context
      const overlapSentences: string[] = []
      let overlapTokens = 0

      // Work backwards to build overlap
      for (let j = currentChunk.length - 1; j >= 0; j--) {
        const s = currentChunk[j]
        const tokens = estimateTokenCount(s)

        if (overlapTokens + tokens <= OVERLAP_TOKENS) {
          overlapSentences.unshift(s)
          overlapTokens += tokens
        } else {
          break
        }
      }

      // Start new chunk with overlap
      currentChunk = overlapSentences
      currentTokens = overlapTokens
    }

    // Add sentence to current chunk
    currentChunk.push(sentence)
    currentTokens += sentenceTokens
  }

  // Add final chunk if it has content
  if (currentChunk.length > 0) {
    const chunkText = currentChunk.join(' ')
    chunks.push({
      content: chunkText,
      tokenCount: estimateTokenCount(chunkText),
      orderIndex: orderIndex++,
    })
  }

  return chunks
}

/**
 * Validates chunk results
 */
export function validateChunks(chunks: ChunkResult[]): boolean {
  if (chunks.length === 0) {
    return false
  }

  for (const chunk of chunks) {
    if (!chunk.content || chunk.content.trim().length === 0) {
      return false
    }
    if (chunk.tokenCount <= 0) {
      return false
    }
    if (chunk.orderIndex < 0) {
      return false
    }
  }

  return true
}
