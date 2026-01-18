'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Users, Clock, MessageSquare, LogOut, LayoutDashboard } from 'lucide-react'
import { cn } from '@/lib/utils'

export function AdminSidebar() {
    const pathname = usePathname()

    const links = [
        {
            href: '/admin',
            label: 'Overview',
            icon: LayoutDashboard,
        },
        {
            href: '/admin/waitlist',
            label: 'Waitlist',
            icon: Clock,
        },
        {
            href: '/admin/users/super',
            label: 'Super Users',
            icon: Users,
        },
        {
            href: '/admin/feedback',
            label: 'Feedback',
            icon: MessageSquare,
        },
    ]

    return (
        <aside className="fixed left-0 top-0 bottom-0 w-64 bg-[#0D1420]/95 backdrop-blur-xl border-r border-white/10 z-40 flex flex-col">
            <div className="p-6 border-b border-white/10">
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Admin Panel
                </h1>
            </div>

            <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
                {links.map((link) => {
                    const isActive = pathname === link.href
                    const Icon = link.icon

                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all group",
                                isActive
                                    ? "bg-white/10 text-white"
                                    : "text-gray-400 hover:text-white hover:bg-white/5"
                            )}
                        >
                            <Icon className={cn(
                                "w-5 h-5 transition-colors",
                                isActive ? "text-blue-400" : "group-hover:text-blue-300"
                            )} />
                            <span className="font-medium">{link.label}</span>
                        </Link>
                    )
                })}
            </nav>

            <div className="p-6 border-t border-white/10">
                <Link
                    href="/dashboard"
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all group"
                >
                    <LogOut className="w-5 h-5 group-hover:text-red-300 transition-colors" />
                    <span className="font-medium">Back to App</span>
                </Link>
            </div>
        </aside>
    )
}
