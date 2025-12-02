'use client'

import { useState, useRef, useEffect } from 'react'
import { MoreVertical, BookOpen, HelpCircle, Map, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { AnalyticsService } from '@/lib/services/AnalyticsService'

interface QuickActionsMenuProps {
  packId: string
  packTitle: string
  hasDueCards: boolean
  onDelete: () => void
}

export default function QuickActionsMenu({
  packId,
  packTitle,
  hasDueCards,
  onDelete,
}: QuickActionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleFlashcards = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    AnalyticsService.trackQuickActionUsed('review_flashcards', packId)
    router.push(`/study-packs/${packId}?tab=flashcards`)
    setIsOpen(false)
  }

  const handleQuiz = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    AnalyticsService.trackQuickActionUsed('take_quiz', packId)
    router.push(`/study-packs/${packId}?tab=quiz`)
    setIsOpen(false)
  }

  const handleMindMap = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    AnalyticsService.trackQuickActionUsed('view_mindmap', packId)
    router.push(`/study-packs/${packId}?tab=mindmap`)
    setIsOpen(false)
  }

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    AnalyticsService.trackQuickActionUsed('delete', packId)
    setShowDeleteConfirm(true)
    setIsOpen(false)
  }

  const handleConfirmDelete = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setShowDeleteConfirm(false)
    onDelete()
  }

  const handleCancelDelete = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setShowDeleteConfirm(false)
  }

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        {/* Three-dot menu button */}
        <button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setIsOpen(!isOpen)
          }}
          className="p-2 rounded-lg hover:bg-white/10 transition-all duration-200"
          aria-label="Pack actions"
          aria-expanded={isOpen}
        >
          <MoreVertical className="w-5 h-5 text-gray-400 hover:text-white transition-colors" />
        </button>

        {/* Dropdown Menu with Framer Motion animations */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="absolute top-full right-0 mt-2 w-52 z-[100]"
            >
              <div className="relative">
                {/* Glow effect */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.6 }}
                  exit={{ opacity: 0 }}
                  className="absolute -inset-1 bg-gradient-to-r from-[#a8d5d5]/30 to-[#8bc5c5]/30 rounded-2xl blur-lg"
                />

                {/* Menu container */}
                <div className="relative bg-[#1a1f2e] backdrop-blur-xl rounded-xl border border-white/20 shadow-2xl overflow-hidden">
                  {/* Flashcards */}
                  <motion.button
                    whileHover={{ backgroundColor: 'rgba(168, 213, 213, 0.2)' }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleFlashcards}
                    className="w-full px-4 py-3 flex items-center gap-3 transition-colors duration-200 group"
                  >
                    <BookOpen className="w-5 h-5 text-[#a8d5d5] group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-medium text-white">
                      Flashcards
                    </span>
                  </motion.button>

                  {/* Quiz */}
                  <motion.button
                    whileHover={{ backgroundColor: 'rgba(96, 165, 250, 0.2)' }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleQuiz}
                    className="w-full px-4 py-3 flex items-center gap-3 transition-colors duration-200 group"
                  >
                    <HelpCircle className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-medium text-white">
                      Quiz
                    </span>
                  </motion.button>

                  {/* Mind Map */}
                  <motion.button
                    whileHover={{ backgroundColor: 'rgba(192, 132, 252, 0.2)' }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleMindMap}
                    className="w-full px-4 py-3 flex items-center gap-3 transition-colors duration-200 group"
                  >
                    <Map className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-medium text-white">
                      Mind Map
                    </span>
                  </motion.button>

                  {/* Divider */}
                  <div className="h-px bg-white/10 mx-3 my-1" />

                  {/* Delete */}
                  <motion.button
                    whileHover={{ backgroundColor: 'rgba(239, 68, 68, 0.2)' }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleDeleteClick}
                    className="w-full px-4 py-3 flex items-center gap-3 transition-colors duration-200 group"
                  >
                    <Trash2 className="w-5 h-5 text-red-400 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-medium text-red-400">
                      Delete
                    </span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Delete Confirmation Modal with Framer Motion */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/95 backdrop-blur-sm flex items-center justify-center z-[200] p-4"
            onClick={handleCancelDelete}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
              className="relative bg-[#1a1a1a] rounded-3xl border-2 border-red-500/50 p-8 max-w-md w-full shadow-2xl"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
              }}
            >
              {/* Animated Glow effect */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                className="absolute -inset-1 bg-gradient-to-r from-red-500 to-orange-500 rounded-3xl blur-2xl"
              />

              <div className="relative">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                  className="flex items-center gap-3 mb-4"
                >
                  <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                    <Trash2 className="w-6 h-6 text-red-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">
                    Delete Pack?
                  </h3>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                >
                  <p className="text-gray-300 mb-2">
                    Are you sure you want to delete{' '}
                    <span className="font-bold text-white">&quot;{packTitle}&quot;</span>
                    ?
                  </p>
                  <p className="text-gray-400 text-sm mb-6">
                    This will permanently delete all flashcards, quizzes, and
                    mind maps. This action cannot be undone.
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex gap-3"
                >
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCancelDelete}
                    className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium rounded-xl transition-colors"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleConfirmDelete}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-red-500/30 transition-shadow"
                  >
                    Delete
                  </motion.button>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
