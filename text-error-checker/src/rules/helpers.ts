import type { Severity, StoredRule } from '../types'

export function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** Builds a built-in rule that flags a literal wrong phrase and suggests a literal replacement. */
export function literalRule(
  id: string,
  category: string,
  description: string,
  wrong: string,
  right: string,
  severity: Severity = 'warning',
): StoredRule {
  return {
    id,
    category,
    description,
    matchType: 'literal',
    pattern: wrong,
    suggestion: right,
    severity,
    enabled: true,
    isBuiltIn: true,
  }
}
