export interface EditOperations {
  /** Cut N seconds off the start */
  trimStartSec?: number;
  /** Cut N seconds off the end */
  trimEndSec?: number;
  /** Keep only [rangeStartSec, rangeEndSec] */
  rangeStartSec?: number;
  rangeEndSec?: number;
  /** Text overlays burned into the whole remaining clip */
  texts: string[];
  grayscale?: boolean;
  mute?: boolean;
  /** 0.5 (half speed) - 2.0 (double speed) */
  speed?: number;
}

export interface ParseResult {
  ops: EditOperations;
  matchedSegments: string[];
  unrecognizedSegments: string[];
}

const NUM = '(\\d+(?:\\.\\d+)?)';

const RULES: { label: string; regex: RegExp; apply: (ops: EditOperations, m: RegExpMatchArray) => void }[] = [
  {
    label: '先頭カット',
    regex: new RegExp(`(?:最初|先頭|冒頭)の?\\s*${NUM}\\s*秒(?:間)?\\s*(?:を)?\\s*(?:カット|削除|消す|切る|除く)`),
    apply: (ops, m) => { ops.trimStartSec = parseFloat(m[1]); },
  },
  {
    label: '末尾カット',
    regex: new RegExp(`(?:最後|末尾|終わり|ラスト)の?\\s*${NUM}\\s*秒(?:間)?\\s*(?:を)?\\s*(?:カット|削除|消す|切る|除く)`),
    apply: (ops, m) => { ops.trimEndSec = parseFloat(m[1]); },
  },
  {
    label: '範囲切り抜き',
    regex: new RegExp(`${NUM}\\s*秒?\\s*(?:から|〜|~|-)\\s*${NUM}\\s*秒\\s*(?:を)?\\s*(?:抽出|切り抜|残す|使う|だけ)`),
    apply: (ops, m) => { ops.rangeStartSec = parseFloat(m[1]); ops.rangeEndSec = parseFloat(m[2]); },
  },
  {
    label: 'テキスト追加',
    // Branch 1 grabs whatever sits inside 「」/『』/"" quotes (unambiguous).
    // Branch 2 (no quotes) has to eat trailing conjugations like
    // "を追加して" itself, so it strips known suffix phrases before the
    // end of the segment instead of relying on a greedy quote match.
    regex: /(?:テロップ|テキスト|字幕)(?:を)?\s*(?:[:：]\s*)?(?:[「『"](.+?)[」』"]|(.+?)\s*(?:を追加(?:して)?|を入れる|を表示(?:して|する)?|を挿入(?:して|する)?|を出す)?$)/,
    apply: (ops, m) => { const t = (m[1] ?? m[2] ?? '').trim(); if (t) ops.texts.push(t); },
  },
  {
    label: 'モノクロ化',
    regex: /(白黒|モノクロ|グレースケール)/,
    apply: (ops) => { ops.grayscale = true; },
  },
  {
    label: 'ミュート',
    regex: /(ミュート|無音|音声(?:を)?(?:消す|オフ|なし|カット))/,
    apply: (ops) => { ops.mute = true; },
  },
  {
    label: '再生速度',
    regex: new RegExp(`${NUM}\\s*倍速`),
    apply: (ops, m) => {
      const speed = parseFloat(m[1]);
      ops.speed = Math.min(2, Math.max(0.5, speed));
    },
  },
];

/**
 * Splits a free-form Japanese instruction into segments and matches each
 * segment against known edit patterns. Unmatched segments are returned so
 * the UI can warn the user instead of silently ignoring their request.
 */
export function parseInstruction(input: string): ParseResult {
  const ops: EditOperations = { texts: [] };
  const matchedSegments: string[] = [];
  const unrecognizedSegments: string[] = [];

  const segments = input
    .split(/[\n、,。]/)
    .map((s) => s.trim())
    .filter(Boolean);

  for (const segment of segments) {
    let matched = false;
    for (const rule of RULES) {
      const m = segment.match(rule.regex);
      if (m) {
        rule.apply(ops, m);
        matchedSegments.push(`${rule.label}: ${segment}`);
        matched = true;
        break;
      }
    }
    if (!matched) unrecognizedSegments.push(segment);
  }

  return { ops, matchedSegments, unrecognizedSegments };
}
