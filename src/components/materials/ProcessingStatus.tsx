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
    <div className="min-h-screen bg-[#F8FAFB] relative overflow-hidden">
      {/* Subtle paper texture */}
      <div className="absolute inset-0 opacity-[0.015] pointer-events-none" style={{
        backgroundImage: 'url("data:image/svg+xml,%3Csvg width="100" height="100" xmlns="http://www.w3.org/2000/svg"%3E%3Cfilter id="noise"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" /%3E%3C/filter%3E%3Crect width="100" height="100" filter="url(%23noise)" opacity="0.4"/%3E%3C/svg%3E")'
      }} />

      <div className="relative flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-2xl animate-in fade-in duration-700">
          {/* Paper stack layers */}
          <div className="absolute top-[6px] left-[6px] right-[-6px] h-full bg-white/40 rounded-xl border border-[#94A3B8]/25" />
          
          {/* Main Card */}
          <div className="relative bg-white rounded-2xl shadow-[0_8px_32px_rgba(15,23,42,0.12),0_2px_8px_rgba(15,23,42,0.08)] border border-[#E2E8F0] overflow-hidden p-12">
            {/* Bookmark Tab */}
            <div className="absolute -top-0 right-12 w-[32px] h-[26px] bg-[#5A5FF0] rounded-b-[5px] shadow-sm">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[22px] h-[3px] bg-[#4A4FD0] rounded-t-sm" />
            </div>
            
            <div className="relative">
              {/* Error State */}
              {error && (
                <div className="text-center">
                  <Orb pose="error-confused" size="xl" />
                  <h2 className="mt-6 text-3xl font-bold text-[#1A1D2E]">
                    Something went wrong
                  </h2>
                  <p className="mt-3 text-[#64748B]">{error}</p>
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="mt-8 rounded-xl bg-[#5A5FF0] hover:bg-[#4A4FD0] px-8 py-3 font-semibold text-white transition-all hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#5A5FF0]/40 focus:ring-offset-2"
                  >
                    Back to Dashboard
                  </button>
                </div>
              )}

              {/* Loading State */}
              {!error && !status && (
                <div className="text-center">
                  <Orb pose="processing-thinking" size="xl" animated />
                  <p className="mt-6 text-[#64748B] flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-[#5A5FF0]" />
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
                    <h2 className="text-3xl font-bold text-[#1A1D2E]">
                      {status.stage}
                    </h2>
                    <p className="mt-3 text-lg text-[#64748B]">{status.description}</p>
                    {/* You can leave message */}
                    {!status.isComplete && status.status !== 'failed' && (
                      <p className="mt-4 text-sm text-[#94A3B8]">
                        Feel free to leave this page — your study pack will be ready on your dashboard when it&apos;s done.
                      </p>
                    )}
                  </div>

                  {/* Progress Bar */}
                  {!status.isComplete && status.status !== 'failed' && (
                    <div className="mt-10">
                      <div className="flex items-center justify-between text-sm text-[#64748B] mb-3">
                        <span className="font-semibold text-[#1A1D2E]">{status.progress}%</span>
                        {status.estimatedTimeRemaining && (
                          <span>~{status.estimatedTimeRemaining}s remaining</span>
                        )}
                      </div>
                      <div className="h-3 w-full overflow-hidden rounded-full bg-[#E2E8F0] border border-[#CBD5E1]">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#5A5FF0] to-[#7B7FF5] transition-all duration-500 shadow-sm"
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
                                    ? 'border-[#5A5FF0] bg-gradient-to-br from-[#5A5FF0] to-[#7B7FF5] text-white shadow-lg shadow-[#5A5FF0]/20'
                                    : isActive
                                      ? 'border-[#5A5FF0] bg-[#5A5FF0]/10 text-[#5A5FF0]'
                                      : 'border-[#E2E8F0] bg-[#F8FAFB] text-[#94A3B8]'
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
                                  isActive ? 'text-[#1A1D2E]' : 'text-[#94A3B8]'
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
                    <div className="mt-8 rounded-xl bg-[#FEF2F2] border border-[#FCA5A5] p-6">
                      <div className="flex gap-3">
                        <XCircle className="w-5 h-5 text-[#DC2626] flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-[#DC2626]">Processing Failed</p>
                          <p className="text-sm text-[#991B1B] mt-1">{status.error}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Success State */}
                  {status.isComplete && (
                    <div className="mt-8 text-center">
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#ECFDF5] border border-[#6EE7B7]">
                        <CheckCircle className="w-5 h-5 text-[#10B981]" />
                        <p className="text-sm text-[#047857] font-semibold">
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
                        className="rounded-xl bg-[#F8FAFB] border border-[#E2E8F0] px-6 py-3 text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#1A1D2E] transition-all font-semibold"
                      >
                        Back to Dashboard
                      </button>
                      <button
                        onClick={() => window.location.reload()}
                        className="rounded-xl bg-[#5A5FF0] hover:bg-[#4A4FD0] px-6 py-3 font-semibold text-white transition-all hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#5A5FF0]/40 focus:ring-offset-2"
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
