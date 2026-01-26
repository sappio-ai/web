'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AdminUserPreview } from '@/lib/actions/admin-users'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar' // Assuming exists, else standard img
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { Search, ChevronLeft, ChevronRight, User as UserIcon, Eye } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'

export function UserListTable({ users, total, formattedTotal, currentPage }: { users: AdminUserPreview[], total: number, formattedTotal: number, currentPage: number }) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [search, setSearch] = useState(searchParams.get('q') || '')

    // Handle Search
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        const params = new URLSearchParams(searchParams)
        if (search) params.set('q', search)
        else params.delete('q')
        params.set('page', '1') // Reset to page 1
        router.push(`/admin/users?${params.toString()}`)
    }

    // Handle Pagination
    const handlePageChange = (newPage: number) => {
        const params = new URLSearchParams(searchParams)
        params.set('page', newPage.toString())
        router.push(`/admin/users?${params.toString()}`)
    }

    const totalPages = Math.ceil(total / 10)

    return (
        <div className="space-y-6">
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <Input
                        placeholder="Search users by email or name..."
                        className="pl-10 bg-[#1A1A24] border-gray-800 text-white placeholder:text-gray-500 focus:ring-blue-500/50 focus:border-blue-500/50"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <Button type="submit" variant="secondary" className="bg-white/10 text-white hover:bg-white/20 border-0">
                    Search
                </Button>
            </form>

            {/* Table */}
            <div className="bg-[#1A1A24] border border-gray-800 rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-gray-800/50 bg-white/5">
                            <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">User</th>
                            <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Role</th>
                            <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Joined</th>
                            <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/50">
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-white/5 transition-colors group">
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center overflow-hidden">
                                            {user.avatar_url ? (
                                                <img src={user.avatar_url} alt="Ava" className="w-full h-full object-cover" />
                                            ) : (
                                                <UserIcon className="w-5 h-5 text-gray-400" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-medium text-white">{user.full_name || 'Anonymous'}</p>
                                            <p className="text-sm text-gray-500">{user.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.plan === 'pro'
                                        ? 'bg-purple-500/10 text-purple-400'
                                        : user.role === 'admin'
                                            ? 'bg-blue-500/10 text-blue-400'
                                            : 'bg-gray-700/50 text-gray-400'
                                        }`}>
                                        {user.role === 'admin' ? 'Admin' : user.plan}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <p className="text-sm text-gray-400">
                                        {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
                                    </p>
                                </td>
                                <td className="p-4 text-right">
                                    <Link href={`/admin/users/${user.id}`}>
                                        <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white hover:bg-white/10">
                                            <Eye className="w-4 h-4 mr-2" />
                                            View
                                        </Button>
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Pagination Stats */}
                <div className="p-4 border-t border-gray-800 flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                        Showing page {currentPage} of {totalPages}
                    </p>
                    <div className="flex gap-2">
                        <Button
                            variant="outline" size="sm"
                            disabled={currentPage <= 1}
                            onClick={() => handlePageChange(currentPage - 1)}
                            className="bg-transparent border-gray-700 text-gray-300 hover:bg-white/5 hover:text-white"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="outline" size="sm"
                            disabled={currentPage >= totalPages}
                            onClick={() => handlePageChange(currentPage + 1)}
                            className="bg-transparent border-gray-700 text-gray-300 hover:bg-white/5 hover:text-white"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
