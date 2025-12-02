export default function StudyPackLoading() {
  return (
    <div className="min-h-screen bg-[#F8FAFB] relative">
      {/* Subtle paper texture */}
      <div className="absolute inset-0 opacity-[0.015] pointer-events-none" style={{
        backgroundImage: 'url("data:image/svg+xml,%3Csvg width="100" height="100" xmlns="http://www.w3.org/2000/svg"%3E%3Cfilter id="noise"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" /%3E%3C/filter%3E%3Crect width="100" height="100" filter="url(%23noise)" opacity="0.4"/%3E%3C/svg%3E")'
      }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        {/* Back Button Skeleton */}
        <div className="mb-6 flex items-center justify-between">
          <div className="h-6 w-32 bg-[#E2E8F0] rounded-lg animate-pulse" />
          <div className="h-10 w-24 bg-[#E2E8F0] rounded-lg animate-pulse" />
        </div>

        {/* Header Card Skeleton */}
        <div className="relative mb-8">
          <div className="absolute top-[6px] left-[6px] right-[-6px] h-full bg-white/40 rounded-xl border border-[#94A3B8]/25" />
          
          <div className="relative bg-white rounded-xl p-8 shadow-[0_2px_12px_rgba(15,23,42,0.08),0_1px_3px_rgba(15,23,42,0.06)] border border-[#E2E8F0]">
            {/* Bookmark Tab */}
            <div className="absolute -top-0 right-12 w-[28px] h-[22px] bg-[#5A5FF0] rounded-b-[5px] shadow-sm">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[20px] h-[3px] bg-[#4A4FD0] rounded-t-sm" />
            </div>

            <div className="space-y-6">
              {/* Title */}
              <div className="h-10 w-3/4 bg-[#E2E8F0] rounded-lg animate-pulse" />
              
              {/* Learning Objectives */}
              <div className="space-y-2">
                <div className="h-4 w-32 bg-[#E2E8F0] rounded animate-pulse" />
                <div className="space-y-1.5">
                  <div className="h-5 w-full bg-[#E2E8F0] rounded animate-pulse" />
                  <div className="h-5 w-5/6 bg-[#E2E8F0] rounded animate-pulse" />
                  <div className="h-5 w-4/5 bg-[#E2E8F0] rounded animate-pulse" />
                </div>
              </div>

              {/* Tags */}
              <div className="flex gap-2">
                <div className="h-8 w-20 bg-[#E2E8F0] rounded-lg animate-pulse" />
                <div className="h-8 w-24 bg-[#E2E8F0] rounded-lg animate-pulse" />
                <div className="h-8 w-20 bg-[#E2E8F0] rounded-lg animate-pulse" />
              </div>

              {/* CTA Button */}
              <div className="h-12 w-40 bg-[#5A5FF0]/20 rounded-xl animate-pulse" />

              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#E2E8F0] animate-pulse" />
                    <div className="space-y-2">
                      <div className="h-7 w-12 bg-[#E2E8F0] rounded animate-pulse" />
                      <div className="h-3 w-16 bg-[#E2E8F0] rounded animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation Skeleton */}
        <div className="mb-8 flex gap-2 p-1.5 bg-white rounded-xl border border-[#E2E8F0]">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex-1 h-10 bg-[#E2E8F0] rounded-lg animate-pulse" />
          ))}
        </div>

        {/* Content Skeleton */}
        <div className="bg-white rounded-xl p-8 border border-[#E2E8F0] space-y-4">
          <div className="h-6 w-1/3 bg-[#E2E8F0] rounded animate-pulse" />
          <div className="h-4 w-full bg-[#E2E8F0] rounded animate-pulse" />
          <div className="h-4 w-5/6 bg-[#E2E8F0] rounded animate-pulse" />
          <div className="h-4 w-4/5 bg-[#E2E8F0] rounded animate-pulse" />
        </div>
      </div>
    </div>
  )
}
