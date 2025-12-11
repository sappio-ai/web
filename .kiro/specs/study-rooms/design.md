# Design Document: Study Rooms

## Overview

Study Rooms is a collaborative study feature that provides virtual spaces for users to study together. The feature combines real-time presence, synchronized timers, chat-based tool sharing, and modal-based tool interaction to create an immersive group study experience without leaving the room context.

The feature is accessed via a new "Rooms" link in the navbar, leading to `/rooms` for the rooms list and `/rooms/{room-id}` for individual rooms.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (Next.js)                       │
├─────────────────────────────────────────────────────────────────┤
│  Pages                    │  Components                          │
│  - /rooms                 │  - RoomCard                          │
│  - /rooms/[id]            │  - CreateRoomModal                   │
│                           │  - RoomInterface                     │
│                           │  - RoomChat                          │
│                           │  - TimerDisplay                      │
│                           │  - MemberSidebar                     │
│                           │  - SharedToolsTab                    │
│                           │  - ToolModal                         │
│                           │  - InviteModal                       │
│                           │  - InviteNotification                │
├─────────────────────────────────────────────────────────────────┤
│                         Services                                 │
│  - RoomService            │  - ChatService                       │
│  - TimerService           │  - InviteService                     │
│  - PresenceService        │  - SharedToolService                 │
├─────────────────────────────────────────────────────────────────┤
│                         API Routes                               │
│  - /api/rooms             │  - /api/rooms/[id]/chat              │
│  - /api/rooms/[id]        │  - /api/rooms/[id]/invite            │
│  - /api/rooms/[id]/members│  - /api/rooms/[id]/shared-tools      │
│  - /api/rooms/[id]/timer  │  - /api/invites                      │
├─────────────────────────────────────────────────────────────────┤
│                    Supabase (Backend)                            │
│  - Database (Postgres)    │  - Realtime (Presence + Broadcast)   │
│  - RLS Policies           │  - Storage (Background images)       │
└─────────────────────────────────────────────────────────────────┘
```

### Real-time Architecture

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   User A     │     │   Supabase   │     │   User B     │
│   Browser    │     │   Realtime   │     │   Browser    │
└──────┬───────┘     └──────┬───────┘     └──────┬───────┘
       │                    │                    │
       │ Subscribe to       │                    │
       │ room:{id}          │                    │
       │───────────────────>│                    │
       │                    │<───────────────────│
       │                    │ Subscribe to       │
       │                    │ room:{id}          │
       │                    │                    │
       │ Send message       │                    │
       │───────────────────>│                    │
       │                    │ Broadcast to all   │
       │                    │───────────────────>│
       │                    │                    │
       │ Presence update    │                    │
       │───────────────────>│                    │
       │                    │ Sync presence      │
       │                    │───────────────────>│
```

## Components and Interfaces

### Pages

#### `/rooms` - Rooms List Page
- **Location**: `src/app/rooms/page.tsx`
- **Purpose**: Display user's rooms and create new rooms
- **Components Used**: RoomCard, CreateRoomModal, EmptyState
- **Data**: Fetches rooms via RoomService

#### `/rooms/[id]` - Room Page
- **Location**: `src/app/rooms/[id]/page.tsx`
- **Purpose**: Main room interface
- **Components Used**: RoomInterface (contains all room UI)
- **Data**: Fetches room details, subscribes to real-time channels

### Components

#### RoomCard
- **Location**: `src/components/rooms/RoomCard.tsx`
- **Purpose**: Display room preview in list
- **Props**: `room: Room`, `onlineCount: number`
- **Used In**: `/rooms` page

#### CreateRoomModal
- **Location**: `src/components/rooms/CreateRoomModal.tsx`
- **Purpose**: Room creation form
- **Props**: `isOpen: boolean`, `onClose: () => void`, `onCreated: (room: Room) => void`
- **Used In**: `/rooms` page, StudyPackView (quick create)

