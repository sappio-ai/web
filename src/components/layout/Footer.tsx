import Link from 'next/link'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative bg-[#0d1117]/60 backdrop-blur-2xl border-t border-[#a8d5d5]/10 mt-auto shadow-[0_-4px_24px_rgba(0,0,0,0.4)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-[#a8d5d5]/30 rounded-full blur-md" />
                <div className="relative w-8 h-8 rounded-full bg-gradient-to-br from-[#a8d5d5] to-[#8bc5c5] shadow-[0_4px_12px_rgba(168,213,213,0.4),inset_0_1px_0_rgba(255,255,255,0.3)]" />
              </div>
              <span className="text-lg font-bold text-white">Sappio</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Your AI study companion. Upload once, learn everything.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Product</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/features" className="text-sm text-gray-400 hover:text-[#a8d5d5] transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-sm text-gray-400 hover:text-[#a8d5d5] transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/roadmap" className="text-sm text-gray-400 hover:text-[#a8d5d5] transition-colors">
                  Roadmap
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Company</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/about" className="text-sm text-gray-400 hover:text-[#a8d5d5] transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-sm text-gray-400 hover:text-[#a8d5d5] transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-gray-400 hover:text-[#a8d5d5] transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Legal</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/privacy" className="text-sm text-gray-400 hover:text-[#a8d5d5] transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-gray-400 hover:text-[#a8d5d5] transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-sm text-gray-400 hover:text-[#a8d5d5] transition-colors">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-[#a8d5d5]/10 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">
            © {currentYear} Sappio. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1.5">
              <div className="w-1 h-1 rounded-full bg-[#a8d5d5] shadow-[0_0_4px_rgba(168,213,213,0.6)]" />
              Secure
            </span>
            <span className="text-[#a8d5d5]/30">•</span>
            <span>GDPR Compliant</span>
            <span className="text-[#a8d5d5]/30">•</span>
            <span>Encrypted</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
