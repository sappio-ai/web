# Design Document

## Overview

This design document outlines the implementation of the Mind Map System and Export System for Sappio V2. The Mind Map System provides an interactive, hierarchical visualization of study content with editing capabilities and content generation from branches. The Export System enables users to export their study materials in multiple formats with plan-based restrictions.

**Key Design Principles:**
- Leverage existing backend infrastructure (GenerationService already generates mind maps)
- Use React Flow or similar library for mind map visualization
- Implement plan-based restrictions at both API and UI levels
- Integrate Orb avatar system throughout the user experience
- Follow existing component patterns (tabs, cards, modals)
- Ensure accessibility (keyboard navigation, ARIA labels, high contrast)

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Next.js)                       │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  MindMapTab  │  │  NotesTab    │  │ FlashcardsTab│      │
│  │  Component   │  │  Component   │  │  Component   │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                 │                  │              │
│         └─────────────────┴──────────────────┘              │
│                           │                                 │
│         ┌─────────────────┴─────────────────┐               │
│         │                                   │               │
│  ┌──────▼──────────┐              ┌────────▼────────┐      │
│  │  MindMapViewer  │              │  ExportMenu     │      │
│  │  (React Flow)   │              │  Component      │      │
│  └──────┬──────────┘              └────────┬────────┘      │
│         │                                   │               │
│  ┌──────▼──────────┐              ┌────────▼────────┐      │
│  │  NodeEditor     │              │  ExportService  │      │
│  │  Component      │              │  (Client)       │      │
│  └─────────────────┘              └────────┬────────┘      │
└─────────────────────────────────────────────┼──────────────┘
                                              │
┌─────────────────────────────────────────────▼──────────────┐
│                     API Layer (Next.js)                     │
├─────────────────────────────────────────────────────────────┤
│  /api/mindmaps/:id                                          │
│  /api/mindmaps/:id/nodes/:nodeId                            │
│  /api/mindmaps/:id/branch/:nodeId/generate-cards            │
│  /api/mindmaps/:id/branch/:nodeId/generate-quiz             │
│  /api/exports/notes-pdf                                     │
│  /api/exports/flashcards-csv                                │
│  /api/exports/flashcards-anki                               │
│  /api/exports/mindmap-image                                 │
│  /api/exports/mindmap-markdown                              │
└─────────────────────────────────────────────┬───────────────┘
                                              │
┌─────────────────────────────────────────────▼──────────────┐
│                  Services & Utilities                       │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Generation  │  │  Export      │  │  Usage       │     │
│  │  Service     │  │  Service     │  │  Service     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────┬───────────────┘
                                              │
┌─────────────────────────────────────────────▼──────────────┐
│                  Database (Supabase)                        │
├─────────────────────────────────────────────────────────────┤
│  mindmaps (id, study_pack_id, title, layout_json)          │
│  mindmap_nodes (id, mindmap_id, parent_id, title, content) │
│  study_packs, flashcards, quizzes, users, plan_limits      │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. Mind Map Tab Component

**Location:** `src/components/study-packs/tabs/MindMapTab.tsx`

**Purpose:** Main container for the mind map view, handles data fetching and state management.

**Props:**
```typescript
interface MindMapTabProps {
  packId: string
}
```

**State:**
```typescript
{
  mindmap: MindMap | null
  nodes: MindMapNode[]
  isLoading: boolean
  error: string | null
  selectedNode: MindMapNode | null
  isEditing: boolean
  userPlan: 'free' | 'student_pro' | 'pro_plus'
  nodeLimit: number
}
```

**Key Responsibilities:**
- Fetch mind map data from API on mount
- Apply plan-based node limits
- Handle node selection and editing
- Coordinate with child components
- Display appropriate Orb avatars based on state

### 2. Mind Map Viewer Component

**Location:** `src/components/mindmap/MindMapViewer.tsx`

**Purpose:** Renders the interactive mind map using React Flow library.

**Props:**
```typescript
interface MindMapViewerProps {
  nodes: MindMapNode[]
  onNodeClick: (node: MindMapNode) => void
  onNodeDragEnd: (nodeId: string, newParentId: string | null) => void
  onBranchCollapse: (nodeId: string, collapsed: boolean) => void
  collapsedNodes: Set<string>
  selectedNodeId: string | null
  readOnly: boolean
}
```

