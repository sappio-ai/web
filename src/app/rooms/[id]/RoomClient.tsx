'use client'

import { RoomWithMembers } from '@/lib/types/rooms'
import RoomInterface from '@/components/rooms/RoomInterface'

interface RoomClientProps {
  room: RoomWithMembers
  userId: string
  isCreator: boolean
}

export default function RoomClient({ room, userId, isCreator }: RoomClientProps) {
  return <RoomInterface room={room} userId={userId} isCreator={isCreator} />
}