#### RoomInterface
- **Location**: `src/components/rooms/RoomInterface.tsx`
- **Purpose**: Main room container with tabs
- **Props**: `room: Room`, `userId: string`, `isCreator: boolean`
- **Contains**: TabNavigation, RoomTab, SharedTab
- **Used In**: `/rooms/[id]` page

#### RoomTab
- **Location**: `src/components/rooms/RoomTab.tsx`
- **Purpose**: Main room view with timers, chat, presence
- **Props**: `room: Room`, `isCreator: boolean`
- **Contains**: GlobalTimer, PersonalTimer, RoomChat, MemberSidebar
- **Used In**: RoomInterface

#### GlobalTimer
- **Location**: `src/components/rooms/GlobalTimer.tsx`
- **Purpose**: Synchronized room timer (creator controls)
- **Props**: `roomId: string`, `isCreator: boolean`, `initialState: TimerState`
- **Used In**: RoomTab

#### PersonalTimer
- **Location**: `src/components/rooms/PersonalTimer.tsx`
- **Purpose**: Individual user timer
- **Props**: `onStatusChange: (status: string) => void`
- **Used In**: RoomTab

#### RoomChat
- **Location**: `src/components/rooms/RoomChat.tsx`
- **Purpose**: Real-time chat with tool sharing
- **Props**: `roomId: string`, `userId: string`
- **Contains**: ChatMessage, ShareToolButton, ToolShareMessage
- **Used In**: RoomTab

#### ChatMessage
- **Location**: `src/components/rooms/ChatMessage.tsx`
- **Purpose**: Render individual chat message
- **Props**: `message: Message`, `isOwn: boolean`
- **Used In**: RoomChat

#### ToolShareMessage
- **Location**: `src/components/rooms/ToolShareMessage.tsx`
- **Purpose**: Special message for shared tools with action button
- **Props**: `share: SharedTool`, `onOpen: () => void`
- **Used In**: RoomChat, SharedTab

#### ShareToolButton
- **Location**: `src/components/rooms/ShareToolButton.tsx`
- **Purpose**: Dropdown to select and share tools
- **Props**: `roomId: string`, `onShare: (tool: SharedTool) => void`
- **Used In**: RoomChat

#### ShareToolModal
- **Location**: `src/components/rooms/ShareToolModal.tsx`
- **Purpose**: Select study pack and tool to share
- **Props**: `isOpen: boolean`, `toolType: string`, `onSelect: (tool) => void`, `onClose: () => void`
- **Used In**: ShareToolButton

#### MemberSidebar
- **Location**: `src/components/rooms/MemberSidebar.tsx`
- **Purpose**: Show room members with presence
- **Props**: `roomId: string`, `members: Member[]`
- **Used In**: RoomTab

#### SharedTab
- **Location**: `src/components/rooms/SharedTab.tsx`
- **Purpose**: List all shared tools
- **Props**: `roomId: string`, `sharedTools: SharedTool[]`
- **Contains**: ToolShareMessage, FilterDropdown
- **Used In**: RoomInterface

#### ToolModal
- **Location**: `src/components/rooms/ToolModal.tsx`
- **Purpose**: Modal wrapper for tool interaction
- **Props**: `isOpen: boolean`, `tool: SharedTool`, `onClose: () => void`, `onComplete: (result) => void`
- **Contains**: FlashcardsTab, QuizTab, NotesTab (existing components)
- **Used In**: RoomTab, SharedTab

#### InviteModal
- **Location**: `src/components/rooms/InviteModal.tsx`
- **Purpose**: Invite users to room
- **Props**: `isOpen: boolean`, `roomId: string`, `inviteLink: string`, `onClose: () => void`
- **Used In**: RoomInterface

#### InviteNotification
- **Location**: `src/components/rooms/InviteNotification.tsx`
- **Purpose**: Real-time popup for room invites
- **Props**: `invite: RoomInvite`, `onAccept: () => void`, `onDecline: () => void`
- **Used In**: Layout (global)

