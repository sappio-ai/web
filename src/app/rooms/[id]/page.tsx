import { redirect } from 'next/navigation'
import { getUserProfile } from '@/lib/auth/session'
import { RoomService } from '@/lib/services/RoomService'
import RoomClient from './RoomClient'

export const metadata = {
  title: 'Study Room',
  description: 'Collaborate in your study room',
}

interface RoomPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function RoomPage({ params }: RoomPageProps) {
  const profile = await getUserProfile()

  if (!profile) {
    redirect('/login')
  }

  // Await params in Next.js 15
  const { id } = await params

  try {
    // Fetch room data and verify membership
    console.log('[RoomPage] Fetching room:', { roomId: id, userId: profile.id, userEmail: profile.email })
    const room = await RoomService.getRoomWithMembers(id, profile.id)
    console.log('[RoomPage] Room fetched successfully:', { roomId: room.id, roomName: room.name })
    const isCreator = room.creatorId === profile.id

    return <RoomClient room={room} userId={profile.id} isCreator={isCreator} />
  } catch (error: any) {
    // Room not found or user not a member
    console.error('[RoomPage] Error accessing room:', {
      roomId: id,
      userId: profile.id,
      userEmail: profile.email,
      error: error.message,
      stack: error.stack
    })
    redirect('/rooms')
  }
}
