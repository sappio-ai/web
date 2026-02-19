import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardClient from './DashboardClient'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  // Get user data from public.users (must be first — everything depends on userData.id)
  const { data: userData } = await supabase
    .from('users')
    .select('*')
    .eq('auth_user_id', user.id)
    .single()

  if (!userData) {
    redirect('/login')
  }

  // Update last_active_at (fire and forget)
  supabase
    .from('users')
    .update({ last_active_at: new Date().toISOString() })
    .eq('id', userData.id)
    .then(() => {})

  // Parallelize independent queries
  const [
    { data: studyPacks },
    { count: materialsCount },
    { count: quizResultsCount },
    { data: quizResults },
  ] = await Promise.all([
    supabase
      .from('study_packs')
      .select('id, title, summary, created_at, updated_at, stats_json')
      .eq('user_id', userData.id)
      .order('updated_at', { ascending: false }),
    supabase
      .from('materials')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userData.id),
    supabase
      .from('quiz_results')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userData.id),
    supabase
      .from('quiz_results')
      .select('score')
      .eq('user_id', userData.id)
      .order('taken_at', { ascending: false })
      .limit(10),
  ])

  const packIds = studyPacks?.map(p => p.id) || []

  let dueCount = 0
  let masteredCount = 0
  let packsWithDueCards = new Set<string>()
  const dueCountByPack: Record<string, number> = {}

  if (packIds.length > 0) {
    const now = new Date().toISOString()

    // Parallelize flashcard queries
    const [{ data: dueCards }, { count: mastered }] = await Promise.all([
      supabase
        .from('flashcards')
        .select('id, study_pack_id')
        .in('study_pack_id', packIds)
        .or(`due_at.is.null,due_at.lte.${now}`),
      supabase
        .from('flashcards')
        .select('*', { count: 'exact', head: true })
        .in('study_pack_id', packIds)
        .gte('interval_days', 30),
    ])

    dueCount = dueCards?.length || 0
    packsWithDueCards = new Set(dueCards?.map(c => c.study_pack_id) || [])
    dueCards?.forEach(card => {
      dueCountByPack[card.study_pack_id] = (dueCountByPack[card.study_pack_id] || 0) + 1
    })
    masteredCount = mastered || 0
  }

  const studyPacksWithDue = studyPacks?.map(pack => ({
    ...pack,
    dueCount: dueCountByPack[pack.id] || 0
  }))

  const avgAccuracy = quizResults && quizResults.length > 0
    ? Math.round(quizResults.reduce((acc, r) => acc + r.score, 0) / quizResults.length)
    : null

  // Check if user has any study rooms
  const { count: roomCount } = await supabase
    .from('room_members')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userData.id)

  const dashboardData = {
    dueCount,
    packsWithDueCards: packsWithDueCards.size,
    masteredCount,
    avgAccuracy: avgAccuracy ?? 0,
    hasQuizResults: (quizResults?.length || 0) > 0,
    totalPacks: studyPacks?.length || 0,
    materialsCount: materialsCount || 0,
    quizResultsCount: quizResultsCount || 0,
    hasRooms: (roomCount || 0) > 0,
  }

  return (
    <DashboardClient
      userData={userData}
      studyPacks={studyPacksWithDue || []}
      dashboardData={dashboardData}
    />
  )
}
