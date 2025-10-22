/**
 * ProcessingService - Handles text extraction from various material types
 */

import { MaterialService } from './MaterialService'
import type { Material, MaterialKind } from '../types/materials'
import { ProcessingError, MaterialErrorCode } from '../utils/errors'
import { chunkContent, validateChunks } from '../utils/chunking'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'

export class ProcessingService {
  /**
   * Main entry point for text extraction based on material kind
   */
  static async extractText(material: Material): Promise<string> {
    switch (material.kind) {
      case 'pdf':
        return await this.extractPdfText(material)
      case 'docx':
        return await this.extractDocxText(material)
      case 'image':
        return await this.extractImageText(material)
      case 'url':
        return await this.extractUrlContent(material)
      case 'youtube':
        return await this.extractYoutubeTranscript(material)
      default:
        throw new ProcessingError(
          MaterialErrorCode.UNSUPPORTED_TYPE,
          `Unsupported material kind: ${material.kind}`,
          material.id
        )
    }
  }

  /**
   * Extracts text from PDF files
   */
  static async extractPdfText(material: Material): Promise<string> {
    if (!material.storagePath) {
      throw new ProcessingError(
        MaterialErrorCode.STORAGE_ERROR,
        'No storage path for PDF',
        material.id
      )
    }

    // Download file from storage
    const blob = await MaterialService.downloadFromStorage(material.storagePath)
    
    // Convert blob to buffer
    const buffer = Buffer.from(await blob.arrayBuffer())

    // Import pdf-parse dynamically (use node-specific version)
    const pdfParseModule = await import('pdf-parse/node')
    const pdfParse = (pdfParseModule as any).default || pdfParseModule

    try {
      const data = await pdfParse(buffer)
      
      // Update material with page count separately
      const { createClient } = await import('@/lib/supabase/server')
      const supabase = await createClient()
      await supabase
        .from('materials')
        .update({ page_count: data.numpages })
        .eq('id', material.id)

      return data.text
    } catch (error: any) {
      throw new ProcessingError(
        MaterialErrorCode.EXTRACTION_FAILED,
        `PDF extraction failed: ${error.message}`,
        material.id
      )
    }
  }

  /**
   * Extracts text from DOCX files
   */
  static async extractDocxText(material: Material): Promise<string> {
    if (!material.storagePath) {
      throw new ProcessingError(
        MaterialErrorCode.STORAGE_ERROR,
        'No storage path for DOCX',
        material.id
      )
    }

    // Download file from storage
    const blob = await MaterialService.downloadFromStorage(material.storagePath)
    
    // Convert blob to buffer
    const buffer = Buffer.from(await blob.arrayBuffer())

    // Import mammoth dynamically
    const mammoth = await import('mammoth')

    try {
      const result = await mammoth.extractRawText({ buffer })
      return result.value
    } catch (error: any) {
      throw new ProcessingError(
        MaterialErrorCode.EXTRACTION_FAILED,
        `DOCX extraction failed: ${error.message}`,
        material.id
      )
    }
  }

  /**
   * Extracts text from images using OCR
   */
  static async extractImageText(material: Material): Promise<string> {
    if (!material.storagePath) {
      throw new ProcessingError(
        MaterialErrorCode.STORAGE_ERROR,
        'No storage path for image',
        material.id
      )
    }

    // Download file from storage
    const blob = await MaterialService.downloadFromStorage(material.storagePath)
    
    // Convert blob to buffer
    const buffer = Buffer.from(await blob.arrayBuffer())

    // Import Tesseract.js dynamically
    const Tesseract = await import('tesseract.js')

    try {
      const worker = await Tesseract.createWorker('eng')
      const { data } = await worker.recognize(buffer)
      await worker.terminate()

      if (!data.text || data.text.trim().length === 0) {
        throw new ProcessingError(
          MaterialErrorCode.EXTRACTION_FAILED,
          'No text found in image. Please ensure the image contains readable text.',
          material.id
        )
      }

      return data.text
    } catch (error: any) {
      if (error instanceof ProcessingError) {
        throw error
      }
      throw new ProcessingError(
        MaterialErrorCode.EXTRACTION_FAILED,
        `OCR extraction failed: ${error.message}`,
        material.id
      )
    }
  }

