import type { Rule, Severity } from '../types'

export function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** Builds a rule that flags a literal wrong phrase and suggests a literal replacement. */
export function literalRule(
  id: string,
  category: string,
  description: string,
  wrong: string,
  right: string,
  severity: Severity = 'warning',
): Rule {
  return {
    id,
    category,
    description,
    pattern: new RegExp(escapeRegExp(wrong), 'g'),
    suggestion: right,
    severity,
  }
}
