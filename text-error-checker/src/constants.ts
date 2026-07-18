import type { Severity } from './types'

export const SEVERITY_LABELS: Record<Severity, string> = {
  error: '誤り',
  warning: '要確認',
  info: '提案',
}

export const SEVERITY_STYLES: Record<Severity, string> = {
  error: 'bg-red-100 text-red-700 border-red-300',
  warning: 'bg-amber-100 text-amber-700 border-amber-300',
  info: 'bg-blue-100 text-blue-700 border-blue-300',
}