**Features:**
- Hierarchical tree layout (top-down or left-right)
- Zoom controls (zoom in, zoom out, fit view)
- Pan controls (drag canvas)
- Node highlighting on hover
- Expand/collapse branches
- Drag-and-drop re-parenting
- Keyboard navigation (arrow keys, Enter, Escape)

**React Flow Configuration:**
```typescript
const nodeTypes = {
  mindmapNode: MindMapNodeComponent
}

const edgeTypes = {
  mindmapEdge: MindMapEdgeComponent
}

const defaultViewport = { x: 0, y: 0, zoom: 1 }
```

### 3. Mind Map Node Component

**Location:** `src/components/mindmap/MindMapNode.tsx`

**Purpose:** Custom React Flow node component for rendering individual mind map nodes.

**Props:**
```typescript
interface MindMapNodeProps {
  data: {
    node: MindMapNode
    isSelected: boolean
    isCollapsed: boolean
    hasChildren: boolean
    onToggleCollapse: () => void
    onEdit: () => void
    onGenerateCards: () => void
    onGenerateQuiz: () => void
  }
}
```

**Visual Design:**
- Card-style container with gradient background
- Title (bold, 16px)
- Content preview (truncated, 14px, gray)
- Expand/collapse icon (if has children)
- Action menu button (three dots)
- Hover state with glow effect
- Selected state with border highlight

### 4. Node Editor Component

**Location:** `src/components/mindmap/NodeEditor.tsx`

**Purpose:** Inline or modal editor for modifying node title and content.

**Props:**
```typescript
interface NodeEditorProps {
  node: MindMapNode
  onSave: (nodeId: string, updates: Partial<MindMapNode>) => Promise<void>
  onCancel: () => void
  mode: 'inline' | 'modal'
}
```

**Features:**
- Title input (3-100 characters)
- Content textarea (0-500 characters)
- Character count display
- Save/Cancel buttons
- Validation feedback
- Organizing Orb avatar

### 5. Node Action Menu Component

**Location:** `src/components/mindmap/NodeActionMenu.tsx`

**Purpose:** Context menu for node actions (edit, generate content, delete).

**Props:**
```typescript
interface NodeActionMenuProps {
  node: MindMapNode
  onEdit: () => void
  onGenerateCards: () => void
  onGenerateQuiz: () => void
  onDelete: () => void
  userPlan: string
}
```

**Actions:**
- Edit Node
- Generate Flashcards from Branch
- Generate Quiz from Branch
- Delete Node (with confirmation)

### 6. Export Menu Component

**Location:** `src/components/exports/ExportMenu.tsx`

**Purpose:** Dropdown menu for export options with plan-based restrictions.

**Props:**
```typescript
interface ExportMenuProps {
  studyPackId: string
  mindmapId?: string
  exportType: 'notes' | 'flashcards' | 'mindmap'
  userPlan: string
  onExportStart: (type: string) => void
  onExportComplete: (type: string, url: string) => void
  onExportError: (type: string, error: string) => void
}
```

**Export Options:**
- **Notes:** PDF (all plans)
- **Flashcards:** CSV (all plans), Anki (Student Pro+)
- **Mind Map:** PNG, SVG, Markdown (all plans)

### 7. Export Service (Client)

**Location:** `src/lib/services/ExportService.ts`

**Purpose:** Client-side service for handling export requests and downloads.

**Methods:**
```typescript
class ExportService {
  static async exportNotesToPDF(studyPackId: string): Promise<Blob>
  static async exportFlashcardsToCSV(studyPackId: string): Promise<Blob>
  static async exportFlashcardsToAnki(studyPackId: string): Promise<Blob>
  static async exportMindMapToImage(mindmapId: string, format: 'png' | 'svg'): Promise<Blob>
  static async exportMindMapToMarkdown(mindmapId: string): Promise<Blob>
  static downloadBlob(blob: Blob, filename: string): void
}
```

### 8. Export Service (Server)

**Location:** `src/lib/services/ExportService.server.ts`

**Purpose:** Server-side service for generating export files.

**Methods:**
```typescript
class ExportServiceServer {
  static async generateNotesPDF(studyPackId: string): Promise<Buffer>
  static async generateFlashcardsCSV(studyPackId: string): Promise<string>
  static async generateFlashcardsAnki(studyPackId: string): Promise<Buffer>
  static async generateMindMapMarkdown(mindmapId: string): Promise<string>
}
```

