# Implementation Plan

- [ ] 1. Database Schema and Types
  - [x] 1.1 Create database migration for study rooms tables
    - Create `study_rooms` table with all columns (id, name, creator_id, background_theme, privacy, pomodoro settings, invite_code)
    - Create `room_members` table with room_id, user_id, joined_at
    - Create `room_messages` table with message_type enum and meta_json
    - Create `room_shared_tools` table linking to study_packs and quizzes
    - Create `room_tool_completions` table for tracking user completions
    - Create `room_invites` table with status enum and expiry
    - Create `room_timer_state` table for global timer sync
    - Add RLS policies for all tables (members can read room data, creators can update)
    - Add indexes for common queries (room_id lookups, user_id lookups)
    - _Requirements: 1.1, 1.2, 1.3, 6.1, 7.5, 11.3_

  - [x] 1.2 Create TypeScript types for rooms
    - Create `src/lib/types/rooms.ts` with Room, RoomMember, Message, SharedTool, ToolCompletion, RoomInvite, TimerState, PresenceState interfaces
    - Update `src/lib/types/database.ts` with new table types (run Supabase type generation)
    - _Requirements: 1.1, 6.2, 7.4, 10.2_

- [ ] 2. Core Room Services
  - [x] 2.1 Implement RoomService
    - Create `src/lib/services/RoomService.ts`
    - Implement `createRoom()` - creates room, adds creator as member, generates invite code
    - Implement `getRoom()` - fetches room with member count
    - Implement `getUserRooms()` - fetches all rooms user is member of with online counts
    - Implement `updateRoom()` - updates room settings (creator only)
    - Implement `deleteRoom()` - deletes room and cascades (creator only)
    - Implement `joinRoom()` - adds user as member
    - Implement `leaveRoom()` - removes user from room
    - Implement `removeMember()` - creator removes another member
    - _Requirements: 1.2, 1.3, 2.2, 12.2, 12.3, 12.4_

  - [x] 2.2 Write property tests for RoomService
    - **Property 1: Room creation assigns creator and sets defaults**
    - **Property 2: Empty room names are rejected**
    - **Property 21: Room deletion cascades to related data**
    - **Validates: Requirements 1.3, 1.4, 1.5, 12.4**

  - [x] 2.3 Implement ChatService
    - Create `src/lib/services/ChatService.ts`
    - Implement `sendMessage()` - creates message record
    - Implement `sendSystemMessage()` - creates system message (join/leave/tool result)
    - Implement `getMessages()` - fetches paginated message history
    - Implement `subscribeToMessages()` - Supabase Realtime subscription for new messages
    - _Requirements: 6.1, 6.2, 10.5_

  - [x] 2.4 Write property tests for ChatService
    - **Property 8: Chat messages contain required metadata**
    - **Property 16: Join/leave events create system messages**
    - **Validates: Requirements 6.2, 10.5**

  - [x] 2.5 Implement TimerService
    - Create `src/lib/services/TimerService.ts`
    - Implement `getGlobalTimerState()` - fetches current timer state
    - Implement `updateGlobalTimer()` - updates timer state (start, pause, reset)
    - Implement `subscribeToGlobalTimer()` - Supabase Realtime subscription for timer sync
    - Implement timer state transition logic (work → break → work)
    - _Requirements: 4.2, 4.3, 4.4_

  - [x] 2.6 Write property tests for TimerService
    - **Property 6: Timer state transitions correctly on completion**
    - **Validates: Requirements 4.4**

  - [x] 2.7 Implement PresenceService
    - Create `src/lib/services/PresenceService.ts`
    - Implement `trackPresence()` - joins Supabase Presence channel
    - Implement `subscribeToPresence()` - subscribes to presence changes
    - Implement `updateStatus()` - updates user status (idle, studying, break)
    - _Requirements: 10.2, 10.3, 10.4_

  - [x] 2.8 Implement InviteService
    - Create `src/lib/services/InviteService.ts`
    - Implement `createInvite()` - creates invite record, triggers real-time notification
    - Implement `getInviteByCode()` - fetches invite by code
    - Implement `acceptInvite()` - marks accepted, adds user to room
    - Implement `declineInvite()` - marks declined
    - Implement `getPendingInvites()` - fetches user's pending invites
    - Implement `subscribeToInvites()` - Supabase Realtime for new invites
    - _Requirements: 11.2, 11.3, 11.5, 11.6_

  - [x] 2.9 Write property tests for InviteService
    - **Property 17: Invite creates record for valid email**
    - **Property 18: Accepted invite adds user to room**
    - **Validates: Requirements 11.3, 11.5, 11.6**

  - [x] 2.10 Implement SharedToolService
    - Create `src/lib/services/SharedToolService.ts`
    - Implement `shareTool()` - creates shared tool record and chat message
    - Implement `getSharedTools()` - fetches all shared tools with completion counts
    - Implement `recordCompletion()` - records user completion with result
    - Implement `getCompletions()` - fetches completions for a shared tool
    - _Requirements: 7.3, 7.5, 8.3, 8.5, 9.1_

  - [x] 2.11 Write property tests for SharedToolService
    - **Property 9: Tool share creates message and shared tab entry**
    - **Property 11: Quiz completion posts result to chat**
    - **Property 12: Tool progress is tracked per user**
    - **Validates: Requirements 7.3, 7.5, 8.3, 8.5**