#### RoomSettings
- **Location**: `src/components/rooms/RoomSettings.tsx`
- **Purpose**: Room settings panel for creator
- **Props**: `room: Room`, `onUpdate: (settings) => void`, `onDelete: () => void`
- **Used In**: RoomInterface

#### BackgroundSelector
- **Location**: `src/components/rooms/BackgroundSelector.tsx`
- **Purpose**: Select room background theme
- **Props**: `selected: string`, `onChange: (theme: string) => void`
- **Used In**: CreateRoomModal, RoomSettings

### Services

#### RoomService
- **Location**: `src/lib/services/RoomService.ts`
- **Methods**:
  - `createRoom(data: CreateRoomInput): Promise<Room>`
  - `getRoom(id: string): Promise<Room>`
  - `getUserRooms(userId: string): Promise<Room[]>`
  - `updateRoom(id: string, data: UpdateRoomInput): Promise<Room>`
  - `deleteRoom(id: string): Promise<void>`
  - `joinRoom(roomId: string, userId: string): Promise<void>`
  - `leaveRoom(roomId: string, userId: string): Promise<void>`
  - `removeMember(roomId: string, memberId: string): Promise<void>`
- **Used By**: API routes, Room pages

#### ChatService
- **Location**: `src/lib/services/ChatService.ts`
- **Methods**:
  - `sendMessage(roomId: string, userId: string, content: string): Promise<Message>`
  - `getMessages(roomId: string, limit?: number): Promise<Message[]>`
  - `subscribeToMessages(roomId: string, callback: (msg: Message) => void): Subscription`
- **Used By**: RoomChat component

#### TimerService
- **Location**: `src/lib/services/TimerService.ts`
- **Methods**:
  - `getGlobalTimerState(roomId: string): Promise<TimerState>`
  - `updateGlobalTimer(roomId: string, state: TimerState): Promise<void>`
  - `subscribeToGlobalTimer(roomId: string, callback: (state: TimerState) => void): Subscription`
- **Used By**: GlobalTimer component

#### PresenceService
- **Location**: `src/lib/services/PresenceService.ts`
- **Methods**:
  - `trackPresence(roomId: string, userId: string, status: string): void`
  - `subscribeToPresence(roomId: string, callback: (members: PresenceState[]) => void): Subscription`
  - `updateStatus(roomId: string, userId: string, status: string): void`
- **Used By**: MemberSidebar, RoomInterface

#### InviteService
- **Location**: `src/lib/services/InviteService.ts`
- **Methods**:
  - `createInvite(roomId: string, email: string): Promise<RoomInvite>`
  - `getInviteByCode(code: string): Promise<RoomInvite>`
  - `acceptInvite(inviteId: string, userId: string): Promise<void>`
  - `declineInvite(inviteId: string): Promise<void>`
  - `getPendingInvites(userId: string): Promise<RoomInvite[]>`
  - `subscribeToInvites(userId: string, callback: (invite: RoomInvite) => void): Subscription`
- **Used By**: InviteModal, InviteNotification, API routes

#### SharedToolService
- **Location**: `src/lib/services/SharedToolService.ts`
- **Methods**:
  - `shareTool(roomId: string, userId: string, tool: ToolInput): Promise<SharedTool>`
  - `getSharedTools(roomId: string): Promise<SharedTool[]>`
  - `recordCompletion(sharedToolId: string, userId: string, result: any): Promise<void>`
  - `getCompletions(sharedToolId: string): Promise<ToolCompletion[]>`
- **Used By**: ShareToolButton, SharedTab, ToolModal

### API Routes

#### `/api/rooms`
- **Location**: `src/app/api/rooms/route.ts`
- **GET**: List user's rooms
- **POST**: Create new room

