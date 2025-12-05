/**
 * Title Generation Tests
 */

import { GenerationService } from '../GenerationService'
import { generateChatCompletion } from '@/lib/ai/openai'

// Mock OpenAI
jest.mock('@/lib/ai/openai', () => ({
  generateChatCompletion: jest.fn(),
}))

const mockGenerateChatCompletion = generateChatCompletion as jest.MockedFunction<
  typeof generateChatCompletion
>

describe('Title Generation', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should generate a title from content chunks', async () => {
    const chunks = [
      {
        id: 1,
        content: 'Introduction to Machine Learning. Machine learning is a subset of artificial intelligence...',
        orderIndex: 0,
      },
      {
        id: 2,
        content: 'Supervised learning algorithms use labeled data to train models...',
        orderIndex: 1,
      },
    ]

    mockGenerateChatCompletion.mockResolvedValue('Introduction to Machine Learning')

    const title = await GenerationService.generateTitle(chunks)

    expect(title).toBe('Introduction to Machine Learning')
    expect(mockGenerateChatCompletion).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          role: 'system',
          content: expect.stringContaining('expert at creating clear, concise titles'),
        }),
        expect.objectContaining({
          role: 'user',
          content: expect.stringContaining('Analyze the following educational content'),
        }),
      ]),
      expect.objectContaining({
        model: 'gpt-4o-mini',
        temperature: 0.3,
        maxTokens: 20,
      })
    )
  })

  it('should handle empty chunks gracefully', async () => {
    const title = await GenerationService.generateTitle([])

    expect(title).toBe('Study Pack')
    expect(mockGenerateChatCompletion).not.toHaveBeenCalled()
  })

  it('should use default title if generation fails', async () => {
    const chunks = [
      {
        id: 1,
        content: 'Some content',
        orderIndex: 0,
      },
    ]

    mockGenerateChatCompletion.mockRejectedValue(new Error('API error'))

    const title = await GenerationService.generateTitle(chunks)

    expect(title).toBe('Study Pack')
  })

  it('should use default title if generated title is too short', async () => {
    const chunks = [
      {
        id: 1,
        content: 'Some content',
        orderIndex: 0,
      },
    ]

    mockGenerateChatCompletion.mockResolvedValue('AI')

    const title = await GenerationService.generateTitle(chunks)

    expect(title).toBe('Study Pack')
  })

  it('should use default title if generated title is too long', async () => {
    const chunks = [
      {
        id: 1,
        content: 'Some content',
        orderIndex: 0,
      },
    ]

    const longTitle = 'A'.repeat(101)
    mockGenerateChatCompletion.mockResolvedValue(longTitle)

    const title = await GenerationService.generateTitle(chunks)

    expect(title).toBe('Study Pack')
  })

  it('should trim whitespace from generated title', async () => {
    const chunks = [
      {
        id: 1,
        content: 'Python Programming Basics',
        orderIndex: 0,
      },
    ]

    mockGenerateChatCompletion.mockResolvedValue('  Python Programming Basics  ')

    const title = await GenerationService.generateTitle(chunks)

    expect(title).toBe('Python Programming Basics')
  })

  it('should use first 3 chunks for title generation', async () => {
    const chunks = [
      { id: 1, content: 'Chunk 1 content', orderIndex: 0 },
      { id: 2, content: 'Chunk 2 content', orderIndex: 1 },
      { id: 3, content: 'Chunk 3 content', orderIndex: 2 },
      { id: 4, content: 'Chunk 4 content', orderIndex: 3 },
      { id: 5, content: 'Chunk 5 content', orderIndex: 4 },
    ]

    mockGenerateChatCompletion.mockResolvedValue('Test Title')

    await GenerationService.generateTitle(chunks)

    const callArgs = mockGenerateChatCompletion.mock.calls[0][0]
    const userMessage = callArgs.find((msg: any) => msg.role === 'user')
    
    // Should include first 3 chunks
    expect(userMessage.content).toContain('Chunk 1 content')
    expect(userMessage.content).toContain('Chunk 2 content')
    expect(userMessage.content).toContain('Chunk 3 content')
  })
})
