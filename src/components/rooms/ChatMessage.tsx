'use client'

import { Message } from '@/lib/types/rooms'

interface ChatMessageProps {
  message: Message
  isOwn: boolean
}

export default function ChatMessage({ message, isOwn }: ChatMessageProps) {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  // System message styling (join/leave)
  if (message.messageType === 'system') {
    return (
      <div className="flex justify-center py-2">
        <span className="px-3 py-1 text-xs text-white/50 bg-white/5 rounded-full">
          {message.content}
        </span>
      </div>
    )
  }

  // Completion message styling
  if (message.messageType === 'completion') {
    const result = message.metaJson as { score?: number; totalQuestions?: number }
    return (
      <div className="flex justify-center py-2">
        <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
          <div className="flex items-center gap-2">
            <span className="text-emerald-400">🎉</span>
            <span className="text-sm text-emerald-300">{message.content}</span>
            {result?.score !== undefined && (
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-xs rounded-full">
                {result.score}%
              </span>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Regular text message
  const senderName = message.user?.fullName || 'Anonymous'
  const avatarUrl = message.user?.avatarUrl
  const initials = senderName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}>
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

      {/* Message Content */}
      <div className={`flex flex-col max-w-[70%] ${isOwn ? 'items-end' : 'items-start'}`}>
        {/* Sender name and timestamp */}
        <div className={`flex items-center gap-2 mb-1 ${isOwn ? 'flex-row-reverse' : ''}`}>
          <span className="text-xs font-medium text-white/70">{senderName}</span>
          <span className="text-xs text-white/40">{formatTime(message.createdAt)}</span>
        </div>

        {/* Message bubble */}
        <div
          className={`px-4 py-2.5 rounded-2xl ${
            isOwn
              ? 'bg-[#5A5FF0] text-white rounded-br-md'
              : 'bg-white/10 text-white/90 rounded-bl-md'
          }`}
        >
          <p className="text-sm leading-relaxed break-words">{message.content}</p>
        </div>
      </div>
    </div>
  )
}
