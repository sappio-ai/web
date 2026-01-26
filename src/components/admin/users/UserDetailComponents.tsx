'use client'

import { AdminUserDetails } from '@/lib/actions/admin-users'
import { Badge } from '@/components/ui/badge'
import { User, Mail, Calendar, Package, CheckCircle, Shield, ArrowLeft } from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'

export function UserDetailHeader({ user }: { user: AdminUserDetails }) {
    return (
        <div className="space-y-6">
            <Link href="/admin/users" className="inline-flex items-center text-gray-400 hover:text-white transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Users
            </Link>

            <div className="bg-[#1A1A24] border border-gray-800 rounded-xl p-8">
                <div className="flex flex-col md:flex-row gap-8 items-start">
                    {/* Avatar */}
                    <div className="w-24 h-24 rounded-full bg-gray-800 flex items-center justify-center overflow-hidden ring-4 ring-white/5">
                        {user.avatar_url ? (
                            <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <User className="w-10 h-10 text-gray-400" />
                        )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 space-y-4">
                        <div className="flex items-start justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-white">{user.full_name || 'Anonymous User'}</h1>
                                <div className="flex items-center gap-4 mt-2 text-gray-400">
                                    <div className="flex items-center gap-1.5">
                                        <Mail className="w-4 h-4" />
                                        <span>{user.email}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Calendar className="w-4 h-4" />
                                        <span>Joined {format(new Date(user.created_at), 'MMM d, yyyy')}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Badge className={user.plan === 'pro' ? 'bg-purple-500/20 text-purple-300 border-purple-500/50' : 'bg-gray-700 text-gray-300'}>
                                    {user.plan.toUpperCase()}
                                </Badge>
                                {user.role === 'admin' && (
                                    <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/50">
                                        <Shield className="w-3 h-3 mr-1" /> ADMIN
                                    </Badge>
                                )}
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                            <div className="bg-white/5 rounded-lg p-4 border border-white/5">
                                <p className="text-gray-400 text-xs uppercase font-semibold">Study Packs</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <Package className="w-5 h-5 text-blue-400" />
                                    <span className="text-2xl font-bold text-white">{user.stats.total_packs}</span>
                                </div>
                            </div>
                            <div className="bg-white/5 rounded-lg p-4 border border-white/5">
                                <p className="text-gray-400 text-xs uppercase font-semibold">Completions</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <CheckCircle className="w-5 h-5 text-green-400" />
                                    <span className="text-2xl font-bold text-white">{user.stats.total_completions}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export function UserActivityTimeline({ activity }: { activity: AdminUserDetails['activity'] }) {
    if (activity.length === 0) {
        return (
            <div className="bg-[#1A1A24] border border-gray-800 rounded-xl p-8 text-center">
                <p className="text-gray-400">No recent activity recorded.</p>
            </div>
        )
    }

    return (
        <div className="bg-[#1A1A24] border border-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-6">Recent Activity Log</h3>
            <div className="relative border-l border-gray-800 ml-3 space-y-8 py-2">
                {activity.map((item, i) => (
                    <div key={i} className="relative pl-8">
                        {/* Dot */}
                        <div className={`absolute -left-1.5 top-1.5 w-3 h-3 rounded-full border-2 border-[#1A1A24] ${item.type === 'study_pack' ? 'bg-blue-500' : 'bg-green-500'
                            }`} />

                        {/* Content */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                            <div>
                                <p className="text-white font-medium">{item.name}</p>
                                <p className="text-xs text-blue-400 font-mono mt-0.5 uppercase tracking-wide">{item.type.replace('_', ' ')}</p>
                            </div>
                            <time className="text-xs text-gray-500 whitespace-nowrap">
                                {format(new Date(item.created_at), 'MMM d, h:mm a')}
                            </time>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
