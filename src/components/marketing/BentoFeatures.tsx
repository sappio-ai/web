import { BookOpen, FileText, Target, BarChart3, Brain, Upload } from 'lucide-react'
import BookmarkCorner from '@/components/ui/BookmarkNotch'
import DecorArt from '@/components/ui/DecorArt'

export default function BentoFeatures() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Large featured card - Mind maps */}
      <div className="md:col-span-2 md:row-span-2 relative bg-gradient-to-br from-[var(--primary)]/5 to-transparent rounded-2xl p-8 border-2 border-[var(--primary)] overflow-hidden" style={{ boxShadow: 'var(--shadow-lg)' }}>
        <BookmarkCorner size="md" />
        
        <div className="relative z-10">
          <Brain className="w-10 h-10 text-[var(--primary)] mb-4" />
          <h3 className="text-2xl font-bold text-[var(--ink)] mb-3">Mind maps</h3>
          <p className="text-base text-[var(--text)] mb-4 max-w-md">
            Visualize concepts and connections. See the big picture and understand how topics relate to each other.
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-semibold rounded-full">
              Mind map
            </span>
            <span className="px-3 py-1 bg-white text-[var(--text)] text-xs font-semibold rounded-full border border-[var(--border)]">
              Visual learning
            </span>
          </div>
        </div>
        
        {/* Illustration INSIDE the card, clearly visible */}
        <div className="absolute bottom-0 right-0 w-64 h-64 opacity-20">
          <DecorArt 
            src="/brand/mascot/mascot-mindmap-3x2.png"
            variant="float"
            width={256}
            height={256}
          />
        </div>
      </div>
      
      {/* Smaller feature cards */}
      {[
        { icon: BookOpen, title: 'Flashcards + spaced repetition', chip: 'Flashcards' },
        { icon: FileText, title: 'AI-generated quizzes', chip: 'Quiz' },
        { icon: FileText, title: 'Smart summaries', chip: 'Summary' },
        { icon: Target, title: 'Practice mode', chip: 'Practice' },
        { icon: BarChart3, title: 'Progress tracking', chip: 'Streaks' },
        { icon: Upload, title: 'PDF & doc support', chip: 'Upload' }
      ].map((feature, i) => (
        <div 
          key={i}
          className="bg-white rounded-2xl p-6 border border-[var(--border)] hover:border-[var(--primary)] transition-all duration-200 hover:-translate-y-1"
          style={{ boxShadow: 'var(--shadow)' }}
        >
          <feature.icon className="w-7 h-7 text-[var(--primary)] mb-3" />
          <h3 className="text-base font-bold text-[var(--ink)] mb-2">{feature.title}</h3>
          <span className="inline-block px-2.5 py-1 bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-semibold rounded-full">
            {feature.chip}
          </span>
        </div>
      ))}
    </div>
  )
}
