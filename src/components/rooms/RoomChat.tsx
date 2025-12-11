'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Message, ToolType } from '@/lib/types/rooms'
import ChatMessage from './ChatMessage'
import ToolShareMessage from './ToolShareMessage'
import ShareToolButton from './ShareToolButton'
import ShareToolModal from './ShareToolModal'

interface RoomChatProps {
  roomId: string
  userId: string
  onToolOpen?: (message: Message) => void
}

export default function RoomChat({ roomId, userId, onToolOpen }: RoomChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [selectedToolType, setSelectedToolType] = useState<ToolType>('quiz')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const [isAtBottom, setIsAtBottom] = useState(true)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    if (isAtBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [isAtBottom])

  // Check if user is at bottom of chat
  const handleScroll = () => {
    if (!chatContainerRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current
    setIsAtBottom(scrollHeight - scrollTop - clientHeight < 50)
  }

  // Fetch initial messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(`/api/rooms/${roomId}/chat`)
        if (!response.ok) throw new Error('Failed to fetch messages')
        const data = await response.json()
        setMessages(data.messages || [])
      } catch (error) {
        console.error('Error fetching messages:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMessages()
  }, [roomId])

  // Subscribe to new messages
  useEffect(() => {
    const channel = supabase
      .channel(`room:${roomId}:messages`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'room_messages',
          filter: `room_id=eq.${roomId}`,
        },
        async (payload) => {
          // Fetch the full message with user data
          const response = await fetch(`/api/rooms/${roomId}/chat?messageId=${payload.new.id}`)
          if (response.ok) {
            const data = await response.json()
            if (data.message) {
              setMessages((prev) => [...prev, data.message])
            }
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [roomId, supabase])

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  // Send message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || sending) return

    setSending(true)
    try {
      const response = await fetch(`/api/rooms/${roomId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newMessage.trim() }),
      })

      if (!response.ok) throw new Error('Failed to send message')
      
      setNewMessage('')
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setSending(false)
    }
  }

  // Handle tool type selection
  const handleSelectToolType = (type: ToolType) => {
    setSelectedToolType(type)
    setShareModalOpen(true)
  }

  // Handle tool share
  const handleShareTool = async (packId: string, packTitle: string) => {
    setShareModalOpen(false)
    try {
      const response = await fetch(`/api/rooms/${roomId}/shared-tools`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toolType: selectedToolType,
          toolId: packId,
          toolName: packTitle,
          studyPackId: packId,
        }),
      })

      if (!response.ok) throw new Error('Failed to share tool')
    } catch (error) {
      console.error('Error sharing tool:', error)
    }
  }

  // Handle tool open
  const handleToolOpen = (message: Message) => {
    if (onToolOpen) {
      onToolOpen(message)
    }
  }

  return (
    <div className="flex flex-col h-full bg-black/20 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden">
      {/* Chat Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
          </svg>
          <span className="text-sm font-medium text-white/80">Chat</span>
        </div>
        <span className="text-xs text-white/40">{messages.length} messages</span>
      </div>

      {/* Messages Area */}
      <div
        ref={chatContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-6 h-6 border-2 border-white/20 border-t-[#5A5FF0] rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
              </svg>
            </div>
            <p className="text-white/40 text-sm">No messages yet</p>
            <p className="text-white/30 text-xs mt-1">Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwn = message.userId === userId

            if (message.messageType === 'tool_share') {
              return (
                <ToolShareMessage
                  key={message.id}
                  message={message}
                  isOwn={isOwn}
                  onOpen={() => handleToolOpen(message)}
                />
              )
            }

            return (
              <ChatMessage
                key={message.id}
                message={message}
                isOwn={isOwn}
              />
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSendMessage} className="p-3 border-t border-white/10">
        <div className="flex items-center gap-2">
          <ShareToolButton onSelectType={handleSelectToolType} />
          
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 text-sm focus:outline-none focus:border-[#5A5FF0]/50 transition-colors"
          />
          
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="p-2.5 bg-[#5A5FF0] hover:bg-[#4A4FD0] text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            )}
          </button>
        </div>
      </form>

      {/* Share Tool Modal */}
      <ShareToolModal
        isOpen={shareModalOpen}
        toolType={selectedToolType}
        onClose={() => setShareModalOpen(false)}
        onShare={handleShareTool}
      />
    </div>
  )
}
