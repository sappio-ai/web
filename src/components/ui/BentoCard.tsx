import { ReactNode } from 'react'
import { ChevronRight } from 'lucide-react'
import Image from 'next/image'

interface BentoCardProps {
    children?: ReactNode
    className?: string
    title: string
    description?: string
    graphic?: ReactNode
    header?: ReactNode
    icon?: React.ElementType
    dark?: boolean
    fade?: Array<'top' | 'bottom' | 'left' | 'right'>
}

export default function BentoCard({
    children,
    className = '',
    title,
    description,
    graphic,
    header,
    icon: Icon,
    dark = false,
    fade = []
}: BentoCardProps) {
    return (
        <div
            className={`
        relative overflow-hidden rounded-3xl border transition-all duration-300 group
        ${dark
                    ? 'bg-[#0B1220] border-white/10 text-white hover:border-white/20'
                    : 'bg-white border-[#E2E8F0] text-[var(--ink)] hover:border-[var(--primary)]/50 hover:shadow-lg'
                }
        ${className}
      `}
        >
            {/* Background Graphic Area */}
            {graphic && (
                <div className="absolute inset-0 z-0 transition-transform duration-700 group-hover:scale-105">
                    {graphic}
                </div>
            )}

            {/* Fade Overlays */}
            {fade.includes('top') && <div className={`absolute top-0 left-0 right-0 h-24 bg-gradient-to-b ${dark ? 'from-[#0B1220]' : 'from-white'} to-transparent z-10 pointer-events-none`} />}
            {fade.includes('bottom') && <div className={`absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t ${dark ? 'from-[#0B1220]' : 'from-white'} to-transparent z-10 pointer-events-none`} />}

            {/* Content Area */}
            <div className="relative z-20 flex flex-col h-full pointer-events-none">
                {header && <div className="p-6 pointer-events-auto">{header}</div>}

                <div className="mt-auto p-8 pointer-events-auto">
                    {Icon && (
                        <div className={`
              w-12 h-12 rounded-xl flex items-center justify-center mb-4
              ${dark ? 'bg-white/10 text-white' : 'bg-[var(--primary)]/10 text-[var(--primary)]'}
            `}>
                            <Icon className="w-6 h-6" />
                        </div>
                    )}

                    <h3 className={`text-2xl font-bold mb-2 ${dark ? 'text-white' : 'text-[var(--ink)]'}`}>
                        {title}
                    </h3>

                    {description && (
                        <p className={`text-lg leading-relaxed ${dark ? 'text-white/60' : 'text-[var(--text)]'}`}>
                            {description}
                        </p>
                    )}

                    {children}
                </div>
            </div>
        </div>
    )
}
