/**
 * GenerationService - Handles AI-powered content generation for study packs
 */

import { generateChatCompletion } from '../ai/openai'
import { createClient, createServiceRoleClient } from '../supabase/server'
import type { SmartNotes, KeyConcept, Definition } from '../types/materials'
import { GenerationError, MaterialErrorCode } from '../utils/errors'

interface Chunk {
  id: number
  content: string
  orderIndex: number
}

export class GenerationService {
  /**
   * Generates a concise, descriptive title from content
   */
  static async generateTitle(chunks: Chunk[]): Promise<string> {
    if (chunks.length === 0) {
      return 'Study Pack'
    }

    try {
      // Use first 3 chunks for title generation
      const selectedChunks = chunks.slice(0, Math.min(3, chunks.length))
      const context = selectedChunks.map((c) => c.content).join('\n\n')

      const prompt = `Analyze the following educational content and generate a concise, descriptive title (3-8 words).

Content:
${context.substring(0, 2000)}

Generate a title that:
- Captures the main topic or subject
- Is 3-8 words long
- Is clear and descriptive
- Uses title case
- Does NOT include "Study Pack" or similar phrases

Return ONLY the title, nothing else.`

      const response = await generateChatCompletion(
        [
          {
            role: 'system',
            content: 'You are an expert at creating clear, concise titles for educational content.',
          },
          { role: 'user', content: prompt },
        ],
        {
          model: 'gpt-4o-mini',
          temperature: 0.3,
          maxTokens: 20,
        }
      )

      const title = response.trim()
      
      // Validate title length
      if (title.length < 3 || title.length > 100) {
        console.warn('[GenerationService] Generated title out of range, using default')
        return 'Study Pack'
      }

      return title
    } catch (error) {
      console.error('[GenerationService] Error generating title:', error)
      return 'Study Pack'
    }
  }

  /**
   * Selects chunks evenly distributed across the document
   */
  private static selectDistributedChunks(
    chunks: Chunk[],
    count: number
  ): Chunk[] {
    if (chunks.length <= count) {
      return chunks
    }

    const step = chunks.length / count
    const selected: Chunk[] = []

    for (let i = 0; i < count; i++) {
      const index = Math.floor(i * step)
      selected.push(chunks[index])
    }

    return selected
  }

  /**
   * Generates learning objectives and tags from material chunks
   */
  static async generateLearningObjectivesAndTags(
    chunks: Chunk[]
  ): Promise<{ learningObjectives: string[]; tags: string[] }> {
    if (chunks.length === 0) {
      throw new GenerationError(
        MaterialErrorCode.GENERATION_FAILED,
        'No chunks available for learning objectives generation'
      )
    }

    // Select 15 chunks distributed across the document
    const selectedChunks = this.selectDistributedChunks(chunks, 15)
    const context = selectedChunks.map((c) => c.content).join('\n\n')

    console.log(
      `[LearningObjectives] Using ${selectedChunks.length} chunks distributed across ${chunks.length} total chunks`
    )

    const prompt = `You are an expert educator. Analyze the following educational content and generate learning objectives and topic tags.

Content:
${context}

Generate in the following JSON format:
{
  "learningObjectives": [
    "First key learning objective (8-12 words)",
    "Second key learning objective (8-12 words)",
    "Third key learning objective (8-12 words)"
  ],
  "tags": [
    "Tag1",
    "Tag2",
    "Tag3"
  ]
}

Requirements:
- Learning Objectives: Exactly 3 clear, actionable learning outcomes (8-12 words each)
- Tags: Exactly 3 relevant topic tags (1-2 words each, capitalize first letter)
- Learning objectives should start with action verbs (Understand, Learn, Master, Explore, etc.)
- Tags should be broad topic categories, not too specific

Return ONLY valid JSON, no markdown or explanations.`

    try {
      const response = await generateChatCompletion(
        [
          {
            role: 'system',
            content:
              'You are an expert educator. Always respond with valid JSON only.',
          },
          { role: 'user', content: prompt },
        ],
        {
          model: 'gpt-4o-mini',
          temperature: 0.7,
          responseFormat: 'json_object',
        }
      )

      const data = JSON.parse(response)
      return {
        learningObjectives: data.learningObjectives || [],
        tags: data.tags || [],
      }
    } catch (error: any) {
      throw new GenerationError(
        MaterialErrorCode.AI_API_ERROR,
        `Failed to generate learning objectives: ${error.message}`
      )
    }
  }