**Dependencies:**
- `jsPDF` or `puppeteer` for PDF generation
- `papaparse` for CSV generation
- `genanki` or custom implementation for Anki .apkg generation
- `html-to-image` or `dom-to-image` for mind map image export

## Data Models

### MindMap Type

```typescript
interface MindMap {
  id: string
  studyPackId: string
  title: string
  layoutJson: {
    nodes: any[] // React Flow node positions
  }
  createdAt: string
  updatedAt: string
}
```

### MindMapNode Type

```typescript
interface MindMapNode {
  id: string
  mindmapId: string
  parentId: string | null
  title: string
  content: string | null
  orderIndex: number
  sourceChunkIds: number[]
}
```

### Export Request Type

```typescript
interface ExportRequest {
  studyPackId?: string
  mindmapId?: string
  format: 'pdf' | 'csv' | 'anki' | 'png' | 'svg' | 'markdown'
  options?: {
    includeMetadata?: boolean
    imageQuality?: number
    paperSize?: 'a4' | 'letter'
  }
}
```

### Export Response Type

```typescript
interface ExportResponse {
  success: boolean
  downloadUrl?: string
  filename?: string
  error?: string
}
```

## API Endpoints

### Mind Map Endpoints

#### GET `/api/mindmaps/:id`

**Purpose:** Fetch mind map with all nodes

**Request:**
```typescript
// URL params
{ id: string }
```

**Response:**
```typescript
{
  mindmap: MindMap
  nodes: MindMapNode[]
  nodeCount: number
  nodeLimit: number // Based on user plan
}
```

**Authorization:** User must own the study pack

**Plan Enforcement:** Return only nodes up to plan limit

#### PATCH `/api/mindmaps/:id/nodes/:nodeId`

**Purpose:** Update node title, content, or parent

**Request:**
```typescript
{
  title?: string // 3-100 chars
  content?: string // 0-500 chars
  parentId?: string | null
}
```

**Response:**
```typescript
{
  success: boolean
  node: MindMapNode
}
```

**Validation:**
- Title required, 3-100 characters
- Content optional, max 500 characters
- Parent ID must exist (if not null)
- Prevent circular references

#### POST `/api/mindmaps/:id/branch/:nodeId/generate-cards`

**Purpose:** Generate flashcards from a node and its descendants

**Request:**
```typescript
{
  nodeId: string
}
```

**Response:**
```typescript
{
  success: boolean
  cardsGenerated: number
  message: string
}
```

**Process:**
1. Fetch node and all descendants
2. Collect source chunk IDs from nodes
3. Fetch chunks from database
4. Call GenerationService.generateFlashcards()
5. Check user plan limits
6. Return success with count

#### POST `/api/mindmaps/:id/branch/:nodeId/generate-quiz`

**Purpose:** Generate quiz questions from a node and its descendants

**Request:**
```typescript
{
  nodeId: string
}
```

**Response:**
```typescript
{
  success: boolean
  questionsGenerated: number
  quizId: string
  message: string
}
```

**Process:** Similar to generate-cards but calls GenerationService.generateQuiz()

### Export Endpoints

#### POST `/api/exports/notes-pdf`

**Purpose:** Export smart notes to PDF

**Request:**
```typescript
{
  studyPackId: string
}
```

**Response:**
```typescript
{
  success: boolean
  downloadUrl: string
  filename: string
}
```

**Process:**
1. Fetch study pack notes from stats_json
2. Generate PDF using jsPDF or puppeteer
3. Include all sections (overview, concepts, definitions, questions, pitfalls)
4. Apply Sappio branding and styling
5. Return download URL or stream file

#### POST `/api/exports/flashcards-csv`

**Purpose:** Export flashcards to CSV

**Request:**
```typescript
{
  studyPackId: string
}
```

**Response:**
```typescript
{
  success: boolean
  downloadUrl: string
  filename: string
}
```

**CSV Format:**
```csv
front,back,kind,topic,ease,interval_days,reps,lapses
"Question 1","Answer 1","qa","Topic A",2.5,0,0,0
"Question 2","Answer 2","cloze","Topic B",2.5,0,0,0
```

#### POST `/api/exports/flashcards-anki`

**Purpose:** Export flashcards to Anki .apkg format (Student Pro+)

**Request:**
```typescript
{
  studyPackId: string
}
```

**Response:**
```typescript
{
  success: boolean
  downloadUrl: string
  filename: string
}
```

