import { X, Check } from 'lucide-react'
import DecorArt from '@/components/ui/DecorArt'

export default function BeforeAfterSection() {
  return (
    <div className="grid md:grid-cols-2 gap-12 items-center">
      {/* Before */}
      <div>
        <h3 className="text-2xl font-bold text-[var(--ink)] mb-6">Before Sappio</h3>
        <div className="space-y-4">
          {[
            'Hours creating flashcards manually',
            'Forgetting to review at the right time',
            'No clear picture of how topics connect',
            'Losing motivation without progress tracking'
          ].map((pain, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <X className="w-4 h-4 text-red-600" />
              </div>
              <p className="text-base text-[var(--text)]">{pain}</p>
            </div>
          ))}
        </div>
      </div>
      
      {/* After */}
      <div className="relative">
        <div className="bg-white rounded-2xl p-8 border-2 border-[var(--primary)] relative overflow-visible" style={{ boxShadow: 'var(--shadow-lg)' }}>
          <h3 className="text-2xl font-bold text-[var(--ink)] mb-6">With Sappio</h3>
          <div className="space-y-4 relative z-10">
            {[
              'AI generates study materials in seconds',
              'Spaced repetition keeps you on track',
              'Mind maps show the big picture',
              'Streaks and progress keep you motivated'
            ].map((benefit, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[var(--accent)]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-4 h-4 text-[var(--accent)]" />
                </div>
                <p className="text-base text-[var(--ink)] font-medium">{benefit}</p>
              </div>
            ))}
          </div>
          
          {/* Mascot positioned outside the card, fully visible */}
          <div className="absolute -right-16 -bottom-8 w-40 h-40 hidden xl:block">
            <DecorArt 
              src="/brand/mascot/mascot-orbit-1x1.png"
              variant="float"
              width={160}
              height={160}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