#### `/api/rooms/[id]`
- **Location**: `src/app/api/rooms/[id]/route.ts`
- **GET**: Get room details
- **PATCH**: Update room settings
- **DELETE**: Delete room

#### `/api/rooms/[id]/members`
- **Location**: `src/app/api/rooms/[id]/members/route.ts`
- **GET**: List room members
- **POST**: Join room
- **DELETE**: Leave room or remove member

#### `/api/rooms/[id]/chat`
- **Location**: `src/app/api/rooms/[id]/chat/route.ts`
- **GET**: Get chat history
- **POST**: Send message

#### `/api/rooms/[id]/timer`
- **Location**: `src/app/api/rooms/[id]/timer/route.ts`
- **GET**: Get timer state
- **POST**: Update timer state

#### `/api/rooms/[id]/invite`
- **Location**: `src/app/api/rooms/[id]/invite/route.ts`
- **POST**: Create invite
- **GET**: Get room invite link

#### `/api/rooms/[id]/shared-tools`
- **Location**: `src/app/api/rooms/[id]/shared-tools/route.ts`
- **GET**: List shared tools
- **POST**: Share a tool

#### `/api/invites`
- **Location**: `src/app/api/invites/route.ts`
- **GET**: Get pending invites for user

#### `/api/invites/[code]`
- **Location**: `src/app/api/invites/[code]/route.ts`
- **GET**: Get invite by code
- **POST**: Accept invite

## Data Models

### Database Tables

#### `study_rooms`
```sql
CREATE TABLE study_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  creator_id UUID NOT NULL REFERENCES users(id),
  background_theme TEXT DEFAULT 'forest',
  privacy TEXT DEFAULT 'private' CHECK (privacy IN ('private', 'public')),
  pomodoro_work_minutes INTEGER DEFAULT 25,
  pomodoro_break_minutes INTEGER DEFAULT 5,
  invite_code TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### `room_members`
```sql
CREATE TABLE room_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES study_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(room_id, user_id)
);
```

#### `room_messages`
```sql
CREATE TABLE room_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES study_rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  content TEXT,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'system', 'tool_share', 'tool_result')),
  meta_json JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### `room_shared_tools`
