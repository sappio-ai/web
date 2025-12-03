import Image from 'next/image'
import { BookOpen, FileText, Target, BarChart3, Upload, Brain } from 'lucide-react'
import BookmarkCorner from '@/components/ui/BookmarkNotch'

export default function FeatureModuleGrid() {
  const features = [
    { 
      icon: Brain, 
      title: 'Mind maps', 
      desc: 'Visualize concepts and connections',
      chips: ['Mind map'],
      why: 'See the big picture and how topics relate',
      featured: true
    },
    { 
      icon: BookOpen, 
      title: 'Flashcards + spaced repetition', 
      desc: 'Review at optimal intervals',
      chips: ['Flashcards'],
      why: 'Proven method for long-term retention',
      featured: true
    },
    { 
      icon: FileText, 
      title: 'Quizzes from your material', 
      desc: 'Test yourself with AI questions',
      chips: ['Quiz'],
      why: 'Active recall beats passive reading',
      featured: false
    },
    { 
      icon: FileText, 
      title: 'Clean summaries', 
      desc: 'Key points without the fluff',
      chips: ['Summary'],
      why: 'Quick review before exams',
      featured: false
    },
    { 
      icon: Target, 
      title: 'Practice mode', 
      desc: 'Focus on what you need most',
      chips: ['Flashcards', 'Quiz'],
      why: 'Adaptive learning targets weak spots',
      featured: false
    },
    { 
      icon: BarChart3, 
      title: 'Progress + streaks', 
      desc: 'Stay motivated with tracking',
      chips: [],
      why: 'Build consistent study habits',
      featured: false
    }
  ]
  
  return (
    <div className="relative">
      <div className="grid md:grid-cols-2 gap-6">
        {features.map((feature, i) => (
          <div 
            key={i}
            className={`relative bg-white rounded-2xl p-6 border border-[var(--border)] transition-all duration-200 hover:border-[var(--primary)] hover:-translate-y-0.5 ${
              feature.featured ? 'md:row-span-1' : ''
            }`}
            style={{ boxShadow: 'var(--shadow)' }}
          >
            {feature.featured && <BookmarkCorner size="sm" />}
            
            <feature.icon className="w-7 h-7 text-[var(--primary)] mb-3" />
            <h3 className="text-lg font-bold text-[var(--ink)] mb-2">{feature.title}</h3>
            <p className="text-sm text-[var(--text)] mb-3">{feature.desc}</p>
            
            {feature.chips.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {feature.chips.map((chip, j) => (
                  <span 
                    key={j}
                    className="px-2.5 py-1 bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-semibold rounded-full"
                  >
                    {chip}
                  </span>
                ))}
              </div>
            )}
            
            <p className="text-xs text-[var(--text)] italic">{feature.why}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
