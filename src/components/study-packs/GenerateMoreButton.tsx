'use client'

import { useState, useEffect, useCallback } from 'react'
import { Sparkles, Crown, CheckCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

type GenerationStatus = 'idle' | 'generating' | 'completed' | 'failed'

interface GenerationStatusData {
  status: GenerationStatus
  updatedAt?: string
  generated?: number
  newTotal?: number
  error?: string
}

interface GenerateMoreButtonProps {
  contentType: 'flashcards' | 'quiz' | 'mindmap'
  studyPackId: string
  currentCount: number
  maxLimit: number
  batchSize: number
  userPlan: 'free' | 'student_pro' | 'pro_plus'
  onGenerated: (newCount: number) => void
  /** External generation status from parent component */
  generationStatus?: GenerationStatusData
}

export default function GenerateMoreButton({
  contentType,
  studyPackId,
  currentCount,
  maxLimit,
  batchSize,
  userPlan,
  onGenerated,
  generationStatus: externalStatus
}: GenerateMoreButtonProps) {
  const [localGenerating, setLocalGenerating] = useState(false)
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null)
  
  // Use external status if provided, otherwise use local state
  const isGenerating = externalStatus?.status === 'generating' || localGenerating
  
  const remaining = maxLimit - currentCount
  const toGenerate = Math.min(batchSize, remaining)
  
  // Poll for status updates when generating
  const pollStatus = useCallback(async () => {
    try {
      const response = await fetch(`/api/study-packs/${studyPackId}`)
      if (!response.ok) return
      
      const data = await response.json()
      const status = data.stats?.generationStatus?.[contentType]
      
      if (status?.status === 'completed') {
        // Generation completed
        setLocalGenerating(false)
        if (pollingInterval) {
          clearInterval(pollingInterval)
          setPollingInterval(null)
        }
        
        // Get the new count
        const newCount = status.newTotal || currentCount + (status.generated || 0)
        onGenerated(newCount)
        toast.success(`Generated ${status.generated || 0} new items!`)
      } else if (status?.status === 'failed') {
        // Generation failed
        setLocalGenerating(false)
        if (pollingInterval) {
          clearInterval(pollingInterval)
          setPollingInterval(null)
        }
        toast.error(status.error || 'Generation failed. Please try again.')
      }
    } catch (error) {
      console.error('Error polling status:', error)
    }
  }, [studyPackId, contentType, currentCount, onGenerated, pollingInterval])
  
  // Start polling when generation starts
  useEffect(() => {
    if (isGenerating && !pollingInterval) {
      const interval = setInterval(pollStatus, 3000) // Poll every 3 seconds
      setPollingInterval(interval)
    }
    
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval)
      }
    }
  }, [isGenerating, pollStatus, pollingInterval])
  
  // Show success message if at limit
  if (remaining <= 0) {
    return (
      <div className="flex items-center gap-2 text-green-600">
        <CheckCircle className="w-5 h-5" />
        <span className="text-[14px]">You&apos;ve generated all {maxLimit} items for this pack</span>
      </div>
    )
  }
  
  const handleGenerate = async () => {
    setLocalGenerating(true)
    try {
      const endpoint = `/api/study-packs/${studyPackId}/${contentType}/generate-more`
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batchSize: toGenerate })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        setLocalGenerating(false)
        
        // Check if it's already generating
        if (data.status === 'generating') {
          toast.info('Generation is already in progress')
          setLocalGenerating(true) // Keep showing loading state
          return
        }
        
        switch (response.status) {
          case 403:
            toast.error('Upgrade to a paid plan to generate more content')
            break
          case 409:
            if (data.remaining === 0) {
              toast.info("You've already generated the maximum content for this pack")
            }
            break
          case 500:
            toast.error('Generation failed. Please try again.')
            break
          default:
            toast.error(data.message || 'Something went wrong')
        }
        return
      }
      
      // Generation started successfully - show toast and start polling
      toast.info(`Generating ${toGenerate} new items in the background...`)
      
    } catch (error) {
      console.error('Generation error:', error)
      setLocalGenerating(false)
      toast.error('Network error. Please check your connection.')
    }
  }
  
  const Icon = userPlan === 'student_pro' ? Sparkles : Crown
  const colorClass = userPlan === 'student_pro' 
    ? 'bg-blue-600 hover:bg-blue-700' 
    : 'bg-orange-500 hover:bg-orange-600'
  
  const contentTypeLabel = contentType === 'flashcards' 
    ? 'flashcards' 
    : contentType === 'quiz' 
    ? 'questions' 
    : 'nodes'
  
  return (
    <button
      onClick={handleGenerate}
      disabled={isGenerating}
      className={`${colorClass} text-white px-6 py-3 rounded-lg font-semibold text-[14px] transition-all shadow-sm hover:shadow-md active:scale-[0.98] flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {isGenerating ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Generating {contentTypeLabel}...</span>
        </>
      ) : (
        <>
          <Icon className="w-4 h-4" />
          <span>Generate up to +{toGenerate} {contentTypeLabel}</span>
          <span className="text-white/80 text-[12px]">({remaining} remaining)</span>
        </>
      )}
    </button>
  )
}
