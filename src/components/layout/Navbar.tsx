import Link from 'next/link'
import { getUser } from '@/lib/auth/session'
import Button from '@/components/ui/Button'
import LogoutButton from './LogoutButton'

export default async function Navbar() {
  const user = await getUser()

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 animate-[slideDown_0.6s_ease-out]">
      {/* Soft glow behind navbar */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0d1117] to-transparent" />
      
      <div className="relative bg-[#0d1117]/60 backdrop-blur-2xl border-b border-[#a8d5d5]/10 shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo with soft shadow */}
            <Link href={user ? '/dashboard' : '/'} className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-[#a8d5d5]/40 rounded-full blur-md" />
                <div className="relative w-9 h-9 rounded-full bg-gradient-to-br from-[#a8d5d5] to-[#8bc5c5] shadow-[0_4px_12px_rgba(168,213,213,0.4),inset_0_1px_0_rgba(255,255,255,0.3)] group-hover:shadow-[0_6px_16px_rgba(168,213,213,0.5)] transition-all" />
              </div>
              <span className="text-xl font-bold text-white">Sappio</span>
            </Link>

            {/* Navigation */}
            <div className="flex items-center gap-6">
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="text-gray-300 hover:text-[#a8d5d5] transition-colors text-sm font-medium"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/profile"
                    className="text-gray-300 hover:text-[#a8d5d5] transition-colors text-sm font-medium"
                  >
                    Profile
                  </Link>
                  <LogoutButton />
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-gray-300 hover:text-[#a8d5d5] transition-colors text-sm font-medium"
                  >
                    Log in
                  </Link>
                  <Link href="/signup">
                    <Button size="sm">Get started</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
