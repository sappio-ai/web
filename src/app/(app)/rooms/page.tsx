import { redirect } from 'next/navigation'
import { getUserProfile } from '@/lib/auth/session'
import { RoomService } from '@/lib/services/RoomService'
import RoomsClient from './RoomsClient'

export const metadata = {
  title: 'Study Rooms | Sappio',
  description: 'Join or create study rooms to collaborate with others',
}

export default async function RoomsPage() {
  const profile = await getUserProfile()

  if (!profile) {
    redirect('/login')
  }

  // Fetch user's rooms
  const rooms = await RoomService.getUserRooms(profile.id)

  return <RoomsClient rooms={rooms} />
}
