import type { StoredRule } from '../types'
import { literalRule } from './helpers'

/** 二重表現（同じ意味を重ねてしまっている表現） */
const PAIRS: [wrong: string, right: string][] = [
  ['頭痛が痛い', '頭が痛い / 頭痛がする'],
  ['犯罪を犯す', '罪を犯す'],
  ['まだ未定', '未定'],
  ['あとで後悔', 'あとで悔やむ / 後悔する'],
  ['一番最初', '最初'],
  ['一番最後', '最後'],
  ['まず最初に', 'まず / 最初に'],
  ['古来から', '古来 / 昔から'],
  ['従来から', '従来 / 以前から'],
  ['射程距離', '射程'],
  ['挙式を挙げる', '式を挙げる'],
  ['加工を加える', '加工する'],
  ['各自各々', '各自 / 各々'],
  ['あらかじめ予約', '予約'],
  ['元旦の朝', '元旦'],
  ['過半数を超える', '過半数に達する / 半数を超える'],
  ['内定が決まる', '内定する'],
]

export const redundantExpressionRules: StoredRule[] = PAIRS.map(([wrong, right], i) =>
  literalRule(
    `redundant-${i + 1}`,
    '二重表現',
    `「${wrong}」は意味が重複した二重表現です。`,
    wrong,
    right,
  ),
)