  /**
   * Generates smart notes from material chunks
   */
  static async generateSmartNotes(
    materialId: string,
    chunks: Chunk[]
  ): Promise<SmartNotes> {
    if (chunks.length === 0) {
      throw new GenerationError(
        MaterialErrorCode.GENERATION_FAILED,
        'No chunks available for notes generation'
      )
    }

    // Select 20 chunks distributed across the entire document
    const selectedChunks = this.selectDistributedChunks(chunks, 20)
    const context = selectedChunks.map((c) => c.content).join('\n\n')

    console.log(
      `[SmartNotes] Using ${selectedChunks.length} chunks distributed across ${chunks.length} total chunks`
    )

    const prompt = `You are an expert educator creating study notes. Analyze the following educational content and create comprehensive smart notes.

Content:
${context}

Generate smart notes in the following JSON format:
{
  "overview": "A 150-300 word summary of the main topic and key themes",
  "keyConcepts": [
    {"title": "Concept Name", "description": "Brief explanation"}
  ],
  "definitions": [
    {"term": "Term", "definition": "Clear definition"}
  ],
  "likelyQuestions": [
    "Question 1 that might appear on an exam",
    "Question 2 that might appear on an exam"
  ],
  "pitfalls": [
    "Common mistake or misconception students make",
    "Another pitfall to avoid"
  ]
}

Requirements:
- Overview: 150-300 words
- Key Concepts: 5-15 concepts
- Definitions: 3-10 important terms
- Likely Questions: 3-10 exam-style questions
- Pitfalls: 3-8 common mistakes

Return ONLY valid JSON, no markdown or explanations.`

    try {
      const response = await generateChatCompletion(
        [
          {
            role: 'system',
            content:
              'You are an expert educator. Always respond with valid JSON only.',
          },
          { role: 'user', content: prompt },
        ],
        {
          model: 'gpt-4o-mini',
          temperature: 0.7,
          responseFormat: 'json_object',
        }
      )

      const notes = JSON.parse(response) as SmartNotes
      return notes
    } catch (error: any) {
      throw new GenerationError(
        MaterialErrorCode.AI_API_ERROR,
        `Failed to generate smart notes: ${error.message}`
      )
    }
  }

