import type { ExtractedDocument } from '../../types'
import { extractFromTxt } from './txt'
import { extractFromDocx } from './docx'
import { extractFromPdf } from './pdf'
import { extractFromSpreadsheet } from './spreadsheet'

export class UnsupportedFileTypeError extends Error {
  constructor(fileName: string) {
    super(`対応していないファイル形式です: ${fileName}`)
    this.name = 'UnsupportedFileTypeError'
  }
}

export async function extractDocument(file: File): Promise<ExtractedDocument> {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? ''

  switch (ext) {
    case 'txt':
      return extractFromTxt(file)
    case 'docx':
      return extractFromDocx(file)
    case 'pdf':
      return extractFromPdf(file)
    case 'xlsx':
    case 'xls':
    case 'csv':
      return extractFromSpreadsheet(file)
    default:
      throw new UnsupportedFileTypeError(file.name)
  }
}

export const SUPPORTED_EXTENSIONS = ['.txt', '.docx', '.pdf', '.xlsx', '.xls', '.csv']
