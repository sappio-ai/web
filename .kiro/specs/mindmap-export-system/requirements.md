# Requirements Document

## Introduction

This specification covers the implementation of Phase 6 (Mind Map System) and Phase 7 (Export System) for Sappio V2. The Mind Map System provides users with an interactive, hierarchical visualization of their study material, allowing them to explore concepts, edit nodes, and generate additional learning content from specific branches. The Export System enables users to export their study materials in various formats (PDF, CSV, Anki, PNG, SVG, Markdown) with plan-based restrictions.

Both systems integrate with the existing study pack infrastructure and leverage the Sappio Orb avatar system to provide a friendly, engaging user experience. The mind map generation is already implemented in the backend (GenerationService), so this spec focuses on the frontend UI, interactivity, and export functionality.

## Requirements

### Requirement 1: Mind Map Visualization

**User Story:** As a student, I want to view an auto-generated mind map of my study material, so that I can understand the hierarchical structure of concepts and their relationships.

#### Acceptance Criteria

1. WHEN a user navigates to the Mind Map tab of a study pack THEN the system SHALL display an interactive mind map with all nodes from the database
2. WHEN the mind map loads THEN the system SHALL render nodes in a hierarchical tree structure with the root node at the top
3. WHEN a node has children THEN the system SHALL display visual connections (lines/edges) between parent and child nodes
4. WHEN the mind map contains many nodes THEN the system SHALL provide zoom controls (zoom in, zoom out, reset) for navigation
5. WHEN the mind map is larger than the viewport THEN the system SHALL provide pan controls (drag to move) for navigation
6. WHEN a node is displayed THEN the system SHALL show the node title and optionally the content on hover or click
7. WHEN the mind map is empty THEN the system SHALL display an Empty State Orb with a message encouraging the user

### Requirement 2: Mind Map Interactivity

**User Story:** As a student, I want to interact with mind map nodes, so that I can explore concepts in detail and customize the organization.

#### Acceptance Criteria

1. WHEN a user clicks on a node THEN the system SHALL display a detail panel showing the node's title, content, and available actions
2. WHEN a user hovers over a node THEN the system SHALL highlight the node and show a preview of its content
3. WHEN a node has children THEN the system SHALL provide expand/collapse controls to show or hide child nodes
4. WHEN a user expands a collapsed branch THEN the system SHALL animate the appearance of child nodes
5. WHEN a user collapses an expanded branch THEN the system SHALL animate the disappearance of child nodes and persist the collapsed state
6. WHEN the mind map is displayed THEN the system SHALL show the Orb avatar in an appropriate pose (Explorer Orb with magnifying glass)

### Requirement 3: Mind Map Editing

**User Story:** As a student, I want to edit mind map nodes, so that I can personalize the content and fix any inaccuracies.

#### Acceptance Criteria

1. WHEN a user clicks an "Edit" button on a node THEN the system SHALL display an inline editor for the node's title and content
2. WHEN a user modifies a node's title or content THEN the system SHALL validate that the title is not empty (3-100 characters)
3. WHEN a user saves node edits THEN the system SHALL update the node in the database via API call
4. WHEN a node update succeeds THEN the system SHALL display a success message and update the UI immediately
5. WHEN a node update fails THEN the system SHALL display an error message and revert to the original content
6. WHEN a user is editing a node THEN the system SHALL show an Organizing Orb (arranging/connecting pose)

### Requirement 4: Mind Map Node Re-parenting

**User Story:** As a student, I want to reorganize the mind map structure, so that I can group concepts in a way that makes sense to me.

#### Acceptance Criteria

1. WHEN a user drags a node THEN the system SHALL allow dropping it onto another node to change its parent
2. WHEN a user drops a node onto a valid parent THEN the system SHALL update the node's parent_id in the database
3. WHEN a node is re-parented THEN the system SHALL prevent circular references (a node cannot be its own ancestor)
4. WHEN a node is re-parented THEN the system SHALL update the visual connections to reflect the new hierarchy
5. WHEN a re-parenting operation fails THEN the system SHALL display an error message and revert the node to its original position
6. IF the user's plan does not support editing (Free tier with limited nodes) THEN the system SHALL display a paywall modal when attempting to re-parent nodes beyond the limit



