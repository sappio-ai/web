import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ExportServiceServer } from '@/lib/services/ExportService.server'

/**
 * POST /api/exports/flashcards-csv
 * Export flashcards to CSV
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

    // Parse request body
    const { studyPackId } = await request.json()

    if (!studyPackId) {
      return NextResponse.json(
        { error: 'Study pack ID is required' },
        { status: 400 }
      )
    }

    // Get study pack with ownership verification
    const { data: pack, error: packError } = await supabase
      .from('study_packs')
      .select('*, users!inner(id, auth_user_id)')
      .eq('id', studyPackId)
      .eq('users.auth_user_id', user.id)
      .single()

    if (packError || !pack) {
      return NextResponse.json(
        { error: 'Study pack not found' },
        { status: 404 }
      )
    }

    // Get flashcards
    const { data: flashcards, error: cardsError } = await supabase
      .from('flashcards')
      .select('*')
      .eq('study_pack_id', studyPackId)
      .order('created_at', { ascending: true })

    if (cardsError) {
      return NextResponse.json(
        { error: 'Failed to fetch flashcards' },
        { status: 500 }
      )
    }

    if (!flashcards || flashcards.length === 0) {
      return NextResponse.json(
        { error: 'No flashcards available for this study pack' },
        { status: 404 }
      )
    }

    // Generate CSV
    const csv = await ExportServiceServer.generateFlashcardsCSV(flashcards)

    // Return CSV as response
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${pack.title.replace(/[^a-z0-9]/gi, '_')}_flashcards.csv"`,
      },
    })
  } catch (error) {
    console.error('Flashcards CSV export error:', error)
    return NextResponse.json(
      { error: 'Failed to export flashcards to CSV' },
      { status: 500 }
    )
  }
}
