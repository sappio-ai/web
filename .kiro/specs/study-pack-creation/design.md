# Design Document

## Overview

The Study Pack Creation feature is the core value proposition of Sappio V2, enabling users to "Upload once → get everything to learn." This feature combines material upload, intelligent processing, and AI-powered content generation into a seamless 60-second experience.

### Key Design Goals

1. **Speed**: Complete study pack generation in under 60 seconds for typical materials
2. **Quality**: Generate comprehensive, exam-ready content from any source format
3. **Scalability**: Handle concurrent uploads and processing with queue-based architecture
4. **User Experience**: Provide real-time feedback with the Sappio Orb throughout the journey
5. **Extensibility**: Design for future multi-material packs while supporting single-material packs now

### Technology Stack

- **Frontend**: Next.js 15 with React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes (App Router)
- **Database**: Supabase PostgreSQL with pgvector extension
- **Storage**: Supabase Storage for file uploads
- **AI/ML**: OpenAI GPT-4 for content generation, OpenAI text-embedding-3-small for embeddings
- **OCR**: Tesseract.js or cloud OCR service (Google Cloud Vision API)
- **Document Processing**: pdf-parse for PDFs, mammoth for DOCX
- **Job Queue**: Vercel Queue or custom implementation with Supabase
- **YouTube**: youtube-transcript API for transcript extraction

## Architecture

### High-Level Flow

```
User Upload → Material Record → Processing Queue → Content Extraction → Chunking → Embedding Generation
                                                                                          ↓
Study Pack View ← Pack Assembly ← Parallel Generation ← AI Content Generation ← Chunk Analysis
                                   (Notes, Cards, Quiz, Map)
```

### Component Architecture


```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend Layer                            │
├─────────────────────────────────────────────────────────────────┤
│  CreatePackModal  │  UploadZone  │  ProcessingStatus  │  OrbAvatar │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                         API Layer                                │
├─────────────────────────────────────────────────────────────────┤
│  /api/materials/upload  │  /api/materials/url  │  /api/study-packs/generate │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      Service Layer                               │
├─────────────────────────────────────────────────────────────────┤
│  MaterialService  │  ProcessingService  │  GenerationService  │  UsageService │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      Worker Layer                                │
├─────────────────────────────────────────────────────────────────┤
│  MaterialProcessor  │  ChunkGenerator  │  EmbeddingGenerator  │  PackGenerator │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    External Services                             │
├─────────────────────────────────────────────────────────────────┤
│  Supabase Storage  │  OpenAI API  │  OCR Service  │  YouTube API │
└─────────────────────────────────────────────────────────────────┘
```

### Database Schema Utilization

**Materials Table**
- Stores metadata about uploaded content
- Fields: id, user_id, kind (pdf/docx/image/url/youtube), source_url, storage_path, page_count, status, meta_json
- Status flow: uploading → processing → chunking → ready → failed

**Chunks Table**
- Stores segmented content with embeddings
- Fields: id, material_id, content, vector (pgvector), token_count, order_index, meta_json
- Enables semantic search and context retrieval

**Study Packs Table**
- Central entity linking materials to generated content
- Fields: id, user_id, material_id, title, summary, stats_json (coverage, generation_time)

**Flashcards, Quizzes, Quiz Items, Mindmaps, Mindmap Nodes**
- Store generated learning content linked to study packs

## Components and Interfaces

### 1. Frontend Components

#### CreatePackModal Component
