# Requirements Document

## Introduction

Study Rooms (working name: "Study Orbit" or similar Sappio-branded name) is a collaborative study feature that combines virtual study rooms with real-time tool sharing. Users can create persistent rooms with calming backgrounds, dual timer systems (personal and group), and share study tools (flashcards, quizzes, notes) through an integrated chat interface. Shared tools open in modals, keeping users present in the room context. The feature includes real-time presence, notifications, and invite functionality.

## Glossary

- **Study Room**: A persistent virtual space where users can study together, featuring backgrounds, timers, chat, and tool sharing
- **Room Creator**: The user who created the room and has administrative privileges (edit settings, manage members, control global timer)
- **Room Member**: A user who has joined a room and can participate in chat and tool sharing
- **Global Timer**: A synchronized Pomodoro timer controlled by the room creator, visible to all members
- **Personal Timer**: An individual Pomodoro timer each user controls for themselves
- **Shared Tool**: A study resource (quiz, flashcards, notes) shared through chat that others can interact with
- **Tool Modal**: A popup interface that displays shared tools without leaving the room context
- **Presence**: Real-time status showing which members are online and their current activity
- **Room Invite**: An invitation to join a room, delivered via link or real-time notification

## Requirements

### Requirement 1: Room Creation

**User Story:** As a user, I want to create a study room, so that I can have a dedicated space to study with others.

#### Acceptance Criteria

1. WHEN a user clicks "Create Room" from the Rooms page THEN the System SHALL display a creation modal with room name, background theme selection, privacy setting, and default Pomodoro duration fields
2. WHEN a user submits valid room creation data THEN the System SHALL create the room and redirect the user to the new room page at `/rooms/{room-id}`
3. WHEN a user creates a room THEN the System SHALL assign them as the room creator with administrative privileges
4. WHEN a room is created THEN the System SHALL set default values of 25 minutes work and 5 minutes break for the Pomodoro timer
5. WHEN a user attempts to create a room with an empty name THEN the System SHALL prevent creation and display a validation error

### Requirement 2: Room Discovery and Navigation

**User Story:** As a user, I want to see and access my study rooms, so that I can easily join ongoing or past study sessions.

#### Acceptance Criteria

1. WHEN a user clicks "Rooms" in the navbar THEN the System SHALL navigate to `/rooms` and display a list of rooms the user has created or joined
2. WHEN displaying the rooms list THEN the System SHALL show room name, member count, online member count, and last activity timestamp for each room
3. WHEN a user clicks on a room card THEN the System SHALL navigate to that room's page at `/rooms/{room-id}`
4. WHEN a user has no rooms THEN the System SHALL display an empty state with a prompt to create their first room

### Requirement 3: Room Interface Layout

**User Story:** As a user, I want a calming and organized room interface, so that I can focus on studying without distractions.

#### Acceptance Criteria

1. WHEN a user enters a room THEN the System SHALL display a full-screen interface with the selected background theme
2. WHEN displaying the room interface THEN the System SHALL show tab navigation with "Room" and "Shared" tabs at the top
3. WHEN on the Room tab THEN the System SHALL display the global timer, personal timer, chat area, and member presence sidebar
4. WHEN on the Shared tab THEN the System SHALL display a list of all tools shared in the room with completion statistics
5. WHEN the room has a background theme THEN the System SHALL render the calming background image behind all UI elements

### Requirement 4: Global Timer (Room Creator)

**User Story:** As a room creator, I want to control a global timer, so that I can coordinate study sessions for all members.

#### Acceptance Criteria

1. WHEN a room creator views the room THEN the System SHALL display global timer controls (start, pause, reset, edit duration)
2. WHEN a room creator starts the global timer THEN the System SHALL synchronize the countdown across all connected members in real-time
3. WHEN a room creator edits the global timer duration THEN the System SHALL update the duration for all members
4. WHEN the global timer reaches zero THEN the System SHALL notify all members and automatically switch to break mode
5. WHEN a non-creator member views the room THEN the System SHALL display the global timer in read-only mode without controls

### Requirement 5: Personal Timer

**User Story:** As a user, I want my own personal timer, so that I can manage my individual study rhythm within the group.

#### Acceptance Criteria

1. WHEN a user views the room THEN the System SHALL display a personal timer with start, pause, and reset controls
2. WHEN a user starts their personal timer THEN the System SHALL begin countdown only for that user without affecting others
3. WHEN a user's personal timer reaches zero THEN the System SHALL notify only that user of the break
4. WHEN a user edits their personal timer duration THEN the System SHALL update only their timer settings

### Requirement 6: Real-time Chat

**User Story:** As a user, I want to chat with room members, so that I can communicate and coordinate during study sessions.

#### Acceptance Criteria

1. WHEN a user sends a chat message THEN the System SHALL broadcast the message to all room members in real-time
2. WHEN a chat message is received THEN the System SHALL display it with the sender's name, avatar, and timestamp
3. WHEN a user is typing THEN the System SHALL show a typing indicator to other members
4. WHEN displaying the chat THEN the System SHALL auto-scroll to the newest message while allowing scroll-back through history

