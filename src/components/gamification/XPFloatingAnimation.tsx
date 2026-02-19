'use client'

interface XPFloatingAnimationProps {
  amount: number
}

export default function XPFloatingAnimation({ amount }: XPFloatingAnimationProps) {
  return (
    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 pointer-events-none z-10 animate-xp-float">
      <span className="text-[#5A5FF0] font-bold text-lg whitespace-nowrap drop-shadow-sm">
        +{amount} XP
      </span>
      <style jsx>{`
        @keyframes xpFloat {
          0% { opacity: 1; transform: translateY(0); }
          70% { opacity: 1; }
          100% { opacity: 0; transform: translateY(-50px); }
        }
        .animate-xp-float {
          animation: xpFloat 1.1s ease-out forwards;
        }
      `}</style>
    </div>
  )
}
