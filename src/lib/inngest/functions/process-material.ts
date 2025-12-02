/**
 * Inngest function for processing materials
 * Handles text extraction, chunking, and embedding generation
 */

import { inngest } from '../client'
import { MaterialService } from '@/lib/services/MaterialService'
import { ProcessingService } from '@/lib/services/ProcessingService'
import { ProcessingError, MaterialErrorCode } from '@/lib/utils/errors'

export const processMaterial = inngest.createFunction(
  {
    id: 'process-material',
    name: 'Process Material',
    retries: 2,
  },
  { event: 'material/process' },
  async ({ event, step }) => {
    const { materialId } = event.data

    // Step 1: Extract text from material
    const text = await step.run('extract-text', async () => {
      try {
        // Update status to processing
        await MaterialService.updateMaterialStatus(materialId, 'processing')

        // Get material (use service role for background job)
        const material = await MaterialService.getMaterialServiceRole(materialId)

        // Extract text based on material kind
        const extractedText = await ProcessingService.extractText(material)

        if (!extractedText || extractedText.trim().length === 0) {
          throw new ProcessingError(
            MaterialErrorCode.EXTRACTION_FAILED,
            'No text could be extracted from material',
            materialId
          )
        }

        return extractedText
      } catch (error: any) {
        // Update material status to failed
        await MaterialService.updateMaterialStatus(materialId, 'failed', {
          error: error.message,
          stage: 'extraction',
        })
        throw error
      }
    })

    // Step 2: Chunk content and store
    const chunkCount = await step.run('chunk-content', async () => {
      try {
        const count = await ProcessingService.chunkAndStoreContent(
          materialId,
          text
        )
        return count
      } catch (error: any) {
        // Update material status to failed
        await MaterialService.updateMaterialStatus(materialId, 'failed', {
          error: error.message,
          stage: 'chunking',
        })
        throw error
      }
    })

    // Step 3: Generate embeddings
    const embeddingCount = await step.run('generate-embeddings', async () => {
      try {
        const count = await ProcessingService.generateEmbeddings(materialId)
        return count
      } catch (error: any) {
        // Update material status to failed
        await MaterialService.updateMaterialStatus(materialId, 'failed', {
          error: error.message,
          stage: 'embeddings',
        })
        throw error
      }
    })

    // Step 4: Mark as ready
    await step.run('mark-ready', async () => {
      await MaterialService.updateMaterialStatus(materialId, 'ready')
    })

    // Step 5: Trigger pack generation
    const packGeneration = await step.run('trigger-pack-generation', async () => {
      // Get material to find user_id (use service role for background job)
      const material = await MaterialService.getMaterialServiceRole(materialId)
      
      // Trigger pack generation
      await inngest.send({
        name: 'pack/generate',
        data: {
          materialId,
          userId: material.userId,
        },
      })

      return { triggered: true }
    })

    return {
      materialId,
      chunkCount,
      embeddingCount,
      packGeneration,
      status: 'completed',
    }
  }
)
