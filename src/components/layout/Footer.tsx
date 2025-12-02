import Link from 'next/link'
import Image from 'next/image'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative bg-white border-t border-[#E2E8F0] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="col-span-1">
            <div className="flex items-center gap-3 mb-4">
              {/* Logo */}
              <div className="relative w-11 h-11 flex items-center justify-center">
                <Image
                  src="/logo.svg"
                  alt="Sappio"
                  width={44}
                  height={44}
                  className="object-contain opacity-90"
                />
              </div>
              <span className="text-[18px] font-extrabold text-[#1A1D2E] tracking-[-0.02em]" style={{ fontFamily: 'var(--font-geist-sans)' }}>
                Sappio
              </span>
            </div>
            <p className="text-[14px] text-[#64748B] leading-relaxed">
              Your AI study companion. Upload once, learn everything.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-[11px] font-semibold text-[#1A1D2E] uppercase tracking-[0.1em] mb-4">Product</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/features" className="text-[14px] text-[#4A5568] hover:text-[#5A5FF0] transition-colors focus:outline-none focus:ring-2 focus:ring-[#5A5FF0]/40 rounded">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-[14px] text-[#4A5568] hover:text-[#5A5FF0] transition-colors focus:outline-none focus:ring-2 focus:ring-[#5A5FF0]/40 rounded">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/roadmap" className="text-[14px] text-[#4A5568] hover:text-[#5A5FF0] transition-colors focus:outline-none focus:ring-2 focus:ring-[#5A5FF0]/40 rounded">
                  Roadmap
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-[11px] font-semibold text-[#1A1D2E] uppercase tracking-[0.1em] mb-4">Company</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/about" className="text-[14px] text-[#4A5568] hover:text-[#5A5FF0] transition-colors focus:outline-none focus:ring-2 focus:ring-[#5A5FF0]/40 rounded">
                  About
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-[14px] text-[#4A5568] hover:text-[#5A5FF0] transition-colors focus:outline-none focus:ring-2 focus:ring-[#5A5FF0]/40 rounded">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-[14px] text-[#4A5568] hover:text-[#5A5FF0] transition-colors focus:outline-none focus:ring-2 focus:ring-[#5A5FF0]/40 rounded">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-[11px] font-semibold text-[#1A1D2E] uppercase tracking-[0.1em] mb-4">Legal</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/privacy" className="text-[14px] text-[#4A5568] hover:text-[#5A5FF0] transition-colors focus:outline-none focus:ring-2 focus:ring-[#5A5FF0]/40 rounded">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-[14px] text-[#4A5568] hover:text-[#5A5FF0] transition-colors focus:outline-none focus:ring-2 focus:ring-[#5A5FF0]/40 rounded">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-[14px] text-[#4A5568] hover:text-[#5A5FF0] transition-colors focus:outline-none focus:ring-2 focus:ring-[#5A5FF0]/40 rounded">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-[#E2E8F0] flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-[13px] text-[#64748B]">
            © {currentYear} Sappio. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-[12px] text-[#64748B]">
            <span className="flex items-center gap-1.5">
              <svg className="w-3 h-3 text-[#10B981]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              Secure
            </span>
            <span className="text-[#CBD5E1]">•</span>
            <span>GDPR Compliant</span>
            <span className="text-[#CBD5E1]">•</span>
            <span>Encrypted</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
