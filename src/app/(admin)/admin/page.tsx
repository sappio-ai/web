import Link from 'next/link'
import { Users, Clock, ListChecks, BarChart3, MessageSquare } from 'lucide-react'
import { getAnalyticsData } from '@/lib/actions/analytics'
import { getSystemHealth, getRetentionCohorts } from '@/lib/actions/admin-system'
import { AnalyticsDashboard } from '@/components/admin/analytics/AnalyticsDashboard'
import { SystemHealthWidget } from '@/components/admin/analytics/SystemHealthWidget'
import { RetentionChart } from '@/components/admin/analytics/RetentionChart'
import Button from '@/components/ui/Button'

export default async function AdminDashboardPage() {
    const [data, health, retention] = await Promise.all([
        getAnalyticsData(),
        getSystemHealth(),
        getRetentionCohorts()
    ])

    return (
        <div className="min-h-screen bg-[#0A0A0F] p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header & Health */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
                        <p className="text-gray-400">Manage users, monitor jobs, and view analytics</p>
                    </div>
                    <div className="min-w-[300px]">
                        <SystemHealthWidget health={health} />
                    </div>
                </div>

                {/* Analytics Section */}
                <section className="space-y-6">
                    <AnalyticsDashboard data={data} />

                    {/* Retention & Cohorts Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <RetentionChart data={retention} />

                        {/* Quick link to Users Table */}
                        <div className="bg-[#1A1A24] border border-gray-800 rounded-xl p-6 flex flex-col justify-center items-center text-center">
                            <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mb-6">
                                <Users className="w-8 h-8 text-blue-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">User Management</h3>
                            <p className="text-gray-400 mb-6 max-w-xs">View all {data.users.total} users, validte stats and inspect individual activity logs.</p>
                            <Link href="/admin/users">
                                <Button className="bg-blue-600 hover:bg-blue-700 text-white min-w-[200px]">
                                    View All Users
                                </Button>
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Quick Tools Navigation */}
                <section>
                    <h2 className="text-xl font-bold text-white mb-6">Quick Tools</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Link
                            href="/admin/waitlist"
                            className="bg-[#1A1A24] border border-gray-800 rounded-lg p-6 hover:border-purple-500/50 transition-colors group"
                        >
                            <div className="flex items-center gap-4 mb-3">
                                <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
                                    <Clock className="w-6 h-6 text-purple-400" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-white">Waitlist</h2>
                                    <p className="text-sm text-gray-400">Manage waitlist & send invites</p>
                                </div>
                            </div>
                        </Link>

                        <Link
                            href="/admin/users/super"
                            className="bg-[#1A1A24] border border-gray-800 rounded-lg p-6 hover:border-green-500/50 transition-colors group"
                        >
                            <div className="flex items-center gap-4 mb-3">
                                <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
                                    <Users className="w-6 h-6 text-green-400" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-white">Super Users</h2>
                                    <p className="text-sm text-gray-400">Power users with high engagement</p>
                                </div>
                            </div>
                        </Link>

                        <Link
                            href="/admin/feedback"
                            className="bg-[#1A1A24] border border-gray-800 rounded-lg p-6 hover:border-yellow-500/50 transition-colors group"
                        >
                            <div className="flex items-center gap-4 mb-3">
                                <div className="w-12 h-12 rounded-lg bg-yellow-500/10 flex items-center justify-center group-hover:bg-yellow-500/20 transition-colors">
                                    <MessageSquare className="w-6 h-6 text-yellow-400" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-white">Feedback</h2>
                                    <p className="text-sm text-gray-400">User bug reports & suggestions</p>
                                </div>
                            </div>
                        </Link>

                        <a
                            href="https://app.inngest.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-[#1A1A24] border border-gray-800 rounded-lg p-6 hover:border-orange-500/50 transition-colors group"
                        >
                            <div className="flex items-center gap-4 mb-3">
                                <div className="w-12 h-12 rounded-lg bg-orange-500/10 flex items-center justify-center group-hover:bg-orange-500/20 transition-colors">
                                    <ListChecks className="w-6 h-6 text-orange-400" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-white">Background Jobs</h2>
                                    <p className="text-sm text-gray-400">View Inngest functions & runs</p>
                                </div>
                            </div>
                        </a>

                        <a
                            href="https://app.posthog.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-[#1A1A24] border border-gray-800 rounded-lg p-6 hover:border-blue-500/50 transition-colors group"
                        >
                            <div className="flex items-center gap-4 mb-3">
                                <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                                    <BarChart3 className="w-6 h-6 text-blue-400" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-white">Full Analytics</h2>
                                    <p className="text-sm text-gray-400">PostHog dashboard & insights</p>
                                </div>
                            </div>
                        </a>
                    </div>
                </section>
            </div>
        </div>
    )
}
