'use client'

import Orb from '../orb/Orb'

interface ModeSelectorProps {
  onSelectMode: (mode: 'practice' | 'timed') => void
}

export default function ModeSelector({ onSelectMode }: ModeSelectorProps) {
  return (
    <div className="flex flex-col items-center max-w-4xl mx-auto">
      {/* Quiz Master Orb */}
      <div className="mb-6">
        <Orb pose="quiz-master" size="lg" />
      </div>

      {/* Title */}
      <h2 className="text-3xl font-bold text-white mb-3">Choose Quiz Mode</h2>
      <p className="text-gray-300 text-center mb-8 max-w-md">
        Select how you&apos;d like to take this quiz
      </p>

      {/* Mode Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        {/* Practice Mode */}
        <button
          onClick={() => onSelectMode('practice')}
          className="group bg-gradient-to-br from-white/[0.12] to-white/[0.05] backdrop-blur-2xl rounded-2xl border border-white/20 p-8 hover:border-[#a8d5d5]/50 hover:shadow-lg hover:shadow-[#a8d5d5]/20 transition-all hover:scale-105"
        >
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-[#a8d5d5]/20 flex items-center justify-center mb-4 group-hover:bg-[#a8d5d5]/30 transition-colors">
              <svg
                className="w-8 h-8 text-[#a8d5d5]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Practice Mode</h3>
            <p className="text-gray-400 text-sm">
              Take your time to learn. No timer, no pressure. Perfect for
              studying and understanding concepts.
            </p>
          </div>
        </button>

        {/* Timed Mode */}
        <button
          onClick={() => onSelectMode('timed')}
          className="group bg-gradient-to-br from-white/[0.12] to-white/[0.05] backdrop-blur-2xl rounded-2xl border border-white/20 p-8 hover:border-orange-500/50 hover:shadow-lg hover:shadow-orange-500/20 transition-all hover:scale-105"
        >
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-orange-500/20 flex items-center justify-center mb-4 group-hover:bg-orange-500/30 transition-colors">
              <svg
                className="w-8 h-8 text-orange-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Timed Mode</h3>
            <p className="text-gray-400 text-sm">
              Simulate exam conditions with a countdown timer. 2 minutes per
              question. Test your knowledge under pressure.
            </p>
          </div>
        </button>
      </div>
    </div>
  )
}
