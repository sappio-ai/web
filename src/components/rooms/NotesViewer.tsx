'use client'

import { useState, useEffect } from 'react'
import { BookOpen, Lightbulb, AlertTriangle, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Orb from '@/components/orb/Orb'

interface NotesData {
  overview?: string
  keyConcepts?: Array<{
    title: string
    description: string
  }>
  definitions?: Array<{
    term: string
    definition: string
  }>
  likelyQuestions?: string[]
  pitfalls?: string[]
}

interface NotesViewerProps {
  studyPackId: string
  roomId: string
  userId: string
  sharedToolId: string
  onComplete?: (result: any) => void
}

export default function NotesViewer({
  studyPackId,
  roomId,
  userId,
  sharedToolId,
  onComplete,
}: NotesViewerProps) {
  const [notes, setNotes] = useState<NotesData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    overview: true,
    concepts: true,
    definitions: true,
    questions: true,
    pitfalls: true,
  })
  const [hasMarkedComplete, setHasMarkedComplete] = useState(false)

  useEffect(() => {
    fetchNotes()
  }, [studyPackId])

  const fetchNotes = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`/api/study-packs/${studyPackId}`)

      if (!response.ok) {
        throw new Error('Failed to fetch notes')
      }

      const data = await response.json()
      
      // Extract notes from mindmap or other sources
      if (data.mindmap?.layout_json) {
        setNotes(data.mindmap.layout_json)
      } else {
        setNotes({})
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  const handleMarkComplete = async () => {
    if (hasMarkedComplete) return

    try {
      await fetch(`/api/rooms/${roomId}/shared-tools/${sharedToolId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          result: {
            viewed: true,
          },
        }),
      })

      setHasMarkedComplete(true)

      if (onComplete) {
        onComplete({ viewed: true })
      }
    } catch (err) {
      console.error('Failed to record completion:', err)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Orb pose="processing-thinking" size="lg" />
        <p className="text-[#64748B] mt-4">Loading notes...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Orb pose="error-confused" size="lg" />
        <p className="text-[#EF4444] mt-4">{error}</p>
      </div>
    )
  }

  if (!notes) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Orb pose="neutral" size="lg" />
        <p className="text-[#64748B] mt-4">No notes available</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Overview Section */}
      {notes.overview && (
        <div className="relative">
          <div className="absolute top-[3px] left-0 right-0 h-full bg-white/60 rounded-xl border border-[#CBD5E1]/40" />
          <div className="relative bg-white rounded-xl shadow-[0_2px_8px_rgba(15,23,42,0.06),0_1px_2px_rgba(15,23,42,0.04)] border border-[#E2E8F0] overflow-hidden">
            <button
              onClick={() => toggleSection('overview')}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-[#F8FAFB] transition-colors"
            >
              <div className="flex items-center gap-3">
                <Orb pose="teacher-pointer" size="sm" />
                <h3 className="text-[18px] font-bold text-[#1A1D2E]">Overview</h3>
              </div>
              {expandedSections.overview ? (
                <ChevronUp className="w-5 h-5 text-[#64748B]" />
              ) : (
                <ChevronDown className="w-5 h-5 text-[#64748B]" />
              )}
            </button>

            <AnimatePresence>
              {expandedSections.overview && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-4 border-t border-[#E2E8F0]">
                    <p className="text-[#475569] leading-relaxed pt-4">{notes.overview}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Key Concepts Section */}
      {notes.keyConcepts && notes.keyConcepts.length > 0 && (
        <div className="relative">
          <div className="absolute top-[3px] left-0 right-0 h-full bg-white/60 rounded-xl border border-[#CBD5E1]/40" />
          <div className="relative bg-white rounded-xl shadow-[0_2px_8px_rgba(15,23,42,0.06),0_1px_2px_rgba(15,23,42,0.04)] border border-[#E2E8F0] overflow-hidden">
            <button
              onClick={() => toggleSection('concepts')}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-[#F8FAFB] transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#5A5FF0]/10 flex items-center justify-center">
                  <Lightbulb className="w-4 h-4 text-[#5A5FF0]" strokeWidth={2} />
                </div>
                <div className="flex items-center gap-2">
                  <h3 className="text-[18px] font-bold text-[#1A1D2E]">Key Concepts</h3>
                  <span className="text-[12px] text-[#64748B]">({notes.keyConcepts.length})</span>
                </div>
              </div>
              {expandedSections.concepts ? (
                <ChevronUp className="w-5 h-5 text-[#64748B]" />
              ) : (
                <ChevronDown className="w-5 h-5 text-[#64748B]" />
              )}
            </button>

            <AnimatePresence>
              {expandedSections.concepts && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-4 border-t border-[#E2E8F0] pt-4">
                    <div className="space-y-3">
                      {notes.keyConcepts.map((concept, index) => (
                        <div
                          key={index}
                          className="bg-[#F8FAFB] rounded-lg p-4 hover:bg-[#F1F5F9] transition-all border border-[#E2E8F0]"
                        >
                          <h4 className="text-[15px] font-bold text-[#5A5FF0] mb-2">
                            {concept.title}
                          </h4>
                          <p className="text-[#475569] leading-relaxed text-[14px]">
                            {concept.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Definitions Section */}
      {notes.definitions && notes.definitions.length > 0 && (
        <div className="relative">
          <div className="absolute top-[3px] left-0 right-0 h-full bg-white/60 rounded-xl border border-[#CBD5E1]/40" />
          <div className="relative bg-white rounded-xl shadow-[0_2px_8px_rgba(15,23,42,0.06),0_1px_2px_rgba(15,23,42,0.04)] border border-[#E2E8F0] overflow-hidden">
            <button
              onClick={() => toggleSection('definitions')}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-[#F8FAFB] transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#8B5CF6]/10 flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-[#8B5CF6]" strokeWidth={2} />
                </div>
                <div className="flex items-center gap-2">
                  <h3 className="text-[18px] font-bold text-[#1A1D2E]">Definitions</h3>
                  <span className="text-[12px] text-[#64748B]">({notes.definitions.length})</span>
                </div>
              </div>
              {expandedSections.definitions ? (
                <ChevronUp className="w-5 h-5 text-[#64748B]" />
              ) : (
                <ChevronDown className="w-5 h-5 text-[#64748B]" />
              )}
            </button>

            <AnimatePresence>
              {expandedSections.definitions && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-4 border-t border-[#E2E8F0] pt-4">
                    <div className="grid grid-cols-1 gap-3">
                      {notes.definitions.map((def, index) => (
                        <div
                          key={index}
                          className="bg-[#F8FAFB] rounded-lg p-4 hover:bg-[#F1F5F9] transition-all border border-[#E2E8F0]"
                        >
                          <dt className="text-[14px] font-bold text-[#8B5CF6] mb-2">
                            {def.term}
                          </dt>
                          <dd className="text-[#475569] leading-relaxed text-[14px]">
                            {def.definition}
                          </dd>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Likely Questions Section */}
      {notes.likelyQuestions && notes.likelyQuestions.length > 0 && (
        <div className="relative">
          <div className="absolute top-[3px] left-0 right-0 h-full bg-white/60 rounded-xl border border-[#CBD5E1]/40" />
          <div className="relative bg-white rounded-xl shadow-[0_2px_8px_rgba(15,23,42,0.06),0_1px_2px_rgba(15,23,42,0.04)] border border-[#E2E8F0] overflow-hidden">
            <button
              onClick={() => toggleSection('questions')}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-[#F8FAFB] transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#10B981]/10 flex items-center justify-center">
                  <HelpCircle className="w-4 h-4 text-[#10B981]" strokeWidth={2} />
                </div>
                <div className="flex items-center gap-2">
                  <h3 className="text-[18px] font-bold text-[#1A1D2E]">Likely Questions</h3>
                  <span className="text-[12px] text-[#64748B]">({notes.likelyQuestions.length})</span>
                </div>
              </div>
              {expandedSections.questions ? (
                <ChevronUp className="w-5 h-5 text-[#64748B]" />
              ) : (
                <ChevronDown className="w-5 h-5 text-[#64748B]" />
              )}
            </button>

            <AnimatePresence>
              {expandedSections.questions && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-4 border-t border-[#E2E8F0] pt-4">
                    <div className="space-y-2">
                      {notes.likelyQuestions.map((question, index) => (
                        <div
                          key={index}
                          className="bg-[#F8FAFB] rounded-lg p-3 hover:bg-[#F1F5F9] transition-all border border-[#E2E8F0] flex items-start gap-3"
                        >
                          <span className="flex-shrink-0 w-6 h-6 bg-[#10B981]/10 text-[#10B981] rounded-full flex items-center justify-center font-bold text-[12px]">
                            {index + 1}
                          </span>
                          <p className="text-[#475569] leading-relaxed text-[14px] pt-0.5">
                            {question}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Pitfalls Section */}
      {notes.pitfalls && notes.pitfalls.length > 0 && (
        <div className="relative">
          <div className="absolute top-[3px] left-0 right-0 h-full bg-white/60 rounded-xl border border-[#CBD5E1]/40" />
          <div className="relative bg-white rounded-xl shadow-[0_2px_8px_rgba(15,23,42,0.06),0_1px_2px_rgba(15,23,42,0.04)] border border-[#F59E0B]/30 overflow-hidden">
            <button
              onClick={() => toggleSection('pitfalls')}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-[#FEF3C7]/20 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#F59E0B]/10 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-[#F59E0B]" strokeWidth={2} />
                </div>
                <div className="flex items-center gap-2">
                  <h3 className="text-[18px] font-bold text-[#1A1D2E]">Common Pitfalls</h3>
                  <span className="text-[12px] text-[#64748B]">({notes.pitfalls.length})</span>
                </div>
              </div>
              {expandedSections.pitfalls ? (
                <ChevronUp className="w-5 h-5 text-[#64748B]" />
              ) : (
                <ChevronDown className="w-5 h-5 text-[#64748B]" />
              )}
            </button>

            <AnimatePresence>
              {expandedSections.pitfalls && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-4 border-t border-[#E2E8F0] pt-4">
                    <div className="space-y-2">
                      {notes.pitfalls.map((pitfall, index) => (
                        <div
                          key={index}
                          className="bg-[#FEF3C7]/30 border border-[#F59E0B]/30 rounded-lg p-3 hover:bg-[#FEF3C7]/50 transition-all flex items-start gap-3"
                        >
                          <AlertTriangle className="w-4 h-4 text-[#F59E0B] flex-shrink-0 mt-0.5" strokeWidth={2} />
                          <p className="text-[#475569] leading-relaxed text-[14px]">
                            {pitfall}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Mark Complete Button */}
      <div className="flex justify-center pt-4">
        <button
          onClick={handleMarkComplete}
          disabled={hasMarkedComplete}
          className={`px-8 py-3 rounded-lg text-[15px] font-semibold transition-colors shadow-sm ${
            hasMarkedComplete
              ? 'bg-[#10B981] text-white cursor-default'
              : 'bg-[#5A5FF0] hover:bg-[#4A4FD0] text-white'
          }`}
        >
          {hasMarkedComplete ? '✓ Marked as Complete' : 'Mark as Complete'}
        </button>
      </div>
    </div>
  )
}