### Requirement 7: Tool Sharing via Chat

**User Story:** As a user, I want to share study tools through chat, so that others can easily access and use them.

#### Acceptance Criteria

1. WHEN a user clicks "Share Tool" in the chat input THEN the System SHALL display a dropdown with options for Quiz, Flashcards, and Notes
2. WHEN a user selects a tool type THEN the System SHALL display a modal showing their study packs and available tools of that type
3. WHEN a user confirms sharing a tool THEN the System SHALL post a special chat message with the tool name and an action button
4. WHEN a shared tool message is displayed THEN the System SHALL show the sharer's name, tool type icon, tool name, and "Take Quiz" / "Review Cards" / "View Notes" button
5. WHEN a user shares a tool THEN the System SHALL add it to the Shared tab automatically

### Requirement 8: Tool Modal Interaction

**User Story:** As a user, I want to interact with shared tools in a modal, so that I can study without leaving the room.

#### Acceptance Criteria

1. WHEN a user clicks the action button on a shared tool message THEN the System SHALL open a modal containing the full tool interface
2. WHEN a tool modal is open THEN the System SHALL display the existing flashcard, quiz, or notes component within the modal
3. WHEN a user completes a quiz in the modal THEN the System SHALL post their result to the chat automatically
4. WHEN a user closes the tool modal THEN the System SHALL return them to the room view without navigation
5. WHEN multiple users interact with the same shared tool THEN the System SHALL track individual progress separately

### Requirement 9: Shared Tab

**User Story:** As a user, I want to see all shared tools in one place, so that I can easily find and access them without scrolling through chat.

#### Acceptance Criteria

1. WHEN a user switches to the Shared tab THEN the System SHALL display all tools shared in the room
2. WHEN displaying shared tools THEN the System SHALL show tool name, type, sharer name, and completion count (e.g., "3/5 completed")
3. WHEN a user clicks a tool in the Shared tab THEN the System SHALL open the tool modal
4. WHEN filtering shared tools THEN the System SHALL allow filtering by type (All, Quizzes, Flashcards, Notes)

### Requirement 10: Member Presence

**User Story:** As a user, I want to see who is in the room and their status, so that I know who I'm studying with.

#### Acceptance Criteria

1. WHEN a user enters a room THEN the System SHALL display a member sidebar showing all room members
2. WHEN displaying members THEN the System SHALL show avatar, name, and online status (green dot for online, gray for offline)
3. WHEN a member's status changes THEN the System SHALL update the presence indicator in real-time
4. WHEN a member starts their timer THEN the System SHALL show "Studying" status next to their name
5. WHEN a member joins or leaves THEN the System SHALL post a system message in chat

### Requirement 11: Room Invitations

**User Story:** As a user, I want to invite others to my room, so that I can study with friends.

#### Acceptance Criteria

1. WHEN a user clicks "Invite" in a room THEN the System SHALL display a modal with invite options
2. WHEN viewing the invite modal THEN the System SHALL show a copyable invite link and an email input field
3. WHEN a user enters an email and sends an invite THEN the System SHALL create an invitation record and deliver a real-time notification to the invitee if they are online
4. WHEN an invited user is online THEN the System SHALL display a popup notification with room name and accept/decline buttons
5. WHEN an invited user accepts THEN the System SHALL add them to the room and redirect them to the room page
6. WHEN an invited user clicks an invite link THEN the System SHALL add them to the room after authentication

### Requirement 12: Room Settings

**User Story:** As a room creator, I want to manage room settings, so that I can customize the room experience.

#### Acceptance Criteria

1. WHEN a room creator clicks the settings icon THEN the System SHALL display a settings panel
2. WHEN editing settings THEN the System SHALL allow changing background theme, global timer duration, and room privacy
3. WHEN a room creator removes a member THEN the System SHALL remove them from the room and revoke their access
4. WHEN a room creator deletes the room THEN the System SHALL remove the room and all associated data after confirmation

### Requirement 13: Notifications

**User Story:** As a user, I want to receive notifications about room activity, so that I stay informed about what's happening.

#### Acceptance Criteria

1. WHEN a tool is shared in a room the user is in THEN the System SHALL display an in-app notification
2. WHEN the global timer starts or ends THEN the System SHALL notify all room members
3. WHEN a user receives a room invite THEN the System SHALL display a real-time popup notification
4. WHEN a user completes a shared tool THEN the System SHALL post the result to chat as a system message

### Requirement 14: Background Themes

**User Story:** As a user, I want calming background options, so that the room feels relaxing and conducive to focus.

#### Acceptance Criteria

1. WHEN creating or editing a room THEN the System SHALL offer background theme options including Forest, Library, Cafe, Space, and Minimal
2. WHEN a background is selected THEN the System SHALL apply the corresponding high-quality image as the room background
3. WHEN displaying the background THEN the System SHALL apply appropriate overlay opacity to ensure UI readability

