import type { ExtractedDocument, Finding, Rule } from '../types'
import { allPatternRules, checkNotationConsistency, checkWidthConsistency } from '../rules'

const CONTEXT_LENGTH = 15

function runPatternRule(rule: Rule, doc: ExtractedDocument): Finding[] {
  const findings: Finding[] = []
  const flags = rule.pattern.flags.includes('g') ? rule.pattern.flags : `${rule.pattern.flags}g`

  for (const segment of doc.segments) {
    const re = new RegExp(rule.pattern.source, flags)
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
        suggestion: typeof rule.suggestion === 'function' ? rule.suggestion(match) : rule.suggestion,
        contextBefore: segment.text.slice(Math.max(0, start - CONTEXT_LENGTH), start),
        contextAfter: segment.text.slice(end, end + CONTEXT_LENGTH),
      })
    }
  }

  return findings
}

export function checkDocument(doc: ExtractedDocument): Finding[] {
  const findings: Finding[] = [
    ...allPatternRules.flatMap((rule) => runPatternRule(rule, doc)),
    ...checkNotationConsistency(doc),
    ...checkWidthConsistency(doc),
  ]

  return findings
}
