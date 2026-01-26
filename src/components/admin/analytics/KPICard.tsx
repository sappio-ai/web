'use client'

import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface KPICardProps {
    title: string
    value: string | number
    icon: LucideIcon
    trend?: {
        value: string
        label: string
        positive?: boolean
    }
    color?: string
}

export function KPICard({ title, value, icon: Icon, trend, color = 'blue' }: KPICardProps) {
    const colorStyles = {
        blue: 'text-blue-400 bg-blue-500/10 from-blue-500/20',
        purple: 'text-purple-400 bg-purple-500/10 from-purple-500/20',
        green: 'text-green-400 bg-green-500/10 from-green-500/20',
        orange: 'text-orange-400 bg-orange-500/10 from-orange-500/20',
        pink: 'text-pink-400 bg-pink-500/10 from-pink-500/20',
    } as const

    const selectedColor = colorStyles[color as keyof typeof colorStyles] || colorStyles.blue

    return (
        <div className="bg-[#1A1A24] border border-gray-800 rounded-xl p-6 relative overflow-hidden group hover:border-gray-700 transition-all">
            <div className={cn(
                "absolute top-0 right-0 p-32 rounded-full blur-3xl opacity-5 transition-opacity group-hover:opacity-10 pointer-events-none bg-gradient-to-br",
                selectedColor.split(' ')[2] // extract gradient from string part
            )} />

            <div className="flex justify-between items-start mb-4">
                <div>
                    <p className="text-gray-400 text-sm font-medium">{title}</p>
                    <h3 className="text-3xl font-bold text-white mt-2">{value}</h3>
                </div>
                <div className={cn("p-3 rounded-lg", selectedColor)}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>

            {trend && (
                <div className="flex items-center gap-2 text-sm">
                    <span className={cn(
                        "font-medium px-1.5 py-0.5 rounded",
                        trend.positive ? "text-green-400 bg-green-400/10" : "text-red-400 bg-red-400/10"
                    )}>
                        {trend.value}
                    </span>
                    <span className="text-gray-500">{trend.label}</span>
                </div>
            )}
        </div>
    )
}
