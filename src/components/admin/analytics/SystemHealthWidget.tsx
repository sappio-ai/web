'use client'

import { SystemHealth } from '@/lib/actions/admin-system'
import { CheckCircle2, AlertTriangle, XCircle, Activity } from 'lucide-react'

export function SystemHealthWidget({ health }: { health: SystemHealth }) {
    const statusConfig = {
        operational: {
            color: 'text-green-400',
            bg: 'bg-green-500/10 border-green-500/20',
            icon: CheckCircle2,
            label: 'Operational'
        },
        degraded: {
            color: 'text-yellow-400',
            bg: 'bg-yellow-500/10 border-yellow-500/20',
            icon: AlertTriangle,
            label: 'Degraded'
        },
        down: {
            color: 'text-red-400',
            bg: 'bg-red-500/10 border-red-500/20',
            icon: XCircle,
            label: 'System Down'
        }
    }

    const config = statusConfig[health.status]
    const Icon = config.icon

    return (
        <div className={`rounded-xl border p-4 flex items-center justify-between ${config.bg}`}>
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-white/5`}>
                    <Activity className={`w-5 h-5 ${config.color}`} />
                </div>
                <div>
                    <h4 className={`text-sm font-semibold ${config.color}`}>{config.label}</h4>
                    <p className="text-xs text-gray-400">Database & API Status</p>
                </div>
            </div>

            <div className="text-right">
                <p className="text-white font-mono font-medium">{health.latency}ms</p>
                <p className="text-xs text-gray-500">Latency</p>
            </div>
        </div>
    )
}
