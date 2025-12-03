'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Orb from '@/components/orb/Orb'
import type { MindMapNode } from '@/lib/types/mindmap'
import { X, Save, Sparkles } from 'lucide-react'

interface NodeEditorProps {
  node: MindMapNode
  onSave: (nodeId: string, updates: { title?: string; content?: string }) => Promise<void>
  onCancel: () => void
  mode?: 'inline' | 'modal'
}

export default function NodeEditor({
  node,
  onSave,
  onCancel,
  mode = 'modal',
}: NodeEditorProps) {
  const [title, setTitle] = useState(node.title)
  const [content, setContent] = useState(node.content || '')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isClosing, setIsClosing] = useState(false)

  const titleLength = title.length
  const contentLength = content.length

  const isTitleValid = titleLength >= 3 && titleLength <= 100
  const isContentValid = contentLength <= 500

  const handleSave = async () => {
    if (!isTitleValid || !isContentValid) {
      setError('Please check the character limits')
      return
    }

    try {
      setIsSaving(true)
      setError(null)
      await onSave(node.id, { title, content: content || undefined })
    } catch (err) {
      console.error('Failed to save node:', err)
      setError(err instanceof Error ? err.message : 'Failed to save changes')
    } finally {
      setIsSaving(false)
    }
  }

  const handleClose = () => {
    onCancel()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClose()
    } else if (e.key === 'Enter' && e.ctrlKey) {
      handleSave()
    }
  }

  const editorContent = (
    <div className="space-y-5">
      {/* Header with orb */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#5A5FF0]/10 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-[#5A5FF0]" />
          </div>
          <div>
            <h3 className="text-[20px] font-bold text-[#1A1D2E]">Edit Node</h3>
            <p className="text-[13px] text-[#64748B]">Customize your mind map node</p>
          </div>
        </div>
      </div>

      {/* Title input */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-[14px] font-medium text-[#1A1D2E]">
            Title
          </label>
          <span className={`text-[12px] font-mono ${titleLength > 90 ? 'text-[#F59E0B]' : 'text-[#64748B]'}`}>
            {titleLength}/100
          </span>
        </div>
        <div className="relative">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            className={`
              w-full px-4 py-3 rounded-lg text-[15px]
              bg-[#F8FAFB] border-2 transition-all duration-200
              text-[#1A1D2E] placeholder-[#94A3B8]
              focus:outline-none focus:ring-2 focus:ring-[#5A5FF0]/20
              ${
                !isTitleValid
                  ? 'border-[#EF4444]/50 focus:border-[#EF4444]'
                  : 'border-[#CBD5E1] focus:border-[#5A5FF0]'
              }
            `}
            placeholder="Enter a descriptive title..."
            maxLength={100}
            autoFocus
          />
        </div>
        {!isTitleValid && (
          <p className="text-[12px] text-[#EF4444] flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-[#EF4444]" />
            Title must be between 3 and 100 characters
          </p>
        )}
      </div>

      {/* Content textarea */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-[14px] font-medium text-[#1A1D2E]">
            Content
            <span className="text-[#64748B] ml-1.5">(optional)</span>
          </label>
          <span className={`text-[12px] font-mono ${contentLength > 450 ? 'text-[#F59E0B]' : 'text-[#64748B]'}`}>
            {contentLength}/500
          </span>
        </div>
        <div className="relative">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            className={`
              w-full px-4 py-3 rounded-lg text-[15px]
              bg-[#F8FAFB] border-2 transition-all duration-200
              text-[#1A1D2E] placeholder-[#94A3B8]
              focus:outline-none focus:ring-2 focus:ring-[#5A5FF0]/20
              resize-none
              ${
                !isContentValid
                  ? 'border-[#EF4444]/50 focus:border-[#EF4444]'
                  : 'border-[#CBD5E1] focus:border-[#5A5FF0]'
              }
            `}
            placeholder="Add additional details or context..."
            rows={5}
            maxLength={500}
          />
        </div>
        {!isContentValid && (
          <p className="text-[12px] text-[#EF4444] flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-[#EF4444]" />
            Content must be 500 characters or less
          </p>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-[#EF4444]/5 border border-[#EF4444]/30 rounded-lg p-3.5 animate-in slide-in-from-top duration-200">
          <p className="text-[14px] text-[#EF4444]">{error}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={handleSave}
          disabled={isSaving || !isTitleValid || !isContentValid}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-[15px] transition-all duration-200 bg-[#5A5FF0] hover:bg-[#4A4FD0] text-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4" />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
        <button
          onClick={handleClose}
          disabled={isSaving}
          className="px-6 py-3 rounded-lg font-semibold text-[15px] transition-all duration-200 bg-white border border-[#CBD5E1] text-[#1A1D2E] hover:bg-[#F1F5F9] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
      </div>

      {/* Keyboard shortcuts hint */}
      <div className="flex items-center justify-center gap-4 pt-2 text-[12px] text-[#94A3B8]">
        <span className="flex items-center gap-1.5">
          <kbd className="px-2 py-1 rounded bg-[#F8FAFB] border border-[#CBD5E1] font-mono text-[11px]">Ctrl</kbd>
          <span>+</span>
          <kbd className="px-2 py-1 rounded bg-[#F8FAFB] border border-[#CBD5E1] font-mono text-[11px]">Enter</kbd>
          <span>to save</span>
        </span>
        <span className="w-px h-3 bg-[#E2E8F0]" />
        <span className="flex items-center gap-1.5">
          <kbd className="px-2 py-1 rounded bg-[#F8FAFB] border border-[#CBD5E1] font-mono text-[11px]">Esc</kbd>
          <span>to cancel</span>
        </span>
      </div>
    </div>
  )

  if (mode === 'modal') {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.95, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 10, opacity: 0 }}
            transition={{ type: 'spring', duration: 0.3, bounce: 0.2 }}
            className="relative w-full max-w-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Paper stack effect */}
            <div className="absolute top-[3px] left-0 right-0 h-full bg-white/60 rounded-xl border border-[#CBD5E1]/40" />
            
            {/* Main modal */}
            <div className="relative bg-white rounded-xl border border-[#E2E8F0] shadow-[0_8px_32px_rgba(15,23,42,0.12)] p-8">
              {/* Close button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center bg-[#F8FAFB] border border-[#CBD5E1] text-[#64748B] hover:text-[#1A1D2E] hover:border-[#5A5FF0]/50 transition-all duration-200"
              >
                <X className="w-4 h-4" />
              </button>
              
              {editorContent}
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    )
  }

  return (
    <div className="relative">
      <div className="absolute top-[3px] left-0 right-0 h-full bg-white/60 rounded-xl border border-[#CBD5E1]/40" />
      <div className="relative bg-white rounded-xl p-6 shadow-[0_2px_8px_rgba(15,23,42,0.06),0_1px_2px_rgba(15,23,42,0.04)] border border-[#E2E8F0]">
        {editorContent}
      </div>
    </div>
  )
}
