import Link from 'next/link'
import Image from 'next/image'
import { getUserProfile } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/server'
import UserMenu from './UserMenu'
import PlanBadge from './PlanBadge'

export default async function Navbar() {
  const profile = await getUserProfile()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 ${user ? 'bg-white/95' : 'bg-white'} backdrop-blur-md border-b border-[#E2E8F0]`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo - clean and academic */}
          <Link href={user ? '/dashboard' : '/'} className="flex items-center gap-3.5 group">
            {/* Logo */}
            <div className="relative w-11 h-11 flex items-center justify-center transition-all duration-200">
              <Image
                src="/logo.svg"
                alt="Sappio"
                width={44}
                height={44}
                className="object-contain opacity-90"
              />
            </div>
            <span className="text-[19px] font-black text-[#1A1D2E] tracking-[-0.02em]" style={{ fontFamily: 'var(--font-geist-sans)' }}>
              Sappio
            </span>
          </Link>

          {/* Center Navigation - more breathing room */}
          {user && (
            <div className="hidden md:flex items-center gap-1 ml-8">
              <Link
                href="/dashboard"
                className="relative px-3 py-2 text-sm font-semibold text-[#1A1D2E] hover:text-[#5A5FF0] transition-colors focus:outline-none focus:ring-2 focus:ring-[#5A5FF0]/40 rounded"
              >
                Study Packs
              </Link>
              <Link
                href="/rooms"
                className="relative px-3 py-2 text-sm font-semibold text-[#1A1D2E] hover:text-[#5A5FF0] transition-colors focus:outline-none focus:ring-2 focus:ring-[#5A5FF0]/40 rounded"
              >
                Rooms
              </Link>
              <Link
                href="/upload"
                className="relative px-3 py-2 text-sm font-semibold text-[#1A1D2E] hover:text-[#5A5FF0] transition-colors focus:outline-none focus:ring-2 focus:ring-[#5A5FF0]/40 rounded"
              >
                Upload
              </Link>
              <Link
                href="/practice"
                className="relative px-3 py-2 text-sm font-semibold text-[#1A1D2E] hover:text-[#5A5FF0] transition-colors focus:outline-none focus:ring-2 focus:ring-[#5A5FF0]/40 rounded"
              >
                Practice
              </Link>
            </div>
          )}

          {/* Right side Navigation */}
          <div className="flex items-center gap-4">
            {user ? (
              <>
                {/* Plan Badge */}
                {profile?.plan && (
                  <PlanBadge plan={profile.plan as 'free' | 'student_pro' | 'pro_plus'} />
                )}
                
                <Link
                  href="/dashboard/new"
                  className="px-4 py-2 bg-[#5A5FF0] hover:bg-[#4A4FD0] text-white text-[14px] font-semibold rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#5A5FF0]/40 focus:ring-offset-2 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  New Pack
                </Link>
                <UserMenu user={user} />
              </>
            ) : (
              <>
                {/* Logged out center links */}
                <div className="hidden md:flex items-center gap-6">
                  <Link
                    href="/how-it-works"
                    className="text-[14px] font-semibold text-[#4A5568] hover:text-[#5A5FF0] transition-colors focus:outline-none focus:ring-2 focus:ring-[#5A5FF0]/40 rounded px-2 py-1"
                  >
                    How it works
                  </Link>
                  <Link
                    href="/features"
                    className="text-[14px] font-semibold text-[#4A5568] hover:text-[#5A5FF0] transition-colors focus:outline-none focus:ring-2 focus:ring-[#5A5FF0]/40 rounded px-2 py-1"
                  >
                    Features
                  </Link>
                  <Link
                    href="/pricing"
                    className="text-[14px] font-semibold text-[#4A5568] hover:text-[#5A5FF0] transition-colors focus:outline-none focus:ring-2 focus:ring-[#5A5FF0]/40 rounded px-2 py-1"
                  >
                    Pricing
                  </Link>
                </div>
                
                <Link
                  href="/login"
                  className="text-[14px] font-bold text-[#1A1D2E] hover:text-[#5A5FF0] hover:underline decoration-2 underline-offset-4 transition-all focus:outline-none focus:ring-2 focus:ring-[#5A5FF0]/40 rounded px-2 py-1"
                >
                  Log in
                </Link>
                <Link 
                  href="/signup"
                  className="px-4 py-2 bg-[#5A5FF0] hover:bg-[#4A4FD0] text-white text-[14px] font-semibold rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#5A5FF0]/40 focus:ring-offset-2"
                >
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
