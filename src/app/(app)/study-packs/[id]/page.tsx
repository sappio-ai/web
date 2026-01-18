import { notFound, redirect } from 'next/navigation'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'
import StudyPackView from '@/components/study-packs/StudyPackView'

export default async function StudyPackPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const demoId = process.env.NEXT_PUBLIC_DEMO_PACK_ID || '3747df11-0426-4749-8597-af89639e8d38'
  const isDemo = id === demoId

  let user = null
  let userPlan = 'free'
  let pack = null

  if (isDemo) {
    // ---------------------------------------------------------
    // DEMO MODE: Bypass Auth & RLS
    // ---------------------------------------------------------
    const adminSupabase = createServiceRoleClient()

    // Fetch pack directly without checking user ownership
    const { data: demoPack, error: demoError } = await adminSupabase
      .from('study_packs')
      .select(`
        *,
        materials(id, kind, source_url, page_count, status)
      `)
      .eq('id', id)
      .single()

    if (demoError || !demoPack) {
      notFound()
    }
    pack = demoPack
    // For demo purposes, we can simulate a plan or keep it free
    userPlan = 'student_pro'
  } else {
    // ---------------------------------------------------------
    // STANDARD MODE: Strict Auth & RLS
    // ---------------------------------------------------------
    const supabase = await createClient()
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()

    if (authError || !authUser) {
      redirect('/login')
    }
    user = authUser

    // Fetch study pack with user ownership check
    const { data: userPack, error: packError } = await supabase
      .from('study_packs')
      .select(`
        *,
        users!inner(id, auth_user_id, plan),
        materials(id, kind, source_url, page_count, status)
      `)
      .eq('id', id)
      .eq('users.auth_user_id', user.id) // Strict ownership check
      .single()

    if (packError || !userPack) {
      notFound()
    }
    pack = userPack
    userPlan = pack.users?.plan || 'free'
  }

  // ---------------------------------------------------------
  // COMMON DATA PREPARATION
  // ---------------------------------------------------------

  // Get counts for stats
  const dataClient = isDemo ? createServiceRoleClient() : await createClient()

  const { count: flashcardCount } = await dataClient
    .from('flashcards')
    .select('*', { count: 'exact', head: true })
    .eq('study_pack_id', id)

  // Check if pack is still being generated (no content yet)
  const isGenerating = !pack.stats_json?.notes && (!flashcardCount || flashcardCount === 0)

  // If still generating, redirect to status page
  if (isGenerating && pack.material_id) {
    redirect(`/materials/${pack.material_id}/status`)
  }

  const { data: quizzes } = await dataClient
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

  return <StudyPackView pack={packData} userPlan={userPlan} isDemo={isDemo} />
}

