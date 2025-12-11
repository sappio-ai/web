'use client'

import { useState, useEffect } from 'react'
import { SharedTool, ToolType, Message } from '@/lib/types/rooms'

interface SharedTabProps {
  roomId: string
  userId: string
  isOpen: boolean
  onToolOpen: (tool: SharedTool) => void
}

type FilterType = 'all' | ToolType

export default function SharedTab({ roomId, userId, isOpen, onToolOpen }: SharedTabProps) {
  const [sharedTools, setSharedTools] = useState<SharedTool[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterType>('all')

  // Fetch shared tools
  useEffect(() => {
    const fetchSharedTools = async () => {
      try {
        const url = filter === 'all' 
          ? `/api/rooms/${roomId}/shared-tools`
          : `/api/rooms/${roomId}/shared-tools?type=${filter}`
        
        const response = await fetch(url)
        if (!response.ok) throw new Error('Failed to fetch shared tools')
        const data = await response.json()
        setSharedTools(data.sharedTools || [])
      } catch (error) {
        console.error('Error fetching shared tools:', error)
      } finally {
        setLoading(false)
      }
    }

    if (isOpen) {
      fetchSharedTools()
    }
  }, [roomId, filter, isOpen])

  // Get tool type icon
  const getToolIcon = (type: ToolType) => {
    switch (type) {
      case 'quiz':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
          </svg>
        )
      case 'flashcards':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0l4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0l-5.571 3-5.571-3" />
          </svg>
        )
      case 'notes':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
        )
    }
  }

  // Get action button text
  const getActionText = (type: ToolType) => {
    switch (type) {
      case 'quiz': return 'Take Quiz'
      case 'flashcards': return 'Review Cards'
      case 'notes': return 'View Notes'
    }
  }

  // Get tool type color
  const getTypeColor = (type: ToolType) => {
    switch (type) {
      case 'quiz': return 'text-purple-400 bg-purple-500/20'
      case 'flashcards': return 'text-cyan-400 bg-cyan-500/20'
      case 'notes': return 'text-amber-400 bg-amber-500/20'
    }
  }

  // Filter options
  const filterOptions: { value: FilterType; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'quiz', label: 'Quizzes' },
    { value: 'flashcards', label: 'Flashcards' },
    { value: 'notes', label: 'Notes' },
  ]

  // Format relative time
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }

  const filteredTools = sharedTools

  if (!isOpen) return null

  return (
    <div className="max-w-4xl mx-auto px-6">
      {/* Filter Tabs */}
      <div className="flex items-center justify-center gap-2 mb-6">
        {filterOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => setFilter(option.value)}
            className={`px-4 py-2 text-sm font-medium rounded-full transition-all ${
              filter === option.value
                ? 'bg-white/20 text-white'
                : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/70'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-6 h-6 border-2 border-white/20 border-t-[#5A5FF0] rounded-full animate-spin" />
        </div>
      ) : filteredTools.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
            </svg>
          </div>
          <p className="text-white/50 text-sm mb-1">No shared tools yet</p>
          <p className="text-white/30 text-xs">Share quizzes, flashcards, or notes from the chat</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[35vh] overflow-y-auto pb-2">
          {filteredTools.map((tool) => (
            <div
              key={tool.id}
              className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-4 transition-all group"
            >
              {/* Tool Header */}
              <div className="flex items-start gap-3 mb-3">
                <div className={`p-2 rounded-xl ${getTypeColor(tool.toolType)}`}>
                  {getToolIcon(tool.toolType)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-white/90 truncate">{tool.toolName}</h3>
                  <p className="text-xs text-white/40 truncate">
                    {tool.studyPack?.title || 'Study Pack'}
                  </p>
                </div>
              </div>

              {/* Sharer Info */}
              <div className="flex items-center gap-2 mb-3">
                {tool.sharer?.avatarUrl ? (
                  <img
                    src={tool.sharer.avatarUrl}
                    alt={tool.sharer.fullName || 'Sharer'}
                    className="w-5 h-5 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                    <span className="text-white text-[10px] font-medium">
                      {(tool.sharer?.fullName || 'A').charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <span className="text-xs text-white/50">
                  {tool.sharer?.fullName || 'Anonymous'} • {formatRelativeTime(tool.sharedAt)}
                </span>
              </div>

              {/* Completion Stats */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-xs text-white/50">
                    {tool.completionCount}/{tool.totalMembers || '?'} completed
                  </span>
                </div>
                {tool.totalMembers && tool.totalMembers > 0 && (
                  <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500 rounded-full transition-all"
                      style={{ width: `${Math.min(100, (tool.completionCount / tool.totalMembers) * 100)}%` }}
                    />
                  </div>
                )}
              </div>

              {/* Action Button */}
              <button
                onClick={() => onToolOpen(tool)}
                className={`w-full py-2 px-3 rounded-xl text-sm font-medium transition-all ${getTypeColor(tool.toolType)} hover:opacity-80`}
              >
                {getActionText(tool.toolType)}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
