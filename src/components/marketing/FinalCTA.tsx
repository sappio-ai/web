import Link from 'next/link'
import Image from 'next/image'

export default function FinalCTA() {
  return (
    <div className="relative">
      {/* Orbit motif background */}
      <svg 
        className="absolute inset-0 w-full h-full pointer-events-none opacity-10" 
        viewBox="0 0 800 400"
      >
        <ellipse cx="400" cy="200" rx="300" ry="150" stroke="var(--primary)" strokeWidth="2" fill="none" strokeDasharray="12 8" />
        <ellipse cx="400" cy="200" rx="200" ry="100" stroke="var(--primary)" strokeWidth="2" fill="none" strokeDasharray="8 6" />
        <circle cx="400" cy="50" r="6" fill="var(--primary)" />
        <circle cx="100" cy="200" r="6" fill="var(--primary)" />
        <circle cx="700" cy="200" r="6" fill="var(--primary)" />
        <circle cx="400" cy="350" r="6" fill="var(--primary)" />
      </svg>
      
      {/* Mascot sticker */}
      <div className="absolute top-8 right-8 w-24 h-24 hidden md:block z-10">
        <Image
          src="/brand/mascot/mascot-orbit-1x1.png"
          alt="Sappio mascot"
          width={96}
          height={96}
          className="object-contain"
        />
      </div>
      
      <div 
        className="relative bg-white rounded-3xl p-16 border border-[var(--border)] text-center"
        style={{ boxShadow: 'var(--shadow-lg)' }}
      >
        <div className="max-w-2xl mx-auto">
          <h2 className="text-[48px] font-bold text-[var(--ink)] mb-4 tracking-[-0.01em]">
            Ready to transform your studying?
          </h2>
          <p className="text-lg text-[var(--text)] mb-8">
            Join the waitlist and be the first to know when we launch
          </p>
          
          <Link
            href="/waitlist"
            className="inline-block px-10 py-5 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-lg font-semibold rounded-xl transition-all duration-150 shadow-lg hover:shadow-xl active:scale-[0.98] relative overflow-hidden group"
          >
            <span className="relative z-10">Join the waitlist →</span>
            <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
          
          <p className="text-sm text-[var(--text)] mt-6">
            No spam. One email when you&apos;re in.
          </p>
        </div>
      </div>
    </div>
  )
}
