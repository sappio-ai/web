'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Orb from '../orb/Orb'
import type { OrbPose } from '../orb/orb-poses'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'

interface ProcessingStatusProps {
  materialId: string
}

interface StatusData {
  materialId: string
  status: string
  progress: number
  stage: string
  description: string
  isComplete: boolean
  studyPackId: string | null
  estimatedTimeRemaining: number | null
  error: string | null
}

const stageToOrbPose: Record<string, OrbPose> = {
  Uploading: 'upload-ready',
  Processing: 'processing-thinking',
  Analyzing: 'reading-document',
  Generating: 'generating-sparkles',
  Complete: 'success-celebrating',
  Failed: 'error-confused',
}

export default function ProcessingStatus({
  materialId,
}: ProcessingStatusProps) {
  const router = useRouter()
  const [status, setStatus] = useState<StatusData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null)

  const fetchStatus = async () => {
    try {
      const response = await fetch(`/api/materials/${materialId}/status`)

      if (!response.ok) {
        if (response.status === 404) {
          setError('Material not found')
          return
        }
        throw new Error('Failed to fetch status')
      }

      const data: StatusData = await response.json()
      setStatus(data)

      if (data.isComplete && data.studyPackId) {
        setTimeout(() => {
          router.push(`/study-packs/${data.studyPackId}`)
        }, 2000)
      }

      if (data.status === 'failed') {
        if (pollingInterval) {
          clearInterval(pollingInterval)
          setPollingInterval(null)
        }
      }
    } catch (err: any) {
      console.error('Status fetch error:', err)
      setError(err.message || 'Failed to fetch status')
    }
  }

  useEffect(() => {
    fetchStatus()
    const interval = setInterval(fetchStatus, 2000)
    setPollingInterval(interval)
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [materialId])

  const orbPose = status ? (stageToOrbPose[status.stage] || 'processing-thinking') : 'processing-thinking'

  return (
    <div className="min-h-screen bg-[#0A0F1A] relative overflow-hidden">
      {/* Animated Background Gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#a8d5d5]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#f5e6d3]/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-[#a8d5d5]/5 to-[#f5e6d3]/5 rounded-full blur-3xl" />
      </div>

      <div className="relative flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-2xl animate-in fade-in duration-700">
          {/* Glow effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-[#a8d5d5] via-[#8bc5c5] to-[#f5e6d3] rounded-3xl blur-2xl opacity-20" />
          
          {/* Main Card */}
          <div className="relative bg-gradient-to-br from-white/[0.12] to-white/[0.05] backdrop-blur-2xl rounded-2xl border border-white/20 shadow-2xl overflow-hidden p-12">
            {/* Decorative gradient orbs */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#a8d5d5]/10 to-transparent rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-[#f5e6d3]/10 to-transparent rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative">
              {/* Error State */}
              {error && (
                <div className="text-center">
                  <Orb pose="error-confused" size="xl" />
                  <h2 className="mt-6 text-3xl font-bold text-white">
                    Something went wrong
                  </h2>
                  <p className="mt-3 text-gray-400">{error}</p>
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="mt-8 rounded-xl bg-gradient-to-r from-[#a8d5d5] to-[#8bc5c5] px-8 py-3 font-bold text-white transition-all hover:scale-105 hover:shadow-xl hover:shadow-[#a8d5d5]/30"
                  >
                    Back to Dashboard
                  </button>
                </div>
              )}

              {/* Loading State */}
              {!error && !status && (
                <div className="text-center">
                  <Orb pose="processing-thinking" size="xl" animated />
                  <p className="mt-6 text-gray-400 flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading...
                  </p>
                </div>
              )}

              {/* Processing State */}
              {!error && status && (
                <div>
                  {/* Orb */}
                  <div className="flex justify-center">
                    <Orb
                      pose={orbPose}
                      size="xl"
                      animated={!status.isComplete && status.status !== 'failed'}
                    />
                  </div>

                  {/* Stage and Description */}
                  <div className="mt-8 text-center">
                    <h2 className="text-3xl font-bold text-white">
                      {status.stage}
                    </h2>
                    <p className="mt-3 text-lg text-gray-400">{status.description}</p>
                  </div>

                  {/* Progress Bar */}
                  {!status.isComplete && status.status !== 'failed' && (
                    <div className="mt-10">
                      <div className="flex items-center justify-between text-sm text-gray-400 mb-3">
                        <span className="font-medium">{status.progress}%</span>
                        {status.estimatedTimeRemaining && (
                          <span>~{status.estimatedTimeRemaining}s remaining</span>
                        )}
                      </div>
                      <div className="h-3 w-full overflow-hidden rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#a8d5d5] to-[#8bc5c5] transition-all duration-500 shadow-lg shadow-[#a8d5d5]/50"
                          style={{ width: `${status.progress}%` }}
                          role="progressbar"
                          aria-valuenow={status.progress}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-label="Processing progress"
                        />
                      </div>
                    </div>
                  )}

                  {/* Stage Indicators */}
                  {!status.isComplete && status.status !== 'failed' && (
                    <div className="mt-12 grid grid-cols-4 gap-4">
                      {['Uploading', 'Processing', 'Analyzing', 'Generating'].map(
                        (stage, index) => {
                          const stageProgress = (index + 1) * 25
                          const isActive = status.progress >= stageProgress - 25
                          const isComplete = status.progress > stageProgress

                          return (
                            <div key={stage} className="flex flex-col items-center gap-3">
                              <div
                                className={`flex h-12 w-12 items-center justify-center rounded-xl border-2 transition-all duration-300 ${
                                  isComplete
                                    ? 'border-[#a8d5d5] bg-gradient-to-br from-[#a8d5d5] to-[#8bc5c5] text-white shadow-lg shadow-[#a8d5d5]/30'
                                    : isActive
                                      ? 'border-[#a8d5d5] bg-white/10 text-[#a8d5d5] backdrop-blur-sm'
                                      : 'border-white/20 bg-white/5 text-gray-500 backdrop-blur-sm'
                                }`}
                              >
                                {isComplete ? (
                                  <CheckCircle className="w-6 h-6" />
                                ) : (
                                  <span className="text-sm font-bold">{index + 1}</span>
                                )}
                              </div>
                              <span
                                className={`text-xs font-medium transition-colors ${
                                  isActive ? 'text-white' : 'text-gray-500'
                                }`}
                              >
                                {stage}
                              </span>
                            </div>
                          )
                        }
                      )}
                    </div>
                  )}

                  {/* Error State */}
                  {status.status === 'failed' && status.error && (
                    <div className="mt-8 rounded-xl bg-red-500/10 border border-red-500/20 p-6 backdrop-blur-sm">
                      <div className="flex gap-3">
                        <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-red-300">Processing Failed</p>
                          <p className="text-sm text-red-400 mt-1">{status.error}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Success State */}
                  {status.isComplete && (
                    <div className="mt-8 text-center">
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500/10 border border-green-500/20 backdrop-blur-sm">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                        <p className="text-sm text-green-300 font-medium">
                          Redirecting to your study pack...
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  {status.status === 'failed' && (
                    <div className="mt-8 flex justify-center gap-4">
                      <button
                        onClick={() => router.push('/dashboard')}
                        className="rounded-xl bg-white/10 border border-white/20 px-6 py-3 text-gray-300 hover:bg-white/20 transition-all backdrop-blur-sm"
                      >
                        Back to Dashboard
                      </button>
                      <button
                        onClick={() => window.location.reload()}
                        className="rounded-xl bg-gradient-to-r from-[#a8d5d5] to-[#8bc5c5] px-6 py-3 font-bold text-white transition-all hover:scale-105 hover:shadow-xl hover:shadow-[#a8d5d5]/30"
                      >
                        Try Again
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