- [ ] 3. API Routes
  - [x] 3.1 Implement rooms API routes
    - Create `src/app/api/rooms/route.ts` - GET (list rooms), POST (create room)
    - Create `src/app/api/rooms/[id]/route.ts` - GET, PATCH, DELETE
    - Add authentication middleware, validate creator for updates/deletes
    - _Requirements: 1.2, 2.1, 12.2, 12.4_

  - [x] 3.2 Implement room members API routes
    - Create `src/app/api/rooms/[id]/members/route.ts` - GET, POST (join), DELETE (leave/remove)
    - Validate permissions for member removal
    - _Requirements: 10.1, 12.3_

  - [x] 3.3 Implement room chat API routes
    - Create `src/app/api/rooms/[id]/chat/route.ts` - GET (history), POST (send message)
    - _Requirements: 6.1, 6.4_

  - [x] 3.4 Implement room timer API routes
    - Create `src/app/api/rooms/[id]/timer/route.ts` - GET, POST (update state)
    - Validate creator permission for updates
    - _Requirements: 4.1, 4.2, 4.3_

  - [x] 3.5 Implement room invite API routes
    - Create `src/app/api/rooms/[id]/invite/route.ts` - GET (invite link), POST (send invite)
    - Create `src/app/api/invites/route.ts` - GET (pending invites for user)
    - Create `src/app/api/invites/[code]/route.ts` - GET (invite details), POST (accept)
    - _Requirements: 11.1, 11.2, 11.5, 11.6_

  - [x] 3.6 Implement shared tools API routes
    - Create `src/app/api/rooms/[id]/shared-tools/route.ts` - GET, POST
    - _Requirements: 7.3, 9.1_

- [ ] 4. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Room List Page and Navigation
  - [x] 5.1 Add Rooms link to navbar
    - Update `src/components/layout/Navbar.tsx` to add "Rooms" link
    - Update `src/components/layout/NavbarClient.tsx` with Rooms navigation item
    - Link should navigate to `/rooms`
    - _Requirements: 2.1_

  - [x] 5.2 Create RoomCard component
    - Create `src/components/rooms/RoomCard.tsx`
    - Display room name, member count, online count, last activity
    - Show online indicator (green dot) when members are online
    - Clickable to navigate to room
    - _Requirements: 2.2, 2.3_

  - [x] 5.3 Write property test for RoomCard
    - **Property 3: Room list contains required fields**
    - **Validates: Requirements 2.2**

  - [x] 5.4 Create CreateRoomModal component
    - Create `src/components/rooms/CreateRoomModal.tsx`
    - Form fields: room name, background theme selector, privacy toggle, Pomodoro duration
    - Validation for empty name
    - Calls RoomService.createRoom on submit
    - _Requirements: 1.1, 1.5_

  - [x] 5.5 Create BackgroundSelector component
    - Create `src/components/rooms/BackgroundSelector.tsx`
    - Display theme options: Forest, Library, Cafe, Space, Minimal
    - Show preview thumbnails for each theme
    - _Requirements: 14.1_

  - [x] 5.6 Create Rooms list page
    - Create `src/app/rooms/page.tsx` (server component)
    - Create `src/app/rooms/RoomsClient.tsx` (client component)
    - Fetch user's rooms via RoomService
    - Display RoomCard grid
    - "Create Room" button opens CreateRoomModal
    - Empty state when no rooms
    - _Requirements: 2.1, 2.2, 2.4_

