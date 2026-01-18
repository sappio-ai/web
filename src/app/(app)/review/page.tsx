import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ReviewClient from './ReviewClient'

export default async function ReviewPage() {
  const supabase = await createClient()

  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  // Get user data
  const { data: userData } = await supabase
    .from('users')
    .select('id, full_name')
    .eq('auth_user_id', user.id)
    .single()

  if (!userData) {
    redirect('/login')
  }

  // Get all user's study packs with stats
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
    .eq('user_id', userData.id)
    .order('updated_at', { ascending: false })

  const packIds = studyPacks?.map(p => p.id) || []

  // Get due cards count per pack
  const now = new Date().toISOString()
  const dueCountByPack: Record<string, number> = {}
  let totalDueCount = 0

  if (packIds.length > 0) {
    const { data: dueCards } = await supabase
      .from('flashcards')
      .select('id, study_pack_id')
      .in('study_pack_id', packIds)
      .or(`due_at.is.null,due_at.lte.${now}`)

    dueCards?.forEach(card => {
      dueCountByPack[card.study_pack_id] = (dueCountByPack[card.study_pack_id] || 0) + 1
      totalDueCount++
    })
  }

  // Get total mastered cards
  let masteredCount = 0
  if (packIds.length > 0) {
    const { count: mastered } = await supabase
      .from('flashcards')
      .select('*', { count: 'exact', head: true })
      .in('study_pack_id', packIds)
      .gte('interval_days', 30)

    masteredCount = mastered || 0
  }

  // Get recent quiz results for accuracy
  const { data: quizResults } = await supabase
    .from('quiz_results')
    .select('score')
    .eq('user_id', userData.id)
    .order('taken_at', { ascending: false })
    .limit(10)

  const avgAccuracy = quizResults && quizResults.length > 0
    ? Math.round(quizResults.reduce((acc, r) => acc + r.score, 0) / quizResults.length)
    : null

  // Enhance study packs with due counts
  const packsWithDue = studyPacks?.map(pack => ({
    ...pack,
    dueCount: dueCountByPack[pack.id] || 0
  })) || []

  // Sort by due count (highest first), then by updated date
  const sortedPacks = packsWithDue.sort((a, b) => {
    if (b.dueCount !== a.dueCount) {
      return b.dueCount - a.dueCount
    }
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  })

  const reviewData = {
    totalDueCount,
    masteredCount,
    avgAccuracy,
    totalPacks: sortedPacks.length,
    packsWithDue: sortedPacks.filter(p => p.dueCount > 0).length,
  }

  return (
    <ReviewClient
      userData={userData}
      studyPacks={sortedPacks}
      reviewData={reviewData}
    />
  )
}
