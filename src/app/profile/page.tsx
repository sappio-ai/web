import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ProfileForm } from '@/components/profile/ProfileForm'
import { ArrowLeft, Sparkles, Zap, Crown, Calendar } from 'lucide-react'

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

  const PlanIcon = getPlanIcon(userData?.plan || 'free')

  return (
    <div className="min-h-screen bg-[#F8FAFB] relative">
      {/* Subtle paper texture */}
      <div className="absolute inset-0 opacity-[0.015] pointer-events-none" style={{
        backgroundImage: 'url("data:image/svg+xml,%3Csvg width="100" height="100" xmlns="http://www.w3.org/2000/svg"%3E%3Cfilter id="noise"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" /%3E%3C/filter%3E%3Crect width="100" height="100" filter="url(%23noise)" opacity="0.4"/%3E%3C/svg%3E")'
      }} />

      {/* Header */}
      <div className="relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 pt-24">
          <Link 
            href="/dashboard"
            className="inline-flex items-center gap-2 text-[#64748B] hover:text-[#5A5FF0] transition-all group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-semibold">Back to Dashboard</span>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pb-12">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-[36px] font-bold text-[#1A1D2E] mb-2 tracking-[-0.02em]" style={{ fontFamily: 'var(--font-geist-sans)' }}>
            Profile Settings
          </h1>
          <p className="text-[#64748B] text-[16px]">Manage your account and subscription</p>
        </div>

        <div className="grid lg:grid-cols-[1fr_400px] gap-6">
          {/* Main Form */}
          <div className="relative">
            {/* Paper stack backing */}
            <div className="absolute top-[3px] left-0 right-0 h-full bg-white/60 rounded-xl border border-[#CBD5E1]/40" />
            
            <div className="relative bg-white rounded-xl p-6 lg:p-8 shadow-[0_2px_12px_rgba(15,23,42,0.08),0_1px_3px_rgba(15,23,42,0.06)] border border-[#E2E8F0]">
              <ProfileForm initialProfile={profile || undefined} hasUsername={!!userData?.username} />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Plan Card */}
            <div className="relative">
              {/* Paper stack backing */}
              <div className="absolute top-[3px] left-0 right-0 h-full bg-white/60 rounded-xl border border-[#CBD5E1]/40" />
              
              <div className="relative bg-white rounded-xl p-6 shadow-[0_2px_12px_rgba(15,23,42,0.08),0_1px_3px_rgba(15,23,42,0.06)] border-2 border-[#5A5FF0]/30">
                {/* Bookmark Tab */}
                <div className="absolute -top-0 right-8 w-[28px] h-[22px] bg-[#5A5FF0] rounded-b-[5px] shadow-sm">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[20px] h-[3px] bg-[#4A4FD0] rounded-t-sm" />
                </div>

                <div className="mb-6">
                  <p className="text-[#64748B] text-xs font-semibold uppercase tracking-wider mb-3">Current Plan</p>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      userData?.plan === 'pro_plus' ? 'bg-[#F59E0B]/10' :
                      userData?.plan === 'student_pro' ? 'bg-[#5A5FF0]/10' :
                      'bg-[#10B981]/10'
                    }`}>
                      <PlanIcon className={`w-5 h-5 ${
                        userData?.plan === 'pro_plus' ? 'text-[#F59E0B]' :
                        userData?.plan === 'student_pro' ? 'text-[#5A5FF0]' :
                        'text-[#10B981]'
                      }`} />
                    </div>
                    <h3 className="text-xl font-bold text-[#1A1D2E]">
                      {userData?.plan === 'pro_plus' ? 'Pro Plus' : userData?.plan === 'student_pro' ? 'Student Pro' : 'Free Plan'}
                    </h3>
                  </div>
                </div>

                {userData?.plan_expires_at && userData?.plan !== 'free' && (
                  <div className="mb-6 p-4 bg-[#F8FAFB] rounded-xl border border-[#E2E8F0]">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-[#64748B]" />
                      <div>
                        <p className="text-xs text-[#64748B] font-medium">Valid Until</p>
                        <p className="text-sm text-[#1A1D2E] font-bold">{formatDate(userData.plan_expires_at)}</p>
                      </div>
                    </div>
                  </div>
                )}

                {userData?.plan === 'free' && (
                  <>
                    <div className="mb-6 space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-lg bg-[#5A5FF0]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Sparkles className="w-3.5 h-3.5 text-[#5A5FF0]" />
                        </div>
                        <div>
                          <p className="text-[#1A1D2E] font-semibold text-sm">60 packs per month</p>
                          <p className="text-[#64748B] text-xs">Upgrade for more</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-lg bg-[#5A5FF0]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Sparkles className="w-3.5 h-3.5 text-[#5A5FF0]" />
                        </div>
                        <div>
                          <p className="text-[#1A1D2E] font-semibold text-sm">Advanced Analytics</p>
                          <p className="text-[#64748B] text-xs">Track your progress</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-lg bg-[#5A5FF0]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Sparkles className="w-3.5 h-3.5 text-[#5A5FF0]" />
                        </div>
                        <div>
                          <p className="text-[#1A1D2E] font-semibold text-sm">Priority Support</p>
                          <p className="text-[#64748B] text-xs">Get help when you need it</p>
                        </div>
                      </div>
                    </div>

                    <button className="w-full py-3 bg-[#5A5FF0] hover:bg-[#4A4FD0] text-white font-bold rounded-xl transition-all shadow-sm hover:shadow-md active:scale-[0.98] flex items-center justify-center gap-2 group/btn">
                      <Sparkles className="w-5 h-5 group-hover/btn:rotate-12 transition-transform" />
                      Upgrade Now
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Account Info */}
            <div className="relative">
              {/* Paper stack backing */}
              <div className="absolute top-[3px] left-0 right-0 h-full bg-white/60 rounded-xl border border-[#CBD5E1]/40" />
              
              <div className="relative bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-[0_1px_3px_rgba(15,23,42,0.06)]">
                <p className="text-[#64748B] text-xs font-semibold uppercase tracking-wider mb-4">Account Info</p>
                <div className="flex justify-between items-center">
                  <span className="text-[#64748B] text-sm font-medium">Member Since</span>
                  <span className="text-[#1A1D2E] font-bold text-sm">{formatDate(userData?.created_at || '')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