- [ ] 6. Room Interface - Layout and Background
  - [x] 6.1 Create RoomInterface component
    - Create `src/components/rooms/RoomInterface.tsx`
    - Full-screen layout with background image
    - Tab navigation: "Room" and "Shared" tabs
    - Settings button (visible to creator only)
    - Invite button
    - Leave room button
    - _Requirements: 3.1, 3.2, 3.5_

  - [x] 6.2 Write property test for background theme
    - **Property 22: Background theme applies correctly**
    - **Validates: Requirements 14.2**

  - [x] 6.3 Create Room page
    - Create `src/app/rooms/[id]/page.tsx` (server component)
    - Create `src/app/rooms/[id]/RoomClient.tsx` (client component)
    - Fetch room data, verify membership
    - Initialize real-time subscriptions (presence, chat, timer)
    - Render RoomInterface
    - _Requirements: 3.1, 3.2, 3.3_

- [ ] 7. Room Tab - Timers
  - [x] 7.1 Create GlobalTimer component
    - Create `src/components/rooms/GlobalTimer.tsx`
    - Display countdown timer with work/break indicator
    - Creator controls: Start, Pause, Reset, Edit duration
    - Non-creator: Read-only display
    - Subscribe to timer state changes
    - _Requirements: 4.1, 4.2, 4.4, 4.5_

  - [x] 7.2 Write property test for timer controls visibility
    - **Property 5: Creator sees timer controls, non-creators see read-only**
    - **Validates: Requirements 4.1, 4.5**

  - [x] 7.3 Create PersonalTimer component
    - Create `src/components/rooms/PersonalTimer.tsx`
    - Local state timer with Start, Pause, Reset controls
    - Edit duration option
    - Callback to update presence status when timer starts/stops
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [x] 7.4 Write property test for personal timer isolation
    - **Property 7: Personal timer isolation**
    - **Validates: Requirements 5.2, 5.3, 5.4**

- [ ] 8. Room Tab - Chat
  - [x] 8.1 Create ChatMessage component
    - Create `src/components/rooms/ChatMessage.tsx`
    - Display sender avatar, name, message content, timestamp
    - Different styling for own messages vs others
    - System message styling (join/leave)
    - _Requirements: 6.2_

  - [x] 8.2 Create ToolShareMessage component
    - Create `src/components/rooms/ToolShareMessage.tsx`
    - Display tool type icon, tool name, sharer name
    - Action button: "Take Quiz" / "Review Cards" / "View Notes"
    - Completion indicator if user has completed
    - _Requirements: 7.4_

  - [x] 8.3 Create ShareToolButton component
    - Create `src/components/rooms/ShareToolButton.tsx`
    - Dropdown with tool type options (Quiz, Flashcards, Notes)
    - Opens ShareToolModal on selection
    - _Requirements: 7.1_

  - [x] 8.4 Create ShareToolModal component
    - Create `src/components/rooms/ShareToolModal.tsx`
    - List user's study packs
    - Show available tools of selected type in each pack
    - Confirm button to share
    - _Requirements: 7.2_

  - [x] 8.5 Create RoomChat component
    - Create `src/components/rooms/RoomChat.tsx`
    - Message list with auto-scroll
    - Render ChatMessage or ToolShareMessage based on type
    - Input field with send button
    - ShareToolButton in input area
    - Subscribe to new messages
    - _Requirements: 6.1, 6.2, 6.4, 7.1_
 
