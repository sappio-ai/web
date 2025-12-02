import { AuthGuard } from '@/components/auth/AuthGuard'
import Link from 'next/link'
import { Home, User } from 'lucide-react'
import LogoutButton from '@/components/layout/LogoutButton'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#0A0F1A]">
        {/* Sidebar Navigation */}
        <aside className="fixed left-0 top-16 bottom-0 w-64 bg-[#0D1420]/60 backdrop-blur-xl border-r border-white/10 z-40">
          <nav className="p-6 space-y-2">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-300 hover:text-white hover:bg-white/5 transition-all group"
            >
              <Home className="w-5 h-5 group-hover:text-[#a8d5d5] transition-colors" />
              <span className="font-medium">Dashboard</span>
            </Link>
            
            <Link
              href="/profile"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-300 hover:text-white hover:bg-white/5 transition-all group"
            >
              <User className="w-5 h-5 group-hover:text-[#a8d5d5] transition-colors" />
              <span className="font-medium">Profile</span>
            </Link>

            <div className="pt-4 border-t border-white/10 mt-4">
              <LogoutButton />
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <div className="ml-64 pt-16">
          {children}
        </div>
      </div>
    </AuthGuard>
  )
}
