import type { Finding } from '../types'
import { SEVERITY_LABELS, SEVERITY_STYLES } from '../constants'

interface Props {
  findings: Finding[]
}

export function ResultList({ findings }: Props) {
  if (findings.length === 0) {
    return (
      <div className="rounded-lg border border-green-300 bg-green-50 p-6 text-center text-green-700">
        指摘事項は見つかりませんでした。
      </div>
    )
  }

  return (
    <ul className="space-y-3">
      {findings.map((finding) => (
        <li
          key={finding.id}
          className={`rounded-lg border p-4 ${SEVERITY_STYLES[finding.severity]}`}
        >
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="rounded-full border px-2 py-0.5 font-semibold">
              {SEVERITY_LABELS[finding.severity]}
            </span>
            <span className="rounded-full border px-2 py-0.5">{finding.category}</span>
            <span className="text-gray-600">{finding.segmentLabel}</span>
          </div>

          <p className="mt-2 text-gray-800">
            {finding.contextBefore}
            <mark className="rounded bg-yellow-200 px-0.5 font-semibold">
              {finding.matchedText}
            </mark>
            {finding.contextAfter}
          </p>

          <p className="mt-1 text-sm text-gray-700">{finding.description}</p>
          {finding.suggestion && (
            <p className="mt-1 text-sm text-gray-600">修正案: {finding.suggestion}</p>
          )}
        </li>
      ))}
    </ul>
  )
}
