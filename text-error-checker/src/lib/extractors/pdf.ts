import * as pdfjsLib from 'pdfjs-dist'
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import type { ExtractedDocument } from '../../types'

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl

export async function extractFromPdf(file: File): Promise<ExtractedDocument> {
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

  const segments = []
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum)
    const content = await page.getTextContent()
    const text = content.items.map((item) => ('str' in item ? item.str : '')).join('')
    segments.push({
      id: `page-${pageNum}`,
      label: `${pageNum}ページ目`,
      text,
    })
  }

  return { fileName: file.name, segments }
}
