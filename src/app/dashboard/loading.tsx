import LoadingSkeleton from '@/components/ui/LoadingSkeleton'

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-[#F8FAFB] relative">
      {/* Subtle paper texture */}
      <div className="absolute inset-0 opacity-[0.015] pointer-events-none" style={{
        backgroundImage: 'url("data:image/svg+xml,%3Csvg width="100" height="100" xmlns="http://www.w3.org/2000/svg"%3E%3Cfilter id="noise"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" /%3E%3C/filter%3E%3Crect width="100" height="100" filter="url(%23noise)" opacity="0.4"/%3E%3C/svg%3E")'
      }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        {/* Welcome Header Skeleton */}
        <div className="mb-8 animate-in fade-in duration-1000">
          <div className="flex items-center gap-4 mb-2">
            <LoadingSkeleton className="w-12 h-12 rounded-full" variant="circle" />
            <LoadingSkeleton className="h-10 w-80" variant="text" />
          </div>
          <div className="ml-[68px]">
            <LoadingSkeleton className="h-5 w-96" variant="text" />
          </div>
        </div>

        {/* Hero CTA Skeleton */}
        <div className="mb-8 relative animate-in slide-in-from-bottom duration-700">
          {/* Paper stack layers */}
          <div className="absolute top-[6px] left-[6px] right-[-6px] h-full bg-white/40 rounded-xl border border-[#94A3B8]/25" />
          
          <div className="relative bg-white rounded-xl p-8 shadow-[0_2px_12px_rgba(15,23,42,0.08),0_1px_3px_rgba(15,23,42,0.06)] border border-[#E2E8F0]">
            {/* Bookmark Tab */}
            <div className="absolute -top-0 right-12 w-[28px] h-[22px] bg-[#CBD5E1] rounded-b-[5px]">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[20px] h-[3px] bg-[#94A3B8] rounded-t-sm" />
            </div>
            
            <div className="flex items-center gap-4">
              <LoadingSkeleton className="w-14 h-14 rounded-xl" variant="circle" />
              <div className="flex-1">
                <LoadingSkeleton className="h-7 w-64 mb-2" variant="text" />
                <LoadingSkeleton className="h-5 w-96" variant="text" />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 animate-in slide-in-from-bottom duration-700 delay-100">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="relative bg-white rounded-xl p-5 shadow-[0_1px_3px_rgba(15,23,42,0.06)] border border-[#E2E8F0]">
              <div className="flex items-center gap-2.5 mb-3">
                <LoadingSkeleton className="w-8 h-8 rounded-lg" variant="circle" />
                <LoadingSkeleton className="h-3 w-16" variant="text" />
              </div>
              <LoadingSkeleton className="h-8 w-16 mb-1" variant="text" />
              <LoadingSkeleton className="h-3 w-20" variant="text" />
            </div>
          ))}
        </div>

        {/* Study Packs Section */}
        <div className="animate-in slide-in-from-bottom duration-700 delay-200">
          <div className="flex items-center justify-between mb-6">
            <LoadingSkeleton className="h-7 w-48" variant="text" />
            <LoadingSkeleton className="h-4 w-24" variant="text" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="relative animate-in slide-in-from-bottom duration-700" style={{ animationDelay: `${i * 50}ms` }}>
                {/* Backing sheet */}
                <div className="absolute top-[3px] left-0 right-0 h-full bg-white/60 rounded-xl border border-[#CBD5E1]/40" />
                
                {/* Main card */}
                <div className="relative bg-white rounded-xl p-6 shadow-[0_2px_8px_rgba(15,23,42,0.06),0_1px_2px_rgba(15,23,42,0.04)] border border-[#94A3B8]/30">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <LoadingSkeleton className="w-10 h-10 rounded-lg" variant="circle" />
                  </div>

                  {/* Title & Summary */}
                  <LoadingSkeleton className="h-5 w-full mb-2" variant="text" />
                  <LoadingSkeleton className="h-4 w-3/4 mb-4" variant="text" />

                  {/* Stats */}
                  <div className="flex items-center gap-4 pt-4 border-t border-[#E2E8F0]">
                    <LoadingSkeleton className="h-3 w-16" variant="text" />
                    <LoadingSkeleton className="h-3 w-20" variant="text" />
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-1.5">
                      <LoadingSkeleton className="h-3 w-16" variant="text" />
                      <LoadingSkeleton className="h-3 w-8" variant="text" />
                    </div>
                    <LoadingSkeleton className="h-2 w-full rounded-full" variant="text" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