  /**
   * Generates flashcards from material chunks with adaptive retry
   */
  static async generateFlashcards(
    studyPackId: string,
    chunks: Chunk[],
    cardLimit: number
  ): Promise<void> {
    if (chunks.length === 0) {
      throw new GenerationError(
        MaterialErrorCode.GENERATION_FAILED,
        'No chunks available for flashcard generation'
      )
    }

    const supabase = createServiceRoleClient()
    const now = new Date().toISOString()
    const allGeneratedCards: any[] = []
    const maxAttempts = 3
    const chunksPerAttempt = 20

    console.log(
      `[Flashcards] Target: ${cardLimit} cards from ${chunks.length} total chunks`
    )

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      // Check if we already have enough cards
      if (allGeneratedCards.length >= cardLimit) {
        console.log(
          `[Flashcards] Target reached: ${allGeneratedCards.length} cards`
        )
        break
      }

      // Select distributed chunks for this attempt
      const startIndex = attempt * chunksPerAttempt
      const remainingChunks = chunks.slice(startIndex)
      
      if (remainingChunks.length === 0) {
        console.log(`[Flashcards] No more chunks available after attempt ${attempt + 1}`)
        break
      }

      const selectedChunks = this.selectDistributedChunks(
        remainingChunks,
        Math.min(chunksPerAttempt, remainingChunks.length)
      )
      const context = selectedChunks.map((c) => c.content).join('\n\n')

      const cardsNeeded = cardLimit - allGeneratedCards.length

      console.log(
        `[Flashcards] Attempt ${attempt + 1}: Requesting ${cardsNeeded} cards from ${selectedChunks.length} chunks`
      )

      const prompt = `You are an expert at creating effective flashcards for studying. Create ${cardsNeeded} flashcards from the following content.

Content:
${context}

Generate flashcards in the following JSON format:
{
  "flashcards": [
    {
      "front": "Question or prompt (10-150 characters)",
      "back": "Answer or explanation (20-500 characters)",
      "kind": "qa",
      "topic": "Topic category"
    }
  ]
}

Requirements:
- Create exactly ${cardsNeeded} flashcards
- Mix of Q&A and cloze deletion types
- Front: 10-150 characters
- Back: 20-500 characters
- Group cards into 5-10 broad topic categories (e.g., "Core Concepts", "Key Terms", "Processes", "Applications")
- Use the same topic name for related cards to enable effective filtering
- Avoid creating unique topics for each card
- Focus on key concepts, definitions, and important facts

Return ONLY valid JSON, no markdown or explanations.`

      try {
        const response = await generateChatCompletion(
          [
            {
              role: 'system',
              content:
                'You are an expert educator. Always respond with valid JSON only.',
            },
            { role: 'user', content: prompt },
          ],
          {
            model: 'gpt-4o-mini',
            temperature: 0.8,
            responseFormat: 'json_object',
          }
        )

        const data = JSON.parse(response)
        const flashcards = data.flashcards || []

        console.log(
          `[Flashcards] Attempt ${attempt + 1}: Generated ${flashcards.length} cards`
        )

        allGeneratedCards.push(...flashcards)
      } catch (error: any) {
        console.error(
          `[Flashcards] Attempt ${attempt + 1} failed:`,
          error.message
        )
        // Continue to next attempt instead of failing completely
        if (attempt === maxAttempts - 1) {
          throw new GenerationError(
            MaterialErrorCode.AI_API_ERROR,
            `Failed to generate flashcards after ${maxAttempts} attempts: ${error.message}`
          )
        }
      }
    }

    // Insert all generated cards (up to the limit)
    const records = allGeneratedCards.slice(0, cardLimit).map((card: any) => ({
      study_pack_id: studyPackId,
      front: card.front,
      back: card.back,
      kind: card.kind || 'qa',
      topic: card.topic || 'General',
      ease: 2.5,
      interval_days: 0,
      due_at: now,
      reps: 0,
      lapses: 0,
    }))

    console.log(
      `[Flashcards] Inserting ${records.length} cards (generated ${allGeneratedCards.length} total)`
    )

    if (records.length === 0) {
      throw new GenerationError(
        MaterialErrorCode.GENERATION_FAILED,
        'No valid flashcards were generated'
      )
    }

    const { error } = await supabase.from('flashcards').insert(records)

