import type { ExtractedDocument, Finding } from '../types'
import { escapeRegExp } from './helpers'

/** 表記ゆれチェック対象のグループ（同じ意味で複数の書き方があるもの） */
const VARIANT_GROUPS: string[][] = [
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

function findFirstOccurrence(doc: ExtractedDocument, needle: string) {
  for (const segment of doc.segments) {
    const index = segment.text.indexOf(needle)
    if (index !== -1) return { segment, index }
  }
  return null
}

function countOccurrences(doc: ExtractedDocument, needle: string): number {
  const re = new RegExp(escapeRegExp(needle), 'g')
  let count = 0
  for (const segment of doc.segments) {
    count += segment.text.match(re)?.length ?? 0
  }
  return count
}

export function checkNotationConsistency(doc: ExtractedDocument): Finding[] {
  const findings: Finding[] = []

  for (const group of VARIANT_GROUPS) {
    const counts = group.map((variant) => ({ variant, count: countOccurrences(doc, variant) }))
    const used = counts.filter((c) => c.count > 0)
    if (used.length < 2) continue

    const first = findFirstOccurrence(doc, used[0].variant)
    if (!first) continue

    findings.push({
      id: `notation-consistency-${group.join('-')}`,
      ruleId: 'notation-consistency',
      category: '表記ゆれ',
      description: `表記ゆれ: ${used.map((c) => `「${c.variant}」(${c.count}件)`).join('、')} が混在しています。表記を統一しましょう。`,
      severity: 'warning',
      segmentId: first.segment.id,
      segmentLabel: first.segment.label,
      matchedText: used[0].variant,
      contextBefore: first.segment.text.slice(Math.max(0, first.index - 15), first.index),
      contextAfter: first.segment.text.slice(first.index + used[0].variant.length, first.index + used[0].variant.length + 15),
    })
  }

  return findings
}

const WIDTH_PAIRS: [full: string, half: string, label: string][] = [
  ['！', '!', '感嘆符'],
  ['？', '?', '疑問符'],
  ['０１２３４５６７８９', '0123456789', '数字'],
]

function containsAny(doc: ExtractedDocument, chars: string): boolean {
  return doc.segments.some((s) => [...chars].some((c) => s.text.includes(c)))
}

export function checkWidthConsistency(doc: ExtractedDocument): Finding[] {
  const findings: Finding[] = []

  for (const [full, half, label] of WIDTH_PAIRS) {
    const hasFull = containsAny(doc, full)
    const hasHalf = containsAny(doc, half)
    if (!hasFull || !hasHalf) continue

    const firstChar = [...full].find((c) => doc.segments.some((s) => s.text.includes(c))) ?? full[0]
    const first = findFirstOccurrence(doc, firstChar)
    if (!first) continue

    findings.push({
      id: `width-consistency-${label}`,
      ruleId: 'width-consistency',
      category: '全角半角混在',
      description: `全角・半角の${label}が混在しています。表記を統一しましょう。`,
      severity: 'info',
      segmentId: first.segment.id,
      segmentLabel: first.segment.label,
      matchedText: firstChar,
      contextBefore: first.segment.text.slice(Math.max(0, first.index - 15), first.index),
      contextAfter: first.segment.text.slice(first.index + 1, first.index + 1 + 15),
    })
  }

  return findings
}
