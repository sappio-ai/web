/**
 * PDF Parser Loader - Using pdf.js-extract for reliable PDF text extraction
 * 
 * pdf.js-extract is built on Mozilla's pdf.js and works well with Next.js
 */

import { PDFExtract } from 'pdf.js-extract'

/**
 * Parse PDF buffer and extract text
 */
export async function parsePdf(buffer: Buffer): Promise<{
    numpages: number
    text: string
    info: any
    metadata: any
    version: string
}> {
    const pdfExtract = new PDFExtract()

    // Extract data from buffer
    const data = await pdfExtract.extractBuffer(buffer)

    // Combine all text from all pages
    let fullText = ''
    for (const page of data.pages) {
        const pageText = page.content
            .map((item) => item.str)
            .join(' ')
        fullText += pageText + '\n'
    }

    return {
        numpages: data.pages.length,
        text: fullText.trim(),
        info: data.meta || {},
        metadata: data.meta || {},
        version: (data.pdfInfo as any)?.PDFFormatVersion || '1.x'
    }
}
