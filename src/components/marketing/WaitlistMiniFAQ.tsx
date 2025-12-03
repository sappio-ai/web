import { HelpCircle } from 'lucide-react'

export default function WaitlistMiniFAQ() {
  const faqs = [
    {
      q: 'When will I get access?',
      a: 'We roll out invites in small batches. You\'ll get an email when it\'s your turn.'
    },
    {
      q: 'Is my data private?',
      a: 'Your uploads are private. We don\'t share or sell your study materials.'
    },
    {
      q: 'What files can I upload?',
      a: 'PDF, DOCX, images, and URLs.'
    },
    {
      q: 'Is there a free plan?',
      a: 'Yes, you can start free. Paid plans unlock higher limits.'
    }
  ]
  
  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Left: What happens next */}
          <div>
            <h3 className="text-2xl font-bold text-[var(--ink)] mb-6">What happens after I join?</h3>
            <div className="space-y-4">
              {[
                { num: 1, text: 'Confirm email' },
                { num: 2, text: 'Get early access invite' },
                { num: 3, text: 'Upload your first material' }
              ].map((step) => (
                <div key={step.num} className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-[var(--primary)] text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {step.num}
                  </div>
                  <p className="text-base text-[var(--ink)]">{step.text}</p>
                </div>
              ))}
            </div>
          </div>
          
          {/* Right: Mini FAQ */}
          <div>
            <h3 className="text-2xl font-bold text-[var(--ink)] mb-6">Quick answers</h3>
            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <details 
                  key={i}
                  className="group bg-[var(--bg)] rounded-xl border border-[var(--border)] overflow-hidden"
                >
                  <summary className="px-4 py-3 cursor-pointer list-none flex items-center gap-3 text-sm font-semibold text-[var(--ink)] hover:bg-white transition-colors">
                    <HelpCircle className="w-4 h-4 text-[var(--primary)] flex-shrink-0" />
                    <span className="flex-1">{faq.q}</span>
                    <span className="text-[var(--primary)] group-open:rotate-180 transition-transform text-xs">▼</span>
                  </summary>
                  <div className="px-4 pb-3 pl-11 text-sm text-[var(--text)]">
                    {faq.a}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
