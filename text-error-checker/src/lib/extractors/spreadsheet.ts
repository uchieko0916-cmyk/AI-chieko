import * as XLSX from 'xlsx'
import type { ExtractedDocument, ExtractedSegment } from '../../types'

export async function extractFromSpreadsheet(file: File): Promise<ExtractedDocument> {
  const isCsv = file.name.toLowerCase().endsWith('.csv')

  // CSV is plain text, so decode it as UTF-8 text rather than treating it as
  // binary; xlsx/xls are zip/binary containers and must be read as bytes.
  const workbook = isCsv
    ? XLSX.read(await file.text(), { type: 'string' })
    : XLSX.read(await file.arrayBuffer(), { type: 'array' })

  const segments: ExtractedSegment[] = []
  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName]
    const ref = sheet['!ref']
    if (!ref) continue
    const range = XLSX.utils.decode_range(ref)

    for (let row = range.s.r; row <= range.e.r; row++) {
      for (let col = range.s.c; col <= range.e.c; col++) {
        const address = XLSX.utils.encode_cell({ r: row, c: col })
        const cell = sheet[address]
        const text = cell?.w ?? (cell?.v !== undefined ? String(cell.v) : '')
        if (!text) continue

        segments.push({
          id: `${sheetName}!${address}`,
          label: workbook.SheetNames.length > 1 ? `${sheetName}シートの${address}セル` : `${address}セル`,
          text,
        })
      }
    }
  }

  return { fileName: file.name, segments }
}
