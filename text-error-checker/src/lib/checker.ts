import type { ExtractedDocument, Finding, StoredRule } from '../types'
import { escapeRegExp } from '../rules/helpers'
import { checkNotationConsistency, checkWidthConsistency } from '../rules'
import { getRules, getVariantGroups } from './ruleStore'

const CONTEXT_LENGTH = 15

function buildPattern(rule: StoredRule): RegExp | null {
  try {
    const source = rule.matchType === 'literal' ? escapeRegExp(rule.pattern) : rule.pattern
    const baseFlags = rule.matchType === 'literal' ? '' : rule.flags ?? ''
    const flags = baseFlags.includes('g') ? baseFlags : `${baseFlags}g`
    return new RegExp(source, flags)
  } catch {
    // an admin-edited regex may be invalid; skip it rather than crash the whole check
    return null
  }
}

function runRule(rule: StoredRule, doc: ExtractedDocument): Finding[] {
  const pattern = buildPattern(rule)
  if (!pattern) return []

  const findings: Finding[] = []

  for (const segment of doc.segments) {
    const re = new RegExp(pattern.source, pattern.flags)
    let match: RegExpExecArray | null

    while ((match = re.exec(segment.text)) !== null) {
      if (match[0] === '') {
        re.lastIndex += 1
        continue
      }
      const start = match.index
      const end = start + match[0].length

      findings.push({
        id: `${segment.id}-${rule.id}-${start}`,
        ruleId: rule.id,
        category: rule.category,
        description: rule.description,
        severity: rule.severity,
        segmentId: segment.id,
        segmentLabel: segment.label,
        matchedText: match[0],
        suggestion: rule.suggestion,
        contextBefore: segment.text.slice(Math.max(0, start - CONTEXT_LENGTH), start),
        contextAfter: segment.text.slice(end, end + CONTEXT_LENGTH),
      })
    }
  }

  return findings
}

export function checkDocument(doc: ExtractedDocument): Finding[] {
  const rules = getRules().filter((rule) => rule.enabled)
  const groups = getVariantGroups()
    .filter((group) => group.enabled)
    .map((group) => group.words)

  return [
    ...rules.flatMap((rule) => runRule(rule, doc)),
    ...checkNotationConsistency(doc, groups),
    ...checkWidthConsistency(doc),
  ]
}
