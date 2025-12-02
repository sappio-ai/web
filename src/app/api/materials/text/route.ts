import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { MaterialService } from '@/lib/services/MaterialService'
import { UsageService } from '@/lib/services/UsageService'

/**
 * POST /api/materials/text
 * Handles pasted text submission for materials
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Authenticate user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

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

    // Parse JSON body
    const body = await request.json()
    const { text } = body

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text content is required', code: 'MISSING_TEXT' },
        { status: 400 }
      )
    }

    // Validate text length (min 50 chars, max 500k chars)
    const trimmedText = text.trim()
    if (trimmedText.length < 50) {
      return NextResponse.json(
        {
          error: 'Text is too short. Please provide at least 50 characters.',
          code: 'TEXT_TOO_SHORT',
        },
        { status: 400 }
      )
    }

    if (trimmedText.length > 500000) {
      return NextResponse.json(
        {
          error: 'Text is too long. Maximum 500,000 characters allowed.',
          code: 'TEXT_TOO_LONG',
        },
        { status: 400 }
      )
    }

    // Create material record with text stored in metadata
    let material
    try {
      material = await MaterialService.createMaterial(userId, {
        kind: 'text',
        metaJson: {
          extractedText: trimmedText,
          submittedAt: new Date().toISOString(),
        } as any,
      })
    } catch (error: any) {
      console.error('Material creation error:', error)
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
          textLength: trimmedText.length,
          createdAt: material.createdAt,
        },
        usage: quotaCheck.usage,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Text submission API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}
