/**
 * ExportService - Client-side service for handling exports
 */

export class ExportService {
  /**
   * Export notes to PDF
   */
  static async exportNotesToPDF(studyPackId: string): Promise<Blob> {
    const response = await fetch('/api/exports/notes-pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studyPackId }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to export notes to PDF')
    }

    return await response.blob()
  }

  /**
   * Export flashcards to CSV
   */
  static async exportFlashcardsToCSV(studyPackId: string): Promise<Blob> {
    const response = await fetch('/api/exports/flashcards-csv', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studyPackId }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to export flashcards to CSV')
    }

    return await response.blob()
  }

  /**
   * Export flashcards to Anki format
   */
  static async exportFlashcardsToAnki(studyPackId: string): Promise<Blob> {
    const response = await fetch('/api/exports/flashcards-anki', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studyPackId }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to export flashcards to Anki')
    }

    return await response.blob()
  }

  /**
   * Export mind map to image (PNG or SVG)
   */
  static async exportMindMapToImage(
    mindmapId: string,
    format: 'png' | 'svg',
    quality?: number
  ): Promise<Blob> {
    const response = await fetch('/api/exports/mindmap-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mindmapId, format, quality }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to export mind map to image')
    }

    return await response.blob()
  }

  /**
   * Export mind map to Markdown
   */
  static async exportMindMapToMarkdown(mindmapId: string): Promise<Blob> {
    const response = await fetch('/api/exports/mindmap-markdown', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mindmapId }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to export mind map to Markdown')
    }

    return await response.blob()
  }

  /**
   * Download a blob as a file
   */
  static downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }
}
