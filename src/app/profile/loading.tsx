import LoadingSkeleton from '@/components/ui/LoadingSkeleton'

export default function ProfileLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0F1A] via-[#0D1420] to-[#0A0F1A]">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -right-48 w-96 h-96 bg-[#a8d5d5]/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-1/4 -left-48 w-96 h-96 bg-[#f5e6d3]/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Header */}
      <div className="relative">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <LoadingSkeleton className="h-6 w-32" variant="button" />
        </div>
      </div>

      {/* Main Content */}
      <div className="relative max-w-6xl mx-auto px-6 pb-12">
        {/* Page Title Skeleton */}
        <div className="mb-10">
          <LoadingSkeleton className="h-14 w-48 mb-3" variant="text" />
          <LoadingSkeleton className="h-6 w-80" variant="text" />
        </div>

        <div className="grid lg:grid-cols-[1fr_420px] gap-8">
          {/* Main Form Skeleton */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-br from-[#a8d5d5]/10 to-[#f5e6d3]/10 rounded-3xl blur-xl opacity-50" />
            <div className="relative bg-[#0D1420]/60 backdrop-blur-sm border border-white/10 rounded-3xl p-8 lg:p-10">
              <LoadingSkeleton className="h-8 w-64 mb-8" variant="text" />
              
              {/* Form Fields */}
              <div className="space-y-6">
                {/* Avatar */}
                <div className="flex items-center gap-6">
                  <LoadingSkeleton className="w-24 h-24 rounded-full" variant="circle" />
                  <div className="flex-1">
                    <LoadingSkeleton className="h-4 w-32 mb-2" variant="text" />
                    <LoadingSkeleton className="h-10 w-40" variant="button" />
                  </div>
                </div>

                {/* Full Name */}
                <div>
                  <LoadingSkeleton className="h-4 w-24 mb-2" variant="text" />
                  <LoadingSkeleton className="h-12 w-full" variant="button" />
                </div>

                {/* Username */}
                <div>
                  <LoadingSkeleton className="h-4 w-24 mb-2" variant="text" />
                  <LoadingSkeleton className="h-12 w-full" variant="button" />
                </div>

                {/* Email */}
                <div>
                  <LoadingSkeleton className="h-4 w-24 mb-2" variant="text" />
                  <LoadingSkeleton className="h-12 w-full" variant="button" />
                </div>

                {/* Language */}
                <div>
                  <LoadingSkeleton className="h-4 w-24 mb-2" variant="text" />
                  <LoadingSkeleton className="h-12 w-full" variant="button" />
                </div>

                {/* Save Button */}
                <LoadingSkeleton className="h-12 w-full mt-8" variant="button" />
              </div>
            </div>
          </div>

          {/* Sidebar Skeleton */}
          <div className="space-y-6">
            {/* Plan Card Skeleton */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-br from-[#a8d5d5]/20 to-[#8bc5c5]/10 rounded-3xl blur-2xl opacity-60" />
              <div className="relative bg-gradient-to-br from-[#0D1420] to-[#0A0F1A] border-2 border-[#a8d5d5]/40 rounded-3xl p-8 shadow-2xl">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <LoadingSkeleton className="h-3 w-24 mb-2" variant="text" />
                    <LoadingSkeleton className="h-8 w-32" variant="text" />
                  </div>
                  <LoadingSkeleton className="w-16 h-16 rounded-2xl" variant="circle" />
                </div>

                {/* Plan Features */}
                <div className="space-y-3 mb-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-start gap-3">
                      <LoadingSkeleton className="w-6 h-6 rounded-lg flex-shrink-0" variant="circle" />
                      <div className="flex-1">
                        <LoadingSkeleton className="h-4 w-32 mb-1" variant="text" />
                        <LoadingSkeleton className="h-3 w-24" variant="text" />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Upgrade Button */}
                <LoadingSkeleton className="h-12 w-full" variant="button" />
              </div>
            </div>

            {/* Account Info Skeleton */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-br from-white/5 to-white/0 rounded-2xl blur opacity-50" />
              <div className="relative bg-white/[0.02] border border-white/10 rounded-2xl p-6">
                <LoadingSkeleton className="h-3 w-24 mb-4" variant="text" />
                <div className="flex justify-between items-center">
                  <LoadingSkeleton className="h-4 w-24" variant="text" />
                  <LoadingSkeleton className="h-4 w-32" variant="text" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