**Plan Check:** Return 403 if user is on Free plan

**Process:**
1. Fetch all flashcards for study pack
2. Create Anki deck with study pack title
3. Add cards with front/back fields
4. Include topic tags
5. Generate .apkg file
6. Return download URL

#### POST `/api/exports/mindmap-image`

**Purpose:** Export mind map to PNG or SVG

**Request:**
```typescript
{
  mindmapId: string
  format: 'png' | 'svg'
  quality?: number // 1-100 for PNG
}
```

**Response:**
```typescript
{
  success: boolean
  downloadUrl: string
  filename: string
}
```

**Process:**
1. Render mind map on server using puppeteer or similar
2. Capture as image (PNG) or vector (SVG)
3. Return download URL

**Alternative:** Client-side export using html-to-image library

#### POST `/api/exports/mindmap-markdown`

**Purpose:** Export mind map to Markdown

**Request:**
```typescript
{
  mindmapId: string
}
```

**Response:**
```typescript
{
  success: boolean
  downloadUrl: string
  filename: string
}
```

**Markdown Format:**
```markdown
# Mind Map Title

## Root Node
Content of root node

### Child Node 1
Content of child node 1

#### Grandchild Node 1.1
Content of grandchild node 1.1

### Child Node 2
Content of child node 2
```

## Error Handling

### Client-Side Error Handling

**Error Types:**
- Network errors (fetch failures)
- Validation errors (invalid input)
- Authorization errors (403)
- Plan limit errors (paywall)
- Server errors (500)

**Error Display:**
- Toast notifications for transient errors
- Modal dialogs for critical errors
- Inline validation messages for form errors
- Error Orb avatar for friendly error states

**Error Recovery:**
- Retry button for network errors
- Upgrade prompt for plan limit errors
- Clear error messages with actionable steps

### Server-Side Error Handling

**Error Responses:**
```typescript
{
  success: false
  error: {
    code: string // 'VALIDATION_ERROR', 'PLAN_LIMIT', 'NOT_FOUND', etc.
    message: string
    details?: any
  }
}
```

**Logging:**
- Log all errors to ErrorLogger service
- Include user ID, request details, stack trace
- Track error rates in analytics

## Testing Strategy

### Unit Tests

**Components:**
- MindMapTab: data fetching, state management
- MindMapViewer: node rendering, interactions
- NodeEditor: validation, save/cancel
- ExportMenu: plan-based restrictions
- ExportService: file generation

**Services:**
- ExportService: PDF/CSV/Anki generation
- API route handlers: validation, authorization

**Test Coverage Target:** 80%+

### Integration Tests

**Scenarios:**
- Load mind map and display nodes
- Edit node title and content
- Re-parent node via drag-and-drop
- Generate flashcards from branch
- Export notes to PDF
- Export flashcards to CSV
- Export flashcards to Anki (with plan check)
- Export mind map to image
- Export mind map to Markdown

### E2E Tests

**User Flows:**
1. Navigate to study pack → Mind Map tab → View mind map
2. Click node → Edit title → Save → Verify update
3. Drag node to new parent → Verify hierarchy change
4. Right-click node → Generate flashcards → Verify creation
5. Click export → Select PDF → Download file
6. Free user → Try Anki export → See paywall

### Accessibility Tests

**Checks:**
- Keyboard navigation (Tab, Enter, Escape, Arrow keys)
- Screen reader compatibility (ARIA labels)
- Color contrast (≥4.5:1)
- Focus indicators
- Reduced motion support

## Performance Considerations

### Mind Map Rendering

**Optimization:**
- Virtualize nodes for large mind maps (>100 nodes)
- Lazy load collapsed branches
- Debounce drag-and-drop updates
- Cache React Flow layout calculations

**Target Performance:**
- Initial render: <1s for 50 nodes
- Smooth interactions: 60fps
- Re-layout: <500ms

### Export Generation

**Optimization:**
- Generate exports asynchronously (background job)
- Cache generated files for 1 hour
- Stream large files instead of loading into memory
- Use worker threads for CPU-intensive operations

**Target Performance:**
- PDF generation: <5s for typical notes
- CSV generation: <1s for 250 cards
- Anki generation: <3s for 250 cards
- Image export: <3s for typical mind map

### API Response Times

