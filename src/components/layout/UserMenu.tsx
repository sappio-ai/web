'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import FeedbackModal from '@/components/FeedbackModal'

interface UserMenuProps {
  user: User
  plan?: 'free' | 'student_pro' | 'pro_plus'
}

export default function UserMenu({ user, plan = 'free' }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Get user initials
  const getInitials = () => {
    const email = user.email || ''
    return email.charAt(0).toUpperCase()
  }

  // Get plan display name
  const getPlanLabel = () => {
    switch (plan) {
      case 'student_pro':
        return 'Student Pro'
      case 'pro_plus':
        return 'Pro Plus'
      default:
        return 'Free Plan'
    }
  }

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleLogout = async () => {
    setLoading(true)
    try {
      const supabase = createBrowserClient()
      await supabase.auth.signOut()
      window.location.href = '/'
    } catch (error) {
      console.error('Logout error:', error)
      setLoading(false)
    }
  }

  const handleFeedbackClick = () => {
    setIsOpen(false)
    setShowFeedbackModal(true)
  }

  return (
    <>
      <FeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
      />

      <div className="relative" ref={menuRef}>
        {/* Avatar Button - matches paper system */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-9 h-9 rounded-lg bg-[#5A5FF0] hover:bg-[#4A4FD0] text-white font-semibold text-[14px] flex items-center justify-center transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#5A5FF0]/40 focus:ring-offset-2 border border-[#4A4FD0] shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
        >
          {getInitials()}
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-[0_4px_16px_rgba(15,23,42,0.12),0_2px_4px_rgba(15,23,42,0.08)] border border-[#E2E8F0] overflow-hidden">
            {/* User Info */}
            <div className="px-4 py-3 border-b border-[#E2E8F0]">
              <p className="text-[13px] font-medium text-[#1A1D2E] truncate">{user.email}</p>
              <p className="text-[11px] text-[#64748B] mt-0.5">{getPlanLabel()}</p>
            </div>

            {/* Menu Items */}
            <div className="py-2">
              <Link
                href="/profile"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-[14px] text-[#4A5568] hover:bg-[#F8FAFB] hover:text-[#5A5FF0] transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Profile
              </Link>
              <Link
                href="/settings"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-[14px] text-[#4A5568] hover:bg-[#F8FAFB] hover:text-[#5A5FF0] transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Settings
              </Link>
              <Link
                href="/billing"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-[14px] text-[#4A5568] hover:bg-[#F8FAFB] hover:text-[#5A5FF0] transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                Billing
              </Link>
              <button
                onClick={handleFeedbackClick}
                className="flex items-center gap-3 px-4 py-2.5 text-[14px] text-[#4A5568] hover:bg-[#F8FAFB] hover:text-[#5A5FF0] transition-colors w-full"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                Send Feedback
              </button>
            </div>

            {/* Logout */}
            <div className="border-t border-[#E2E8F0] py-2">
              <button
                onClick={handleLogout}
                disabled={loading}
                className="flex items-center gap-3 px-4 py-2.5 text-[14px] text-[#DC2626] hover:bg-[#FEE2E2] transition-colors w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                {loading ? 'Logging out...' : 'Log out'}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
