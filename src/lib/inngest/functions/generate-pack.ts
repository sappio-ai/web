/**
 * Inngest function for generating study packs
 * Orchestrates AI content generation and pack assembly
 */

import { inngest } from '../client'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { GenerationService } from '@/lib/services/GenerationService'
import { UsageService } from '@/lib/services/UsageService'
import { GenerationError, MaterialErrorCode } from '@/lib/utils/errors'

export const generatePack = inngest.createFunction(
  {
    id: 'generate-pack',
    name: 'Generate Study Pack',
    retries: 1,
    // TODO: Re-enable priority processing after Inngest version update
    // priority: {
    //   run: async (event) => {
    //     const { userId } = event.data
    //     const supabase = createServiceRoleClient()
    //     const { data: user } = await supabase.from('users').select('plan').eq('id', userId).single()
    //     return user?.plan === 'student_pro' || user?.plan === 'pro_plus' ? 100 : 0
    //   },
    // },
  },
  { event: 'pack/generate' },
  async ({ event, step }) => {
    const { materialId, userId } = event.data
    const startTime = Date.now()

    // Step 1: Fetch material and chunks
    const { material, chunks, userPlan } = await step.run(
      'fetch-data',
      async () => {
        // Use service role for background job
        const supabase = createServiceRoleClient()

        console.log(`Fetching material and chunks for ${materialId}`)

        // Get material
        const { data: material, error: materialError } = await supabase
          .from('materials')
          .select('*')
          .eq('id', materialId)
          .single()

        if (materialError || !material) {
          console.error('Material fetch error:', materialError)
          throw new GenerationError(
            MaterialErrorCode.MATERIAL_NOT_FOUND,
            'Material not found'
          )
        }

        console.log('Material found:', material.id)

        // Get chunks
        const { data: chunks, error: chunksError } = await supabase
          .from('chunks')
          .select('id, content, order_index')
          .eq('material_id', materialId)
          .order('order_index', { ascending: true })

        console.log(`Found ${chunks?.length || 0} chunks`)

        if (chunksError || !chunks || chunks.length === 0) {
          throw new GenerationError(
            MaterialErrorCode.GENERATION_FAILED,
            'No chunks found for material'
          )
        }

        // Get user plan
        const user = await UsageService.getUserProfile(userId)

        return {
          material,
          chunks: chunks.map((c) => ({
            id: c.id,
            content: c.content,
            orderIndex: c.order_index,
          })),
          userPlan: user.plan,
        }
      }
    )

    // Step 2: Generate AI title from content
    const generatedTitle = await step.run('generate-title', async () => {
      console.log('Generating title from content')
      return await GenerationService.generateTitle(chunks)
    })

    // Step 3: Create study pack record
    const studyPackId = await step.run('create-study-pack', async () => {
      // Use service role for background job
      const supabase = createServiceRoleClient()

      console.log('Creating study pack record with title:', generatedTitle)

      const { data: pack, error } = await supabase
        .from('study_packs')
        .insert({
          user_id: userId,
          material_id: materialId,
          title: generatedTitle,
          summary: '',
          stats_json: {},
        })
        .select()
        .single()

      if (error || !pack) {
        console.error('Failed to create study pack:', error)
        throw new GenerationError(
          MaterialErrorCode.DATABASE_ERROR,
          `Failed to create study pack: ${error?.message}`
        )
      }

      console.log('Study pack created:', pack.id)
      return pack.id
    })

    // Step 4: Get plan limits
    const limits = await step.run('get-plan-limits', async () => {
      return await UsageService.getPlanLimits(userPlan)
    })

    // Step 5: Generate all content in parallel
    const results = await step.run('generate-content', async () => {
      try {
        const [notes, learningData, , , ] = await Promise.all([
          GenerationService.generateSmartNotes(materialId, chunks),
          GenerationService.generateLearningObjectivesAndTags(chunks),
          GenerationService.generateFlashcards(
            studyPackId,
            chunks,
            limits.cardsPerPack
          ),
          GenerationService.generateQuiz(
            studyPackId,
            chunks,
            limits.questionsPerQuiz
          ),
          GenerationService.generateMindMap(
            studyPackId,
            chunks,
            limits.mindmapNodesLimit
          ),
        ])

        return { notes, learningData }
      } catch (error: any) {
        throw new GenerationError(
          MaterialErrorCode.AI_API_ERROR,
          `Content generation failed: ${error.message}`
        )
      }
    })

    // Step 6: Calculate coverage and update pack
    await step.run('finalize-pack', async () => {
      // Use service role for background job
      const supabase = createServiceRoleClient()
      const generationTime = Date.now() - startTime

      console.log('Finalizing study pack')

      // Calculate coverage (simplified - using all chunks as "used")
      const coverage = GenerationService.calculateCoverage(
        chunks.length,
        Math.min(chunks.length, 20)
      )

      // Count generated items
      const { count: cardCount } = await supabase
        .from('flashcards')
        .select('*', { count: 'exact', head: true })
        .eq('study_pack_id', studyPackId)

      const { count: quizCount } = await supabase
        .from('quiz_items')
        .select('*', { count: 'exact', head: true })
        .eq('quiz_id', studyPackId)

      const { count: nodeCount } = await supabase
        .from('mindmap_nodes')
        .select('*', { count: 'exact', head: true })
        .eq('mindmap_id', studyPackId)

      console.log('Generated items:', { cardCount, quizCount, nodeCount })

      // Update study pack with stats and notes
      const { error: updateError } = await supabase
        .from('study_packs')
        .update({
          summary: results.notes.overview,
          stats_json: {
            coverage,
            generationTime,
            cardCount: cardCount || 0,
            quizQuestionCount: quizCount || 0,
            mindMapNodeCount: nodeCount || 0,
            chunkUtilization: Math.min(chunks.length, 20),
            notes: results.notes,
            learningObjectives: results.learningData.learningObjectives,
            tags: results.learningData.tags,
          },
          updated_at: new Date().toISOString(),
        })
        .eq('id', studyPackId)

      if (updateError) {
        console.error('Failed to update study pack:', updateError)
      }
    })

    // Step 7: Consume quota and log completion
    await step.run('consume-quota-and-log', async () => {
      console.log('[generate-pack] Study pack generation complete:', studyPackId)
      
      // Consume pack quota with idempotency
      console.log('[generate-pack] Consuming quota for user:', userId)
      const consumeResult = await UsageService.consumePackQuota(
        userId,
        `pack-${studyPackId}`
      )
      
      if (consumeResult.success) {
        console.log('[generate-pack] Quota consumed successfully. New count:', consumeResult.newCount)
      } else {
        console.error('[generate-pack] Failed to consume quota, but pack was created')
      }
      
      // Log analytics event
      console.log('[generate-pack] Logging pack_created event for user:', userId)
      try {
        await UsageService.logUsageEvent(userId, 'pack_created', {
          materialId,
          studyPackId,
          materialKind: material.kind,
          generationTime: Date.now() - startTime,
          chunkCount: chunks.length,
          newUsageCount: consumeResult.newCount,
        })
        console.log('[generate-pack] Event logged successfully')
      } catch (error) {
        console.error('[generate-pack] Failed to log event:', error)
      }
    })

    return {
      studyPackId,
      materialId,
      generationTime: Date.now() - startTime,
      status: 'completed',
    }
  }
)