  /**
   * Extracts content from URLs
   */
  static async extractUrlContent(material: Material): Promise<string> {
    if (!material.sourceUrl) {
      throw new ProcessingError(
        MaterialErrorCode.INVALID_INPUT,
        'No source URL provided',
        material.id
      )
    }

    try {
      // Fetch the URL with timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

      const response = await fetch(material.sourceUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; SappioBot/1.0)',
        },
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const html = await response.text()

      // Import cheerio dynamically
      const cheerio = await import('cheerio')
      const $ = cheerio.load(html)

      // Remove script, style, nav, footer, and other non-content elements
      $('script, style, nav, footer, header, aside, .advertisement, .ads').remove()

      // Try to find main content area
      let content = ''
      const mainSelectors = [
        'article',
        'main',
        '[role="main"]',
        '.content',
        '.post-content',
        '.article-content',
        '#content',
      ]

      for (const selector of mainSelectors) {
        const element = $(selector)
        if (element.length > 0) {
          content = element.text()
          break
        }
      }

      // Fallback to body if no main content found
      if (!content) {
        content = $('body').text()
      }

      // Clean up whitespace
      content = content
        .replace(/\s+/g, ' ')
        .replace(/\n+/g, '\n')
        .trim()

      if (!content || content.length < 100) {
        throw new ProcessingError(
          MaterialErrorCode.EXTRACTION_FAILED,
          'Unable to extract meaningful content from URL',
          material.id
        )
      }

      return content
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw new ProcessingError(
          MaterialErrorCode.EXTRACTION_FAILED,
          'URL fetch timeout. Please try again or check the URL.',
          material.id
        )
      }
      if (error instanceof ProcessingError) {
        throw error
      }
      throw new ProcessingError(
        MaterialErrorCode.EXTRACTION_FAILED,
        `URL content extraction failed: ${error.message}`,
        material.id
      )
    }
  }

  /**
   * Extracts transcript from YouTube videos
   */
  static async extractYoutubeTranscript(material: Material): Promise<string> {
    if (!material.sourceUrl) {
      throw new ProcessingError(
        MaterialErrorCode.INVALID_INPUT,
        'No source URL provided',
        material.id
      )
    }

    try {
      // Import youtube-transcript dynamically
      const { YoutubeTranscript } = await import('youtube-transcript')

      const transcript = await YoutubeTranscript.fetchTranscript(
        material.sourceUrl
      )

      if (!transcript || transcript.length === 0) {
        throw new ProcessingError(
          MaterialErrorCode.EXTRACTION_FAILED,
          'No transcript available for this video. The video may not have captions.',
          material.id
        )
      }

      // Combine transcript segments into text
      const text = transcript.map((segment: any) => segment.text).join(' ')

      return text
    } catch (error: any) {
      if (error instanceof ProcessingError) {
        throw error
      }
      throw new ProcessingError(
        MaterialErrorCode.EXTRACTION_FAILED,
        `YouTube transcript extraction failed: ${error.message}`,
        material.id
      )
    }
  }

  /**
   * Chunks extracted text and stores chunks in database
   */
  static async chunkAndStoreContent(
    materialId: string,
    text: string
  ): Promise<number> {
    // Update status to chunking
    await MaterialService.updateMaterialStatus(materialId, 'chunking')

    // Chunk the content
    const chunks = chunkContent(text)

    if (!validateChunks(chunks)) {
      throw new ProcessingError(
        MaterialErrorCode.EXTRACTION_FAILED,
        'Failed to create valid chunks from content',
        materialId
      )
    }

    // Store chunks in database (use service role for background job)
    const supabase = createServiceRoleClient()

    const chunkRecords = chunks.map((chunk) => ({
      material_id: materialId,
      content: chunk.content,
      token_count: chunk.tokenCount,
      order_index: chunk.orderIndex,
      meta_json: {},
    }))

    console.log(`Storing ${chunkRecords.length} chunks for material ${materialId}`)

    const { error } = await supabase.from('chunks').insert(chunkRecords)

    if (error) {
      console.error('Failed to store chunks:', error)
      throw new ProcessingError(
        MaterialErrorCode.DATABASE_ERROR,
        `Failed to store chunks: ${error.message}`,
        materialId
      )
    }

    console.log('Chunks stored successfully')

    // Update material status to ready
    await MaterialService.updateMaterialStatus(materialId, 'ready')

    return chunks.length
  }

  /**
   * Generates embeddings for all chunks of a material
   */
  static async generateEmbeddings(materialId: string): Promise<number> {
    // Use service role for background job
    const supabase = createServiceRoleClient()

    console.log(`Fetching chunks for material ${materialId}`)

    // Fetch all chunks for this material
    const { data: chunks, error: fetchError } = await supabase
      .from('chunks')
      .select('id, content')
      .eq('material_id', materialId)
      .order('order_index', { ascending: true })

    console.log(`Found ${chunks?.length || 0} chunks`)

    if (fetchError || !chunks) {
      throw new ProcessingError(
        MaterialErrorCode.DATABASE_ERROR,
        `Failed to fetch chunks: ${fetchError?.message}`,
        materialId
      )
    }

    if (chunks.length === 0) {
      throw new ProcessingError(
        MaterialErrorCode.EXTRACTION_FAILED,
        'No chunks found for material',
        materialId
      )
    }

    // Generate embeddings in batches
    const { generateEmbeddings } = await import('@/lib/ai/openai')
    const texts = chunks.map((chunk) => chunk.content)

    let embeddings: number[][]
    try {
      embeddings = await generateEmbeddings(texts)
    } catch (error: any) {
      throw new ProcessingError(
        MaterialErrorCode.AI_API_ERROR,
        `Failed to generate embeddings: ${error.message}`,
        materialId
      )
    }

    // Update chunks with embeddings
    const updates = chunks.map((chunk, index) => ({
      id: chunk.id,
      vector: embeddings[index],
    }))

    // Update in batches to avoid overwhelming the database
    const BATCH_SIZE = 50
    for (let i = 0; i < updates.length; i += BATCH_SIZE) {
      const batch = updates.slice(i, i + BATCH_SIZE)

      for (const update of batch) {
        const { error: updateError } = await supabase
          .from('chunks')
          .update({ vector: update.vector })
          .eq('id', update.id)

        if (updateError) {
          console.error('Failed to update chunk embedding:', updateError)
          // Continue with other chunks even if one fails
        }
      }
    }

    return embeddings.length
  }
}
