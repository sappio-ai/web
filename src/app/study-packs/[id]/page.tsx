import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import StudyPackView from '@/components/study-packs/StudyPackView'

export default async function StudyPackPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  // Authenticate user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  // Fetch study pack with all related data
  const { data: pack, error: packError } = await supabase
    .from('study_packs')
    .select(
      `
      *,
      users!inner(id, auth_user_id, plan),
      materials(id, kind, source_url, page_count, status)
    `
    )
    .eq('id', id)
    .eq('users.auth_user_id', user.id)
    .single()

  if (packError || !pack) {
    notFound()
  }

  // Get user plan
  const userPlan = pack.users?.plan || 'free'

  // Get counts for stats
  const { count: flashcardCount } = await supabase
    .from('flashcards')
    .select('*', { count: 'exact', head: true })
    .eq('study_pack_id', id)

  // Check if pack is still being generated (no content yet)
  const isGenerating = !pack.stats_json?.notes && (!flashcardCount || flashcardCount === 0)
  
  // If still generating, redirect to status page
  if (isGenerating && pack.material_id) {
    redirect(`/materials/${pack.material_id}/status`)
  }

  const { data: quizzes } = await supabase
    .from('quizzes')
    .select('id, quiz_items(count)')
    .eq('study_pack_id', id)

  const quizQuestionCount = quizzes?.[0]?.quiz_items?.[0]?.count || 0

  // Convert old string coverage to number for backward compatibility
  const getCoverageValue = (coverage: any): number => {
    if (typeof coverage === 'number') return coverage
    if (coverage === 'high') return 85
    if (coverage === 'med') return 65
    if (coverage === 'low') return 35
    return 50
  }

  // Prepare pack data for client component
  const packData = {
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
        status: pack.materials.status,
      }
      : null,
    stats: {
      coverage: getCoverageValue(pack.stats_json?.coverage),
      cardCount: flashcardCount || 0,
      quizQuestionCount,
      notes: pack.stats_json?.notes || null,
      learningObjectives: pack.stats_json?.learningObjectives || [],
      tags: pack.stats_json?.tags || [],
    },
  }

  return <StudyPackView pack={packData} userPlan={userPlan} />
}

