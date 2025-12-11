'use client'

import Link from 'next/link'
import { RoomListItem } from '@/lib/types/rooms'
import { formatDistanceToNow } from 'date-fns'

interface RoomCardProps {
  room: RoomListItem
}

export default function RoomCard({ room }: RoomCardProps) {
  const lastActivityText = formatDistanceToNow(new Date(room.lastActivityAt), {
    addSuffix: true,
  })

  return (
    <Link
      href={`/rooms/${room.id}`}
      className="block group relative bg-white rounded-xl border border-gray-200 hover:border-[#5A5FF0] hover:shadow-lg transition-all duration-200 overflow-hidden"
    >
      {/* Background theme preview */}
      <div className="h-32 relative overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
        <div className="absolute inset-0 bg-cover bg-center" 
          style={{ 
            backgroundImage: `url(/${room.backgroundTheme}.png)`,
          }}
        />
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/20 to-transparent" />
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Room name */}
        <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-[#5A5FF0] transition-colors line-clamp-1">
          {room.name}
        </h3>

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
          {/* Member count */}
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <span>{room.memberCount} {room.memberCount === 1 ? 'member' : 'members'}</span>
          </div>

          {/* Online indicator */}
          {room.onlineCount > 0 && (
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-green-600 font-medium">{room.onlineCount} online</span>
            </div>
          )}
        </div>

        {/* Last activity */}
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Active {lastActivityText}</span>
        </div>

        {/* Creator badge */}
        {room.isCreator && (
          <div className="absolute top-3 right-3 px-2 py-1 bg-[#5A5FF0] text-white text-xs font-semibold rounded">
            Creator
          </div>
        )}
      </div>
    </Link>
  )
}
