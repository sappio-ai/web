import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { BookOpen, Package, CheckCircle } from 'lucide-react'
import DashboardClient from '@/app/dashboard/DashboardClient'

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

  return (
    <DashboardClient userData={userData}>
      {/* Welcome Section */}
      <div className="mb-8 animate-in fade-in duration-1000">
        <h1 className="text-4xl sm:text-5xl font-bold mb-4">
          <span className="bg-gradient-to-r from-[#a8d5d5] via-white to-[#f5e6d3] bg-clip-text text-transparent">
            Welcome back{userData?.full_name ? `, ${userData.full_name}` : ''}!
          </span>
        </h1>
        <p className="text-gray-400 text-lg">
          Ready to continue your learning journey?
        </p>
      </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Quick Stats Card */}
          <div className="relative group animate-in slide-in-from-bottom duration-700 delay-100">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-[#a8d5d5]/20 to-[#8bc5c5]/20 rounded-3xl blur opacity-30 group-hover:opacity-50 transition duration-500" />
            <div className="relative bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-2xl">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#a8d5d5] to-[#8bc5c5] flex items-center justify-center shadow-lg">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Study Materials</p>
                  <p className="text-2xl font-bold text-white">0</p>
                </div>
              </div>
              <p className="text-gray-500 text-sm">Upload your first material to get started</p>
            </div>
          </div>

          {/* Study Packs Card */}
          <div className="relative group animate-in slide-in-from-bottom duration-700 delay-200">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-[#f5e6d3]/20 to-[#e5d6c3]/20 rounded-3xl blur opacity-30 group-hover:opacity-50 transition duration-500" />
            <div className="relative bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-2xl">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#f5e6d3] to-[#e5d6c3] flex items-center justify-center shadow-lg">
                  <Package className="w-6 h-6 text-[#0a0e14]" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Study Packs</p>
                  <p className="text-2xl font-bold text-white">0</p>
                </div>
              </div>
              <p className="text-gray-500 text-sm">Create your first study pack</p>
            </div>
          </div>

          {/* Quiz Results Card */}
          <div className="relative group animate-in slide-in-from-bottom duration-700 delay-300">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-[#a8d5d5]/20 to-[#f5e6d3]/20 rounded-3xl blur opacity-30 group-hover:opacity-50 transition duration-500" />
            <div className="relative bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-2xl">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#a8d5d5] to-[#8bc5c5] flex items-center justify-center shadow-lg">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Quizzes Taken</p>
                  <p className="text-2xl font-bold text-white">0</p>
                </div>
              </div>
              <p className="text-gray-500 text-sm">Take your first quiz</p>
            </div>
          </div>
        </div>

        {/* Getting Started Section */}
        <div className="mt-12 animate-in slide-in-from-bottom duration-700 delay-400">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-[#a8d5d5]/20 to-[#f5e6d3]/20 rounded-3xl blur opacity-30 group-hover:opacity-50 transition duration-500" />
            <div className="relative bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-2xl">
              <h2 className="text-2xl font-bold text-white mb-6">Getting Started</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/10 hover:border-[#a8d5d5]/30 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#a8d5d5] to-[#8bc5c5] flex items-center justify-center flex-shrink-0 shadow-lg">
                    <span className="text-white font-bold">1</span>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">Upload Study Material</h3>
                    <p className="text-gray-400 text-sm">Upload PDFs, documents, or paste URLs to create your first study material</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/10 hover:border-[#f5e6d3]/30 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#f5e6d3] to-[#e5d6c3] flex items-center justify-center flex-shrink-0 shadow-lg">
                    <span className="text-[#0a0e14] font-bold">2</span>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">Generate Study Pack</h3>
                    <p className="text-gray-400 text-sm">Let AI create flashcards, quizzes, and mind maps from your materials</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/10 hover:border-[#a8d5d5]/30 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#a8d5d5] to-[#8bc5c5] flex items-center justify-center flex-shrink-0 shadow-lg">
                    <span className="text-white font-bold">3</span>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">Start Learning</h3>
                    <p className="text-gray-400 text-sm">Practice with flashcards, take quizzes, and track your progress</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      {/* User Info (Debug) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-8 p-4 bg-white/[0.03] rounded-xl border border-white/10 backdrop-blur-xl">
          <p className="text-gray-400 text-sm mb-2">Debug Info:</p>
          <p className="text-gray-500 text-xs">Email: {user.email}</p>
          <p className="text-gray-500 text-xs">User ID: {userData?.id}</p>
          <p className="text-gray-500 text-xs">Plan: {userData?.plan}</p>
        </div>
      )}
    </DashboardClient>
  )
}
