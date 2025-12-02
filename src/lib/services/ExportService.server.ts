/**
 * ExportService - Server-side service for generating exports
 */

import { jsPDF } from 'jspdf'
// @ts-expect-error - papaparse types not available
import Papa from 'papaparse'

export class ExportServiceServer {
  /**
   * Generate notes PDF
   */
  static async generateNotesPDF(notes: any): Promise<Buffer> {
    const doc = new jsPDF()
    
    // Add title
    doc.setFontSize(20)
    doc.text('Study Notes', 20, 20)
    
    let yPosition = 40
    
    // Add overview
    if (notes.overview) {
      doc.setFontSize(16)
      doc.text('Overview', 20, yPosition)
      yPosition += 10
      doc.setFontSize(12)
      const overviewLines = doc.splitTextToSize(notes.overview, 170)
      doc.text(overviewLines, 20, yPosition)
      yPosition += overviewLines.length * 7 + 10
    }
    
    // Add key concepts
    if (notes.keyConcepts && notes.keyConcepts.length > 0) {
      doc.setFontSize(16)
      doc.text('Key Concepts', 20, yPosition)
      yPosition += 10
      
      notes.keyConcepts.forEach((concept: any) => {
        if (yPosition > 270) {
          doc.addPage()
          yPosition = 20
        }
        doc.setFontSize(14)
        doc.text(concept.title, 20, yPosition)
        yPosition += 7
        doc.setFontSize(12)
        const descLines = doc.splitTextToSize(concept.description, 170)
        doc.text(descLines, 20, yPosition)
        yPosition += descLines.length * 7 + 5
      })
    }
    
    // Add definitions
    if (notes.definitions && notes.definitions.length > 0) {
      if (yPosition > 250) {
        doc.addPage()
        yPosition = 20
      }
      doc.setFontSize(16)
      doc.text('Definitions', 20, yPosition)
      yPosition += 10
      
      notes.definitions.forEach((def: any) => {
        if (yPosition > 270) {
          doc.addPage()
          yPosition = 20
        }
        doc.setFontSize(12)
        doc.setFont('helvetica', 'bold')
        doc.text(def.term, 20, yPosition)
        yPosition += 7
        doc.setFont('helvetica', 'normal')
        const defLines = doc.splitTextToSize(def.definition, 170)
        doc.text(defLines, 20, yPosition)
        yPosition += defLines.length * 7 + 5
      })
    }
    
    return Buffer.from(doc.output('arraybuffer'))
  }

  /**
   * Generate flashcards CSV
   */
  static async generateFlashcardsCSV(flashcards: any[]): Promise<string> {
    const data = flashcards.map((card) => ({
      front: card.front,
      back: card.back,
      topic: card.topic || '',
    }))
    
    return Papa.unparse(data)
  }

  /**
   * Generate mind map Markdown
   */
  static async generateMindMapMarkdown(
    title: string,
    nodes: any[]
  ): Promise<string> {
    let markdown = `# ${title}\n\n`
    
    // Find root nodes (nodes without parent)
    const rootNodes = nodes.filter((n) => !n.parentId && !n.parent_id)
    
    function renderNode(node: any, level: number): string {
      // Limit heading depth to 6 (markdown max)
      const headingLevel = Math.min(level + 2, 6)
      const heading = '#'.repeat(headingLevel)
      let md = `${heading} ${node.title}\n\n`
      
      if (node.content) {
        md += `${node.content}\n\n`
      }
      
      // Find and render children (support both camelCase and snake_case)
      const children = nodes.filter((n) => 
        n.parentId === node.id || n.parent_id === node.id
      )
      
      // Sort children by order_index if available
      children.sort((a, b) => {
        const aOrder = a.orderIndex || a.order_index || 0
        const bOrder = b.orderIndex || b.order_index || 0
        return aOrder - bOrder
      })
      
      children.forEach((child) => {
        md += renderNode(child, level + 1)
      })
      
      return md
    }
    
    // Sort root nodes by order_index if available
    rootNodes.sort((a, b) => {
      const aOrder = a.orderIndex || a.order_index || 0
      const bOrder = b.orderIndex || b.order_index || 0
      return aOrder - bOrder
    })
    
    rootNodes.forEach((root) => {
      markdown += renderNode(root, 0)
    })
    
    return markdown
  }

  /**
   * Generate Anki package (placeholder - requires anki package)
   */
  static async generateFlashcardsAnki(flashcards: any[]): Promise<Buffer> {
    // This would require the genanki package or similar
    // For now, return a simple text file
    const content = flashcards
      .map((card) => `Q: ${card.front}\nA: ${card.back}\n---\n`)
      .join('\n')
    
    return Buffer.from(content, 'utf-8')
  }
}
