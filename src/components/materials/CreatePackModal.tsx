'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import UploadZone from './UploadZone'
import Orb from '../orb/Orb'
import { PaywallModal } from '../paywall/PaywallModal'
import { isValidUrl } from '@/lib/utils/files'
import { X, Upload, Link2, Video } from 'lucide-react'
import type { UsageStats } from '@/lib/types/usage'

interface CreatePackModalProps {
  isOpen: boolean
  onClose: () => void
}

type Tab = 'file' | 'url' | 'youtube'

export default function CreatePackModal({
  isOpen,
  onClose,
}: CreatePackModalProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>('file')
  const [url, setUrl] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [usageWarning, setUsageWarning] = useState<string | null>(null)
  const [showPaywall, setShowPaywall] = useState(false)
  const [paywallUsage, setPaywallUsage] = useState<UsageStats | undefined>()

  if (!isOpen) return null

  const handleFileUpload = async (file: File) => {
    setIsUploading(true)
    setError(null)
    setUsageWarning(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/materials/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.code === 'QUOTA_EXCEEDED') {
          setPaywallUsage(data.usage)
          setShowPaywall(true)
          setIsUploading(false)
          return
        }
        throw new Error(data.error || 'Upload failed')
      }

      if (data.usage?.isNearLimit) {
        setUsageWarning(
          `You've used ${data.usage.currentUsage} of ${data.usage.limit} packs this month.`
        )
      }

      router.push(`/materials/${data.material.id}/status`)
      onClose()
    } catch (err: any) {
      setError(err.message || 'Upload failed. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUploading(true)
    setError(null)
    setUsageWarning(null)

    if (!url.trim()) {
      setError('Please enter a URL')
      setIsUploading(false)
      return
    }

    if (!isValidUrl(url)) {
      setError('Please enter a valid URL')
      setIsUploading(false)
      return
    }

    try {
      const response = await fetch('/api/materials/url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.code === 'QUOTA_EXCEEDED') {
          setPaywallUsage(data.usage)
          setShowPaywall(true)
          setIsUploading(false)
          return
        }
        throw new Error(data.error || 'Submission failed')
      }

      if (data.usage?.isNearLimit) {
        setUsageWarning(
          `You've used ${data.usage.currentUsage} of ${data.usage.limit} packs this month.`
        )
      }

      router.push(`/materials/${data.material.id}/status`)
      onClose()
    } catch (err: any) {
      setError(err.message || 'Submission failed. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab)
    setError(null)
    setUsageWarning(null)
    setUrl('')
  }

  return (
    <>
      <PaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        usage={paywallUsage}
        trigger="upload"
      />
      
      <div
        className="fixed inset-0 z-50 flex items-start justify-center pt-20 pb-20 px-4 backdrop-blur-md bg-[#0A0F1A]/80 overflow-y-auto"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
      <div
        className="relative w-full max-w-2xl animate-in fade-in zoom-in duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-[#a8d5d5] via-[#8bc5c5] to-[#f5e6d3] rounded-3xl blur-2xl opacity-30" />
        
        {/* Modal content */}
        <div className="relative bg-gradient-to-br from-white/[0.12] to-white/[0.05] backdrop-blur-2xl rounded-2xl border border-white/20 shadow-2xl overflow-hidden">
          {/* Decorative gradient orbs */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#a8d5d5]/10 to-transparent rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-[#f5e6d3]/10 to-transparent rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative p-8">
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute right-6 top-6 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all border border-white/10 hover:border-white/20"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="mb-8">
              <h2 id="modal-title" className="text-3xl font-bold text-white mb-2">
                Create Study Pack
              </h2>
              <p className="text-gray-400">
                Upload your materials and get notes, flashcards, quiz, and mind map in under 60 seconds
              </p>
            </div>

            {/* Tabs */}
            <div className="mb-6 flex gap-2 p-1 bg-white/5 rounded-xl border border-white/10">
              <button
                onClick={() => handleTabChange('file')}
                className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'file'
                    ? 'bg-gradient-to-r from-[#a8d5d5] to-[#8bc5c5] text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
                role="tab"
                aria-selected={activeTab === 'file'}
              >
                <Upload className="w-4 h-4" />
                File Upload
              </button>
              <button
                onClick={() => handleTabChange('url')}
                className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'url'
                    ? 'bg-gradient-to-r from-[#a8d5d5] to-[#8bc5c5] text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
                role="tab"
                aria-selected={activeTab === 'url'}
              >
                <Link2 className="w-4 h-4" />
                URL
              </button>
              <button
                onClick={() => handleTabChange('youtube')}
                className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'youtube'
                    ? 'bg-gradient-to-r from-[#a8d5d5] to-[#8bc5c5] text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
                role="tab"
                aria-selected={activeTab === 'youtube'}
              >
                <Video className="w-4 h-4" />
                YouTube
              </button>
            </div>

            {/* Content */}
            <div className="min-h-[320px]">
              {activeTab === 'file' && (
                <UploadZone onFileSelect={handleFileUpload} disabled={isUploading} />
              )}

              {(activeTab === 'url' || activeTab === 'youtube') && (
                <form onSubmit={handleUrlSubmit} className="space-y-6">
                  <div className="flex flex-col items-center gap-6">
                    <Orb
                      pose={error ? 'error-confused' : 'neutral'}
                      size="lg"
                    />

                    <div className="w-full space-y-2">
                      <label
                        htmlFor="url-input"
                        className="block text-sm font-medium text-gray-300"
                      >
                        {activeTab === 'youtube' ? 'YouTube Video URL' : 'Website URL'}
                      </label>
                      <input
                        id="url-input"
                        type="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder={
                          activeTab === 'youtube'
                            ? 'https://www.youtube.com/watch?v=...'
                            : 'https://example.com/article'
                        }
                        className="w-full rounded-xl bg-black/40 border border-white/20 px-4 py-3 text-white placeholder-gray-400 focus:border-[#a8d5d5] focus:outline-none focus:ring-2 focus:ring-[#a8d5d5]/50 transition-all backdrop-blur-sm"
                        disabled={isUploading}
                        required
                      />
                      <div className="px-3 py-2 rounded-lg bg-black/30 backdrop-blur-sm border border-white/10">
                        <p className="text-xs text-gray-300">
                          {activeTab === 'youtube'
                            ? 'Paste a YouTube video URL to extract the transcript'
                            : 'Paste a URL to extract the main content'}
                        </p>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isUploading || !url.trim()}
                      className="w-full rounded-xl bg-gradient-to-r from-[#a8d5d5] to-[#8bc5c5] px-6 py-4 font-bold text-white transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-[#a8d5d5]/30 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
                    >
                      {isUploading ? 'Processing...' : 'Create Study Pack'}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Error message */}
            {error && (
              <div className="mt-6 rounded-xl bg-red-500/10 border border-red-500/20 p-4 backdrop-blur-sm">
                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-red-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-red-300">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Usage warning */}
            {usageWarning && !error && (
              <div className="mt-6 rounded-xl bg-yellow-500/10 border border-yellow-500/20 p-4 backdrop-blur-sm">
                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-yellow-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-yellow-300">
                      {usageWarning}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Loading state */}
            {isUploading && (
              <div className="mt-6 flex items-center justify-center gap-3 text-sm text-gray-400">
                <svg
                  className="h-5 w-5 animate-spin text-[#a8d5d5]"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>Creating your study pack...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    </>
  )
}
