'use client'

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { AnalyticsData } from '@/lib/actions/analytics'

export function UserGrowthChart({ data }: { data: AnalyticsData['users']['growth'] }) {
    return (
        <div className="bg-[#1A1A24] border border-gray-800 rounded-xl p-6 h-[400px]">
            <h3 className="text-lg font-semibold text-white mb-6">User Growth (Last 30 Days)</h3>
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#60A5FA" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#60A5FA" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#2D3748" vertical={false} />
                        <XAxis
                            dataKey="date"
                            stroke="#718096"
                            tick={{ fill: '#718096', fontSize: 12 }}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke="#718096"
                            tick={{ fill: '#718096', fontSize: 12 }}
                            tickLine={false}
                            axisLine={false}
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#1A202C', borderColor: '#2D3748', color: '#fff' }}
                            itemStyle={{ color: '#fff' }}
                            cursor={{ stroke: '#4A5568' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="count"
                            stroke="#60A5FA"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorUsers)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}

const COLORS = ['#22C55E', '#3B82F6', '#EAB308', '#EF4444']; // Green, Blue, Yellow, Red

export function PlanDistributionChart({ data }: { data: AnalyticsData['users']['distribution'] }) {
    // Filter out zero values to avoid ugly empty pie segments
    const activeData = data.filter(d => d.value > 0);

    return (
        <div className="bg-[#1A1A24] border border-gray-800 rounded-xl p-6 h-[400px]">
            <h3 className="text-lg font-semibold text-white mb-6">User Plans</h3>
            <div className="h-[300px] w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={activeData}
                            cx="50%"
                            cy="50%"
                            innerRadius={80}
                            outerRadius={110}
                            fill="#8884d8"
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {activeData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{ backgroundColor: '#1A202C', borderColor: '#2D3748', borderRadius: '8px', color: '#fff' }}
                            itemStyle={{ color: '#fff' }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="flex justify-center gap-6 mt-[-20px]">
                {activeData.map((entry, index) => (
                    <div key={entry.name} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                        <span className="text-gray-400 text-sm">{entry.name}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}
