import { Check } from 'lucide-react'

export default function TestimonialGrid() {
  const testimonials = [
    {
      quote: "The mind maps were the big unlock. I finally saw how the topics connect, and my revision time dropped a lot.",
      name: "Alex Chen",
      role: "CS Student",
      featured: true
    },
    {
      quote: "Sappio cut my study prep time in half. The flashcards are spot-on and the spaced repetition actually works.",
      name: "Sarah Martinez",
      role: "Med Student",
      featured: false
    },
    {
      quote: "I went from struggling with retention to acing my exams. The quiz feature is a game-changer.",
      name: "James Wilson",
      role: "Law Student",
      featured: false
    }
  ]
  
  return (
    <div className="grid md:grid-cols-3 gap-6">
      {testimonials.map((testimonial, i) => (
        <div 
          key={i}
          className={`bg-white rounded-2xl p-6 border transition-all duration-200 hover:-translate-y-1 ${
            testimonial.featured 
              ? 'border-[var(--primary)] md:scale-105' 
              : 'border-[var(--border)]'
          }`}
          style={{ boxShadow: testimonial.featured ? 'var(--shadow-lg)' : 'var(--shadow)' }}
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-5 h-5 rounded-full bg-[var(--accent)]/10 flex items-center justify-center">
              <Check className="w-3 h-3 text-[var(--accent)]" />
            </div>
            <span className="text-xs font-semibold text-[var(--accent)]">Verified student</span>
          </div>
          <p className="text-base text-[var(--ink)] leading-relaxed mb-4">
            &ldquo;{testimonial.quote}&rdquo;
          </p>
          <div>
            <p className="text-sm font-bold text-[var(--ink)]">{testimonial.name}</p>
            <p className="text-xs text-[var(--text)]">{testimonial.role}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