### Requirement 5: Mind Map Plan-Based Restrictions

**User Story:** As a product owner, I want to enforce plan-based limits on mind map features, so that we can monetize premium functionality.

#### Acceptance Criteria

1. WHEN a Free user views a mind map with more than 50 nodes THEN the system SHALL display only the first 50 nodes and show a paywall message
2. WHEN a Student Pro user views a mind map with more than 150 nodes THEN the system SHALL display only the first 150 nodes and show a paywall message
3. WHEN a Pro+ user views a mind map THEN the system SHALL display up to 250 nodes without restrictions
4. WHEN a user reaches their node limit THEN the system SHALL display an Upgrade Orb (friendly upsell, showing premium features)
5. WHEN a user clicks the upgrade prompt THEN the system SHALL open the PaywallModal component with appropriate messaging

### Requirement 6: Export Notes to PDF

**User Story:** As a student, I want to export my smart notes to PDF, so that I can read them offline or print them for studying.

#### Acceptance Criteria

1. WHEN a user clicks "Export Notes to PDF" in the Notes tab THEN the system SHALL call the export API endpoint with the study pack ID
2. WHEN the export is processing THEN the system SHALL display a Packaging Orb (wrapping/preparing files pose) and a loading indicator
3. WHEN the PDF export is ready THEN the system SHALL provide a download link or automatically trigger the download
4. WHEN the PDF export fails THEN the system SHALL display an error message with details
5. WHEN the PDF is generated THEN the system SHALL include the overview, key concepts, definitions, likely questions, and pitfalls sections
6. WHEN the PDF is generated THEN the system SHALL format the content with proper headings, spacing, and styling for readability

### Requirement 7: Export Flashcards to CSV

**User Story:** As a student, I want to export my flashcards to CSV, so that I can use them in other tools or share them with classmates.

#### Acceptance Criteria

1. WHEN a user clicks "Export Flashcards to CSV" in the Flashcards tab THEN the system SHALL call the export API endpoint with the study pack ID
2. WHEN the CSV export is ready THEN the system SHALL provide a download link or automatically trigger the download
3. WHEN the CSV is generated THEN the system SHALL include columns for: front, back, kind, topic, ease, interval_days, reps, lapses
4. WHEN the CSV is generated THEN the system SHALL properly escape special characters (commas, quotes, newlines)
5. WHEN the CSV export fails THEN the system SHALL display an error message with details

### Requirement 8: Export Flashcards to Anki

**User Story:** As a Student Pro or Pro+ user, I want to export my flashcards to Anki format, so that I can use them in the Anki spaced repetition app.

#### Acceptance Criteria

1. WHEN a Free user clicks "Export to Anki" THEN the system SHALL display a paywall modal indicating this feature requires Student Pro or Pro+
2. WHEN a Student Pro or Pro+ user clicks "Export to Anki" THEN the system SHALL call the export API endpoint to generate an .apkg file
3. WHEN the Anki export is ready THEN the system SHALL provide a download link for the .apkg file
4. WHEN the .apkg file is generated THEN the system SHALL include all flashcards with proper formatting for Anki import
5. WHEN the .apkg file is generated THEN the system SHALL preserve the topic tags as Anki tags
6. WHEN the Anki export fails THEN the system SHALL display an error message with details

### Requirement 9: Export Mind Map to Image

**User Story:** As a student, I want to export my mind map as an image (PNG or SVG), so that I can include it in presentations or documents.

#### Acceptance Criteria

1. WHEN a user clicks "Export Mind Map" in the Mind Map tab THEN the system SHALL display format options: PNG, SVG
2. WHEN a user selects PNG format THEN the system SHALL generate a raster image of the current mind map view
3. WHEN a user selects SVG format THEN the system SHALL generate a vector image of the current mind map view
4. WHEN the image export is ready THEN the system SHALL provide a download link or automatically trigger the download
5. WHEN the image is generated THEN the system SHALL include all visible nodes and connections with proper styling
6. WHEN the image export fails THEN the system SHALL display an error message with details

### Requirement 10: Export Mind Map to Markdown

**User Story:** As a student, I want to export my mind map to Markdown, so that I can use it in note-taking apps or version control systems.