**Targets:**
- GET /api/mindmaps/:id: <500ms
- PATCH /api/mindmaps/:id/nodes/:nodeId: <300ms
- POST /api/exports/*: <5s (or async with status endpoint)

## Security Considerations

### Authorization

**Checks:**
- Verify user owns study pack before any operation
- Check plan limits before generating content or exporting
- Validate all input parameters
- Prevent SQL injection via parameterized queries

### Data Validation

**Input Validation:**
- Node title: 3-100 characters, no HTML
- Node content: 0-500 characters, sanitize HTML
- Parent ID: must exist and not create circular reference
- Export format: whitelist allowed formats

### Rate Limiting

**Limits:**
- Mind map API: 60 requests/minute per user
- Export API: 10 requests/minute per user
- Content generation: 5 requests/minute per user

### File Security

**Export Files:**
- Generate unique, non-guessable filenames
- Set short expiration (1 hour) for download URLs
- Scan generated files for malware (if user-provided content)
- Limit file sizes (max 50MB)

## Orb Avatar Integration

### Mind Map Orb Poses

**States:**
- **Loading:** Processing Orb (thinking with orbital rings)
- **Empty State:** Empty State Orb (inviting/encouraging)
- **Viewing:** Explorer Orb (with magnifying glass)
- **Editing:** Organizing Orb (arranging/connecting pose)
- **Generating:** Generating Orb (intense thinking with sparkles)
- **Success:** Success Orb (thumbs up or celebrating)
- **Error:** Error Orb (sad/confused with error symbol)

### Export Orb Poses

**States:**
- **Menu:** Format Orb variations (PDF, CSV, Anki icons)
- **Processing:** Packaging Orb (wrapping/preparing files)
- **Downloading:** Download Orb (holding download arrow)
- **Success:** Success Orb (delivery/gift pose)
- **Paywall:** Paywall Orb (gentle upsell pose)
- **Error:** Error Orb (sad/confused with error symbol)

### Orb Component Usage

```typescript
<Orb 
  pose="explorer-magnifying-glass" 
  size="md" 
  className="mb-4"
/>
```

## Analytics Events

### Mind Map Events

```typescript
// View mind map
trackEvent('map_viewed', {
  studyPackId: string
  nodeCount: number
  userPlan: string
})

// Edit node
trackEvent('map_edited', {
  nodeId: string
  action: 'edit' | 're-parent' | 'delete'
  studyPackId: string
})

// Generate content from branch
trackEvent('map_branch_generate', {
  nodeId: string
  contentType: 'flashcards' | 'quiz'
  studyPackId: string
  success: boolean
})
```

### Export Events

```typescript
// Initiate export
trackEvent('export_triggered', {
  exportType: string
  studyPackId: string
  userPlan: string
})

// Complete export
trackEvent('export_completed', {
  exportType: string
  studyPackId: string
  duration: number
  fileSize: number
})

// Paywall encounter
trackEvent('upgrade_clicked', {
  feature: string // 'anki-export', 'full-mindmap', etc.
  currentPlan: string
  studyPackId: string
})
```

## Deployment Considerations

### Environment Variables

```env
# PDF Generation
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# File Storage
EXPORT_STORAGE_BUCKET=sappio-exports
EXPORT_URL_EXPIRATION=3600

# Rate Limiting
RATE_LIMIT_MINDMAP_API=60
RATE_LIMIT_EXPORT_API=10
```

### Dependencies

**New Packages:**
```json
{
  "reactflow": "^11.10.0",
  "jspdf": "^2.5.1",
  "papaparse": "^5.4.1",
  "html-to-image": "^1.11.11",
  "genanki": "^2.0.0" // or custom Anki implementation
}
```

### Database Indexes

**Recommended Indexes:**
```sql
CREATE INDEX idx_mindmap_nodes_mindmap_id ON mindmap_nodes(mindmap_id);
CREATE INDEX idx_mindmap_nodes_parent_id ON mindmap_nodes(parent_id);
CREATE INDEX idx_mindmaps_study_pack_id ON mindmaps(study_pack_id);
```

## Future Enhancements

**Phase 2 Features:**
- Collaborative mind map editing (real-time)
- Mind map templates (pre-built structures)
- Custom node colors and icons
- Mind map sharing (public links)
- Export to other formats (OPML, FreeMind)
- AI-powered mind map suggestions
- Mind map version history
- Bulk node operations (move multiple nodes)
- Search within mind map
- Mind map statistics (depth, breadth, coverage)
