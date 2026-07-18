import type { StoredRule } from '../types'
import { redundantExpressionRules } from './redundantExpressions'
import { raNukiRules } from './raNuki'
import { doubleHonorificRules } from './doubleHonorifics'
import { patternRules } from './patternRules'

export const DEFAULT_RULES: StoredRule[] = [
  ...redundantExpressionRules,
  ...raNukiRules,
  ...doubleHonorificRules,
  ...patternRules,
]
