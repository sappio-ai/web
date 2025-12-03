import { HelpCircle } from 'lucide-react'

export default function FAQAccordion() {
  const faqs = [
    { 
      q: 'What file types does Sappio support?', 
      a: 'We support PDFs, Word documents, text files, and URLs. More formats coming soon.' 
    },
    { 
      q: 'How are mind maps generated?', 
      a: 'Our AI analyzes your material to identify key concepts and their relationships, then creates a visual map showing how topics connect. You can customize and expand the map as you study.' 
    },
    { 
      q: 'Is my data private?', 
      a: 'Yes. Your study materials are encrypted and never shared. We take privacy seriously and are GDPR compliant.' 
    },
    { 
      q: 'When do I get access?', 
      a: 'We\'re rolling out access to waitlist members in batches. Join now to get early access and discounted pricing.' 
    },
    { 
      q: 'Can I use it for university?', 
      a: 'Absolutely! Sappio is designed for students at all levels, from high school to graduate school.' 
    },
    { 
      q: 'Can I export flashcards?', 
      a: 'Yes, you can export your flashcards to Anki and other popular formats.' 
    }
  ]
  
  return (
    <div className="space-y-3">
      {faqs.map((faq, i) => (
        <details 
          key={i} 
          className="group bg-white rounded-xl border border-[var(--border)] overflow-hidden transition-all duration-200 hover:border-[var(--primary)]"
        >
          <summary className="px-6 py-4 cursor-pointer list-none flex items-center gap-3 font-semibold text-[var(--ink)] hover:bg-[var(--bg)] transition-colors">
            <HelpCircle className="w-5 h-5 text-[var(--primary)] flex-shrink-0" />
            <span className="flex-1">{faq.q}</span>
            <span className="text-[var(--primary)] group-open:rotate-180 transition-transform">▼</span>
          </summary>
          <div className="px-6 pb-4 pl-14 text-sm text-[var(--text)] leading-relaxed">
            {faq.a}
          </div>
        </details>
      ))}
    </div>
  )
}
