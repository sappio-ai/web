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
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#a8d5d5]/20 to-[#8bc5c5]/20 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-[#a8d5d5]" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Edit Node</h3>
            <p className="text-xs text-gray-500">Customize your mind map node</p>
          </div>
        </div>
      </div>

      {/* Title input with futuristic design */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-300">
            Title
          </label>
          <span className={`text-xs font-mono ${titleLength > 90 ? 'text-orange-400' : 'text-gray-500'}`}>
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
              w-full px-4 py-3.5 rounded-xl
              bg-[#0d1117] border-2 transition-all duration-200
              text-white placeholder-gray-600
              focus:outline-none focus:ring-2 focus:ring-[#a8d5d5]/30
              ${
                !isTitleValid
                  ? 'border-red-500/50 focus:border-red-500'
                  : 'border-[#30363d] focus:border-[#a8d5d5]'
              }
            `}
            placeholder="Enter a descriptive title..."
            maxLength={100}
            autoFocus
          />
          {/* Animated underline */}
          <div className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-[#a8d5d5] to-[#8bc5c5] transition-all duration-300 ${isTitleValid ? 'w-full' : 'w-0'}`} />
        </div>
        {!isTitleValid && (
          <p className="text-xs text-red-400 flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-red-400" />
            Title must be between 3 and 100 characters
          </p>
        )}
      </div>

      {/* Content textarea */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-300">
            Content
            <span className="text-gray-500 ml-1.5">(optional)</span>
          </label>
          <span className={`text-xs font-mono ${contentLength > 450 ? 'text-orange-400' : 'text-gray-500'}`}>
            {contentLength}/500
          </span>
        </div>
        <div className="relative">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            className={`
              w-full px-4 py-3.5 rounded-xl
              bg-[#0d1117] border-2 transition-all duration-200
              text-white placeholder-gray-600
              focus:outline-none focus:ring-2 focus:ring-[#a8d5d5]/30
              resize-none
              ${
                !isContentValid
                  ? 'border-red-500/50 focus:border-red-500'
                  : 'border-[#30363d] focus:border-[#a8d5d5]'
              }
            `}
            placeholder="Add additional details or context..."
            rows={5}
            maxLength={500}
          />
        </div>
        {!isContentValid && (
          <p className="text-xs text-red-400 flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-red-400" />
            Content must be 500 characters or less
          </p>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3.5 animate-in slide-in-from-top duration-200">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={handleSave}
          disabled={isSaving || !isTitleValid || !isContentValid}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-medium transition-all duration-200 bg-gradient-to-r from-[#a8d5d5] to-[#8bc5c5] text-white hover:shadow-lg hover:shadow-[#a8d5d5]/30 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          <Save className="w-4 h-4" />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
        <button
          onClick={handleClose}
          disabled={isSaving}
          className="px-6 py-3.5 rounded-xl font-medium transition-all duration-200 bg-[#21262d] border border-[#30363d] text-gray-400 hover:text-white hover:border-[#a8d5d5]/50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
      </div>

      {/* Keyboard shortcuts hint */}
      <div className="flex items-center justify-center gap-4 pt-2 text-xs text-gray-600">
        <span className="flex items-center gap-1.5">
          <kbd className="px-2 py-1 rounded bg-[#21262d] border border-[#30363d] font-mono">Ctrl</kbd>
          <span>+</span>
          <kbd className="px-2 py-1 rounded bg-[#21262d] border border-[#30363d] font-mono">Enter</kbd>
          <span>to save</span>
        </span>
        <span className="w-px h-3 bg-[#30363d]" />
        <span className="flex items-center gap-1.5">
          <kbd className="px-2 py-1 rounded bg-[#21262d] border border-[#30363d] font-mono">Esc</kbd>
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 10, opacity: 0 }}
            transition={{ type: 'spring', duration: 0.4, bounce: 0.3 }}
            className="relative w-full max-w-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-[#a8d5d5]/20 via-[#8bc5c5]/20 to-[#a8d5d5]/20 rounded-2xl blur-xl" />
            
            {/* Main modal */}
            <div className="relative bg-gradient-to-br from-[#161b22] to-[#0d1117] rounded-2xl border-2 border-[#30363d] shadow-2xl p-8">
              {/* Close button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center bg-[#21262d] border border-[#30363d] text-gray-500 hover:text-white hover:border-[#a8d5d5]/50 transition-all duration-200"
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
      <div className="absolute -inset-0.5 bg-gradient-to-br from-[#a8d5d5]/10 to-[#f5e6d3]/10 rounded-3xl blur-xl opacity-50" />
      <div className="relative bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl p-6">
        {editorContent}
      </div>
    </div>
  )
}
