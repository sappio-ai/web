/**
 * Inngest functions for incremental content generation
 * Handles background generation of additional flashcards, quiz questions, and mindmap nodes
 */

import { inngest } from '../client'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { GenerationService } from '@/lib/services/GenerationService'
import { UsageService } from '@/lib/services/UsageService'
import { GenerationError, MaterialErrorCode } from '@/lib/utils/errors'
import { responseCache } from '@/lib/utils/cache'

// Type for generation status tracking
export type GenerationStatus = 'idle' | 'generating' | 'completed' | 'failed'
export type ContentType = 'flashcards' | 'quiz' | 'mindmap'

/**
 * Helper to update generation status in study_packs.stats_json
 */
async function updateGenerationStatus(
  studyPackId: string,
  contentType: ContentType,
  status: GenerationStatus,
  error?: string
) {
  const supabase = createServiceRoleClient()
  
  // Get current stats_json
  const { data: pack, error: fetchError } = await supabase
    .from('study_packs')
    .select('stats_json')
    .eq('id', studyPackId)
    .single()

  if (fetchError || !pack) {
    console.error(`[GenerateMore] Failed to fetch pack for status update: ${fetchError?.message}`)
    return
  }

  const statsJson = (pack.stats_json as any) || {}
  const generationStatus = statsJson.generationStatus || {}

  // Update the status for this content type
  generationStatus[contentType] = {
    status,
    updatedAt: new Date().toISOString(),
    ...(error ? { error } : {}),
  }

  const { error: updateError } = await supabase
    .from('study_packs')
    .update({
      stats_json: {
        ...statsJson,
        generationStatus,
      },
      updated_at: new Date().toISOString(),
    })
    .eq('id', studyPackId)

  if (updateError) {
    console.error(`[GenerateMore] Failed to update generation status: ${updateError.message}`)
  }
}

/**
 * Generate more flashcards for a study pack
 */
export const generateMoreFlashcards = inngest.createFunction(
  {
    id: 'generate-more-flashcards',
    name: 'Generate More Flashcards',
    retries: 1,
  },
  { event: 'content/generate-more-flashcards' },
  async ({ event, step }) => {
    const { studyPackId, userId, batchSize } = event.data
    const startTime = Date.now()

    // Step 1: Mark as generating
    await step.run('mark-generating', async () => {
      await updateGenerationStatus(studyPackId, 'flashcards', 'generating')
    })

    try {
      // Step 2: Fetch study pack and validate
      const { material, chunks, limits, currentCount } = await step.run(
        'fetch-data',
        async () => {
          const supabase = createServiceRoleClient()

          // Get study pack with material
          const { data: studyPack, error: packError } = await supabase
            .from('study_packs')
            .select('id, material_id, users!inner(id, plan)')
            .eq('id', studyPackId)
            .single()

          if (packError || !studyPack) {
            throw new GenerationError(
              MaterialErrorCode.MATERIAL_NOT_FOUND,
              'Study pack not found'
            )
          }

          // Get chunks
          const { data: chunks, error: chunksError } = await supabase
            .from('chunks')
            .select('id, content, order_index')
            .eq('material_id', studyPack.material_id)
            .order('order_index', { ascending: true })

          if (chunksError || !chunks || chunks.length === 0) {
            throw new GenerationError(
              MaterialErrorCode.GENERATION_FAILED,
              'No chunks found for material'
            )
          }

          // Get plan limits
          const owner = studyPack.users as any
          const limits = await UsageService.getPlanLimits(owner.plan)

          // Count existing flashcards
          const { count } = await supabase
            .from('flashcards')
            .select('*', { count: 'exact', head: true })
            .eq('study_pack_id', studyPackId)

          return {
            material: studyPack,
            chunks: chunks.map((c) => ({
              id: c.id,
              content: c.content,
              orderIndex: c.order_index,
            })),
            limits,
            currentCount: count || 0,
          }
        }
      )

      // Step 3: Calculate how many to generate
      const toGenerate = await step.run('calculate-count', async () => {
        const remaining = limits.cardsPerPack - currentCount
        if (remaining <= 0) {
          throw new GenerationError(
            MaterialErrorCode.GENERATION_FAILED,
            'Already at maximum limit'
          )
        }
        return Math.min(batchSize || limits.batchCardsSize || 30, remaining)
      })

      // Step 4: Generate flashcards
      const generated = await step.run('generate-flashcards', async () => {
        return await GenerationService.generateFlashcardsIncremental(
          studyPackId,
          chunks,
          toGenerate
        )
      })

      // Step 5: Update stats and mark complete
      await step.run('finalize', async () => {
        const supabase = createServiceRoleClient()
        const newTotal = currentCount + generated

        // Get current stats_json
        const { data: pack } = await supabase
          .from('study_packs')
          .select('stats_json')
          .eq('id', studyPackId)
          .single()

        const statsJson = (pack?.stats_json as any) || {}
        const generationStatus = statsJson.generationStatus || {}

        // Update stats and mark as completed
        generationStatus.flashcards = {
          status: 'completed',
          updatedAt: new Date().toISOString(),
          generated,
          newTotal,
        }

        await supabase
          .from('study_packs')
          .update({
            stats_json: {
              ...statsJson,
              cardCount: newTotal,
              generationStatus,
            },
            updated_at: new Date().toISOString(),
          })
          .eq('id', studyPackId)

        // Invalidate cache
        responseCache.invalidatePattern(new RegExp(`^study-pack:${studyPackId}:`))

        // Log event
        await supabase.from('events').insert({
          user_id: userId,
          event: 'flashcards_generated_more',
          props_json: {
            study_pack_id: studyPackId,
            generated,
            new_total: newTotal,
            generation_time: Date.now() - startTime,
          },
        })
      })

      return {
        studyPackId,
        generated,
        newTotal: currentCount + generated,
        status: 'completed',
      }
    } catch (error: any) {
      // Mark as failed
      await updateGenerationStatus(studyPackId, 'flashcards', 'failed', error.message)
      throw error
    }
  }
)

