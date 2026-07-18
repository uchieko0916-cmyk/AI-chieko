import type { Rule } from '../types'
import { redundantExpressionRules } from './redundantExpressions'
import { raNukiRules } from './raNuki'
import { doubleHonorificRules } from './doubleHonorifics'
import { patternRules } from './patternRules'

export const allPatternRules: Rule[] = [
  ...redundantExpressionRules,
  ...raNukiRules,
  ...doubleHonorificRules,
  ...patternRules,
]

export { checkNotationConsistency, checkWidthConsistency } from './consistency'
