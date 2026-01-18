'use client'

import { useRouter } from 'next/navigation'
import Orb from '@/components/orb/Orb'

interface DemoPromptProps {
    featureName: string
    description?: string
    bulletPoints?: string[]
    ctaText?: string;
    icon?: 'lock' | 'sparkles' | 'chart' | 'mindmap';
}

export default function DemoPrompt({
    featureName,
    description = "Sign up to unlock this feature and track your progress.",
    bulletPoints = [],
    ctaText = "Start for Free",
    icon = 'lock'
}: DemoPromptProps) {
    const router = useRouter()

    return (
        <div className="relative group overflow-hidden rounded-2xl animate-in fade-in duration-700">
            {/* Animated glowing background border effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 opacity-30 blur-2xl group-hover:opacity-50 transition-opacity duration-1000" />

            {/* Main card background */}
            <div className="relative bg-white rounded-2xl p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 bg-opacity-80 backdrop-blur-xl">
                {/* Subtle grid pattern overlay */}
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.04] pointer-events-none" />

                <div className="relative z-10 flex flex-col items-center text-center">

                    {/* Icon Area with Glow */}
                    <div className="mb-6 relative">
                        <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full transform scale-150 animate-pulse" />
                        <div className="bg-gradient-to-tr from-white to-blue-50 p-4 rounded-full shadow-sm border border-blue-100/50 relative">
                            {icon === 'mindmap' ? <Orb pose="explorer-magnifying-glass" size="md" /> :
                                icon === 'chart' ? <Orb pose="analytics-dashboard" size="md" /> :
                                    icon === 'sparkles' ? <Orb pose="generating-sparkles" size="md" /> :
                                        <Orb pose="neutral" size="md" />
                            }
                        </div>
                    </div>

                    <h3 className="text-[28px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-700 mb-4 tracking-tight">
                        {featureName}
                    </h3>

                    <p className="text-slate-600 text-[16px] leading-relaxed mb-8 max-w-lg font-medium">
                        {description}
                    </p>

                    {bulletPoints.length > 0 && (
                        <div className="w-full max-w-md bg-white/50 border border-indigo-100 rounded-xl p-6 mb-8 text-left shadow-sm">
                            <ul className="space-y-3">
                                {bulletPoints.map((point, index) => (
                                    <li key={index} className="flex items-start gap-3 text-slate-700 text-[15px]">
                                        <div className="mt-1.5 w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                            <div className="w-2 h-2 rounded-full bg-blue-600" />
                                        </div>
                                        <span className="font-medium">{point}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <button
                        onClick={() => router.push('/signup')}
                        className="group/btn relative w-full max-w-sm overflow-hidden rounded-xl bg-slate-900 p-[1px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50 transition-all hover:shadow-lg hover:shadow-blue-500/25 active:scale-[0.98]"
                    >
                        <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2E8F0_0%,#5090FF_50%,#E2E8F0_100%)]" />
                        <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-xl bg-slate-950 px-8 py-4 text-sm font-semibold text-white backdrop-blur-3xl transition-all group-hover/btn:bg-slate-900">
                            <span className="text-[16px] flex items-center gap-2">
                                {ctaText}
                                <svg className="w-5 h-5 transition-transform group-hover/btn:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </span>
                        </span>
                    </button>

                    <p className="mt-6 text-[14px] text-slate-500 font-medium">
                        Existing member? <button onClick={() => router.push('/login')} className="text-blue-600 hover:text-blue-700 hover:underline transition-colors">Log in</button>
                    </p>
                </div>
            </div>
        </div>
    )
}