/**
 * Generate more quiz questions for a study pack
 */
export const generateMoreQuiz = inngest.createFunction(
  {
    id: 'generate-more-quiz',
    name: 'Generate More Quiz Questions',
    retries: 1,
  },
  { event: 'content/generate-more-quiz' },
  async ({ event, step }) => {
    const { studyPackId, userId, batchSize } = event.data
    const startTime = Date.now()

    // Step 1: Mark as generating
    await step.run('mark-generating', async () => {
      await updateGenerationStatus(studyPackId, 'quiz', 'generating')
    })

    try {
      // Step 2: Fetch study pack and validate
      const { chunks, limits, currentCount } = await step.run(
        'fetch-data',
        async () => {
          const supabase = createServiceRoleClient()

          // Get study pack with material
          const { data: studyPack, error: packError } = await supabase
            .from('study_packs')
            .select('id, material_id, users!inner(id, plan)')
            .eq('id', studyPackId)
            .single()

          if (packError || !studyPack) {
            throw new GenerationError(
              MaterialErrorCode.MATERIAL_NOT_FOUND,
              'Study pack not found'
            )
          }

          // Get chunks
          const { data: chunks, error: chunksError } = await supabase
            .from('chunks')
            .select('id, content, order_index')
            .eq('material_id', studyPack.material_id)
            .order('order_index', { ascending: true })

          if (chunksError || !chunks || chunks.length === 0) {
            throw new GenerationError(
              MaterialErrorCode.GENERATION_FAILED,
              'No chunks found for material'
            )
          }

          // Get plan limits
          const owner = studyPack.users as any
          const limits = await UsageService.getPlanLimits(owner.plan)

          // Get quiz and count existing questions
          const { data: quiz } = await supabase
            .from('quizzes')
            .select('id')
            .eq('study_pack_id', studyPackId)
            .single()

          let count = 0
          if (quiz) {
            const { count: questionCount } = await supabase
              .from('quiz_items')
              .select('*', { count: 'exact', head: true })
              .eq('quiz_id', quiz.id)
            count = questionCount || 0
          }

          return {
            chunks: chunks.map((c) => ({
              id: c.id,
              content: c.content,
              orderIndex: c.order_index,
            })),
            limits,
            currentCount: count,
          }
        }
      )

      // Step 3: Calculate how many to generate
      const toGenerate = await step.run('calculate-count', async () => {
        const remaining = limits.questionsPerQuiz - currentCount
        if (remaining <= 0) {
          throw new GenerationError(
            MaterialErrorCode.GENERATION_FAILED,
            'Already at maximum limit'
          )
        }
        return Math.min(batchSize || limits.batchQuestionsSize || 10, remaining)
      })

      // Step 4: Generate quiz questions
      const generated = await step.run('generate-quiz', async () => {
        return await GenerationService.generateQuizIncremental(
          studyPackId,
          chunks,
          toGenerate
        )
      })

      // Step 5: Update stats and mark complete
      await step.run('finalize', async () => {
        const supabase = createServiceRoleClient()
        const newTotal = currentCount + generated

        // Get current stats_json
        const { data: pack } = await supabase
          .from('study_packs')
          .select('stats_json')
          .eq('id', studyPackId)
          .single()

        const statsJson = (pack?.stats_json as any) || {}
        const generationStatus = statsJson.generationStatus || {}

        // Update stats and mark as completed
        generationStatus.quiz = {
          status: 'completed',
          updatedAt: new Date().toISOString(),
          generated,
          newTotal,
        }

        await supabase
          .from('study_packs')
          .update({
            stats_json: {
              ...statsJson,
              quizQuestionCount: newTotal,
              generationStatus,
            },
            updated_at: new Date().toISOString(),
          })
          .eq('id', studyPackId)

        // Invalidate cache
        responseCache.invalidatePattern(new RegExp(`^study-pack:${studyPackId}:`))

        // Log event
        await supabase.from('events').insert({
          user_id: userId,
          event: 'quiz_generated_more',
          props_json: {
            study_pack_id: studyPackId,
            generated,
            new_total: newTotal,
            generation_time: Date.now() - startTime,
          },
        })
      })

      return {
        studyPackId,
        generated,
        newTotal: currentCount + generated,
        status: 'completed',
      }
    } catch (error: any) {
      // Mark as failed
      await updateGenerationStatus(studyPackId, 'quiz', 'failed', error.message)
      throw error
    }
  }
)

