'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { CreateRoomInput, BackgroundTheme } from '@/lib/types/rooms'
import BackgroundSelector from '@/components/rooms/BackgroundSelector'

interface CreateRoomModalProps {
  isOpen: boolean
  onClose: () => void
  onCreated?: (roomId: string) => void
}

export default function CreateRoomModal({
  isOpen,
  onClose,
  onCreated,
}: CreateRoomModalProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isClosing, setIsClosing] = useState(false)
  const [mounted, setMounted] = useState(false)
  
  const [formData, setFormData] = useState<CreateRoomInput>({
    name: '',
    backgroundTheme: 'forest',
    privacy: 'private',
    pomodoroWorkMinutes: 25,
    pomodoroBreakMinutes: 5,
  })

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      setIsClosing(false)
      onClose()
    }, 300)
  }

  useEffect(() => {
    if (isOpen) {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') handleClose()
      }
      document.addEventListener('keydown', handleEscape)

      const originalOverflow = document.body.style.overflow
      const originalTransform = document.body.style.transform

      document.body.style.overflow = 'hidden'
      document.body.style.transform = 'none'

      return () => {
        document.removeEventListener('keydown', handleEscape)
        document.body.style.overflow = originalOverflow
        document.body.style.transform = originalTransform
      }
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validate room name
    if (!formData.name || formData.name.trim().length === 0) {
      setError('Room name cannot be empty')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create room')
      }

      const { room } = await response.json()
      
      if (onCreated) {
        onCreated(room.id)
      } else {
        router.push(`/rooms/${room.id}`)
      }
      
      handleClose()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  if (!mounted || (!isOpen && !isClosing)) {
    return null
  }

  const modalContent = (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[100] bg-[#1A1D2E]/60 backdrop-blur-sm transition-opacity duration-300 ${
          isClosing ? 'opacity-0' : 'opacity-100'
        }`}
        onClick={handleClose}
      />

      {/* Centered Modal with Paper Stack Effect */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: `translate(-50%, -50%)`,
          zIndex: 101,
          width: '95vw',
          maxWidth: '42rem',
          maxHeight: '90vh',
        }}
      >
        {/* Paper stack backing */}
        <div className="absolute top-[6px] left-[6px] right-[-6px] h-full bg-white/40 rounded-2xl border border-[#94A3B8]/25" />
        
        <div
          className={`relative bg-white rounded-2xl shadow-[0_8px_32px_rgba(15,23,42,0.15),0_2px_8px_rgba(15,23,42,0.08)] border-2 border-[#5A5FF0]/30 transition-all duration-300 ease-out overflow-hidden flex flex-col
            ${isClosing ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
          style={{ maxHeight: '90vh' }}
        >
          {/* Highlight accent line */}
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#5A5FF0] to-transparent" />
          
          {/* Scrollable content */}
          <div className="overflow-y-auto flex-1">
            {/* Header */}
            <div className="bg-gradient-to-br from-white to-[#F8FAFB] px-6 pt-6 pb-4 border-b border-[#E2E8F0] flex-shrink-0">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-[#1A1D2E]">Create Study Room</h2>
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-[#F1F5F9] rounded-lg transition-colors"
                  disabled={isLoading}
                  aria-label="Close"
                >
                  <svg className="w-5 h-5 text-[#64748B]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Error message */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              {/* Room name */}
              <div>
                <label htmlFor="room-name" className="block text-sm font-semibold text-gray-700 mb-2">
                  Room Name *
                </label>
                <input
                  id="room-name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Biology Study Group"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5A5FF0] focus:border-transparent transition-all text-gray-900 placeholder:text-gray-500"
                  disabled={isLoading}
                  required
                />
              </div>

              {/* Background theme */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Background Theme
                </label>
                <BackgroundSelector
                  selected={formData.backgroundTheme || 'forest'}
                  onChange={(theme: BackgroundTheme) => setFormData({ ...formData, backgroundTheme: theme })}
                />
              </div>

              {/* Privacy */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Privacy
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, privacy: 'private' })}
                    className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${
                      formData.privacy === 'private'
                        ? 'border-[#5A5FF0] bg-[#5A5FF0]/5'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    disabled={isLoading}
                  >
                    <div className={`font-semibold ${formData.privacy === 'private' ? 'text-[#5A5FF0]' : 'text-gray-900'}`}>
                      Private
                    </div>
                    <div className="text-xs text-gray-600 mt-1">Invite only</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, privacy: 'public' })}
                    className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${
                      formData.privacy === 'public'
                        ? 'border-[#5A5FF0] bg-[#5A5FF0]/5'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    disabled={isLoading}
                  >
                    <div className={`font-semibold ${formData.privacy === 'public' ? 'text-[#5A5FF0]' : 'text-gray-900'}`}>
                      Public
                    </div>
                    <div className="text-xs text-gray-600 mt-1">Anyone can join</div>
                  </button>
                </div>
              </div>

              {/* Pomodoro settings */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Pomodoro Timer Settings
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="work-minutes" className="block text-xs font-medium text-gray-700 mb-1">
                      Work Duration (minutes)
                    </label>
                    <input
                      id="work-minutes"
                      type="number"
                      min="1"
                      max="120"
                      value={formData.pomodoroWorkMinutes}
                      onChange={(e) =>
                        setFormData({ ...formData, pomodoroWorkMinutes: parseInt(e.target.value) })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5A5FF0] focus:border-transparent text-gray-900"
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <label htmlFor="break-minutes" className="block text-xs font-medium text-gray-700 mb-1">
                      Break Duration (minutes)
                    </label>
                    <input
                      id="break-minutes"
                      type="number"
                      min="1"
                      max="30"
                      value={formData.pomodoroBreakMinutes}
                      onChange={(e) =>
                        setFormData({ ...formData, pomodoroBreakMinutes: parseInt(e.target.value) })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5A5FF0] focus:border-transparent text-gray-900"
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-[#5A5FF0] hover:bg-[#4A4FD0] text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating...' : 'Create Room'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  )

  return createPortal(modalContent, document.body)
}
