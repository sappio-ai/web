import { Tables } from './database'

// Database table types
export type StudyRoom = Tables<'study_rooms'>
export type RoomMember = Tables<'room_members'>
export type RoomMessage = Tables<'room_messages'>
export type RoomInvite = Tables<'room_invites'>
export type RoomSharedTool = Tables<'room_shared_tools'>
export type RoomSession = Tables<'room_sessions'>

// Enums
export type BackgroundTheme = 'forest' | 'library' | 'cafe' | 'space' | 'minimal'
export type RoomPrivacy = 'private' | 'public'
export type RoomStatus = 'active' | 'dormant' | 'deleted'
export type MemberRole = 'creator' | 'co_host' | 'member'
export type MessageType = 'text' | 'tool_share' | 'system' | 'completion'
export type ToolType = 'quiz' | 'flashcards' | 'notes'
export type InviteStatus = 'pending' | 'accepted' | 'declined' | 'expired'
export type MemberStatus = 'idle' | 'studying' | 'break' | 'offline'

// Extended types with relations
export interface Room {
  id: string
  name: string
  creatorId: string
  backgroundTheme: BackgroundTheme
  privacy: RoomPrivacy
  pomodoroWorkMinutes: number
  pomodoroBreakMinutes: number
  status: RoomStatus
  lastActivityAt: string
  createdAt: string
  updatedAt: string
  metaJson: Record<string, any>
  // Computed fields
  memberCount?: number
  onlineCount?: number
}

export interface RoomMemberWithUser extends RoomMember {
  user: {
    id: string
    fullName: string | null
    avatarUrl: string | null
    email: string
  }
  isOnline?: boolean
  status?: MemberStatus
}

export interface Message {
  id: string
  roomId: string
  userId: string
  user?: {
    fullName: string | null
    avatarUrl: string | null
  }
  messageType: MessageType
  content: string | null
  toolType: ToolType | null
  toolId: string | null
  toolName: string | null
  createdAt: string
  metaJson: Record<string, any>
}

export interface SharedTool {
  id: string
  roomId: string
  messageId: string
  sharerId: string
  sharer?: {
    fullName: string | null
    avatarUrl: string | null
  }
  toolType: ToolType
  toolId: string
  toolName: string
  studyPackId: string | null
  studyPack?: {
    title: string
  }
  completionCount: number
  sharedAt: string
  // Computed fields
  totalMembers?: number
  hasCompleted?: boolean
}

export interface RoomInviteWithDetails extends RoomInvite {
  room?: {
    name: string
    backgroundTheme: BackgroundTheme
  }
  inviter?: {
    fullName: string | null
    avatarUrl: string | null
  }
}

// Timer state (stored in room meta_json or separate state management)
export interface TimerState {
  isRunning: boolean
  isBreak: boolean
  remainingSeconds: number
  startedAt?: string
  pausedAt?: string
}

// Presence state (from Supabase Realtime)
export interface PresenceState {
  userId: string
  user?: {
    fullName: string | null
    avatarUrl: string | null
  }
  status: MemberStatus
  lastSeen: string
  timerRunning?: boolean
}

// Tool completion result
export interface ToolCompletionResult {
  score?: number
  totalQuestions?: number
  correctAnswers?: number
  cardsReviewed?: number
  duration?: number
}

// Input types for API
export interface CreateRoomInput {
  name: string
  backgroundTheme?: BackgroundTheme
  privacy?: RoomPrivacy
  pomodoroWorkMinutes?: number
  pomodoroBreakMinutes?: number
}

export interface UpdateRoomInput {
  name?: string
  backgroundTheme?: BackgroundTheme
  privacy?: RoomPrivacy
  pomodoroWorkMinutes?: number
  pomodoroBreakMinutes?: number
}

export interface SendMessageInput {
  content: string
  messageType?: MessageType
}

export interface ShareToolInput {
  toolType: ToolType
  toolId: string
  toolName: string
  studyPackId?: string
}

export interface CreateInviteInput {
  email: string
}

// Response types
export interface RoomWithMembers extends Room {
  members: RoomMemberWithUser[]
  creator: {
    fullName: string | null
    avatarUrl: string | null
  }
}

export interface RoomListItem {
  id: string
  name: string
  backgroundTheme: BackgroundTheme
  memberCount: number
  onlineCount: number
  lastActivityAt: string
  createdAt: string
  isCreator: boolean
}
