/**
 * File validation and utility functions for material uploads
 */

import { MaterialKind } from '../types/materials'

// ============================================================================
// Constants
// ============================================================================

export const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB in bytes

export const ALLOWED_MIME_TYPES = {
  pdf: ['application/pdf'],
  docx: [
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ],
  doc: [
    'application/msword'
  ],
  image: [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif'
  ]
} as const

export const ALLOWED_EXTENSIONS = {
  pdf: ['.pdf'],
  docx: ['.docx'],
  doc: ['.doc'],
  image: ['.jpg', '.jpeg', '.png', '.webp', '.gif']
} as const

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Validates if a file type is allowed
 */
export function isValidFileType(file: File): boolean {
  const allAllowedTypes: string[] = [
    ...ALLOWED_MIME_TYPES.pdf,
    ...ALLOWED_MIME_TYPES.docx,
    ...ALLOWED_MIME_TYPES.doc,
    ...ALLOWED_MIME_TYPES.image
  ]
  
  return allAllowedTypes.includes(file.type)
}

/**
 * Validates if a file size is within limits
 */
export function isValidFileSize(file: File): boolean {
  return file.size <= MAX_FILE_SIZE
}

/**
 * Gets the material kind from a file
 */
export function getMaterialKindFromFile(file: File): MaterialKind | null {
  const pdfTypes: string[] = [...ALLOWED_MIME_TYPES.pdf]
  const docxTypes: string[] = [...ALLOWED_MIME_TYPES.docx]
  const docTypes: string[] = [...ALLOWED_MIME_TYPES.doc]
  const imageTypes: string[] = [...ALLOWED_MIME_TYPES.image]
  
  if (pdfTypes.includes(file.type)) {
    return 'pdf'
  }
  
  if (docxTypes.includes(file.type)) {
    return 'docx'
  }
  
  if (docTypes.includes(file.type)) {
    return 'doc'
  }
  
  if (imageTypes.includes(file.type)) {
    return 'image'
  }
  
  return null
}

/**
 * Gets the material kind from a file extension
 */
export function getMaterialKindFromExtension(filename: string): MaterialKind | null {
  const ext = filename.toLowerCase().match(/\.[^.]+$/)?.[0]
  
  if (!ext) return null
  
  const pdfExts: string[] = [...ALLOWED_EXTENSIONS.pdf]
  const docxExts: string[] = [...ALLOWED_EXTENSIONS.docx]
  const docExts: string[] = [...ALLOWED_EXTENSIONS.doc]
  const imageExts: string[] = [...ALLOWED_EXTENSIONS.image]
  
  if (pdfExts.includes(ext)) return 'pdf'
  if (docxExts.includes(ext)) return 'docx'
  if (docExts.includes(ext)) return 'doc'
  if (imageExts.includes(ext)) return 'image'
  
  return null
}

/**
 * Formats file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Validates a URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Checks if a URL is a YouTube URL
 */
export function isYouTubeUrl(url: string): boolean {
  try {
    const urlObj = new URL(url)
    const hostname = urlObj.hostname.toLowerCase()
    
    return (
      hostname === 'youtube.com' ||
      hostname === 'www.youtube.com' ||
      hostname === 'youtu.be' ||
      hostname === 'm.youtube.com'
    )
  } catch {
    return false
  }
}

/**
 * Extracts YouTube video ID from URL
 */
export function extractYouTubeVideoId(url: string): string | null {
  try {
    const urlObj = new URL(url)
    
    // Handle youtu.be format
    if (urlObj.hostname === 'youtu.be') {
      return urlObj.pathname.slice(1)
    }
    
    // Handle youtube.com format
    const videoId = urlObj.searchParams.get('v')
    return videoId
  } catch {
    return null
  }
}

/**
 * Generates a unique storage path for a material
 * Note: Don't include bucket name in path, Supabase adds it automatically
 */
export function generateStoragePath(
  userId: string,
  materialId: string,
  filename: string
): string {
  return `${userId}/${materialId}/${filename}`
}

/**
 * Validates file and returns error message if invalid
 */
export function validateFile(file: File): string | null {
  if (!isValidFileType(file)) {
    return 'Unsupported file type. Please upload PDF, DOCX, DOC, or images (JPG, PNG, WEBP, GIF).'
  }
  
  if (!isValidFileSize(file)) {
    return `File too large. Maximum size is ${formatFileSize(MAX_FILE_SIZE)}.`
  }
  
  return null
}
