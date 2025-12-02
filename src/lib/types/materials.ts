/**
 * Type definitions for Study Pack Creation feature
 * These interfaces match the database schema and design document
 */

import { Tables } from './database'

// ============================================================================
// Material Types
// ============================================================================

export type MaterialKind = 'pdf' | 'docx' | 'doc' | 'image' | 'url' | 'youtube' | 'text'
export type MaterialStatus = 'uploading' | 'processing' | 'chunking' | 'ready' | 'failed'

export interface MaterialMetadata {
  filename?: string
  fileSize?: number
  mimeType?: string
  originalUrl?: string
  submittedAt?: string
  progress?: number
  stage?: string
  error?: string
  extractedText?: string // temporary, removed after chunking
  processingTime?: number
}

export interface Material {
  id: string
  userId: string
  kind: MaterialKind
  sourceUrl?: string
  storagePath?: string
  pageCount?: number
  status: MaterialStatus
  metaJson: MaterialMetadata
  createdAt: string
}

// ============================================================================
// Chunk Types
// ============================================================================

export interface ChunkMetadata {
  pageNumber?: number
  section?: string
}

export interface Chunk {
  id: number
  materialId: string
  content: string
  vector: number[] | null
  tokenCount: number
  orderIndex: number
  metaJson: ChunkMetadata
}

// ============================================================================
// Study Pack Types
// ============================================================================

export type CoverageLevel = 'high' | 'med' | 'low'

export interface StudyPackStats {
  coverage: CoverageLevel
  generationTime: number
  cardCount: number
  quizQuestionCount: number
  mindMapNodeCount: number
  chunkUtilization: number // percentage
}

export interface StudyPack {
  id: string
  userId: string
  materialId: string
  title: string
  summary: string
  statsJson: StudyPackStats
  createdAt: string
  updatedAt: string
}

// ============================================================================
// Smart Notes Types
// ============================================================================

export interface KeyConcept {
  title: string
  description: string
}

export interface Definition {
  term: string
  definition: string
}

export interface SmartNotes {
  overview: string
  keyConcepts: KeyConcept[]
  definitions: Definition[]
  likelyQuestions: string[]
  pitfalls: string[]
}

// ============================================================================
// Flashcard Types
// ============================================================================

export type FlashcardKind = 'qa' | 'cloze'

export interface Flashcard {
  id: string
  studyPackId: string
  front: string
  back: string
  kind: FlashcardKind
  topic: string
  // SRS (Spaced Repetition System) fields
  ease: number // 2.50 default
  intervalDays: number // 0 initially
  dueAt: string // now() initially
  reps: number // 0 initially
  lapses: number // 0 initially
  createdAt: string
}

// ============================================================================
// Quiz Types
// ============================================================================

export type QuizItemType = 'mcq' | 'short_answer'

export interface QuizConfig {
  timeLimit?: number
  passingScore?: number
}

export interface Quiz {
  id: string
  studyPackId: string
  configJson: QuizConfig
  createdAt: string
}

export interface QuizItem {
  id: string
  quizId: string
  type: QuizItemType
  question: string
  answer: string
  optionsJson?: string[] // for MCQ only
  explanation: string
  topic: string
}

// ============================================================================
// Mind Map Types
// ============================================================================

export interface MindMapNodePosition {
  id: string
  x: number
  y: number
}

export interface MindMapLayout {
  nodes: MindMapNodePosition[]
}

export interface MindMap {
  id: string
  studyPackId: string
  title: string
  layoutJson: MindMapLayout
  createdAt: string
  updatedAt: string
}

export interface MindMapNode {
  id: string
  mindMapId: string
  parentId?: string
  title: string
  content: string
  orderIndex: number
  sourceChunkIds: number[]
}

// ============================================================================
// Complete Study Pack Response (for API)
// ============================================================================

export interface CompleteStudyPack {
  id: string
  title: string
  summary: string
  createdAt: string
  material: {
    id: string
    kind: MaterialKind
    sourceUrl?: string
    pageCount?: number
  }
  stats: StudyPackStats
  notes: SmartNotes
  flashcards: Flashcard[]
  quiz: Quiz & { items: QuizItem[] }
  mindMap: MindMap & { nodes: MindMapNode[] }
}

// ============================================================================
// Database Row Types (for Supabase queries)
// ============================================================================

export type MaterialRow = Tables<'materials'>
export type ChunkRow = Tables<'chunks'>
export type StudyPackRow = Tables<'study_packs'>
export type FlashcardRow = Tables<'flashcards'>
export type QuizRow = Tables<'quizzes'>
export type QuizItemRow = Tables<'quiz_items'>
export type MindMapRow = Tables<'mindmaps'>
export type MindMapNodeRow = Tables<'mindmap_nodes'>
