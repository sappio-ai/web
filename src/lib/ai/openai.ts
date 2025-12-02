/**
 * OpenAI client wrapper for AI operations
 */

import OpenAI from 'openai'

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})

/**
 * Generates embeddings for text chunks using text-embedding-3-small
 * Handles batching (max 100 texts per call)
 */
export async function generateEmbeddings(
    texts: string[]
): Promise<number[][]> {
    if (texts.length === 0) {
        return []
    }

    const embeddings: number[][] = []
    const BATCH_SIZE = 100

    // Process in batches of 100
    for (let i = 0; i < texts.length; i += BATCH_SIZE) {
        const batch = texts.slice(i, i + BATCH_SIZE)

        try {
            const response = await openai.embeddings.create({
                model: 'text-embedding-3-small',
                input: batch,
                encoding_format: 'float',
            })

            // Extract embeddings from response
            const batchEmbeddings = response.data.map((item) => item.embedding)
            embeddings.push(...batchEmbeddings)
        } catch (error: any) {
            console.error('OpenAI embedding error:', error)
            throw new Error(`Failed to generate embeddings: ${error.message}`)
        }
    }

    return embeddings
}

/**
 * Generates chat completion using GPT-4
 */
export async function generateChatCompletion(
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
    options?: {
        model?: string
        temperature?: number
        maxTokens?: number
        responseFormat?: 'text' | 'json_object'
    }
): Promise<string> {
    try {
        const response = await openai.chat.completions.create({
            model: options?.model || 'gpt-4o-mini',
            messages,
            temperature: options?.temperature ?? 0.7,
            max_tokens: options?.maxTokens,
            response_format: options?.responseFormat
                ? { type: options.responseFormat }
                : undefined,
        })

        return response.choices[0]?.message?.content || ''
    } catch (error: any) {
        console.error('OpenAI chat completion error:', error)
        throw new Error(`Failed to generate completion: ${error.message}`)
    }
}

/**
 * Estimates cost for embedding generation
 */
export function estimateEmbeddingCost(textCount: number): number {
    // text-embedding-3-small: $0.00002 per 1K tokens
    // Rough estimate: 1 chunk ≈ 750 tokens
    const tokensPerChunk = 750
    const totalTokens = textCount * tokensPerChunk
    const costPer1kTokens = 0.00002
    return (totalTokens / 1000) * costPer1kTokens
}

/**
 * Estimates cost for chat completion
 */
export function estimateChatCost(
    inputTokens: number,
    outputTokens: number,
    model: string = 'gpt-4o-mini'
): number {
    // gpt-4o-mini: $0.150 per 1M input tokens, $0.600 per 1M output tokens
    const inputCostPer1M = 0.15
    const outputCostPer1M = 0.6

    const inputCost = (inputTokens / 1_000_000) * inputCostPer1M
    const outputCost = (outputTokens / 1_000_000) * outputCostPer1M

    return inputCost + outputCost
}

export { openai }
