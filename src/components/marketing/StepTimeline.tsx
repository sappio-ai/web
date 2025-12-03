import { Upload, Sparkles, TrendingUp } from 'lucide-react'
import BookmarkCorner from '@/components/ui/BookmarkNotch'
import DecorArt from '@/components/ui/DecorArt'

export default function StepTimeline() {
  const steps = [
    {
      num: 1,
      icon: Upload,
      title: 'Upload your material',
      desc: 'PDFs, docs, or links'
    },
    {
      num: 2,
      icon: Sparkles,
      title: 'Generate a study pack',
      desc: 'Flashcards, quizzes, summaries, mind maps'
    },
    {
      num: 3,
      icon: TrendingUp,
      title: 'Review + improve',
      desc: 'Daily review, streaks, and progress'
    }
  ]

  return (
    <div className="grid md:grid-cols-[auto_1fr] gap-8 max-w-4xl mx-auto">
      {/* Left: Timeline rail */}
      <div className="hidden md:flex flex-col items-center gap-8 pt-8">
        {steps.map((step, i) => (
          <div key={i} className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[var(--primary)] text-white flex items-center justify-center text-xl font-bold flex-shrink-0 relative">
              {step.num}
              {i === 0 && <BookmarkCorner size="sm" className="right-0" />}
            </div>
            {i < steps.length - 1 && (
              <div className="w-0.5 h-24 bg-[var(--primary)]/20" />
            )}
          </div>
        ))}
      </div>
      
      {/* Right: Step cards */}
      <div className="space-y-6">
        {steps.map((step, i) => (
          <div 
            key={i}
            className="relative bg-white rounded-2xl p-6 border border-[var(--border)] hover:border-[var(--primary)] transition-all duration-200"
            style={{ boxShadow: 'var(--shadow)' }}
          >
            {/* Mobile number */}
            <div className="md:hidden w-10 h-10 rounded-full bg-[var(--primary)] text-white flex items-center justify-center text-lg font-bold mb-4">
              {step.num}
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center flex-shrink-0">
                <step.icon className="w-6 h-6 text-[var(--primary)]" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-[var(--ink)] mb-2">{step.title}</h3>
                <p className="text-base text-[var(--text)]">{step.desc}</p>
              </div>
              
              {/* Small mascot on step 2 */}
              {i === 1 && (
                <div className="hidden lg:block w-16 h-16 -mt-4">
                  <DecorArt 
                    src="/brand/mascot/mascot-orbit-1x1.png"
                    variant="float"
                    width={64}
                    height={64}
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
