import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ProfileForm } from '@/components/profile/ProfileForm'
import { ArrowLeft, Sparkles, Zap, Crown, AlertCircle, Calendar } from 'lucide-react'

export default async function ProfilePage() {
  const supabase = await createClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  const { data: userData } = await supabase
    .from('users')
    .select('*')
    .eq('auth_user_id', user.id)
    .single()

  const profile = userData ? {
    id: userData.id,
    email: user.email!,
    full_name: userData.full_name,
    username: userData.username,
    avatar_url: userData.avatar_url,
    role: userData.role,
    plan: userData.plan,
    plan_expires_at: userData.plan_expires_at,
    locale: userData.locale,
    created_at: userData.created_at,
  } : null

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const getPlanIcon = (plan: string) => {
    switch(plan) {
      case 'pro_plus': return Crown
      case 'student_pro': return Sparkles
      default: return Zap
    }
  }

  const getPlanColor = (plan: string) => {
    switch(plan) {
      case 'pro_plus': return { bg: 'from-[#f5e6d3]/20 to-[#e5d6c3]/10', border: 'border-[#f5e6d3]/40', text: 'text-[#f5e6d3]', glow: 'shadow-[#f5e6d3]/20' }
      case 'student_pro': return { bg: 'from-[#a8d5d5]/20 to-[#8bc5c5]/10', border: 'border-[#a8d5d5]/40', text: 'text-[#a8d5d5]', glow: 'shadow-[#a8d5d5]/20' }
      default: return { bg: 'from-gray-500/20 to-gray-600/10', border: 'border-gray-500/40', text: 'text-gray-400', glow: 'shadow-gray-500/20' }
    }
  }

  const PlanIcon = getPlanIcon(userData?.plan || 'free')
  const planColors = getPlanColor(userData?.plan || 'free')

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0F1A] via-[#0D1420] to-[#0A0F1A]">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -right-48 w-96 h-96 bg-[#a8d5d5]/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-1/4 -left-48 w-96 h-96 bg-[#f5e6d3]/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Header */}
      <div className="relative">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <Link 
            href="/dashboard"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-[#a8d5d5] transition-all group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Dashboard</span>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative max-w-6xl mx-auto px-6 pb-12">
        {/* Page Title */}
        <div className="mb-10">
          <h1 className="text-5xl font-bold mb-3">
            <span className="bg-gradient-to-r from-white via-[#a8d5d5] to-white bg-clip-text text-transparent">
              Profile
            </span>
          </h1>
          <p className="text-gray-500 text-lg">Manage your account and subscription</p>
        </div>

        <div className="grid lg:grid-cols-[1fr_420px] gap-8">
          {/* Main Form */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-br from-[#a8d5d5]/10 to-[#f5e6d3]/10 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition" />
            <div className="relative bg-[#0D1420]/60 backdrop-blur-sm border border-white/10 rounded-3xl p-8 lg:p-10">
              <ProfileForm initialProfile={profile || undefined} hasUsername={!!userData?.username} />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Plan Card */}
            <div className="relative group">
              <div className={`absolute -inset-1 bg-gradient-to-br ${planColors.bg} rounded-3xl blur-2xl opacity-60 group-hover:opacity-100 transition duration-500`} />
              <div className={`relative bg-gradient-to-br from-[#0D1420] to-[#0A0F1A] border-2 ${planColors.border} rounded-3xl p-8 ${planColors.glow} shadow-2xl`}>
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <p className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-2">Current Plan</p>
                    <h3 className={`text-2xl font-bold ${planColors.text}`}>
                      {userData?.plan === 'pro_plus' ? 'Pro Plus' : userData?.plan === 'student_pro' ? 'Student Pro' : 'Free Plan'}
                    </h3>
                  </div>
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${planColors.bg} border ${planColors.border} flex items-center justify-center`}>
                    <PlanIcon className={`w-8 h-8 ${planColors.text}`} />
                  </div>
                </div>

                {userData?.plan_expires_at && userData?.plan !== 'free' && (
                  <div className="mb-6 p-4 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Valid Until</p>
                        <p className="text-sm text-white font-semibold">{formatDate(userData.plan_expires_at)}</p>
                      </div>
                    </div>
                  </div>
                )}

                {userData?.plan === 'free' && (
                  <>
                    <div className="mb-6 space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-lg bg-[#a8d5d5]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Sparkles className="w-3.5 h-3.5 text-[#a8d5d5]" />
                        </div>
                        <div>
                          <p className="text-white font-medium text-sm">Unlimited Study Packs</p>
                          <p className="text-gray-500 text-xs">Create as many as you need</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-lg bg-[#a8d5d5]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Sparkles className="w-3.5 h-3.5 text-[#a8d5d5]" />
                        </div>
                        <div>
                          <p className="text-white font-medium text-sm">Advanced Analytics</p>
                          <p className="text-gray-500 text-xs">Track your progress</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-lg bg-[#a8d5d5]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Sparkles className="w-3.5 h-3.5 text-[#a8d5d5]" />
                        </div>
                        <div>
                          <p className="text-white font-medium text-sm">Priority Support</p>
                          <p className="text-gray-500 text-xs">Get help when you need it</p>
                        </div>
                      </div>
                    </div>

                    <button className="w-full py-4 bg-gradient-to-r from-[#a8d5d5] to-[#8bc5c5] hover:from-[#8bc5c5] hover:to-[#a8d5d5] text-[#0a0e14] font-bold rounded-xl transition-all hover:scale-[1.02] shadow-xl shadow-[#a8d5d5]/40 hover:shadow-2xl hover:shadow-[#a8d5d5]/50 flex items-center justify-center gap-2 group/btn">
                      <Sparkles className="w-5 h-5 group-hover/btn:rotate-12 transition-transform" />
                      Upgrade Now
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Account Info */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-br from-white/5 to-white/0 rounded-2xl blur opacity-50 group-hover:opacity-75 transition" />
              <div className="relative bg-white/[0.02] border border-white/10 rounded-2xl p-6">
                <p className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-4">Account Info</p>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Member Since</span>
                  <span className="text-white font-medium text-sm">{formatDate(userData?.created_at || '')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
