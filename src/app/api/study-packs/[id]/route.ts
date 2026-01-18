import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'
import { responseCache, CACHE_TTL } from '@/lib/utils/cache'

/**
 * GET /api/study-packs/:id
 * Returns complete study pack with all generated content
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id: studyPackId } = await params

    const demoId = process.env.NEXT_PUBLIC_DEMO_PACK_ID || '3747df11-0426-4749-8597-af89639e8d38'
    const isDemo = studyPackId === demoId
    let user = null
    let pack = null
    let supabaseClient = supabase

    if (isDemo) {
      // DEMO MODE: Bypass Auth
      supabaseClient = createServiceRoleClient()

      const { data: demoPack, error: demoError } = await supabaseClient
        .from('study_packs')
        .select(`
                *,
                materials(id, kind, source_url, page_count)
            `)
        .eq('id', studyPackId)
        .single()

      if (demoError || !demoPack) {
        return NextResponse.json({ error: 'Study pack not found' }, { status: 404 })
      }
      pack = demoPack
    } else {
      // STANDARD MODE: Strict Auth
      const {
        data: { user: authUser },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !authUser) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      user = authUser

      // Check cache first (skip if request has cache-busting param)
      const url = new URL(request.url)
      const skipCache = url.searchParams.has('t')
      const cacheKey = `study-pack:${studyPackId}:${user.id}`

      if (!skipCache) {
        const cached = responseCache.get(cacheKey, CACHE_TTL.STUDY_PACK)
        if (cached) {
          return NextResponse.json(cached)
        }
      }

      // Get study pack with ownership verification
      const { data: userPack, error: packError } = await supabase
        .from('study_packs')
        .select(
          `
            *,
            users!inner(id),
            materials(id, kind, source_url, page_count)
        `
        )
        .eq('id', studyPackId)
        .eq('users.auth_user_id', user.id)
        .single()

      if (packError || !userPack) {
        return NextResponse.json(
          { error: 'Study pack not found' },
          { status: 404 }
        )
      }
      pack = userPack
    }

    // Get flashcards
    const { data: flashcards } = await supabaseClient
      .from('flashcards')
      .select('*')
      .eq('study_pack_id', studyPackId)
      .order('created_at', { ascending: true })

    // Get quiz with items
    const { data: quizzes } = await supabaseClient
      .from('quizzes')
      .select(
        `
        *,
        quiz_items(*)
      `
      )
      .eq('study_pack_id', studyPackId)

    const quiz = quizzes?.[0] || null

    // Get mind map with nodes
    const { data: mindmaps } = await supabaseClient
      .from('mindmaps')
      .select(
        `
        *,
        mindmap_nodes(*)
      `
      )
      .eq('study_pack_id', studyPackId)

    const mindmap = mindmaps?.[0] || null

    // Extract notes from stats_json
    const notes = pack.stats_json?.notes || null

    // Build complete response
    const response = {
      id: pack.id,
      title: pack.title,
      summary: pack.summary,
      createdAt: pack.created_at,
      updatedAt: pack.updated_at,
      material: pack.materials
        ? {
          id: pack.materials.id,
          kind: pack.materials.kind,
          sourceUrl: pack.materials.source_url,
          pageCount: pack.materials.page_count,
        }
        : null,
      stats: {
        coverage: pack.stats_json?.coverage || 'med',
        generationTime: pack.stats_json?.generationTime || 0,
        cardCount: pack.stats_json?.cardCount || 0,
        quizQuestionCount: pack.stats_json?.quizQuestionCount || 0,
        mindMapNodeCount: pack.stats_json?.mindMapNodeCount || 0,
        chunkUtilization: pack.stats_json?.chunkUtilization || 0,
      },
      notes,
      flashcards: flashcards || [],
      quiz: quiz
        ? {
          id: quiz.id,
          configJson: quiz.config_json,
          createdAt: quiz.created_at,
          items: quiz.quiz_items || [],
        }
        : null,
      mindMap: mindmap
        ? {
          id: mindmap.id,
          title: mindmap.title,
          layoutJson: mindmap.layout_json,
          createdAt: mindmap.created_at,
          updatedAt: mindmap.updated_at,
          nodes: mindmap.mindmap_nodes || [],
        }
        : null,
    }

    // Cache the response
    if (user) {
      const cacheKey = `study-pack:${studyPackId}:${user.id}`
      responseCache.set(cacheKey, response)
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Study pack retrieval error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/study-packs/:id
 * Deletes a study pack and associated material
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id: studyPackId } = await params

    // Authenticate user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get study pack with ownership verification
    const { data: pack, error: packError } = await supabase
      .from('study_packs')
      .select('*, users!inner(id), materials(id, storage_path, status)')
      .eq('id', studyPackId)
      .eq('users.auth_user_id', user.id)
      .single()

    if (packError || !pack) {
      return NextResponse.json(
        { error: 'Study pack not found' },
        { status: 404 }
      )
    }

    // Prevent deletion if material is still processing
    if (
      pack.materials?.status === 'processing' ||
      pack.materials?.status === 'chunking'
    ) {
      return NextResponse.json(
        {
          error: 'Cannot delete while material is processing',
          code: 'PROCESSING_IN_PROGRESS',
        },
        { status: 400 }
      )
    }

    const materialId = pack.materials?.id
    const storagePath = pack.materials?.storage_path

    // Invalidate cache
    const cacheKey = `study-pack:${studyPackId}:${user.id}`
    responseCache.invalidate(cacheKey)

    // Delete in order (cascading will handle related records)
    // 1. Delete flashcards, quiz items, mindmap nodes (cascades via foreign keys)
    // 2. Delete study pack
    const { error: deletePackError } = await supabase
      .from('study_packs')
      .delete()
      .eq('id', studyPackId)

    if (deletePackError) {
      console.error('Failed to delete study pack:', deletePackError)
      return NextResponse.json(
        { error: 'Failed to delete study pack' },
        { status: 500 }
      )
    }

    // 3. Delete material if it exists
    if (materialId) {
      const { error: deleteMaterialError } = await supabase
        .from('materials')
        .delete()
        .eq('id', materialId)

      if (deleteMaterialError) {
        console.error('Failed to delete material:', deleteMaterialError)
        // Continue anyway, pack is already deleted
      }
    }

    // 4. Delete storage file if it exists
    if (storagePath) {
      const { error: deleteStorageError } = await supabase.storage
        .from('materials')
        .remove([storagePath])

      if (deleteStorageError) {
        console.error('Failed to delete storage file:', deleteStorageError)
        // Continue anyway, database records are deleted
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Study pack deleted successfully',
    })
  } catch (error) {
    console.error('Study pack deletion error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
