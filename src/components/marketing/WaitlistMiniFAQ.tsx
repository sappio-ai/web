'use client'

import { Plus, Minus } from 'lucide-react'
import { useState } from 'react'

export default function WaitlistMiniFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const faqs = [
    {
      q: 'When will I get access?',
      a: 'We roll out invites in small batches. You&apos;ll get an email when it&apos;s your turn.'
    },
    {
      q: 'Is my data private?',
      a: 'Your uploads are private. We don&apos;t share or sell your study materials.'
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
    <div className="py-24 px-4 sm:px-6 lg:px-8 bg-[#F8FAFB]">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Left: What happens next */}
          <div>
            <h3 className="text-[32px] font-bold text-[#1A1D2E] mb-8 tracking-[-0.01em]">What happens after I join?</h3>
            <div className="space-y-5">
              {[
                { num: 1, text: 'Confirm email' },
                { num: 2, text: 'Get early access invite' },
                { num: 3, text: 'Upload your first material' }
              ].map((step) => (
                <div key={step.num} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#5A5FF0] text-white flex items-center justify-center text-sm font-bold flex-shrink-0 shadow-sm">
                    {step.num}
                  </div>
                  <p className="text-lg text-[#1A1D2E] font-medium">{step.text}</p>
                </div>
              ))}
            </div>
          </div>
          
          {/* Right: Mini FAQ with Paper Shadow */}
          <div>
            <h3 className="text-[32px] font-bold text-[#1A1D2E] mb-8 tracking-[-0.01em]">Quick answers</h3>
            <div className="space-y-4">
              {faqs.map((faq, i) => {
                const isOpen = openIndex === i
                
                return (
                  <div key={i} className="relative group">
                    {/* Paper Shadow */}
                    <div className={`absolute inset-0 bg-[#1A1D2E] rounded-xl transition-transform duration-300 ${isOpen ? 'translate-y-1.5 translate-x-1.5' : 'translate-y-1 translate-x-1 group-hover:translate-y-1.5 group-hover:translate-x-1.5'}`} />
                    
                    <div
                      onClick={() => setOpenIndex(isOpen ? null : i)}
                      className="relative bg-white rounded-xl border-2 border-[#1A1D2E] cursor-pointer overflow-hidden"
                    >
                      <div className="px-5 py-4 flex items-center gap-3">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors shrink-0 ${isOpen ? 'bg-[#5A5FF0] text-white' : 'bg-[#F8FAFB] text-[#1A1D2E]'}`}>
                          {isOpen ? <Minus className="w-4 h-4" strokeWidth={2.5} /> : <Plus className="w-4 h-4" strokeWidth={2.5} />}
                        </div>
                        
                        <div className="flex-1">
                          <p className="text-[15px] font-bold text-[#1A1D2E]">{faq.q}</p>
                          {isOpen && (
                            <p className="pt-2 text-[14px] text-[#64748B] leading-relaxed">
                              {faq.a}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
