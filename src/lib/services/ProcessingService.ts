/**
 * ProcessingService - Handles text extraction from various material types
 */

import { MaterialService } from './MaterialService'
import type { Material } from '../types/materials'
import { ProcessingError, MaterialErrorCode } from '../utils/errors'
import { chunkContent, validateChunks } from '../utils/chunking'
import { createServiceRoleClient } from '@/lib/supabase/server'

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
      case 'doc':
        return await this.extractDocText(material)
      case 'image':
        return await this.extractImageText(material)
      case 'url':
        return await this.extractUrlContent(material)
      case 'youtube':
        return await this.extractYoutubeTranscript(material)
      case 'text':
        return await this.extractTextContent(material)
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

    console.log(`[PDF] Starting text extraction for material ${material.id}`)
    console.log(`[PDF] Storage path: ${material.storagePath}`)

    try {
      // Download file from storage
      console.log(`[PDF] Downloading PDF from storage...`)
      const blob = await MaterialService.downloadFromStorage(material.storagePath)
      console.log(`[PDF] ✅ PDF downloaded (${blob.size} bytes)`)

      // Convert blob to buffer
      const buffer = Buffer.from(await blob.arrayBuffer())
      console.log(`[PDF] ✅ Converted to buffer (${buffer.length} bytes)`)

      // Parse PDF using dedicated loader
      console.log(`[PDF] Parsing PDF...`)
      const { parsePdf } = await import('@/lib/utils/pdf-loader')
      const data = await parsePdf(buffer)
      console.log(`[PDF] ✅ PDF parsed successfully`)
      console.log(`[PDF] Pages: ${data.numpages}`)
      console.log(`[PDF] Text length: ${data.text.length} characters`)

      // Update material with page count separately
      console.log(`[PDF] Updating page count in database...`)
      const { createClient } = await import('@/lib/supabase/server')
      const supabase = await createClient()
      await supabase
        .from('materials')
        .update({ page_count: data.numpages })
        .eq('id', material.id)
      console.log(`[PDF] ✅ Page count updated`)

      console.log(`[PDF] ✅ Successfully extracted ${data.text.length} characters from ${data.numpages} pages`)

      return data.text
    } catch (error: any) {
      console.error(`[PDF] ❌ Error during PDF processing:`, error)
      console.error(`[PDF] Error message:`, error.message)
      console.error(`[PDF] Error stack:`, error.stack)

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
   * Extracts text from DOC files (old Word format)
   * Uses word-extractor library which handles .doc files natively
   */
  static async extractDocText(material: Material): Promise<string> {
    if (!material.storagePath) {
      throw new ProcessingError(
        MaterialErrorCode.STORAGE_ERROR,
        'No storage path for DOC',
        material.id
      )
    }

    console.log(`[DOC] Starting text extraction for material ${material.id}`)

    try {
      // Download file from storage
      const blob = await MaterialService.downloadFromStorage(material.storagePath)

      // Convert blob to buffer
      const buffer = Buffer.from(await blob.arrayBuffer())
      console.log(`[DOC] Downloaded file (${buffer.length} bytes)`)

      // Import word-extractor dynamically
      const WordExtractor = (await import('word-extractor')).default
      const extractor = new WordExtractor()

      // Extract text from buffer
      const extracted = await extractor.extract(buffer)
      const text = extracted.getBody()

      console.log(`[DOC] Extracted ${text.length} characters`)

      if (!text || text.trim().length === 0) {
        throw new Error('No text extracted from .doc file')
      }

      return text
    } catch (error: any) {
      console.error(`[DOC] Extraction failed:`, error)
      throw new ProcessingError(
        MaterialErrorCode.EXTRACTION_FAILED,
        `.doc file extraction failed: ${error.message}`,
        material.id
      )
    }
  }

  /**
   * Extracts text from images using OCR
   * Uses node-tesseract-ocr which requires Tesseract to be installed on the system
   */
  static async extractImageText(material: Material): Promise<string> {
    if (!material.storagePath) {
      throw new ProcessingError(
        MaterialErrorCode.STORAGE_ERROR,
        'No storage path for image',
        material.id
      )
    }

    console.log(`[OCR] Starting text extraction for material ${material.id}`)
    console.log(`[OCR] Storage path: ${material.storagePath}`)

    try {
      // Download file from storage
      console.log(`[OCR] Downloading image from storage...`)
      const blob = await MaterialService.downloadFromStorage(material.storagePath)
      console.log(`[OCR] ✅ Image downloaded (${blob.size} bytes)`)

      // Convert blob to buffer
      const buffer = Buffer.from(await blob.arrayBuffer())
      console.log(`[OCR] ✅ Converted to buffer (${buffer.length} bytes)`)

      // Save to temporary file
      const fs = await import('fs')
      const path = await import('path')
      const os = await import('os')

      const tempDir = os.tmpdir()
      const tempFile = path.join(tempDir, `ocr-${material.id}-${Date.now()}.png`)

      console.log(`[OCR] Writing to temporary file: ${tempFile}`)
      fs.writeFileSync(tempFile, buffer)
      console.log(`[OCR] ✅ Temporary file created`)

      // Import node-tesseract-ocr
      console.log(`[OCR] Loading Tesseract OCR...`)
      const tesseract = await import('node-tesseract-ocr')
      console.log(`[OCR] ✅ Tesseract OCR loaded`)

      console.log(`[OCR] Starting text recognition...`)
      const text = await tesseract.default.recognize(tempFile, {
        lang: 'eng',
        oem: 1,
        psm: 3,
      })
      console.log(`[OCR] ✅ Recognition complete`)

      // Clean up temporary file
      try {
        fs.unlinkSync(tempFile)
        console.log(`[OCR] ✅ Temporary file cleaned up`)
      } catch (cleanupError) {
        console.warn(`[OCR] ⚠️ Failed to cleanup temp file: ${cleanupError}`)
      }

      if (!text || text.trim().length === 0) {
        console.error(`[OCR] ❌ No text found in image`)
        throw new ProcessingError(
          MaterialErrorCode.EXTRACTION_FAILED,
          'No text found in image. Please ensure the image contains readable text.',
          material.id
        )
      }

      console.log(`[OCR] ✅ Successfully extracted ${text.length} characters`)

      return text.trim()
    } catch (error: any) {
      console.error(`[OCR] ❌ Error during OCR processing:`, error)
      console.error(`[OCR] Error message:`, error.message)
      console.error(`[OCR] Error stack:`, error.stack)

      if (error instanceof ProcessingError) {
        throw error
      }

      // Check if Tesseract is not installed
      if (error.message?.includes('tesseract') || error.code === 'ENOENT') {
        throw new ProcessingError(
          MaterialErrorCode.EXTRACTION_FAILED,
          `OCR is not available. Tesseract needs to be installed on the server.\n\nFor now, please use text-based files (PDF, DOCX) instead of images.`,
          material.id
        )
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
   * First tries to fetch existing transcript, falls back to AssemblyAI if unavailable
   */
  static async extractYoutubeTranscript(material: Material): Promise<string> {
    if (!material.sourceUrl) {
      throw new ProcessingError(
        MaterialErrorCode.INVALID_INPUT,
        'No source URL provided',
        material.id
      )
    }

    console.log(`[YouTube] Starting transcript extraction for material ${material.id}`)
    console.log(`[YouTube] URL: ${material.sourceUrl}`)

    try {
      // Import youtube-transcript dynamically
      const { YoutubeTranscript } = await import('youtube-transcript')

      console.log(`[YouTube] Attempting to fetch existing transcript...`)
      const transcript = await YoutubeTranscript.fetchTranscript(
        material.sourceUrl
      )

      if (!transcript || transcript.length === 0) {
        console.log(`[YouTube] No transcript segments returned, trying fallback...`)
        return await this.extractYoutubeTranscriptWithAssemblyAI(material)
      }

      // Combine transcript segments into text
      const text = transcript.map((segment: any) => segment.text).join(' ')
      console.log(`[YouTube] ✅ Successfully extracted transcript using YouTube API (${text.length} characters)`)

      return text
    } catch (error: any) {
      if (error instanceof ProcessingError) {
        throw error
      }

      console.log(`[YouTube] ⚠️ YouTube transcript fetch failed: ${error.message}`)
      console.log(`[YouTube] Attempting fallback to AssemblyAI...`)

      // Try AssemblyAI fallback
      return await this.extractYoutubeTranscriptWithAssemblyAI(material)
    }
  }

  /**
   * Fallback method: Downloads YouTube audio and transcribes with AssemblyAI
   */
  static async extractYoutubeTranscriptWithAssemblyAI(material: Material): Promise<string> {
    const assemblyApiKey = process.env.ASSEMBLYAI_API_KEY

    console.log(`[AssemblyAI] ========================================`)
    console.log(`[AssemblyAI] Starting AI transcription`)
    console.log(`[AssemblyAI] Material ID: ${material.id}`)
    console.log(`[AssemblyAI] Video URL: ${material.sourceUrl}`)
    console.log(`[AssemblyAI] API Key configured: ${assemblyApiKey ? 'YES' : 'NO'}`)
    console.log(`[AssemblyAI] API Key (first 10 chars): ${assemblyApiKey?.substring(0, 10)}...`)
    console.log(`[AssemblyAI] ========================================`)

    if (!assemblyApiKey) {
      console.error(`[AssemblyAI] ❌ API key not configured`)
      throw new ProcessingError(
        MaterialErrorCode.EXTRACTION_FAILED,
        `This YouTube video has transcripts disabled by the creator.\n\nTo enable AI-powered transcription for videos without transcripts, please configure AssemblyAI:\n\n1. Sign up at https://www.assemblyai.com (free tier: 5 hours/month)\n2. Get your API key\n3. Add ASSEMBLYAI_API_KEY to your .env.local file\n\nAlternatively, try a different video that has transcripts enabled.`,
        material.id
      )
    }

    let tempStoragePath: string | null = null

    try {
      // Step 1: Download audio from YouTube
      console.log(`[AssemblyAI] Step 1: Downloading audio from YouTube...`)
      const audioBuffer = await this.downloadYoutubeAudio(material.sourceUrl!)
      console.log(`[AssemblyAI] ✅ Audio downloaded (${(audioBuffer.length / 1024 / 1024).toFixed(2)} MB)`)

      // Step 2: Upload audio to Supabase Storage temporarily
      console.log(`[AssemblyAI] Step 2: Uploading audio to temporary storage...`)
      tempStoragePath = await this.uploadTempAudio(material.id, audioBuffer)
      console.log(`[AssemblyAI] ✅ Audio uploaded to: ${tempStoragePath}`)

      // Step 3: Get public URL for the audio
      const audioUrl = await this.getTempAudioUrl(tempStoragePath)
      console.log(`[AssemblyAI] Step 3: Generated public URL for AssemblyAI`)

      // Step 4: Transcribe with AssemblyAI
      console.log(`[AssemblyAI] Step 4: Submitting to AssemblyAI for transcription...`)
      const { AssemblyAI } = await import('assemblyai')
      const client = new AssemblyAI({ apiKey: assemblyApiKey })

      const transcript = await client.transcripts.transcribe({
        audio: audioUrl,
      })

      if (transcript.status === 'error') {
        console.error(`[AssemblyAI] ❌ Transcription failed: ${transcript.error}`)
        throw new Error(transcript.error || 'Transcription failed')
      }

      if (!transcript.text) {
        console.error(`[AssemblyAI] ❌ No text in transcript response`)
        throw new Error('No text returned from transcription')
      }

      console.log(`[AssemblyAI] ✅ Successfully transcribed video (${transcript.text.length} characters)`)
      console.log(`[AssemblyAI] 📊 Audio duration: ${transcript.audio_duration}s`)
      console.log(`[AssemblyAI] 💰 Cost estimate: ~$${((transcript.audio_duration || 0) / 3600 * 0.37).toFixed(4)}`)

      return transcript.text
    } catch (error: any) {
      console.error(`[AssemblyAI] ❌ Transcription error: ${error.message}`)
      throw new ProcessingError(
        MaterialErrorCode.EXTRACTION_FAILED,
        `AI transcription failed: ${error.message}\n\nThis video may not be accessible or may have restrictions. Please try a different video.`,
        material.id
      )
    } finally {
      // Step 5: Clean up temporary audio file
      if (tempStoragePath) {
        console.log(`[AssemblyAI] Step 5: Cleaning up temporary audio file...`)
        await this.deleteTempAudio(tempStoragePath)
        console.log(`[AssemblyAI] ✅ Cleanup complete`)
      }
    }
  }

  /**
   * Downloads audio-only stream from YouTube video using youtubei.js
   * Most reliable and actively maintained method for YouTube downloads
   */
  static async downloadYoutubeAudio(youtubeUrl: string): Promise<Buffer> {
    const { Innertube, UniversalCache } = await import('youtubei.js')
    const fs = await import('fs')
    const path = await import('path')
    const os = await import('os')

    console.log(`[youtubei.js] ========== DOWNLOAD START ==========`)
    console.log(`[youtubei.js] Video URL: ${youtubeUrl}`)

    try {
      // Initialize Innertube client
      const youtube = await Innertube.create({
        cache: new UniversalCache(false),
        // If you need age-restricted videos, add cookies:
        // cookie: process.env.YOUTUBE_COOKIES,
      })

      console.log(`[youtubei.js] Fetching video info...`)
      const info = await youtube.getInfo(youtubeUrl)

      console.log(`[youtubei.js] ✅ Video info fetched`)
      console.log(`[youtubei.js] Title: ${info.basic_info.title}`)
      console.log(`[youtubei.js] Duration: ${info.basic_info.duration}s`)
      console.log(`[youtubei.js] Playable: ${info.playability_status?.status}`)

      // Check if video is playable
      if (info.playability_status?.status !== 'OK') {
        const reason = info.playability_status?.reason || 'Unknown reason'
        throw new Error(`Video not playable: ${reason}`)
      }

      // Choose best audio format
      const format = info.chooseFormat({ type: 'audio', quality: 'best' })
      if (!format?.decipher) {
        throw new Error('No audio format with valid URL found')
      }

      console.log(`[youtubei.js] Selected format: ${format.mime_type}`)
      console.log(`[youtubei.js] Downloading audio stream...`)

      // Download the audio stream
      const stream = await info.download({ type: 'audio', quality: 'best' })

      // Collect chunks into buffer
      const chunks: Buffer[] = []
      let totalBytes = 0

      for await (const chunk of stream as any) {
        chunks.push(Buffer.from(chunk))
        totalBytes += chunk.length

        // Log progress every 5MB
        if (totalBytes % (5 * 1024 * 1024) < chunk.length) {
          console.log(`[youtubei.js] Downloaded: ${(totalBytes / 1024 / 1024).toFixed(2)} MB`)
        }
      }

      const buffer = Buffer.concat(chunks)
      console.log(`[youtubei.js] ✅ Download complete (${(buffer.length / 1024 / 1024).toFixed(2)} MB)`)

      return buffer
    } catch (error: any) {
      console.error(`[youtubei.js] ❌ Download failed:`, error.message)
      throw new Error(`YouTube download failed: ${error.message}`)
    }
  }

  /**
   * Uploads audio buffer to Supabase Storage temporarily
   */
  static async uploadTempAudio(materialId: string, audioBuffer: Buffer): Promise<string> {
    const supabase = createServiceRoleClient()
    const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'materials'

    // Create a temporary path for the audio file (webm format from ytdl-core)
    const tempPath = `temp-audio/${materialId}-${Date.now()}.webm`

    const { error } = await supabase.storage
      .from(bucket)
      .upload(tempPath, audioBuffer, {
        contentType: 'audio/webm',
        upsert: false,
      })

    if (error) {
      throw new Error(`Failed to upload temp audio: ${error.message}`)
    }

    return tempPath
  }

  /**
   * Gets a public URL for the temporary audio file
   */
  static async getTempAudioUrl(storagePath: string): Promise<string> {
    const supabase = createServiceRoleClient()
    const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'materials'

    // Create a signed URL that expires in 1 hour
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(storagePath, 3600)

    if (error || !data) {
      throw new Error(`Failed to create signed URL: ${error?.message}`)
    }

    return data.signedUrl
  }

  /**
   * Deletes temporary audio file from storage
   */
  static async deleteTempAudio(storagePath: string): Promise<void> {
    try {
      const supabase = createServiceRoleClient()
      const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'materials'

      const { error } = await supabase.storage
        .from(bucket)
        .remove([storagePath])

      if (error) {
        console.error(`[AssemblyAI] ⚠️ Failed to delete temp audio: ${error.message}`)
        // Don't throw - cleanup failure shouldn't break the flow
      }
    } catch (error: any) {
      console.error(`[AssemblyAI] ⚠️ Cleanup error: ${error.message}`)
      // Don't throw - cleanup failure shouldn't break the flow
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
      content: chunk.content.replace(/\u0000/g, ''), // Remove null bytes for PostgreSQL
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

  /**
   * Extracts text from pasted text content
   * Text is already stored in material metadata
   */
  static async extractTextContent(material: Material): Promise<string> {
    console.log(`[Text] Starting text extraction for material ${material.id}`)

    const extractedText = material.metaJson?.extractedText

    if (!extractedText || typeof extractedText !== 'string') {
      throw new ProcessingError(
        MaterialErrorCode.EXTRACTION_FAILED,
        'No text content found in material metadata',
        material.id
      )
    }

    console.log(`[Text] ✅ Extracted ${extractedText.length} characters`)
    return extractedText
  }
}
