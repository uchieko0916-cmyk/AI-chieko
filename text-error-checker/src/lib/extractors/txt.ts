import type { ExtractedDocument } from '../../types'

export async function extractFromTxt(file: File): Promise<ExtractedDocument> {
  const text = await file.text()
  const lines = text.split(/\r\n|\r|\n/)

  return {
    fileName: file.name,
    segments: lines.map((line, i) => ({
      id: `line-${i + 1}`,
      label: `${i + 1}行目`,
      text: line,
    })),
  }
}
