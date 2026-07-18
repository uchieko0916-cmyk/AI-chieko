import type { Rule } from '../types'

export const patternRules: Rule[] = [
  {
    id: 'particle-no-chain',
    category: '読みにくさ',
    description: '「の」が短い間隔で3回以上連続しており読みにくくなっています。',
    pattern: /の[^の。、!?！?\n]{0,4}の[^の。、!?！?\n]{0,4}の/g,
    suggestion: '言い換えて「の」の連続を減らすことを検討してください',
    severity: 'info',
  },
  {
    id: 'double-sasete-itadaku',
    category: '二重敬語',
    description: '「させていただく」が二重に使われている可能性があります。',
    pattern: /させていただ[^、。\n]{0,6}させていただ/g,
    suggestion: '「させていただく」を1回にまとめる',
    severity: 'warning',
  },
]
