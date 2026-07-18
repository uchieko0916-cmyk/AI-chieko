export interface ExtractedSegment {
  /** unique key within the document, e.g. "line-3" or "Sheet1!A2" */
  id: string
  /** human-readable location shown to the user, e.g. "3行目" or "Sheet1 のセル A2" */
  label: string
  text: string
}

export interface ExtractedDocument {
  fileName: string
  segments: ExtractedSegment[]
}

export type Severity = 'error' | 'warning' | 'info'

export interface Rule {
  id: string
  category: string
  description: string
  pattern: RegExp
  suggestion?: string | ((match: RegExpExecArray) => string)
  severity: Severity
}

export interface Finding {
  id: string
  ruleId: string
  category: string
  description: string
  severity: Severity
  segmentId: string
  segmentLabel: string
  matchedText: string
  suggestion?: string
  contextBefore: string
  contextAfter: string
}
