import type { Rule } from '../types'
import { literalRule } from './helpers'

/** 二重敬語（敬語を重ねてしまっている表現） */
const PAIRS: [wrong: string, right: string][] = [
  ['おっしゃられる', 'おっしゃる / 言われる'],
  ['ご覧になられる', 'ご覧になる'],
  ['お召し上がりになられる', '召し上がる'],
  ['お見えになられる', 'お見えになる'],
  ['なさられる', 'なさる / される'],
  ['伺わせていただく', '伺う'],
  ['お伺いさせていただく', '伺う'],
]

export const doubleHonorificRules: Rule[] = PAIRS.map(([wrong, right], i) =>
  literalRule(
    `double-honorific-${i + 1}`,
    '二重敬語',
    `「${wrong}」は敬語が重複した二重敬語の可能性があります。`,
    wrong,
    right,
  ),
)
