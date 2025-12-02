import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ExportServiceServer } from '@/lib/services/ExportService.server'

/**
 * POST /api/exports/notes-pdf
 * Export study pack notes to PDF
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

    // Get notes from stats_json
    const notes = pack.stats_json?.notes

    if (!notes) {
      return NextResponse.json(
        { error: 'No notes available for this study pack' },
        { status: 404 }
      )
    }

    // Generate PDF
    const pdfBuffer = await ExportServiceServer.generateNotesPDF(notes)

    // Return PDF as response
    return new NextResponse(Buffer.from(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${pack.title.replace(/[^a-z0-9]/gi, '_')}_notes.pdf"`,
      },
    })
  } catch (error) {
    console.error('Notes PDF export error:', error)
    return NextResponse.json(
      { error: 'Failed to export notes to PDF' },
      { status: 500 }
    )
  }
}