/**
 * Generate more mindmap nodes for a study pack
 */
export const generateMoreMindmap = inngest.createFunction(
  {
    id: 'generate-more-mindmap',
    name: 'Generate More Mind Map Nodes',
    retries: 1,
  },
  { event: 'content/generate-more-mindmap' },
  async ({ event, step }) => {
    const { studyPackId, userId, batchSize } = event.data
    const startTime = Date.now()

    // Step 1: Mark as generating
    await step.run('mark-generating', async () => {
      await updateGenerationStatus(studyPackId, 'mindmap', 'generating')
    })

    try {
      // Step 2: Fetch study pack and validate
      const { chunks, limits, currentCount } = await step.run(
        'fetch-data',
        async () => {
          const supabase = createServiceRoleClient()

          // Get study pack with material
          const { data: studyPack, error: packError } = await supabase
            .from('study_packs')
            .select('id, material_id, users!inner(id, plan)')
            .eq('id', studyPackId)
            .single()

          if (packError || !studyPack) {
            throw new GenerationError(
              MaterialErrorCode.MATERIAL_NOT_FOUND,
              'Study pack not found'
            )
          }

          // Get chunks
          const { data: chunks, error: chunksError } = await supabase
            .from('chunks')
            .select('id, content, order_index')
            .eq('material_id', studyPack.material_id)
            .order('order_index', { ascending: true })

          if (chunksError || !chunks || chunks.length === 0) {
            throw new GenerationError(
              MaterialErrorCode.GENERATION_FAILED,
              'No chunks found for material'
            )
          }

          // Get plan limits
          const owner = studyPack.users as any
          const limits = await UsageService.getPlanLimits(owner.plan)

          // Get mindmap and count existing nodes
          const { data: mindmap } = await supabase
            .from('mindmaps')
            .select('id')
            .eq('study_pack_id', studyPackId)
            .single()

          let count = 0
          if (mindmap) {
            const { count: nodeCount } = await supabase
              .from('mindmap_nodes')
              .select('*', { count: 'exact', head: true })
              .eq('mindmap_id', mindmap.id)
            count = nodeCount || 0
          }

          return {
            chunks: chunks.map((c) => ({
              id: c.id,
              content: c.content,
              orderIndex: c.order_index,
            })),
            limits,
            currentCount: count,
          }
        }
      )

      // Step 3: Calculate how many to generate
      const toGenerate = await step.run('calculate-count', async () => {
        const remaining = limits.mindmapNodesLimit - currentCount
        if (remaining <= 0) {
          throw new GenerationError(
            MaterialErrorCode.GENERATION_FAILED,
            'Already at maximum limit'
          )
        }
        return Math.min(batchSize || limits.batchNodesSize || 60, remaining)
      })

      // Step 4: Generate mindmap nodes
      const generated = await step.run('generate-mindmap', async () => {
        return await GenerationService.generateMindMapIncremental(
          studyPackId,
          chunks,
          toGenerate
        )
      })

      // Step 5: Update stats and mark complete
      await step.run('finalize', async () => {
        const supabase = createServiceRoleClient()
        const newTotal = currentCount + generated

        // Get current stats_json
        const { data: pack } = await supabase
          .from('study_packs')
          .select('stats_json')
          .eq('id', studyPackId)
          .single()

        const statsJson = (pack?.stats_json as any) || {}
        const generationStatus = statsJson.generationStatus || {}

        // Update stats and mark as completed
        generationStatus.mindmap = {
          status: 'completed',
          updatedAt: new Date().toISOString(),
          generated,
          newTotal,
        }

        await supabase
          .from('study_packs')
          .update({
            stats_json: {
              ...statsJson,
              mindMapNodeCount: newTotal,
              generationStatus,
            },
            updated_at: new Date().toISOString(),
          })
          .eq('id', studyPackId)

        // Invalidate cache
        responseCache.invalidatePattern(new RegExp(`^study-pack:${studyPackId}:`))

        // Log event
        await supabase.from('events').insert({
          user_id: userId,
          event: 'mindmap_generated_more',
          props_json: {
            study_pack_id: studyPackId,
            generated,
            new_total: newTotal,
            generation_time: Date.now() - startTime,
          },
        })
      })

      return {
        studyPackId,
        generated,
        newTotal: currentCount + generated,
        status: 'completed',
      }
    } catch (error: any) {
      // Mark as failed
      await updateGenerationStatus(studyPackId, 'mindmap', 'failed', error.message)
      throw error
    }
  }
)
