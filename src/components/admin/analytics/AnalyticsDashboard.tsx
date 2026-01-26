'use client'

import { AnalyticsData } from '@/lib/actions/analytics'
import { KPICard } from './KPICard'
import { UserGrowthChart, PlanDistributionChart } from './AnalyticsCharts'
import { RecentActivityList } from './RecentActivityList'
import { Users, Zap, Library, MessageSquare } from 'lucide-react'

export function AnalyticsDashboard({ data }: { data: AnalyticsData }) {
    return (
        <div className="space-y-6">
            {/* KPI Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard
                    title="Total Users"
                    value={data.users.total}
                    icon={Users}
                    color="blue"
                    trend={{
                        value: `+${data.users.newLast7Days}`,
                        label: 'last 7 days',
                        positive: true
                    }}
                />
                <KPICard
                    title="Pro Subscribers"
                    value={data.users.pro}
                    icon={Zap}
                    color="purple"
                    trend={{
                        value: `${((data.users.pro / (data.users.total || 1)) * 100).toFixed(1)}%`,
                        label: 'conversion rate',
                        positive: true
                    }}
                />
                <KPICard
                    title="Study Packs"
                    value={data.content.totalStudyPacks}
                    icon={Library}
                    color="green"
                />
                <KPICard
                    title="Active Rooms"
                    value={data.engagement.activeRooms}
                    icon={MessageSquare}
                    color="pink"
                />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <UserGrowthChart data={data.users.growth} />
                </div>
                <div>
                    <PlanDistributionChart data={data.users.distribution} />
                </div>
            </div>

            {/* Activity Lists */}
            <RecentActivityList users={data.recentUsers} feedback={data.recentFeedback} />
        </div>
    )
}