```sql
CREATE TABLE room_shared_tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES study_rooms(id) ON DELETE CASCADE,
  shared_by UUID NOT NULL REFERENCES users(id),
  tool_type TEXT NOT NULL CHECK (tool_type IN ('quiz', 'flashcards', 'notes')),
  study_pack_id UUID NOT NULL REFERENCES study_packs(id),
  quiz_id UUID REFERENCES quizzes(id),
  message_id UUID REFERENCES room_messages(id),
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### `room_tool_completions`
```sql
CREATE TABLE room_tool_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shared_tool_id UUID NOT NULL REFERENCES room_shared_tools(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  result_json JSONB,
  completed_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(shared_tool_id, user_id)
);
```

#### `room_invites`
```sql
CREATE TABLE room_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES study_rooms(id) ON DELETE CASCADE,
  invited_by UUID NOT NULL REFERENCES users(id),
  invited_email TEXT,
  invited_user_id UUID REFERENCES users(id),
  invite_code TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT (now() + interval '7 days')
);
```

#### `room_timer_state`
```sql
CREATE TABLE room_timer_state (
  room_id UUID PRIMARY KEY REFERENCES study_rooms(id) ON DELETE CASCADE,
  is_running BOOLEAN DEFAULT false,
  is_break BOOLEAN DEFAULT false,
  remaining_seconds INTEGER,
  started_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### TypeScript Interfaces

```typescript
// src/lib/types/rooms.ts

interface Room {
  id: string
  name: string
  creatorId: string
  backgroundTheme: BackgroundTheme
  privacy: 'private' | 'public'
  pomodoroWorkMinutes: number
  pomodoroBreakMinutes: number
  inviteCode: string
  createdAt: string
  updatedAt: string
  memberCount?: number
  onlineCount?: number
}

type BackgroundTheme = 'forest' | 'library' | 'cafe' | 'space' | 'minimal'

interface RoomMember {
  id: string
  roomId: string
  userId: string
  user: {
    id: string
    fullName: string
    avatarUrl: string
  }
  joinedAt: string
  isOnline?: boolean
  status?: 'idle' | 'studying' | 'break'
}

interface Message {
  id: string
  roomId: string
  userId: string | null
  user?: {
    fullName: string
    avatarUrl: string
  }
  content: string | null
  messageType: 'text' | 'system' | 'tool_share' | 'tool_result'
  metaJson: Record<string, any>
  createdAt: string
}

interface SharedTool {
  id: string
  roomId: string
  sharedBy: string
  sharedByUser?: {
    fullName: string
    avatarUrl: string
  }
  toolType: 'quiz' | 'flashcards' | 'notes'
  studyPackId: string
  studyPack?: {
    title: string
  }
  quizId?: string
  messageId?: string
  createdAt: string
  completionCount?: number
  totalMembers?: number
}

interface ToolCompletion {
  id: string
  sharedToolId: string
  userId: string
  user?: {
    fullName: string
  }
  resultJson: {
    score?: number
    cardsReviewed?: number
  }
  completedAt: string
}

interface RoomInvite {
  id: string
  roomId: string
  room?: {
    name: string
  }
  invitedBy: string
  invitedByUser?: {
    fullName: string
  }
  invitedEmail?: string
  invitedUserId?: string
  inviteCode: string
  status: 'pending' | 'accepted' | 'declined' | 'expired'
  createdAt: string
  expiresAt: string
}

interface TimerState {
  isRunning: boolean
  isBreak: boolean
  remainingSeconds: number
  startedAt?: string
}

interface PresenceState {
  oderId: string
  status: 'idle' | 'studying' | 'break'
  lastSeen: string
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Room creation assigns creator and sets defaults
*For any* valid room creation request, the created room should have the requesting user as creator with admin privileges, and default Pomodoro values of 25 minutes work and 5 minutes break.
**Validates: Requirements 1.3, 1.4**

### Property 2: Empty room names are rejected
*For any* room creation request with an empty or whitespace-only name, the system should reject the request and return a validation error.
**Validates: Requirements 1.5**

### Property 3: Room list contains required fields
*For any* room in the user's room list, the display data should include room name, member count, online member count, and last activity timestamp.
**Validates: Requirements 2.2**

### Property 4: Shared tab displays all shared tools
*For any* room with shared tools, the Shared tab should display all tools that have been shared in that room.
**Validates: Requirements 3.4, 9.1**

### Property 5: Creator sees timer controls, non-creators see read-only
*For any* room view, if the user is the creator they should see global timer controls, otherwise they should see the timer in read-only mode.
**Validates: Requirements 4.1, 4.5**

### Property 6: Timer state transitions correctly on completion
*For any* timer that reaches zero, if it was in work mode it should transition to break mode, and if it was in break mode it should transition to work mode.
**Validates: Requirements 4.4**

### Property 7: Personal timer isolation
*For any* user's personal timer action (start, pause, edit), only that user's timer state should be affected, not other users' timers.
**Validates: Requirements 5.2, 5.3, 5.4**

### Property 8: Chat messages contain required metadata
*For any* chat message displayed, it should include the sender's name, avatar, and timestamp.
**Validates: Requirements 6.2**

### Property 9: Tool share creates message and shared tab entry
*For any* tool share action, a chat message with action button should be created, and the tool should appear in the Shared tab.
**Validates: Requirements 7.3, 7.4, 7.5**

### Property 10: Tool modal renders correct component
*For any* shared tool opened in a modal, the modal should render the appropriate component (FlashcardsTab for flashcards, QuizTab for quizzes, NotesTab for notes).
**Validates: Requirements 8.2**

### Property 11: Quiz completion posts result to chat
*For any* quiz completed in a tool modal, a result message should be posted to the room chat with the user's score.
**Validates: Requirements 8.3, 13.4**

### Property 12: Tool progress is tracked per user
*For any* shared tool with multiple users interacting, each user's progress and completion should be tracked independently.
**Validates: Requirements 8.5**

### Property 13: Shared tools display completion statistics
*For any* shared tool in the Shared tab, it should display the tool name, type, sharer name, and completion count.
**Validates: Requirements 9.2**

### Property 14: Shared tool filter returns matching types only
*For any* filter applied to shared tools, the results should only contain tools of the selected type.
**Validates: Requirements 9.4**

### Property 15: Member display includes presence data
*For any* member displayed in the sidebar, it should show avatar, name, and online status, and show "Studying" status when their timer is running.
**Validates: Requirements 10.2, 10.4**

### Property 16: Join/leave events create system messages
*For any* member join or leave event, a system message should be posted to the room chat.
**Validates: Requirements 10.5**

### Property 17: Invite creates record for valid email
*For any* invite sent to a valid email, an invitation record should be created with pending status.
**Validates: Requirements 11.3**

### Property 18: Accepted invite adds user to room
*For any* accepted invite (via button or link), the invited user should become a member of the room.
**Validates: Requirements 11.5, 11.6**

### Property 19: Room settings update persists changes
*For any* settings update by the room creator, the changes to background theme, timer duration, or privacy should be persisted.
**Validates: Requirements 12.2**

### Property 20: Member removal revokes access
*For any* member removed by the room creator, that user should no longer have access to the room.
**Validates: Requirements 12.3**

### Property 21: Room deletion cascades to related data
*For any* room deletion, all associated data (members, messages, shared tools, invites) should be removed.
**Validates: Requirements 12.4**

### Property 22: Background theme applies correctly
*For any* selected background theme, the corresponding background image should be applied to the room interface.
**Validates: Requirements 14.2**

## Error Handling

### API Error Responses

All API routes return consistent error responses:

```typescript
interface ApiError {
  error: string
  code: string
  details?: Record<string, any>
}
```

Error codes:
- `UNAUTHORIZED` - User not authenticated
- `FORBIDDEN` - User lacks permission
- `NOT_FOUND` - Resource not found
- `VALIDATION_ERROR` - Invalid input data
- `ROOM_FULL` - Room has reached member limit (if implemented)
- `INVITE_EXPIRED` - Invite link has expired
- `ALREADY_MEMBER` - User is already a room member

### Real-time Error Handling

- Connection loss: Show reconnecting indicator, auto-reconnect with exponential backoff
- Message send failure: Show retry button, queue messages for retry
- Presence sync failure: Gracefully degrade to showing all members as offline

### UI Error States

- Room not found: Redirect to /rooms with error toast
- Permission denied: Show access denied message with option to request invite
- Tool load failure: Show error in modal with retry button

## Testing Strategy

### Unit Testing

Unit tests will be written using Jest for:
- Service methods (RoomService, ChatService, etc.)
- Utility functions (timer calculations, invite code generation)
- Component rendering (using React Testing Library)

### Property-Based Testing

Property-based tests will be written using fast-check for:
- Room creation validation (Property 1, 2)
- Timer state transitions (Property 6)
- Tool sharing flow (Property 9)
- Filter functionality (Property 14)
- Cascade deletion (Property 21)

Each property test will:
- Generate random valid inputs
- Execute the operation
- Verify the property holds
- Run minimum 100 iterations
- Be tagged with the property number: `**Feature: study-rooms, Property {N}: {description}**`

### Integration Testing

Integration tests for:
- Real-time message delivery
- Presence synchronization
- Invite notification delivery
- Timer synchronization across clients

### E2E Testing

End-to-end tests using Playwright for critical flows:
- Room creation and joining
- Tool sharing and completion
- Invite flow (send, receive notification, accept)
