import mammoth from 'mammoth'
import type { ExtractedDocument } from '../../types'

export async function extractFromDocx(file: File): Promise<ExtractedDocument> {
  const arrayBuffer = await file.arrayBuffer()
  const { value } = await mammoth.extractRawText({ arrayBuffer })
  const lines = value.split(/\r\n|\r|\n/)

  return {
    fileName: file.name,
    segments: lines.map((line, i) => ({
      id: `line-${i + 1}`,
      label: `${i + 1}行目`,
      text: line,
    })),
  }
}