#### Acceptance Criteria

1. WHEN a user clicks "Export to Markdown" in the Mind Map tab THEN the system SHALL call the export API endpoint to generate a .md file
2. WHEN the Markdown export is ready THEN the system SHALL provide a download link for the .md file
3. WHEN the Markdown is generated THEN the system SHALL format the hierarchy using nested bullet points or headings
4. WHEN the Markdown is generated THEN the system SHALL include node titles and content in a readable format
5. WHEN the Markdown export fails THEN the system SHALL display an error message with details

### Requirement 11: Export UI and Orb Integration

**User Story:** As a user, I want a consistent and friendly export experience, so that I understand what's happening and feel supported throughout the process.

#### Acceptance Criteria

1. WHEN a user initiates any export THEN the system SHALL display a Download Orb (holding download arrow) during processing
2. WHEN an export completes successfully THEN the system SHALL display a Success Orb (delivery/gift pose) with a success message
3. WHEN an export is restricted by plan THEN the system SHALL display a Paywall Orb (gentle upsell pose) with upgrade options
4. WHEN an export fails THEN the system SHALL display an Error Orb (sad/confused with error symbol) with a helpful error message
5. WHEN multiple export options are available THEN the system SHALL display them in a clear, organized menu with Format Orb variations (PDF, CSV, Anki icons)

### Requirement 12: Export API Endpoints

**User Story:** As a developer, I want well-defined API endpoints for exports, so that the frontend can reliably request and download exported content.

#### Acceptance Criteria

1. WHEN the system is deployed THEN the API SHALL provide POST `/api/exports/notes-pdf` endpoint accepting studyPackId
2. WHEN the system is deployed THEN the API SHALL provide POST `/api/exports/flashcards-csv` endpoint accepting studyPackId
3. WHEN the system is deployed THEN the API SHALL provide POST `/api/exports/flashcards-anki` endpoint accepting studyPackId (with plan check)
4. WHEN the system is deployed THEN the API SHALL provide POST `/api/exports/mindmap-image` endpoint accepting mindmapId and format (png/svg)
5. WHEN the system is deployed THEN the API SHALL provide POST `/api/exports/mindmap-markdown` endpoint accepting mindmapId
6. WHEN an export endpoint is called THEN the system SHALL validate the user's authentication and authorization
7. WHEN an export endpoint is called THEN the system SHALL check the user's plan limits before processing
8. WHEN an export is generated THEN the system SHALL return a download URL or file stream

### Requirement 13: Mind Map API Endpoints

**User Story:** As a developer, I want well-defined API endpoints for mind map operations, so that the frontend can interact with mind map data.

#### Acceptance Criteria

1. WHEN the system is deployed THEN the API SHALL provide GET `/api/mindmaps/:id` endpoint to fetch mind map data with nodes
2. WHEN the system is deployed THEN the API SHALL provide PATCH `/api/mindmaps/:id/nodes/:nodeId` endpoint to update a node's title, content, or parent_id
3. WHEN the system is deployed THEN the API SHALL provide POST `/api/mindmaps/:id/nodes` endpoint to create a new node
4. WHEN the system is deployed THEN the API SHALL provide DELETE `/api/mindmaps/:id/nodes/:nodeId` endpoint to delete a node and its descendants
5. WHEN any mind map endpoint is called THEN the system SHALL validate that the user owns the associated study pack

### Requirement 14: Analytics Event Tracking

**User Story:** As a product owner, I want to track user interactions with mind maps and exports, so that I can understand feature usage and optimize the product.

#### Acceptance Criteria

1. WHEN a user views a mind map THEN the system SHALL log a `map_viewed` event with studyPackId and nodeCount
2. WHEN a user edits a mind map node THEN the system SHALL log a `map_edited` event with nodeId and action (edit/re-parent/delete)
3. WHEN a user initiates an export THEN the system SHALL log an `export_triggered` event with exportType (notes-pdf, flashcards-csv, etc.)
4. WHEN an export completes successfully THEN the system SHALL log an `export_completed` event with exportType and duration
5. WHEN a user encounters a paywall THEN the system SHALL log an `upgrade_clicked` event with feature (anki-export, full-mindmap, etc.)
