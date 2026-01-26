'use client'

import { RetentionData } from '@/lib/actions/admin-system'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

export function RetentionChart({ data }: { data: RetentionData }) {
    return (
        <div className="bg-[#1A1A24] border border-gray-800 rounded-xl p-6 h-[400px]">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-white">Weekly Activity</h3>
                    <p className="text-sm text-gray-500">Ratio of created packs vs new users per week</p>
                </div>
                <div className="text-right">
                    <span className="text-2xl font-bold text-white">{data[data.length - 1]?.retentionRate || 0}%</span>
                    <p className="text-xs text-gray-500">Current Wk</p>
                </div>
            </div>

            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#2D3748" vertical={false} />
                        <XAxis
                            dataKey="week"
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
                            cursor={{ fill: '#ffffff05' }}
                            contentStyle={{ backgroundColor: '#1A202C', borderColor: '#2D3748', color: '#fff' }}
                            itemStyle={{ color: '#fff' }}
                        />
                        <Bar dataKey="activeUsers" name="Content Actions" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="newUsers" name="New Signups" fill="#3B82F6" fillOpacity={0.3} radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}
