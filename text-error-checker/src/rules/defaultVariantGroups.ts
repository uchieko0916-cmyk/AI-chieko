import type { VariantGroup } from '../types'

/** 表記ゆれチェック対象のグループ（同じ意味で複数の書き方があるもの） */
const GROUPS: string[][] = [
  ['子供', '子ども', 'こども'],
  ['問い合わせ', '問合せ', 'お問い合わせ'],
  ['申し込み', '申込み', '申込'],
  ['取り組み', '取組み', '取組'],
  ['打ち合わせ', '打ち合せ', '打合せ'],
  ['ユーザー', 'ユーザ'],
  ['サーバー', 'サーバ'],
  ['コンピューター', 'コンピュータ'],
  ['プリンター', 'プリンタ'],
  ['出来る', 'できる'],
  ['下さい', 'ください'],
  ['頂く', 'いただく'],
]

export const DEFAULT_VARIANT_GROUPS: VariantGroup[] = GROUPS.map((words, i) => ({
  id: `variant-${i + 1}`,
  words,
  enabled: true,
  isBuiltIn: true,
}))
