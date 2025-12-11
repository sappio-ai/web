'use client'

import { Message, ToolType } from '@/lib/types/rooms'

interface ToolShareMessageProps {
  message: Message
  isOwn: boolean
  hasCompleted?: boolean
  onOpen: () => void
}

const toolIcons: Record<ToolType, string> = {
  quiz: '📝',
  flashcards: '🃏',
  notes: '📄',
}

const toolLabels: Record<ToolType, string> = {
  quiz: 'Take Quiz',
  flashcards: 'Review Cards',
  notes: 'View Notes',
}

const toolColors: Record<ToolType, { bg: string; border: string; text: string }> = {
  quiz: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    text: 'text-amber-300',
  },
  flashcards: {
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/20',
    text: 'text-violet-300',
  },
  notes: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    text: 'text-blue-300',
  },
}

export default function ToolShareMessage({
  message,
  isOwn,
  hasCompleted = false,
  onOpen,
}: ToolShareMessageProps) {
  const toolType = message.toolType as ToolType
  const toolName = message.toolName || 'Untitled'
  const senderName = message.user?.fullName || 'Anonymous'
  const avatarUrl = message.user?.avatarUrl
  const initials = senderName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  const colors = toolColors[toolType] || toolColors.notes

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className={`flex gap-2 w-full ${isOwn ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div className="flex-shrink-0">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={senderName}
            className="w-8 h-8 rounded-full object-cover border border-white/10"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#5A5FF0] to-[#8B5CF6] flex items-center justify-center text-white text-xs font-medium">
            {initials}
          </div>
        )}
      </div>

      {/* Tool Share Card */}
      <div className={`flex flex-col min-w-0 flex-1 max-w-[calc(100%-48px)] ${isOwn ? 'items-end' : 'items-start'}`}>
        {/* Sender name and timestamp */}
        <div className={`flex items-center gap-2 mb-1 ${isOwn ? 'flex-row-reverse' : ''}`}>
          <span className="text-xs font-medium text-white/70 truncate">{senderName}</span>
          <span className="text-xs text-white/40 flex-shrink-0">{formatTime(message.createdAt)}</span>
        </div>

        {/* Tool Card */}
        <div
          className={`${colors.bg} border ${colors.border} rounded-2xl p-3 w-full max-w-[220px] ${
            isOwn ? 'rounded-br-md' : 'rounded-bl-md'
          }`}
        >
          {/* Tool Header */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl flex-shrink-0">{toolIcons[toolType]}</span>
            <div className="flex-1 min-w-0 overflow-hidden">
              <p className="text-sm font-medium text-white truncate">{toolName}</p>
              <p className="text-xs text-white/50 capitalize">{toolType}</p>
            </div>
            {hasCompleted && (
              <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-300 text-xs rounded-full flex-shrink-0">
                ✓
              </span>
            )}
          </div>

          {/* Action Button */}
          <button
            onClick={onOpen}
            className={`w-full px-3 py-2 ${colors.bg} hover:bg-white/10 border ${colors.border} ${colors.text} text-xs font-medium rounded-lg transition-all duration-200`}
          >
            {hasCompleted ? 'Review Again' : toolLabels[toolType]}
          </button>
        </div>
      </div>
    </div>
  )
}
