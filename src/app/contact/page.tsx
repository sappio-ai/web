'use client'

import { useState } from 'react'
import { Loader2, Send, Mail, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import DotPattern from '@/components/ui/DotPattern'

export default function ContactPage() {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            const data = await response.json()
            if (!response.ok) throw new Error(data.error || 'Failed to send message')

            toast.success('Message sent! We\'ll get back to you soon.')
            setFormData({ name: '', email: '', message: '' })
        } catch (error) {
            toast.error('Something went wrong. Please try again.')
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#F8FAFB] py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute inset-0 -z-10 bg-[#F8FAFB]">
                <DotPattern className="opacity-[0.15] fill-[#1A1D2E]" width={32} height={32} />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#F8FAFB_100%)]" />
            </div>

            <div className="max-w-2xl mx-auto relative z-10">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#E2E8F0] shadow-sm mb-6">
                        <Sparkles className="w-4 h-4 text-[#5A5FF0]" />
                        <span className="text-sm font-semibold text-[#1A1D2E]">Get in Touch</span>
                    </div>

                    <h1 className="text-[40px] md:text-[48px] leading-[1.1] font-bold text-[#1A1D2E] tracking-[-0.02em] mb-4">
                        Contact Us
                    </h1>

                    <p className="text-lg text-[#334155] font-medium">
                        Have a question or feedback? We&apos;d love to hear from you.
                    </p>
                </div>

                {/* Form Card */}
                <div className="relative">
                    <div className="absolute inset-0 bg-[#1A1D2E] rounded-2xl translate-y-2 translate-x-2" />
                    <div className="relative bg-white rounded-2xl border-2 border-[#1A1D2E] p-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-[#1A1D2E] mb-2">
                                    Your Name
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border-2 border-[#E2E8F0] focus:border-[#5A5FF0] outline-none transition-colors text-[#1A1D2E] placeholder:text-[#94A3B8]"
                                    placeholder="John Doe"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-[#1A1D2E] mb-2">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border-2 border-[#E2E8F0] focus:border-[#5A5FF0] outline-none transition-colors text-[#1A1D2E] placeholder:text-[#94A3B8]"
                                    placeholder="john@example.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-[#1A1D2E] mb-2">
                                    Message
                                </label>
                                <textarea
                                    required
                                    rows={5}
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border-2 border-[#E2E8F0] focus:border-[#5A5FF0] outline-none transition-colors resize-none text-[#1A1D2E] placeholder:text-[#94A3B8]"
                                    placeholder="Tell us what's on your mind..."
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-[#5A5FF0] text-white font-bold rounded-xl hover:bg-[#4A4FD0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-5 h-5" />
                                        Send Message
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Email Alternative */}
                <div className="mt-12 text-center">
                    <p className="text-[#334155] font-medium mb-2">Or email us directly at</p>
                    <a
                        href="mailto:support@sappio.ai"
                        className="inline-flex items-center gap-2 text-[#5A5FF0] font-bold hover:underline"
                    >
                        <Mail className="w-5 h-5" />
                        support@sappio.ai
                    </a>
                </div>
            </div>
        </div>
    )
}
