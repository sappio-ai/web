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

    // Combine chunks into context (limit to first 20 chunks for cost)
    const context = chunks
      .slice(0, 20)
      .map((c) => c.content)
      .join('\n\n')

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
   * Generates flashcards from material chunks
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

    const context = chunks
      .slice(0, 20)
      .map((c) => c.content)
      .join('\n\n')

    const prompt = `You are an expert at creating effective flashcards for studying. Create ${cardLimit} flashcards from the following content.

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
- Create exactly ${cardLimit} flashcards
- Mix of Q&A and cloze deletion types
- Front: 10-150 characters
- Back: 20-500 characters
- Assign relevant topic tags
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

      // Insert flashcards into database (use service role for background job)
      const supabase = createServiceRoleClient()
      const now = new Date().toISOString()

      const records = flashcards.slice(0, cardLimit).map((card: any) => ({
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

      console.log(`Inserting ${records.length} flashcards`)

      const { error } = await supabase.from('flashcards').insert(records)

      if (error) {
        console.error('Failed to insert flashcards:', error)
        throw new Error(`Database error: ${error.message}`)
      }
    } catch (error: any) {
      throw new GenerationError(
        MaterialErrorCode.AI_API_ERROR,
        `Failed to generate flashcards: ${error.message}`
      )
    }
  }

  /**
   * Generates quiz from material chunks
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

    const context = chunks
      .slice(0, 20)
      .map((c) => c.content)
      .join('\n\n')

    const mcqCount = Math.floor(questionLimit * 0.7)
    const shortAnswerCount = questionLimit - mcqCount

    const prompt = `You are an expert at creating educational quizzes. Create a quiz with ${mcqCount} multiple-choice questions and ${shortAnswerCount} short answer questions from the following content.

Content:
${context}

Generate quiz in the following JSON format:
{
  "questions": [
    {
      "type": "mcq",
      "question": "Question text",
      "answer": "Correct answer",
      "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
      "explanation": "Why this is the correct answer (100-300 chars)",
      "topic": "Topic category"
    },
    {
      "type": "short_answer",
      "question": "Question text",
      "answer": "Expected answer",
      "explanation": "Explanation of the answer",
      "topic": "Topic category"
    }
  ]
}

Requirements:
- ${mcqCount} MCQ questions (70%)
- ${shortAnswerCount} short answer questions (30%)
- MCQ: Exactly 4 options, only 1 correct
- Explanations: 100-300 characters
- Assign relevant topic tags
- Focus on understanding, not memorization

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

      // Use service role for background job
      const supabase = createServiceRoleClient()

      console.log('Creating quiz record')

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

      // Insert quiz items
      const items = questions.slice(0, questionLimit).map((q: any) => ({
        quiz_id: quiz.id,
        type: q.type,
        question: q.question,
        answer: q.answer,
        options_json: q.options || null,
        explanation: q.explanation || '',
        topic: q.topic || 'General',
      }))

      const { error: itemsError } = await supabase
        .from('quiz_items')
        .insert(items)

      if (itemsError) {
        throw new Error(`Failed to create quiz items: ${itemsError.message}`)
      }

      return quiz.id
    } catch (error: any) {
      throw new GenerationError(
        MaterialErrorCode.AI_API_ERROR,
        `Failed to generate quiz: ${error.message}`
      )
    }
  }

  /**
   * Generates mind map from material chunks
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

    const context = chunks
      .slice(0, 15)
      .map((c) => c.content)
      .join('\n\n')

    const prompt = `You are an expert at creating hierarchical mind maps. Create a mind map with up to ${nodeLimit} nodes from the following content.

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
      "title": "Sub-concept",
      "content": "Brief description",
      "parentId": 0,
      "orderIndex": 1,
      "sourceChunkIds": []
    }
  ]
}

Requirements:
- 1 root node (parentId: null)
- 3-7 main branches (children of root)
- 2-5 sub-nodes per branch
- Total nodes: up to ${nodeLimit}
- Title: concise (3-8 words)
- Content: brief description (10-50 words)
- Hierarchical structure with parent-child relationships

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
      // Use service role for background job
      const supabase = createServiceRoleClient()

      console.log('Creating mindmap record')

      // Create mind map record
      const { data: mindmap, error: mindmapError } = await supabase
        .from('mindmaps')
        .insert({
          study_pack_id: studyPackId,
          title: data.title || 'Mind Map',
          layout_json: { nodes: [] },
        })
        .select()
        .single()

      if (mindmapError || !mindmap) {
        console.error('Failed to create mindmap:', mindmapError)
        throw new Error(`Failed to create mindmap: ${mindmapError?.message}`)
      }

      console.log('Mindmap created:', mindmap.id)

      // Insert nodes
      const nodes = (data.nodes || []).slice(0, nodeLimit)
      const nodeRecords = nodes.map((node: any, index: number) => ({
        mindmap_id: mindmap.id,
        parent_id: node.parentId !== null ? nodes[node.parentId]?.id : null,
        title: node.title,
        content: node.content || '',
        order_index: node.orderIndex ?? index,
        source_chunk_ids: node.sourceChunkIds || [],
      }))

      const { error: nodesError } = await supabase
        .from('mindmap_nodes')
        .insert(nodeRecords)

      if (nodesError) {
        throw new Error(`Failed to create mindmap nodes: ${nodesError.message}`)
      }

      return mindmap.id
    } catch (error: any) {
      throw new GenerationError(
        MaterialErrorCode.AI_API_ERROR,
        `Failed to generate mind map: ${error.message}`
      )
    }
  }

  /**
   * Calculates coverage meter based on chunk utilization
   */
  static calculateCoverage(
    totalChunks: number,
    usedChunks: number
  ): 'high' | 'med' | 'low' {
    const percentage = (usedChunks / totalChunks) * 100

    if (percentage >= 80) return 'high'
    if (percentage >= 50) return 'med'
    return 'low'
  }
}
