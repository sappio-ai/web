'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { SharedTool } from '@/lib/types/rooms'
import FlashcardsViewer from './FlashcardsViewer'
import QuizViewer from './QuizViewer'
import NotesViewer from './NotesViewer'

interface ToolModalProps {
  isOpen: boolean
  tool: SharedTool | null
  roomId: string
  userId: string
  onClose: () => void
  onComplete?: (result: any) => void
}

export default function ToolModal({
  isOpen,
  tool,
  roomId,
  userId,
  onClose,
  onComplete,
}: ToolModalProps) {
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Prevent body scroll when modal is open
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen || !tool) return null

  const handleComplete = async (result: any) => {
    if (onComplete) {
      await onComplete(result)
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-5xl max-h-[90vh] mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0] bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#5A5FF0]/10 flex items-center justify-center">
              {tool.toolType === 'quiz' && (
                <svg className="w-5 h-5 text-[#5A5FF0]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              )}
              {tool.toolType === 'flashcards' && (
                <svg className="w-5 h-5 text-[#5A5FF0]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              )}
              {tool.toolType === 'notes' && (
                <svg className="w-5 h-5 text-[#5A5FF0]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              )}
            </div>
            <div>
              <h2 className="text-[18px] font-bold text-[#1A1D2E]">{tool.toolName}</h2>
              <p className="text-[13px] text-[#64748B]">
                Shared by {tool.sharer?.fullName || 'Unknown'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:bg-[#F1F5F9] rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-[#64748B]" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#F8FAFB]">
          {tool.toolType === 'flashcards' && tool.studyPackId && (
            <FlashcardsViewer
              studyPackId={tool.studyPackId}
              roomId={roomId}
              userId={userId}
              sharedToolId={tool.id}
              onComplete={handleComplete}
            />
          )}

          {tool.toolType === 'quiz' && (
            <QuizViewer
              quizId={tool.toolId}
              studyPackId={tool.studyPackId || ''}
              roomId={roomId}
              userId={userId}
              sharedToolId={tool.id}
              onComplete={handleComplete}
            />
          )}

          {tool.toolType === 'notes' && tool.studyPackId && (
            <NotesViewer
              studyPackId={tool.studyPackId}
              roomId={roomId}
              userId={userId}
              sharedToolId={tool.id}
              onComplete={handleComplete}
            />
          )}
        </div>
      </div>
    </div>
  )
}