    if (error) {
      console.error('Failed to insert flashcards:', error)
      throw new Error(`Database error: ${error.message}`)
    }
  }

  /**
   * Generates quiz from material chunks with adaptive retry
   */
  static async generateQuiz(
    studyPackId: string,
    chunks: Chunk[],
    questionLimit: number
  ): Promise<string> {
    if (chunks.length === 0) {
      throw new GenerationError(
        MaterialErrorCode.GENERATION_FAILED,
        'No chunks available for quiz generation'
      )
    }

    const supabase = createServiceRoleClient()
    const allGeneratedQuestions: any[] = []
    const maxAttempts = 3
    const chunksPerAttempt = 20

    console.log(
      `[Quiz] Target: ${questionLimit} questions from ${chunks.length} total chunks`
    )

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      // Check if we already have enough questions
      if (allGeneratedQuestions.length >= questionLimit) {
        console.log(
          `[Quiz] Target reached: ${allGeneratedQuestions.length} questions`
        )
        break
      }

      // Select distributed chunks for this attempt
      const startIndex = attempt * chunksPerAttempt
      const remainingChunks = chunks.slice(startIndex)

      if (remainingChunks.length === 0) {
        console.log(
          `[Quiz] No more chunks available after attempt ${attempt + 1}`
        )
        break
      }

      const selectedChunks = this.selectDistributedChunks(
        remainingChunks,
        Math.min(chunksPerAttempt, remainingChunks.length)
      )
      const context = selectedChunks.map((c) => c.content).join('\n\n')

      const questionsNeeded = questionLimit - allGeneratedQuestions.length

      console.log(
        `[Quiz] Attempt ${attempt + 1}: Requesting ${questionsNeeded} MCQ questions from ${selectedChunks.length} chunks`
      )

      const prompt = `You are an expert at creating educational quizzes. Create ${questionsNeeded} multiple-choice questions from the following content.

Content:
${context}

Generate quiz in the following JSON format:
{
  "questions": [
    {
      "type": "mcq",
      "question": "Question text",
      "answer": "Correct answer (must match one of the options exactly)",
      "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
      "explanation": "Why this is the correct answer (100-300 chars)",
      "topic": "Topic category"
    }
  ]
}

Requirements:
- Generate exactly ${questionsNeeded} multiple-choice questions
- Each question must have exactly 4 options
- Only 1 option should be correct
- The "answer" field must match one of the options exactly
- Explanations should be 100-300 characters
- Group questions into 3-5 broad topic categories
- Use the same topic name for related questions
- Focus on understanding and application, not just memorization
- Vary difficulty levels (easy, medium, hard)

Return ONLY valid JSON, no markdown or explanations.`

      try {
        const response = await generateChatCompletion(
          [
            {
              role: 'system',
              content:
                'You are an expert educator. Always respond with valid JSON only.',
            },
            { role: 'user', content: prompt },
          ],
          {
            model: 'gpt-4o-mini',
            temperature: 0.7,
            responseFormat: 'json_object',
          }
        )

        const data = JSON.parse(response)
        const questions = data.questions || []

        console.log(
          `[Quiz] Attempt ${attempt + 1}: Generated ${questions.length} questions`
        )

        allGeneratedQuestions.push(...questions)
      } catch (error: any) {
        console.error(`[Quiz] Attempt ${attempt + 1} failed:`, error.message)
        // Continue to next attempt instead of failing completely
        if (attempt === maxAttempts - 1) {
          throw new GenerationError(
            MaterialErrorCode.AI_API_ERROR,
            `Failed to generate quiz after ${maxAttempts} attempts: ${error.message}`
          )
        }
      }
    }

    if (allGeneratedQuestions.length === 0) {
      throw new GenerationError(
        MaterialErrorCode.GENERATION_FAILED,
        'No valid quiz questions were generated'
      )
    }

    console.log('[Quiz] Creating quiz record')

    // Create quiz record
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .insert({
        study_pack_id: studyPackId,
        config_json: {},
      })
      .select()
      .single()

    if (quizError || !quiz) {
      console.error('Failed to create quiz:', quizError)
      throw new Error(`Failed to create quiz: ${quizError?.message}`)
    }

    console.log('Quiz created:', quiz.id)

    // Insert quiz items (up to the limit)
    const items = allGeneratedQuestions
      .slice(0, questionLimit)
      .map((q: any) => ({
        quiz_id: quiz.id,
        type: q.type,
        question: q.question,
        answer: q.answer,
        options_json: q.options || null,
        explanation: q.explanation || '',
        topic: q.topic || 'General',
      }))

    console.log(
      `[Quiz] Inserting ${items.length} questions (generated ${allGeneratedQuestions.length} total)`
    )

    const { error: itemsError } = await supabase.from('quiz_items').insert(items)

    if (itemsError) {
      throw new Error(`Failed to create quiz items: ${itemsError.message}`)
    }

    return quiz.id
  }

  /**
   * Generates mind map from material chunks with adaptive retry
   */
  static async generateMindMap(
    studyPackId: string,
    chunks: Chunk[],
    nodeLimit: number
  ): Promise<string> {
    if (chunks.length === 0) {
      throw new GenerationError(
        MaterialErrorCode.GENERATION_FAILED,
        'No chunks available for mind map generation'
      )
    }

    const supabase = createServiceRoleClient()
    const allGeneratedNodes: any[] = []
    const maxAttempts = 3
    const chunksPerAttempt = 15
    let mindmapTitle = 'Mind Map'

    console.log(
      `[MindMap] Target: ${nodeLimit} nodes from ${chunks.length} total chunks`
    )

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      // Check if we already have enough nodes
      if (allGeneratedNodes.length >= nodeLimit) {
        console.log(
          `[MindMap] Target reached: ${allGeneratedNodes.length} nodes`
        )
        break
      }

      // Select distributed chunks for this attempt
      const startIndex = attempt * chunksPerAttempt
      const remainingChunks = chunks.slice(startIndex)

      if (remainingChunks.length === 0) {
        console.log(
          `[MindMap] No more chunks available after attempt ${attempt + 1}`
        )
        break
      }

      const selectedChunks = this.selectDistributedChunks(
        remainingChunks,
        Math.min(chunksPerAttempt, remainingChunks.length)
      )
      const context = selectedChunks.map((c) => c.content).join('\n\n')

      const nodesNeeded = nodeLimit - allGeneratedNodes.length

      console.log(
        `[MindMap] Attempt ${attempt + 1}: Requesting ${nodesNeeded} nodes from ${selectedChunks.length} chunks`
      )

      const prompt = `You are an expert at creating hierarchical mind maps. Create a mind map with EXACTLY ${nodesNeeded} nodes from the following content.

Content:
${context}

Generate mind map in the following JSON format:
{
  "title": "Main topic title",
  "nodes": [
    {
      "title": "Root concept",
      "content": "Brief description",
      "parentId": null,
      "orderIndex": 0,
      "sourceChunkIds": []
    },
    {
      "title": "Main branch 1",
      "content": "Brief description",
      "parentId": 0,
      "orderIndex": 1,
      "sourceChunkIds": []
    },
    {
      "title": "Sub-topic of branch 1",
      "content": "Brief description",
      "parentId": 1,
      "orderIndex": 2,
      "sourceChunkIds": []
    }
  ]
}

CRITICAL REQUIREMENTS:
1. EXACTLY ONE root node with parentId: null (this MUST be node at index 0)
2. Create 4-6 main branches as direct children of root (parentId: 0)
3. EACH main branch MUST have 2-4 sub-nodes (grandchildren of root)
4. Some sub-nodes SHOULD have their own children (great-grandchildren) for depth
5. Minimum 3 levels deep (root → branch → sub-topic)
6. Maximum 4 levels deep to avoid over-complexity
7. Use array index as parentId (e.g., node at index 5 has parentId: 2 means it's a child of node at index 2)
8. Total nodes: EXACTLY ${nodesNeeded}

Node Format:
- Title: concise and descriptive (3-10 words)
- Content: brief explanation (15-40 words)
- parentId: array index of parent node, or null for root only
- orderIndex: sequential number starting from 0

Structure Example for 15 nodes:
- 1 root (index 0, parentId: null)
- 5 main branches (indices 1-5, parentId: 0)
- 9 sub-nodes distributed across branches (indices 6-14, parentId: 1-5)
  - At least 2 of these sub-nodes should have their own children

Return ONLY valid JSON, no markdown, no explanations, no code blocks.`

      try {
        const response = await generateChatCompletion(
          [
            {
              role: 'system',
              content:
                'You are an expert educator. Always respond with valid JSON only.',
            },
            { role: 'user', content: prompt },
          ],
          {
            model: 'gpt-4o-mini',
            temperature: 0.7,
            responseFormat: 'json_object',
          }
        )

        const data = JSON.parse(response)
        const nodes = data.nodes || []

        // Save title from first attempt
        if (attempt === 0 && data.title) {
          mindmapTitle = data.title
        }

        console.log(
          `[MindMap] Attempt ${attempt + 1}: Generated ${nodes.length} nodes`
        )

        allGeneratedNodes.push(...nodes)
      } catch (error: any) {
        console.error(
          `[MindMap] Attempt ${attempt + 1} failed:`,
          error.message
        )
        // Continue to next attempt instead of failing completely
        if (attempt === maxAttempts - 1) {
          throw new GenerationError(
            MaterialErrorCode.AI_API_ERROR,
            `Failed to generate mind map after ${maxAttempts} attempts: ${error.message}`
          )
        }
      }
    }

    if (allGeneratedNodes.length === 0) {
      throw new GenerationError(
        MaterialErrorCode.GENERATION_FAILED,
        'No valid mind map nodes were generated'
      )
    }

    console.log('[MindMap] Creating mindmap record')

    // Create mind map record
    const { data: mindmap, error: mindmapError } = await supabase
      .from('mindmaps')
      .insert({
        study_pack_id: studyPackId,
        title: mindmapTitle,
        layout_json: { nodes: [] },
      })
      .select()
      .single()

    if (mindmapError || !mindmap) {
      console.error('Failed to create mindmap:', mindmapError)
      throw new Error(`Failed to create mindmap: ${mindmapError?.message}`)
    }

    console.log('Mindmap created:', mindmap.id)

    // Two-pass insertion to fix parent_id bug
    // Pass 1: Insert all nodes without parent relationships
    const nodesToInsert = allGeneratedNodes.slice(0, nodeLimit)
    const nodeRecords = nodesToInsert.map((node: any, index: number) => ({
      mindmap_id: mindmap.id,
      parent_id: null, // Insert all as root nodes first
      title: node.title,
      content: node.content || '',
      order_index: node.orderIndex ?? index,
      source_chunk_ids: node.sourceChunkIds || [],
    }))

    console.log(
      `[MindMap] Pass 1: Inserting ${nodeRecords.length} nodes without parent relationships`
    )

    const { data: insertedNodes, error: nodesError } = await supabase
      .from('mindmap_nodes')
      .insert(nodeRecords)
      .select()

    if (nodesError || !insertedNodes) {
      throw new Error(`Failed to create mindmap nodes: ${nodesError?.message}`)
    }

    console.log(`[MindMap] Pass 1 complete: ${insertedNodes.length} nodes inserted`)

    // Pass 2: Update parent relationships using actual database IDs
    const updates: Array<{ id: string; parent_id: string }> = []
    
    for (let i = 0; i < nodesToInsert.length; i++) {
      const node = nodesToInsert[i]
      if (node.parentId !== null && node.parentId < insertedNodes.length) {
        updates.push({
          id: insertedNodes[i].id,
          parent_id: insertedNodes[node.parentId].id,
        })
      }
    }

    if (updates.length > 0) {
      console.log(`[MindMap] Pass 2: Updating ${updates.length} parent relationships`)
      
      for (const update of updates) {
        const { error: updateError } = await supabase
          .from('mindmap_nodes')
          .update({ parent_id: update.parent_id })
          .eq('id', update.id)

        if (updateError) {
          console.error(`Failed to update parent for node ${update.id}:`, updateError)
        }
      }
      
      console.log('[MindMap] Pass 2 complete: Parent relationships established')
    } else {
      console.log('[MindMap] Pass 2: No parent relationships to update (all root nodes)')
    }

    return mindmap.id
  }

  /**
   * Calculates coverage percentage based on chunk utilization
   */
  static calculateCoverage(
    totalChunks: number,
    usedChunks: number
  ): number {
    const percentage = (usedChunks / totalChunks) * 100
    return Math.min(Math.round(percentage), 100)
  }
}
