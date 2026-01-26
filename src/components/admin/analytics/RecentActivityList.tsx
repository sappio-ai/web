'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar' // Assuming you have this, otherwise standard img
import { AnalyticsData } from '@/lib/actions/analytics'
import { formatDistanceToNow } from 'date-fns'
import { User, MessageSquare } from 'lucide-react'

export function RecentActivityList({
    users,
    feedback
}: {
    users: AnalyticsData['recentUsers'],
    feedback: AnalyticsData['recentFeedback']
}) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            {/* Recent Signups */}
            <div className="bg-[#1A1A24] border border-gray-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-6">Recent Signups</h3>
                <div className="space-y-4">
                    {users.map((user) => (
                        <div key={user.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center overflow-hidden">
                                    {user.avatar_url ? (
                                        <img src={user.avatar_url} alt={user.full_name || 'User'} className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="w-5 h-5 text-gray-400" />
                                    )}
                                </div>
                                <div>
                                    <p className="text-white font-medium text-sm">{user.full_name || 'Anonymous User'}</p>
                                    <p className="text-gray-500 text-xs">{user.email}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className={`text-xs px-2 py-1 rounded-full ${user.plan === 'pro' ? 'bg-purple-500/20 text-purple-400' : 'bg-gray-700 text-gray-300'}`}>
                                    {user.plan}
                                </span>
                                <p className="text-gray-500 text-xs mt-1">
                                    {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
                                </p>
                            </div>
                        </div>
                    ))}
                    {users.length === 0 && (
                        <p className="text-gray-500 text-center py-4">No recent signups</p>
                    )}
                </div>
            </div>

            {/* Recent Feedback */}
            <div className="bg-[#1A1A24] border border-gray-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-6">Recent Feedback</h3>
                <div className="space-y-4">
                    {feedback.map((item) => (
                        <div key={item.id} className="p-3 rounded-lg hover:bg-white/5 transition-colors border border-gray-800/50">
                            <div className="flex items-start gap-4">
                                <div className="mt-1 p-2 rounded-lg bg-yellow-500/10">
                                    <MessageSquare className="w-4 h-4 text-yellow-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-white text-sm line-clamp-2">{item.message}</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="text-xs text-gray-500">{item.user_email || 'Anonymous'}</span>
                                        <span className="w-1 h-1 rounded-full bg-gray-700" />
                                        <span className="text-xs text-blue-400 capitalize">{item.type}</span>
                                        <span className="w-1 h-1 rounded-full bg-gray-700" />
                                        <span className="text-xs text-gray-500">
                                            {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    {feedback.length === 0 && (
                        <p className="text-gray-500 text-center py-4">No recent feedback</p>
                    )}
                </div>
            </div>
        </div>
    )
}
