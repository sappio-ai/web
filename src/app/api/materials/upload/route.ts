import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { MaterialService } from '@/lib/services/MaterialService'
import { UsageService } from '@/lib/services/UsageService'
import {
  validateFile,
  getMaterialKindFromFile,
  MAX_FILE_SIZE,
  formatFileSize,
} from '@/lib/utils/files'
import { randomUUID } from 'crypto'

/**
 * POST /api/materials/upload
 * Handles file upload for materials (PDF, DOCX, images)
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Authenticate user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    console.log('Auth check:', { user: user?.id, authError })

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile to get internal user ID
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('id')
      .eq('auth_user_id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      )
    }

    const userId = profile.id

    // Check plan limits
    const quotaCheck = await UsageService.canCreatePack(userId)
    if (!quotaCheck.allowed) {
      const isGraceExceeded = quotaCheck.reason === 'quota_exceeded'

      return NextResponse.json(
        {
          error: 'Pack creation limit reached',
          code: 'QUOTA_EXCEEDED',
          usage: quotaCheck.usage,
          message: isGraceExceeded
            ? 'You have reached your monthly pack limit. Upgrade your plan to create more packs.'
            : 'Unable to check quota. Please try again.',
        },
        { status: 403 }
      )
    }

    // Parse multipart form data
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided', code: 'NO_FILE' },
        { status: 400 }
      )
    }

    // Validate file type
    const validationError = validateFile(file)
    if (validationError) {
      const isSizeError = file.size > MAX_FILE_SIZE
      return NextResponse.json(
        {
          error: validationError,
          code: isSizeError ? 'FILE_TOO_LARGE' : 'INVALID_FILE_TYPE',
        },
        { status: isSizeError ? 413 : 415 }
      )
    }

    // Get material kind
    const kind = getMaterialKindFromFile(file)
    if (!kind) {
      return NextResponse.json(
        {
          error: 'Unable to determine file type',
          code: 'UNKNOWN_FILE_TYPE',
        },
        { status: 400 }
      )
    }

    // Generate material ID
    const materialId = randomUUID()

    // Upload file to storage (use auth user ID for RLS)
    let storagePath: string
    try {
      storagePath = await MaterialService.uploadToStorage(
        file,
        user.id, // Use auth user ID for storage path (RLS policy)
        materialId
      )
    } catch (error: any) {
      console.error('Storage upload error:', error)
      return NextResponse.json(
        {
          error: 'Failed to upload file',
          code: 'UPLOAD_FAILED',
          details: error.message,
        },
        { status: 500 }
      )
    }

    // Create material record
    let material
    try {
      material = await MaterialService.createMaterial(userId, {
        kind,
        storagePath,
        metaJson: {
          filename: file.name,
          fileSize: file.size,
          mimeType: file.type,
        },
      })
    } catch (error: any) {
      console.error('Material creation error:', error)

      // Clean up uploaded file
      try {
        await MaterialService.deleteFromStorage(storagePath)
      } catch (cleanupError) {
        console.error('Failed to cleanup storage:', cleanupError)
      }

      return NextResponse.json(
        {
          error: 'Failed to create material record',
          code: 'DATABASE_ERROR',
          details: error.message,
        },
        { status: 500 }
      )
    }

    // Trigger background processing
    try {
      const { inngest } = await import('@/lib/inngest/client')
      await inngest.send({
        name: 'material/process',
        data: {
          materialId: material.id,
        },
      })
    } catch (error) {
      console.error('Failed to trigger processing:', error)
      // Non-critical, material can be reprocessed manually
    }

    // Return success response
    return NextResponse.json(
      {
        success: true,
        material: {
          id: material.id,
          kind: material.kind,
          status: 'processing',
          filename: file.name,
          fileSize: file.size,
          createdAt: material.createdAt,
        },
        usage: quotaCheck.usage,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Upload API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}
