import { Upload, Sparkles, TrendingUp } from 'lucide-react'
import Image from 'next/image'

export default function OrbitTimeline() {
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
    <div className="relative">
      {/* Orbit path SVG */}
      <svg 
        className="absolute inset-0 w-full h-full pointer-events-none" 
        viewBox="0 0 1000 200"
        preserveAspectRatio="none"
      >
        <path
          d="M 50,100 Q 250,50 500,100 T 950,100"
          stroke="var(--primary)"
          strokeWidth="2"
          fill="none"
          opacity="0.2"
          strokeDasharray="8 8"
        />
        {/* Orbit dots */}
        <circle cx="50" cy="100" r="4" fill="var(--primary)" opacity="0.3" />
        <circle cx="500" cy="100" r="4" fill="var(--primary)" opacity="0.3" />
        <circle cx="950" cy="100" r="4" fill="var(--primary)" opacity="0.3" />
      </svg>

      {/* Steps */}
      <div className="relative grid md:grid-cols-3 gap-8">
        {steps.map((step, i) => (
          <div key={i} className="relative">
            {/* Mascot sticker on step 2 */}
            {i === 1 && (
              <div className="absolute -top-12 -right-6 w-20 h-20 hidden md:block z-10">
                <Image
                  src="/brand/mascot/mascot-orbit-1x1.png"
                  alt="Sappio mascot"
                  width={80}
                  height={80}
                  className="object-contain"
                />
              </div>
            )}
            
            <div className="bg-white rounded-2xl p-6 border border-[var(--border)] transition-all duration-200 hover:border-[var(--primary)] hover:-translate-y-1" style={{ boxShadow: 'var(--shadow)' }}>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 rounded-full bg-[var(--primary)] text-white flex items-center justify-center text-lg font-bold flex-shrink-0">
                  {step.num}
                </div>
                <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center flex-shrink-0">
                  <step.icon className="w-5 h-5 text-[var(--primary)]" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-[var(--ink)] mb-2">{step.title}</h3>
              <p className="text-sm text-[var(--text)]">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
