'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import UploadZone from './UploadZone'
import Orb from '../orb/Orb'
import { PaywallModal } from '../paywall/PaywallModal'
import { QuotaExhaustedPaywall } from '../paywall/QuotaExhaustedPaywall'
import { isValidUrl } from '@/lib/utils/files'
import { X, Upload, Link2, FileText } from 'lucide-react'
import { AnalyticsService } from '@/lib/services/AnalyticsService'
import type { UsageStats } from '@/lib/types/usage'

interface CreatePackModalProps {
  isOpen: boolean
  onClose: () => void
}

type Tab = 'upload' | 'url'

export default function CreatePackModal({
  isOpen,
  onClose,
}: CreatePackModalProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>('upload')
  const [url, setUrl] = useState('')
  const [pastedText, setPastedText] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [usageWarning, setUsageWarning] = useState<string | null>(null)
  const [showPaywall, setShowPaywall] = useState(false)
  const [paywallUsage, setPaywallUsage] = useState<UsageStats | undefined>()
  const [showPasteText, setShowPasteText] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)

  if (!isOpen) return null

  const handleFileSelect = (file: File) => {
    setUploadedFile(file)
    setError(null)
  }

  const handleFileUpload = async () => {
    if (!uploadedFile) return
    
    setIsUploading(true)
    setError(null)
    setUsageWarning(null)

    try {
      const formData = new FormData()
      formData.append('file', uploadedFile)

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

      AnalyticsService.trackPackCreated('upload')
      router.push(`/materials/${data.material.id}/status`)
      onClose()
    } catch (err: any) {
      setError(err.message || 'Upload failed. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveFile = () => {
    setUploadedFile(null)
    setError(null)
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

      AnalyticsService.trackPackCreated('url')
      router.push(`/materials/${data.material.id}/status`)
      onClose()
    } catch (err: any) {
      setError(err.message || 'Submission failed. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUploading(true)
    setError(null)
    setUsageWarning(null)

    if (!pastedText.trim()) {
      setError('Please paste some text')
      setIsUploading(false)
      return
    }

    if (pastedText.trim().length < 50) {
      setError('Text is too short. Please provide at least 50 characters.')
      setIsUploading(false)
      return
    }

    try {
      const response = await fetch('/api/materials/text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: pastedText }),
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

      AnalyticsService.trackPackCreated('text')
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
    setPastedText('')
    setUploadedFile(null)
    setShowPasteText(false)
  }

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText()
      setPastedText(text)
    } catch (err) {
      // Clipboard access denied or not available
      console.error('Failed to read clipboard:', err)
    }
  }

  const getButtonText = () => {
    if (isUploading) return 'Processing...'
    
    if (activeTab === 'upload') {
      if (uploadedFile) return 'Create Study Pack'
      if (pastedText.trim().length >= 50) return 'Create Study Pack'
      return 'Add a file or paste 50+ chars'
    }
    
    if (activeTab === 'url') {
      if (url.trim()) return 'Create Study Pack'
      return 'Enter a URL to continue'
    }
    
    return 'Create Study Pack'
  }

  const isButtonDisabled = () => {
    if (isUploading) return true
    
    if (activeTab === 'upload') {
      return !uploadedFile && pastedText.trim().length < 50
    }
    
    if (activeTab === 'url') {
      return !url.trim()
    }
    
    return false
  }

  return (
    <>
      <QuotaExhaustedPaywall
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        usage={paywallUsage}
        currentPlan="free"
      />

      <div
        className="fixed inset-0 z-50 flex items-start justify-center pt-20 pb-20 px-4 backdrop-blur-sm bg-[#0F172A]/40 overflow-y-auto"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div
          className="relative w-full max-w-2xl animate-in fade-in zoom-in duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Paper stack layers */}
          <div className="absolute top-[6px] left-[6px] right-[-6px] h-full bg-white/40 rounded-2xl border border-[#94A3B8]/25" />

          {/* Modal content - Paper card */}
          <div className="relative bg-white rounded-2xl shadow-[0_8px_32px_rgba(15,23,42,0.12),0_2px_8px_rgba(15,23,42,0.08)] border border-[#CBD5E1]">
            {/* Bookmark Tab */}
            <div className="absolute -top-0 right-12 w-[32px] h-[26px] bg-[#5A5FF0] rounded-b-[5px] shadow-sm">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[22px] h-[3px] bg-[#4A4FD0] rounded-t-sm" />
            </div>

            <div className="relative p-8">
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute right-6 top-6 p-2 rounded-lg bg-[#F8FAFB] hover:bg-[#F1F5F9] text-[#64748B] hover:text-[#1A1D2E] transition-all border border-[#E2E8F0]"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Header */}
              <div className="mb-8">
                <h2 id="modal-title" className="text-[28px] font-bold text-[#1A1D2E] mb-2 tracking-[-0.02em]" style={{ fontFamily: 'var(--font-geist-sans)' }}>
                  Create Study Pack
                </h2>
                <p className="text-[15px] text-[#64748B] mb-4">
                  Upload your materials and get everything you need in under 60 seconds
                </p>
                
                {/* What will be generated */}
                <div className="flex items-start gap-2.5">
                  <span className="text-[13px] font-semibold text-[#64748B] pt-1">You&apos;ll get:</span>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-1 rounded-md bg-[#5A5FF0]/10 border border-[#5A5FF0]/20 text-[12px] font-semibold text-[#5A5FF0] flex items-center gap-1.5">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Notes
                    </span>
                    <span className="px-2.5 py-1 rounded-md bg-[#5A5FF0]/10 border border-[#5A5FF0]/20 text-[12px] font-semibold text-[#5A5FF0] flex items-center gap-1.5">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Flashcards
                    </span>
                    <span className="px-2.5 py-1 rounded-md bg-[#5A5FF0]/10 border border-[#5A5FF0]/20 text-[12px] font-semibold text-[#5A5FF0] flex items-center gap-1.5">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Quiz
                    </span>
                    <span className="px-2.5 py-1 rounded-md bg-[#5A5FF0]/10 border border-[#5A5FF0]/20 text-[12px] font-semibold text-[#5A5FF0] flex items-center gap-1.5">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Mind Map
                    </span>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="mb-6 flex gap-2 p-1.5 bg-[#F8FAFB] rounded-xl border border-[#E2E8F0]">
                <button
                  onClick={() => handleTabChange('upload')}
                  className={`flex-1 px-4 py-2.5 rounded-lg font-semibold text-[14px] transition-all flex items-center justify-center gap-2 ${
                    activeTab === 'upload'
                      ? 'bg-white text-[#5A5FF0] shadow-sm border border-[#E2E8F0]'
                      : 'text-[#64748B] hover:text-[#1A1D2E] hover:bg-white/50'
                  }`}
                  role="tab"
                  aria-selected={activeTab === 'upload'}
                >
                  <Upload className="w-4 h-4" />
                  Upload
                </button>
                <button
                  onClick={() => handleTabChange('url')}
                  className={`flex-1 px-4 py-2.5 rounded-lg font-semibold text-[14px] transition-all flex items-center justify-center gap-2 ${
                    activeTab === 'url'
                      ? 'bg-white text-[#5A5FF0] shadow-sm border border-[#E2E8F0]'
                      : 'text-[#64748B] hover:text-[#1A1D2E] hover:bg-white/50'
                  }`}
                  role="tab"
                  aria-selected={activeTab === 'url'}
                >
                  <Link2 className="w-4 h-4" />
                  URL
                </button>
              </div>

              {/* Content */}
              <div className="min-h-[280px]">
                {activeTab === 'upload' && (
                  <div className="space-y-4">
                    {!uploadedFile ? (
                      <UploadZone onFileSelect={handleFileSelect} disabled={isUploading} />
                    ) : (
                      /* File Preview */
                      <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFB] p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="w-10 h-10 rounded-lg bg-[#5A5FF0]/10 flex items-center justify-center flex-shrink-0">
                              <FileText className="w-5 h-5 text-[#5A5FF0]" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[14px] font-semibold text-[#1A1D2E] truncate">
                                {uploadedFile.name}
                              </p>
                              <p className="text-[12px] text-[#94A3B8] mt-0.5">
                                {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={handleRemoveFile}
                            disabled={isUploading}
                            className="ml-3 p-2 rounded-lg hover:bg-[#FEF2F2] text-[#64748B] hover:text-[#DC2626] transition-colors disabled:opacity-50"
                            aria-label="Remove file"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {/* Collapsible Paste Text Section */}
                    {!uploadedFile && (
                      <div className="space-y-3">
                        <button
                          onClick={() => setShowPasteText(!showPasteText)}
                          className="w-full flex items-center justify-between px-4 py-3 rounded-lg bg-[#F8FAFB] hover:bg-[#F1F5F9] border border-[#E2E8F0] transition-colors text-left"
                        >
                          <span className="text-[14px] font-semibold text-[#64748B]">
                            No file? Paste text instead
                          </span>
                          <svg
                            className={`w-4 h-4 text-[#64748B] transition-transform ${showPasteText ? 'rotate-180' : ''}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2.5}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>

                        {showPasteText && (
                          <div className="space-y-3 animate-in slide-in-from-top duration-200">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <label
                                  htmlFor="paste-text"
                                  className="flex items-center gap-2 text-[14px] font-semibold text-[#1A1D2E]"
                                >
                                  <FileText className="w-4 h-4 text-[#5A5FF0]" />
                                  Paste Text
                                </label>
                                <button
                                  type="button"
                                  onClick={handlePasteFromClipboard}
                                  className="text-[13px] font-semibold text-[#5A5FF0] hover:text-[#4A4FD0] transition-colors"
                                >
                                  Paste from clipboard
                                </button>
                              </div>
                              <textarea
                                id="paste-text"
                                value={pastedText}
                                onChange={(e) => setPastedText(e.target.value)}
                                placeholder="Paste your notes, lecture content, or study material here..."
                                className="w-full h-32 rounded-xl bg-[#F8FAFB] border border-[#CBD5E1] px-4 py-3 text-[#1A1D2E] text-[14px] placeholder-[#94A3B8] focus:border-[#5A5FF0] focus:outline-none focus:ring-2 focus:ring-[#5A5FF0]/20 transition-all resize-none"
                                disabled={isUploading}
                              />
                              <div className="flex items-center justify-between px-4 py-2 rounded-lg bg-white border border-[#E2E8F0]">
                                <p className="text-[12px] text-[#64748B] font-medium">
                                  Minimum 50 characters
                                </p>
                                <p className={`text-[12px] font-semibold ${pastedText.length >= 50 ? 'text-[#10B981]' : 'text-[#94A3B8]'}`}>
                                  {pastedText.length} / 50
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Primary CTA */}
                    <button
                      onClick={uploadedFile ? handleFileUpload : handleTextSubmit}
                      disabled={isButtonDisabled()}
                      className="w-full rounded-xl bg-[#5A5FF0] hover:bg-[#4A4FD0] px-6 py-3.5 font-semibold text-[15px] text-white transition-all hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:shadow-none disabled:hover:bg-[#5A5FF0] focus:outline-none focus:ring-2 focus:ring-[#5A5FF0]/40 focus:ring-offset-2"
                    >
                      {getButtonText()}
                    </button>
                  </div>
                )}

                {activeTab === 'url' && (
                  <form onSubmit={handleUrlSubmit} className="space-y-6">
                    <div className="flex flex-col items-center gap-6">
                      <Orb
                        pose={error ? 'error-confused' : 'neutral'}
                        size="lg"
                      />

                      <div className="w-full space-y-2">
                        <label
                          htmlFor="url-input"
                          className="flex items-center gap-2 text-[14px] font-semibold text-[#1A1D2E]"
                        >
                          <Link2 className="w-4 h-4 text-[#5A5FF0]" />
                          Website URL
                        </label>
                        <input
                          id="url-input"
                          type="url"
                          value={url}
                          onChange={(e) => setUrl(e.target.value)}
                          placeholder="https://example.com/article"
                          className="w-full rounded-xl bg-[#F8FAFB] border border-[#CBD5E1] px-4 py-3 text-[#1A1D2E] text-[14px] placeholder-[#94A3B8] focus:border-[#5A5FF0] focus:outline-none focus:ring-2 focus:ring-[#5A5FF0]/20 transition-all"
                          disabled={isUploading}
                          required
                        />
                        <p className="text-[12px] text-[#94A3B8] px-1">
                          We&apos;ll extract the main content from articles, blog posts, or documentation
                        </p>
                      </div>

                      <button
                        type="submit"
                        disabled={isButtonDisabled()}
                        className="w-full rounded-xl bg-[#5A5FF0] hover:bg-[#4A4FD0] px-6 py-3.5 font-semibold text-[15px] text-white transition-all hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:shadow-none disabled:hover:bg-[#5A5FF0] focus:outline-none focus:ring-2 focus:ring-[#5A5FF0]/40 focus:ring-offset-2"
                      >
                        {getButtonText()}
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Error message */}
              {error && (
                <div className="mt-6 rounded-xl bg-[#FEF2F2] border border-[#FCA5A5] p-4">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-[#DC2626]"
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
                      <p className="text-[14px] font-medium text-[#DC2626]">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Usage warning */}
              {usageWarning && !error && (
                <div className="mt-6 rounded-xl bg-[#FFFBEB] border border-[#FCD34D] p-4">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-[#F59E0B]"
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
                      <p className="text-[14px] font-medium text-[#D97706]">
                        {usageWarning}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Loading state */}
              {isUploading && (
                <div className="mt-6 flex items-center justify-center gap-3 text-[14px] text-[#64748B]">
                  <svg
                    className="h-5 w-5 animate-spin text-[#5A5FF0]"
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
                  <span className="font-medium">Creating your study pack...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
