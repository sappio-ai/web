'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase/client'
import UserMenu from './UserMenu'
import CreatePackModal from '@/components/materials/CreatePackModal'
import PlanBadge from './PlanBadge'
import type { User } from '@supabase/supabase-js'
import { Menu, X } from 'lucide-react'

interface NavbarClientProps {
  waitlistMode?: boolean
  isAppNav?: boolean
}

export default function NavbarClient(props: NavbarClientProps) {
  const { waitlistMode } = props
  const [user, setUser] = useState<User | null>(null)
  const [userPlan, setUserPlan] = useState<'free' | 'student_pro' | 'pro_plus'>('free')
  const [loading, setLoading] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const supabase = createBrowserClient()

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      // Get user plan
      if (user) {
        const { data: profile } = await supabase
          .from('users')
          .select('plan')
          .eq('auth_user_id', user.id)
          .single()

        if (profile?.plan) {
          setUserPlan(profile.plan as 'free' | 'student_pro' | 'pro_plus')
        }
      }

      setLoading(false)
    }

    getSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase.auth])

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isMobileMenuOpen])

  // Logic to hide the global root navbar on app/admin routes
  // But allow it if explicitly invoked by the App Layout (via isAppNav prop)
  const isAppRoute = pathname?.startsWith('/dashboard') ||
    pathname?.startsWith('/settings') ||
    pathname?.startsWith('/profile') ||
    pathname?.startsWith('/admin') ||
    pathname?.startsWith('/rooms') ||
    pathname?.startsWith('/study-packs') ||
    pathname?.startsWith('/flashcards') ||
    pathname?.startsWith('/materials') ||
    pathname?.startsWith('/review') ||
    pathname?.startsWith('/test-timer')

  if (isAppRoute && !props.isAppNav) {
    return null
  }

  // Check if link is active
  const isActive = (path: string) => pathname === path

  return (
    <>
      <CreatePackModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href={user ? '/dashboard' : '/'} className="flex items-center gap-3 group flex-shrink-0">
              <div className="relative w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center">
                <Image
                  src="/applogo.png"
                  alt="Sappio"
                  width={64}
                  height={64}
                  className="object-contain"
                />
              </div>
              <span className="text-[17px] sm:text-[19px] font-black text-[var(--ink)] tracking-[-0.02em]">
                Sappio
              </span>
            </Link>

            {/* Desktop Navigation - Logged In */}
            {!loading && user && (
              <div className="hidden md:flex items-center gap-1 ml-8">
                <Link
                  href="/dashboard"
                  className={`relative px-3 py-2 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[#5A5FF0]/40 rounded ${isActive('/dashboard') ? 'text-[#5A5FF0]' : 'text-[#1A1D2E] hover:text-[#5A5FF0]'
                    }`}
                >
                  Study Packs
                  {isActive('/dashboard') && (
                    <div className="absolute -top-1 right-1/2 translate-x-1/2 w-[12px] h-[10px] bg-[#5A5FF0] rounded-b-[2px] shadow-sm">
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[8px] h-[1.5px] bg-[#4A4FD0] rounded-t-sm" />
                    </div>
                  )}
                </Link>
                <Link
                  href="/rooms"
                  className={`relative px-3 py-2 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[#5A5FF0]/40 rounded ${pathname?.startsWith('/rooms') ? 'text-[#5A5FF0]' : 'text-[#1A1D2E] hover:text-[#5A5FF0]'
                    }`}
                >
                  Rooms
                  {pathname?.startsWith('/rooms') && (
                    <div className="absolute -top-1 right-1/2 translate-x-1/2 w-[12px] h-[10px] bg-[#5A5FF0] rounded-b-[2px] shadow-sm">
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[8px] h-[1.5px] bg-[#4A4FD0] rounded-t-sm" />
                    </div>
                  )}
                </Link>
              </div>
            )}

            {/* Desktop Right Side */}
            <div className="hidden md:flex items-center gap-4 flex-shrink-0">
              {loading ? (
                <div className="w-32 h-8 bg-[#F1F5F9] animate-pulse rounded-lg" />
              ) : user ? (
                <>
                  <PlanBadge plan={userPlan} />

                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-sm font-semibold rounded-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/40 focus:ring-offset-2 flex items-center gap-2 active:scale-[0.98] shadow-sm whitespace-nowrap"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    <span className="hidden lg:inline">New Pack</span>
                    <span className="lg:hidden">New</span>
                  </button>
                  <UserMenu user={user} plan={userPlan} />
                </>
              ) : (
                <>
                  <div className="flex items-center gap-6">
                    <Link
                      href="/#how-it-works"
                      className="text-sm font-semibold text-[var(--text)] hover:text-[var(--primary)] hover:underline decoration-2 underline-offset-4 transition-all focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/40 rounded px-2 py-1 whitespace-nowrap"
                    >
                      How it works
                    </Link>
                    <Link
                      href="/#features"
                      className="text-sm font-semibold text-[var(--text)] hover:text-[var(--primary)] hover:underline decoration-2 underline-offset-4 transition-all focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/40 rounded px-2 py-1"
                    >
                      Features
                    </Link>
                    <Link
                      href="/#pricing"
                      className="text-sm font-semibold text-[var(--text)] hover:text-[var(--primary)] hover:underline decoration-2 underline-offset-4 transition-all focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/40 rounded px-2 py-1"
                    >
                      Pricing
                    </Link>
                  </div>

                  <Link
                    href="/login"
                    className="text-sm font-bold text-[var(--ink)] hover:text-[var(--primary)] hover:underline decoration-2 underline-offset-4 transition-all focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/40 rounded px-2 py-1 whitespace-nowrap"
                  >
                    Log in
                  </Link>
                  <Link
                    href={waitlistMode ? '/waitlist' : '/signup'}
                    className="px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-sm font-semibold rounded-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/40 focus:ring-offset-2 active:scale-[0.98] shadow-sm relative overflow-hidden group whitespace-nowrap"
                  >
                    <span className="relative z-10">{waitlistMode ? 'Join waitlist' : 'Get started'}</span>
                    <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            {!loading && (
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-[#F1F5F9] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/40 flex-shrink-0"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6 text-[var(--ink)]" />
                ) : (
                  <Menu className="w-6 h-6 text-[var(--ink)]" />
                )}
              </button>
            )}
          </div>

          {/* Mobile Menu Dropdown */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-[var(--border)] bg-white">
              <div className="px-2 pt-2 pb-4 space-y-1">
                {user ? (
                  /* Logged In Mobile Menu */
                  <>
                    <Link
                      href="/dashboard"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`block px-3 py-2 rounded-lg text-base font-semibold transition-all ${isActive('/dashboard')
                        ? 'bg-[#EEF2FF] text-[#5A5FF0]'
                        : 'text-[#1A1D2E] hover:bg-[#F8FAFB]'
                        }`}
                    >
                      Study Packs
                    </Link>
                    <Link
                      href="/rooms"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`block px-3 py-2 rounded-lg text-base font-semibold transition-all ${pathname?.startsWith('/rooms')
                        ? 'bg-[#EEF2FF] text-[#5A5FF0]'
                        : 'text-[#1A1D2E] hover:bg-[#F8FAFB]'
                        }`}
                    >
                      Rooms
                    </Link>


                    <div className="pt-3 mt-3 border-t border-[#E2E8F0]">
                      <button
                        onClick={() => {
                          setIsCreateModalOpen(true)
                          setIsMobileMenuOpen(false)
                        }}
                        className="w-full px-3 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-base font-semibold rounded-lg transition-all duration-150 flex items-center justify-center gap-2 shadow-sm"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                        Create New Pack
                      </button>
                    </div>

                    <div className="pt-3 mt-3 border-t border-[#E2E8F0]">
                      <div className="px-3 py-2 bg-[#F8FAFB] rounded-lg mx-2 mb-2">
                        <div className="text-xs text-[#64748B] mb-1">Signed in as</div>
                        <div className="text-sm font-semibold text-[#1A1D2E] truncate">{user.email}</div>
                        <div className="text-xs text-[#64748B] mt-1">
                          {userPlan === 'student_pro' ? 'Student Pro' : userPlan === 'pro_plus' ? 'Pro Plus' : 'Free Plan'}
                        </div>
                      </div>

                      <Link
                        href="/profile"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[#4A5568] hover:bg-[#F8FAFB] hover:text-[#5A5FF0] transition-colors mx-2"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Profile
                      </Link>
                      <Link
                        href="/settings"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[#4A5568] hover:bg-[#F8FAFB] hover:text-[#5A5FF0] transition-colors mx-2"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Settings
                      </Link>
                      <Link
                        href="/billing"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[#4A5568] hover:bg-[#F8FAFB] hover:text-[#5A5FF0] transition-colors mx-2"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                        Billing
                      </Link>

                      <div className="pt-2 mt-2 border-t border-[#E2E8F0] mx-2">
                        <button
                          onClick={async () => {
                            setIsMobileMenuOpen(false)
                            const supabase = createBrowserClient()
                            await supabase.auth.signOut()
                            window.location.href = '/'
                          }}
                          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[#DC2626] hover:bg-[#FEE2E2] transition-colors w-full"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          Log out
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  /* Logged Out Mobile Menu */
                  <>
                    <Link
                      href="/#how-it-works"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-3 py-2 rounded-lg text-base font-semibold text-[#1A1D2E] hover:bg-[#F8FAFB] transition-all"
                    >
                      How it works
                    </Link>
                    <Link
                      href="/#features"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-3 py-2 rounded-lg text-base font-semibold text-[#1A1D2E] hover:bg-[#F8FAFB] transition-all"
                    >
                      Features
                    </Link>
                    <Link
                      href="/#pricing"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-3 py-2 rounded-lg text-base font-semibold text-[#1A1D2E] hover:bg-[#F8FAFB] transition-all"
                    >
                      Pricing
                    </Link>

                    <div className="pt-3 mt-3 border-t border-[#E2E8F0] space-y-2">
                      <Link
                        href="/login"
                        className="block px-3 py-2 text-center rounded-lg text-base font-bold text-[var(--ink)] hover:bg-[#F8FAFB] border border-[#E2E8F0] transition-all"
                      >
                        Log in
                      </Link>
                      <Link
                        href={waitlistMode ? '/waitlist' : '/signup'}
                        className="block px-3 py-2 text-center bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-base font-semibold rounded-lg transition-all duration-150 shadow-sm"
                      >
                        {waitlistMode ? 'Join waitlist' : 'Get started'}
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  )
}
