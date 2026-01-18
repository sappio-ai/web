import { createServiceRoleClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ArrowLeft, MessageSquare, Bug, Lightbulb, Clock, CheckCircle, Archive } from 'lucide-react'

interface Feedback {
    id: string
    user_id: string | null
    email: string | null
    type: string
    message: string
    page_url: string | null
    status: string
    created_at: string
}

async function getFeedback() {
    const supabase = createServiceRoleClient()

    const { data, error } = await supabase
        .from('feedback')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100)

    if (error) {
        console.error('Error fetching feedback:', error)
        return []
    }

    return data as Feedback[]
}

function getTypeIcon(type: string) {
    switch (type) {
        case 'bug':
            return <Bug className="w-4 h-4 text-red-400" />
        case 'feature':
            return <Lightbulb className="w-4 h-4 text-purple-400" />
        default:
            return <MessageSquare className="w-4 h-4 text-blue-400" />
    }
}

function getStatusBadge(status: string) {
    switch (status) {
        case 'resolved':
            return (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-green-500/10 text-green-400">
                    <CheckCircle className="w-3 h-3" />
                    Resolved
                </span>
            )
        case 'reviewed':
            return (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-blue-500/10 text-blue-400">
                    <Clock className="w-3 h-3" />
                    Reviewed
                </span>
            )
        case 'archived':
            return (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-gray-500/10 text-gray-400">
                    <Archive className="w-3 h-3" />
                    Archived
                </span>
            )
        default:
            return (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-yellow-500/10 text-yellow-400">
                    New
                </span>
            )
    }
}

export default async function AdminFeedbackPage() {
    const feedback = await getFeedback()

    const stats = {
        total: feedback.length,
        new: feedback.filter(f => f.status === 'new').length,
        bugs: feedback.filter(f => f.type === 'bug').length,
        features: feedback.filter(f => f.type === 'feature').length,
    }

    return (
        <div className="min-h-screen bg-[#0A0A0F] p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href="/admin"
                        className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Admin
                    </Link>
                    <h1 className="text-3xl font-bold text-white mb-2">User Feedback</h1>
                    <p className="text-gray-400">
                        View and manage feedback submitted by users
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-[#1A1A24] border border-gray-800 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-1">
                            <MessageSquare className="w-4 h-4 text-blue-400" />
                            <span className="text-sm text-gray-400">Total</span>
                        </div>
                        <p className="text-2xl font-bold text-white">{stats.total}</p>
                    </div>
                    <div className="bg-[#1A1A24] border border-gray-800 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-1">
                            <Clock className="w-4 h-4 text-yellow-400" />
                            <span className="text-sm text-gray-400">New</span>
                        </div>
                        <p className="text-2xl font-bold text-white">{stats.new}</p>
                    </div>
                    <div className="bg-[#1A1A24] border border-gray-800 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-1">
                            <Bug className="w-4 h-4 text-red-400" />
                            <span className="text-sm text-gray-400">Bugs</span>
                        </div>
                        <p className="text-2xl font-bold text-white">{stats.bugs}</p>
                    </div>
                    <div className="bg-[#1A1A24] border border-gray-800 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-1">
                            <Lightbulb className="w-4 h-4 text-purple-400" />
                            <span className="text-sm text-gray-400">Features</span>
                        </div>
                        <p className="text-2xl font-bold text-white">{stats.features}</p>
                    </div>
                </div>

                {/* Feedback List */}
                {feedback.length > 0 ? (
                    <div className="space-y-4">
                        {feedback.map((item) => (
                            <div
                                key={item.id}
                                className="bg-[#1A1A24] border border-gray-800 rounded-lg p-4 hover:border-gray-700 transition-colors"
                            >
                                <div className="flex items-start justify-between gap-4 mb-3">
                                    <div className="flex items-center gap-3">
                                        {getTypeIcon(item.type)}
                                        <span className="text-sm text-gray-400">
                                            {item.email || 'Anonymous'}
                                        </span>
                                        <span className="text-gray-600">•</span>
                                        <span className="text-sm text-gray-500">
                                            {new Date(item.created_at).toLocaleDateString()} at{' '}
                                            {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    {getStatusBadge(item.status)}
                                </div>

                                <p className="text-white text-sm leading-relaxed whitespace-pre-wrap">
                                    {item.message}
                                </p>

                                {item.page_url && (
                                    <div className="mt-3 pt-3 border-t border-gray-800">
                                        <p className="text-xs text-gray-500">
                                            From: <span className="text-gray-400">{item.page_url}</span>
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-[#1A1A24] border border-gray-800 rounded-lg p-12 text-center">
                        <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-400">No feedback yet.</p>
                        <p className="text-gray-500 text-sm mt-1">User feedback will appear here.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
