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
export type MatchType = 'literal' | 'regex'

/** A rule as persisted in localStorage / edited via the admin screen. */
export interface StoredRule {
  id: string
  category: string
  description: string
  matchType: MatchType
  /** literal text to match, or a regular expression source string */
  pattern: string
  /** regex flags (only meaningful when matchType === 'regex') */
  flags?: string
  suggestion?: string
  severity: Severity
  enabled: boolean
  /** true for rules shipped as defaults, false for admin-added ones */
  isBuiltIn: boolean
}

/** A set of words/phrases that mean the same thing but are written differently. */
export interface VariantGroup {
  id: string
  words: string[]
  enabled: boolean
  isBuiltIn: boolean
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
