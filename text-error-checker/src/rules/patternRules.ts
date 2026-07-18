import type { StoredRule } from '../types'

export const patternRules: StoredRule[] = [
  {
    id: 'particle-no-chain',
    category: '読みにくさ',
    description: '「の」が短い間隔で3回以上連続しており読みにくくなっています。',
    matchType: 'regex',
    pattern: 'の[^の。、!?！?\\n]{0,4}の[^の。、!?！?\\n]{0,4}の',
    suggestion: '言い換えて「の」の連続を減らすことを検討してください',
    severity: 'info',
    enabled: true,
    isBuiltIn: true,
  },
  {
    id: 'double-sasete-itadaku',
    category: '二重敬語',
    description: '「させていただく」が二重に使われている可能性があります。',
    matchType: 'regex',
    pattern: 'させていただ[^、。\\n]{0,6}させていただ',
    suggestion: '「させていただく」を1回にまとめる',
    severity: 'warning',
    enabled: true,
    isBuiltIn: true,
  },
]
