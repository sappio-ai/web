import { BookOpen, FileText, Brain, Sparkles } from 'lucide-react'

export default function WhatYouGet() {
  const features = [
    {
      icon: BookOpen,
      title: 'Flashcards + spaced repetition',
      desc: 'Review at optimal intervals'
    },
    {
      icon: FileText,
      title: 'Quizzes from your material',
      desc: 'Test yourself effectively'
    },
    {
      icon: Brain,
      title: 'Mind maps that connect concepts',
      desc: 'See the big picture'
    },
    {
      icon: Sparkles,
      title: 'Summaries that cut the fluff',
      desc: 'Get to the key points'
    }
  ]
  
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[var(--bg)]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-[36px] font-bold text-[var(--ink)] mb-3 tracking-[-0.01em]">
            What you get
          </h2>
        </div>
        
        <div className="grid md:grid-cols-4 gap-6">
          {features.map((feature, i) => (
            <div 
              key={i}
              className="bg-white rounded-2xl p-6 border border-[var(--border)] hover:border-[var(--primary)] transition-all duration-200"
              style={{ boxShadow: 'var(--shadow)' }}
            >
              <feature.icon className="w-8 h-8 text-[var(--primary)] mb-4" />
              <h3 className="text-base font-bold text-[var(--ink)] mb-2">{feature.title}</h3>
              <p className="text-sm text-[var(--text)]">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
