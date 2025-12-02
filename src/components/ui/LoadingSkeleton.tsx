'use client'

interface LoadingSkeletonProps {
  className?: string
  variant?: 'card' | 'text' | 'circle' | 'button'
}

export default function LoadingSkeleton({
  className = '',
  variant = 'card',
}: LoadingSkeletonProps) {
  const baseClasses = 'animate-pulse bg-[#E2E8F0]'

  const variantClasses = {
    card: 'rounded-2xl h-48',
    text: 'rounded h-4',
    circle: 'rounded-full',
    button: 'rounded-xl h-12',
  }

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`} />
  )
}

// Skeleton for study pack page
export function StudyPackSkeleton() {
  return (
    <div className="min-h-screen bg-[#0A0F1A] relative overflow-hidden">
      {/* Animated Background Gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#a8d5d5]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#f5e6d3]/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Skeleton */}
        <div className="mb-8">
          <LoadingSkeleton className="h-8 w-64 mb-4" variant="text" />
          <LoadingSkeleton className="h-4 w-96" variant="text" />
        </div>

        {/* Tab Navigation Skeleton */}
        <div className="flex gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <LoadingSkeleton key={i} className="h-10 w-24" variant="button" />
          ))}
        </div>

        {/* Content Skeleton */}
        <div className="space-y-6">
          <LoadingSkeleton variant="card" />
          <LoadingSkeleton variant="card" />
          <LoadingSkeleton variant="card" />
        </div>
      </div>
    </div>
  )
}

// Skeleton for flashcard session
export function FlashcardSessionSkeleton() {
  return (
    <div className="flex flex-col items-center max-w-4xl mx-auto">
      <LoadingSkeleton className="w-32 h-32 mb-6" variant="circle" />
      <LoadingSkeleton className="h-6 w-32 mb-6" variant="text" />
      <LoadingSkeleton className="w-full max-w-2xl h-96 mb-6" variant="card" />
      <div className="flex gap-3 w-full max-w-2xl">
        {[1, 2, 3, 4].map((i) => (
          <LoadingSkeleton key={i} className="flex-1" variant="button" />
        ))}
      </div>
    </div>
  )
}

// Skeleton for quiz
export function QuizSkeleton() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <LoadingSkeleton className="h-6 w-48" variant="text" />
        <LoadingSkeleton className="h-8 w-24" variant="text" />
      </div>
      <LoadingSkeleton className="w-full h-96 mb-6" variant="card" />
      <LoadingSkeleton className="w-full h-12" variant="button" />
    </div>
  )
}

// Skeleton for progress chart
export function ProgressChartSkeleton() {
  return (
    <div className="relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-br from-[#a8d5d5]/10 to-[#f5e6d3]/10 rounded-3xl blur-xl opacity-50" />
      <div className="relative bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl p-8">
        <LoadingSkeleton className="h-6 w-48 mb-6" variant="text" />
        <LoadingSkeleton className="h-8 w-full mb-4" variant="text" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i}>
              <LoadingSkeleton className="h-4 w-16 mb-2" variant="text" />
              <LoadingSkeleton className="h-3 w-24" variant="text" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
