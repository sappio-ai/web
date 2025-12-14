import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id: studyPackId } = await params

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify pack ownership
    const { data: pack, error: packError } = await supabase
      .from('study_packs')
      .select('user_id')
      .eq('id', studyPackId)
      .single()

    if (packError || !pack) {
      return NextResponse.json({ error: 'Study pack not found' }, { status: 404 })
    }

    if (pack.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get mindmap for this pack
    const { data: mindmap, error: mindmapError } = await supabase
      .from('mindmaps')
      .select('id')
      .eq('study_pack_id', studyPackId)
      .single()

    if (mindmapError || !mindmap) {
      return NextResponse.json({ count: 0 })
    }

    // Count mindmap nodes
    const { count, error: countError } = await supabase
      .from('mindmap_nodes')
      .select('*', { count: 'exact', head: true })
      .eq('mindmap_id', mindmap.id)

    if (countError) {
      console.error('Error counting mindmap nodes:', countError)
      return NextResponse.json(
        { error: 'Failed to count mindmap nodes' },
        { status: 500 }
      )
    }

    return NextResponse.json({ count: count || 0 })
  } catch (error) {
    console.error('Error in mindmap count endpoint:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
