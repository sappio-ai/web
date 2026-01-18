import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardClient from './DashboardClient'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  // Get user data from public.users
  const { data: userData } = await supabase
    .from('users')
    .select('*')
    .eq('auth_user_id', user.id)
    .single()

  // Get user's study packs with progress
  const { data: studyPacks } = await supabase
    .from('study_packs')
    .select(`
      id,
      title,
      summary,
      created_at,
      updated_at,
      stats_json
    `)
    .eq('user_id', userData?.id)
    .order('updated_at', { ascending: false })

  // Get materials count
  const { count: materialsCount } = await supabase
    .from('materials')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userData?.id)

  // Get quiz results count (using database user_id)
  const { count: quizResultsCount } = await supabase
    .from('quiz_results')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userData?.id)

  // Get all flashcards for the user's study packs
  const packIds = studyPacks?.map(p => p.id) || []

  let dueCount = 0
  let masteredCount = 0
  let packsWithDueCards = new Set<string>()
  const dueCountByPack: Record<string, number> = {}

  if (packIds.length > 0) {
    // Get due cards count
    const now = new Date().toISOString()
    const { data: dueCards } = await supabase
      .from('flashcards')
      .select('id, study_pack_id')
      .in('study_pack_id', packIds)
      .or(`due_at.is.null,due_at.lte.${now}`)

    dueCount = dueCards?.length || 0
    packsWithDueCards = new Set(dueCards?.map(c => c.study_pack_id) || [])

    // Count due cards per pack
    dueCards?.forEach(card => {
      dueCountByPack[card.study_pack_id] = (dueCountByPack[card.study_pack_id] || 0) + 1
    })

    // Get mastered cards (interval >= 30 days indicates mastery)
    const { count: mastered } = await supabase
      .from('flashcards')
      .select('*', { count: 'exact', head: true })
      .in('study_pack_id', packIds)
      .gte('interval_days', 30)

    masteredCount = mastered || 0
  }

  // Enhance study packs with due counts
  const studyPacksWithDue = studyPacks?.map(pack => ({
    ...pack,
    dueCount: dueCountByPack[pack.id] || 0
  }))

  // Get average quiz accuracy (score is already a percentage 0-100)
  // Note: quiz_results.user_id is the database user ID, not auth_user_id
  const { data: quizResults } = await supabase
    .from('quiz_results')
    .select('score')
    .eq('user_id', userData?.id) // userData.id is the database user ID
    .order('taken_at', { ascending: false })
    .limit(10)

  const avgAccuracy = quizResults && quizResults.length > 0
    ? Math.round(quizResults.reduce((acc, r) => acc + r.score, 0) / quizResults.length)
    : null

  const dashboardData = {
    dueCount,
    packsWithDueCards: packsWithDueCards.size,
    masteredCount,
    avgAccuracy: avgAccuracy ?? 0,
    hasQuizResults: (quizResults?.length || 0) > 0,
    totalPacks: studyPacks?.length || 0,
    materialsCount: materialsCount || 0,
    quizResultsCount: quizResultsCount || 0,
  }

  return (
    <DashboardClient
      userData={userData}
      studyPacks={studyPacksWithDue || []}
      dashboardData={dashboardData}
    />
  )
}