- [ ] 9. Room Tab - Presence
  - [x] 9.1 Create MemberSidebar component
    - Create `src/components/rooms/MemberSidebar.tsx`
    - List all room members with avatars
    - Online indicator (green/gray dot)
    - Status text (Studying, Break, Idle)
    - Subscribe to presence changes
    - _Requirements: 10.1, 10.2, 10.3, 10.4_

  - [x] 9.2 Write property test for member display
    - **Property 15: Member display includes presence data**
    - **Validates: Requirements 10.2, 10.4**

  - [x] 9.3 Create RoomTab component
    - Create `src/components/rooms/RoomTab.tsx`
    - Layout: Timers at top, Chat in center, MemberSidebar on right
    - Compose GlobalTimer, PersonalTimer, RoomChat, MemberSidebar
    - _Requirements: 3.3_

- [ ] 10. Shared Tab
  - [x] 10.1 Create SharedTab component
    - Create `src/components/rooms/SharedTab.tsx`
    - List all shared tools with ToolShareMessage component
    - Filter dropdown: All, Quizzes, Flashcards, Notes
    - Show completion stats (e.g., "3/5 completed")
    - Click opens ToolModal
    - _Requirements: 3.4, 9.1, 9.2, 9.4_

  - [x] 10.2 Write property tests for SharedTab
    - **Property 4: Shared tab displays all shared tools**
    - **Property 13: Shared tools display completion statistics**
    - **Property 14: Shared tool filter returns matching types only**
    - **Validates: Requirements 3.4, 9.1, 9.2, 9.4**

- [x] 11. Tool Modal
  - [x] 11.1 Create ToolModal component
    - Create `src/components/rooms/ToolModal.tsx`
    - Modal wrapper with close button
    - Render FlashcardsTab, QuizTab, or NotesTab based on tool type
    - Pass study pack ID and quiz ID to child components
    - On quiz completion, call SharedToolService.recordCompletion and post result to chat
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

  - [x] 11.2 Write property test for tool modal rendering
    - **Property 10: Tool modal renders correct component**
    - **Validates: Requirements 8.2**

- [ ] 12. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 13. Invitations
  - [ ] 13.1 Create InviteModal component
    - Create `src/components/rooms/InviteModal.tsx`
    - Display copyable invite link
    - Email input field with send button
    - List of pending invites
    - _Requirements: 11.1, 11.2_

  - [ ] 13.2 Create InviteNotification component
    - Create `src/components/rooms/InviteNotification.tsx`
    - Popup notification with room name, inviter name
    - Accept and Decline buttons
    - Auto-dismiss after timeout if not interacted
    - _Requirements: 11.4_

  - [ ] 13.3 Add InviteNotification to global layout
    - Update `src/app/layout.tsx` to include InviteNotificationProvider
    - Create `src/lib/contexts/InviteNotificationContext.tsx`
    - Subscribe to user's invite channel on mount
    - Display InviteNotification when invite received
    - _Requirements: 11.4_

  - [ ] 13.4 Create invite link join page
    - Create `src/app/rooms/join/[code]/page.tsx`
    - Validate invite code
    - If logged in: show room preview, join button
    - If not logged in: redirect to login with return URL
    - On join: add to room, redirect to room page
    - _Requirements: 11.6_

- [ ] 14. Room Settings
  - [ ] 14.1 Create RoomSettings component
    - Create `src/components/rooms/RoomSettings.tsx`
    - Slide-out panel or modal
    - Edit: background theme, Pomodoro duration, privacy
    - Member management: list members, remove button
    - Delete room button with confirmation
    - _Requirements: 12.1, 12.2, 12.3, 12.4_

  - [ ] 14.2 Write property tests for room settings
    - **Property 19: Room settings update persists changes**
    - **Property 20: Member removal revokes access**
    - **Validates: Requirements 12.2, 12.3**

- [ ] 15. Notifications
  - [ ] 15.1 Implement in-room notifications
    - Create notification toast component for room events
    - Show notification when tool is shared
    - Show notification when global timer starts/ends
    - Show notification when member joins/leaves
    - _Requirements: 13.1, 13.2_

- [ ] 16. Background Assets
  - [ ] 16.1 Add background theme images
    - Add background images to `public/rooms/backgrounds/`
    - Images: forest.jpg, library.jpg, cafe.jpg, space.jpg, minimal.jpg
    - Optimize images for web (compress, appropriate resolution)
    - _Requirements: 14.2, 14.3_

- [ ] 17. Final Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
