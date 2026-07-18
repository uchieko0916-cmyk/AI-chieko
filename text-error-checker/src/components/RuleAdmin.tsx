import { useState } from 'react'
import type { MatchType, Severity, StoredRule, VariantGroup } from '../types'
import { SEVERITY_LABELS } from '../constants'
import {
  addRule,
  addVariantGroup,
  deleteRule,
  deleteVariantGroup,
  getRules,
  getVariantGroups,
  resetRulesToDefault,
  resetVariantGroupsToDefault,
  updateRule,
  updateVariantGroup,
} from '../lib/ruleStore'

interface RuleDraft {
  category: string
  description: string
  matchType: MatchType
  pattern: string
  flags: string
  suggestion: string
  severity: Severity
  enabled: boolean
}

const EMPTY_DRAFT: RuleDraft = {
  category: '',
  description: '',
  matchType: 'literal',
  pattern: '',
  flags: '',
  suggestion: '',
  severity: 'warning',
  enabled: true,
}

function toDraft(rule: StoredRule): RuleDraft {
  return {
    category: rule.category,
    description: rule.description,
    matchType: rule.matchType,
    pattern: rule.pattern,
    flags: rule.flags ?? '',
    suggestion: rule.suggestion ?? '',
    severity: rule.severity,
    enabled: rule.enabled,
  }
}

function validateDraft(draft: RuleDraft): string | null {
  if (!draft.category.trim()) return 'カテゴリを入力してください'
  if (!draft.description.trim()) return '説明を入力してください'
  if (!draft.pattern.trim()) {
    return draft.matchType === 'literal' ? '検出する語句を入力してください' : '正規表現を入力してください'
  }
  if (draft.matchType === 'regex') {
    try {
      new RegExp(draft.pattern, draft.flags || undefined)
    } catch (e) {
      return `正規表現が不正です: ${(e as Error).message}`
    }
  }
  return null
}

interface RuleFormProps {
  draft: RuleDraft
  onChange: (draft: RuleDraft) => void
  onSubmit: () => void
  onCancel?: () => void
  submitLabel: string
  error: string | null
}

function RuleForm({ draft, onChange, onSubmit, onCancel, submitLabel, error }: RuleFormProps) {
  return (
    <form
      className="grid grid-cols-1 gap-3 rounded-lg border border-gray-200 bg-white p-4 sm:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit()
      }}
    >
      <label className="text-sm">
        カテゴリ
        <input
          className="mt-1 w-full rounded border border-gray-300 px-2 py-1"
          value={draft.category}
          onChange={(e) => onChange({ ...draft, category: e.target.value })}
          placeholder="例: 二重表現"
        />
      </label>

      <label className="text-sm">
        重要度
        <select
          className="mt-1 w-full rounded border border-gray-300 px-2 py-1"
          value={draft.severity}
          onChange={(e) => onChange({ ...draft, severity: e.target.value as Severity })}
        >
          {(Object.keys(SEVERITY_LABELS) as Severity[]).map((s) => (
            <option key={s} value={s}>
              {SEVERITY_LABELS[s]}
            </option>
          ))}
        </select>
      </label>

      <label className="text-sm sm:col-span-2">
        説明
        <input
          className="mt-1 w-full rounded border border-gray-300 px-2 py-1"
          value={draft.description}
          onChange={(e) => onChange({ ...draft, description: e.target.value })}
          placeholder="例: 「頭痛が痛い」は意味が重複した二重表現です。"
        />
      </label>

      <label className="text-sm">
        判定方法
        <select
          className="mt-1 w-full rounded border border-gray-300 px-2 py-1"
          value={draft.matchType}
          onChange={(e) => onChange({ ...draft, matchType: e.target.value as MatchType })}
        >
          <option value="literal">単語の完全一致</option>
          <option value="regex">正規表現</option>
        </select>
      </label>

      <label className="text-sm">
        {draft.matchType === 'literal' ? '検出する語句' : '正規表現パターン'}
        <input
          className="mt-1 w-full rounded border border-gray-300 px-2 py-1 font-mono"
          value={draft.pattern}
          onChange={(e) => onChange({ ...draft, pattern: e.target.value })}
          placeholder={draft.matchType === 'literal' ? '例: 頭痛が痛い' : '例: の.{0,4}の.{0,4}の'}
        />
      </label>

      {draft.matchType === 'regex' && (
        <label className="text-sm">
          フラグ（任意）
          <input
            className="mt-1 w-full rounded border border-gray-300 px-2 py-1 font-mono"
            value={draft.flags}
            onChange={(e) => onChange({ ...draft, flags: e.target.value })}
            placeholder="例: i"
          />
        </label>
      )}

      <label className="text-sm sm:col-span-2">
        修正案（任意）
        <input
          className="mt-1 w-full rounded border border-gray-300 px-2 py-1"
          value={draft.suggestion}
          onChange={(e) => onChange({ ...draft, suggestion: e.target.value })}
          placeholder="例: 頭が痛い / 頭痛がする"
        />
      </label>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={draft.enabled}
          onChange={(e) => onChange({ ...draft, enabled: e.target.checked })}
        />
        有効にする
      </label>

      {error && <p className="text-sm text-red-600 sm:col-span-2">{error}</p>}

      <div className="flex gap-2 sm:col-span-2">
        <button
          type="submit"
          className="rounded bg-blue-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          {submitLabel}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="rounded border border-gray-300 px-4 py-1.5 text-sm">
            キャンセル
          </button>
        )}
      </div>
    </form>
  )
}

export function RuleAdmin() {
  const [rules, setRules] = useState<StoredRule[]>(() => getRules())
  const [groups, setGroups] = useState<VariantGroup[]>(() => getVariantGroups())

  const [newRuleDraft, setNewRuleDraft] = useState<RuleDraft>(EMPTY_DRAFT)
  const [newRuleError, setNewRuleError] = useState<string | null>(null)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editDraft, setEditDraft] = useState<RuleDraft>(EMPTY_DRAFT)
  const [editError, setEditError] = useState<string | null>(null)

  const [newGroupWords, setNewGroupWords] = useState('')
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null)
  const [editingGroupWords, setEditingGroupWords] = useState('')

  function refreshRules() {
    setRules(getRules())
  }
  function refreshGroups() {
    setGroups(getVariantGroups())
  }

  function draftToRulePatch(draft: RuleDraft) {
    return {
      category: draft.category.trim(),
      description: draft.description.trim(),
      matchType: draft.matchType,
      pattern: draft.pattern,
      flags: draft.matchType === 'regex' ? draft.flags.trim() || undefined : undefined,
      suggestion: draft.suggestion.trim() || undefined,
      severity: draft.severity,
      enabled: draft.enabled,
    }
  }

  function handleAddRule() {
    const validationError = validateDraft(newRuleDraft)
    if (validationError) {
      setNewRuleError(validationError)
      return
    }
    addRule(draftToRulePatch(newRuleDraft))
    setNewRuleDraft(EMPTY_DRAFT)
    setNewRuleError(null)
    refreshRules()
  }

  function startEdit(rule: StoredRule) {
    setEditingId(rule.id)
    setEditDraft(toDraft(rule))
    setEditError(null)
  }

  function handleSaveEdit() {
    if (!editingId) return
    const validationError = validateDraft(editDraft)
    if (validationError) {
      setEditError(validationError)
      return
    }
    updateRule(editingId, draftToRulePatch(editDraft))
    setEditingId(null)
    refreshRules()
  }

  function handleDeleteRule(id: string) {
    if (!window.confirm('このルールを削除しますか？')) return
    deleteRule(id)
    refreshRules()
  }

  function handleToggleRule(rule: StoredRule) {
    updateRule(rule.id, { enabled: !rule.enabled })
    refreshRules()
  }

  function handleResetRules() {
    if (!window.confirm('検出ルールを初期状態に戻しますか？追加・編集した内容は失われます。')) return
    resetRulesToDefault()
    refreshRules()
  }

  function parseGroupWords(input: string): string[] {
    return input
      .split(/[,、]/)
      .map((w) => w.trim())
      .filter(Boolean)
  }

  function handleAddGroup() {
    const words = parseGroupWords(newGroupWords)
    if (words.length < 2) {
      window.alert('カンマ区切りで2つ以上の表記ゆれ候補を入力してください')
      return
    }
    addVariantGroup(words)
    setNewGroupWords('')
    refreshGroups()
  }

  function handleSaveGroupEdit(group: VariantGroup) {
    const words = parseGroupWords(editingGroupWords)
    if (words.length < 2) {
      window.alert('カンマ区切りで2つ以上の表記ゆれ候補を入力してください')
      return
    }
    updateVariantGroup(group.id, words, group.enabled)
    setEditingGroupId(null)
    refreshGroups()
  }

  function handleDeleteGroup(id: string) {
    if (!window.confirm('この表記ゆれグループを削除しますか？')) return
    deleteVariantGroup(id)
    refreshGroups()
  }

  function handleToggleGroup(group: VariantGroup) {
    updateVariantGroup(group.id, group.words, !group.enabled)
    refreshGroups()
  }

  function handleResetGroups() {
    if (!window.confirm('表記ゆれグループを初期状態に戻しますか？追加・編集した内容は失われます。')) return
    resetVariantGroupsToDefault()
    refreshGroups()
  }

  return (
    <div className="space-y-10">
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">検出ルール</h2>
          <button onClick={handleResetRules} className="text-sm text-gray-500 underline hover:text-gray-700">
            初期状態に戻す
          </button>
        </div>

        <RuleForm
          draft={newRuleDraft}
          onChange={setNewRuleDraft}
          onSubmit={handleAddRule}
          submitLabel="ルールを追加"
          error={newRuleError}
        />

        <ul className="mt-4 space-y-2">
          {rules.map((rule) =>
            editingId === rule.id ? (
              <li key={rule.id}>
                <RuleForm
                  draft={editDraft}
                  onChange={setEditDraft}
                  onSubmit={handleSaveEdit}
                  onCancel={() => setEditingId(null)}
                  submitLabel="保存"
                  error={editError}
                />
              </li>
            ) : (
              <li
                key={rule.id}
                className={`flex items-start justify-between gap-3 rounded-lg border p-3 ${
                  rule.enabled ? 'border-gray-200 bg-white' : 'border-gray-200 bg-gray-100 opacity-60'
                }`}
              >
                <div className="text-sm">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border px-2 py-0.5 text-xs font-semibold">{rule.category}</span>
                    <span className="rounded-full border px-2 py-0.5 text-xs">{SEVERITY_LABELS[rule.severity]}</span>
                    {!rule.isBuiltIn && <span className="text-xs text-blue-600">カスタム</span>}
                  </div>
                  <p className="mt-1 text-gray-800">{rule.description}</p>
                  <p className="mt-1 font-mono text-xs text-gray-500">
                    {rule.matchType === 'literal' ? '一致' : '正規表現'}: {rule.pattern}
                    {rule.flags ? ` (${rule.flags})` : ''}
                  </p>
                  {rule.suggestion && <p className="mt-1 text-xs text-gray-500">修正案: {rule.suggestion}</p>}
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1 text-sm">
                  <label className="flex items-center gap-1">
                    <input type="checkbox" checked={rule.enabled} onChange={() => handleToggleRule(rule)} />
                    有効
                  </label>
                  <button onClick={() => startEdit(rule)} className="text-blue-600 hover:underline">
                    編集
                  </button>
                  <button onClick={() => handleDeleteRule(rule.id)} className="text-red-600 hover:underline">
                    削除
                  </button>
                </div>
              </li>
            ),
          )}
        </ul>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">表記ゆれグループ</h2>
          <button onClick={handleResetGroups} className="text-sm text-gray-500 underline hover:text-gray-700">
            初期状態に戻す
          </button>
        </div>
        <p className="mb-2 text-sm text-gray-600">
          同じ意味で複数の書き方がある語句をカンマ区切りで登録すると、文書内で表記が混在している場合に警告します。
        </p>

        <div className="flex gap-2">
          <input
            className="flex-1 rounded border border-gray-300 px-2 py-1 text-sm"
            value={newGroupWords}
            onChange={(e) => setNewGroupWords(e.target.value)}
            placeholder="例: 問い合わせ, 問合せ, お問い合わせ"
          />
          <button
            onClick={handleAddGroup}
            className="rounded bg-blue-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            追加
          </button>
        </div>

        <ul className="mt-4 space-y-2">
          {groups.map((group) =>
            editingGroupId === group.id ? (
              <li key={group.id} className="flex gap-2 rounded-lg border border-gray-200 bg-white p-3">
                <input
                  className="flex-1 rounded border border-gray-300 px-2 py-1 text-sm"
                  value={editingGroupWords}
                  onChange={(e) => setEditingGroupWords(e.target.value)}
                />
                <button
                  onClick={() => handleSaveGroupEdit(group)}
                  className="rounded bg-blue-600 px-3 py-1 text-sm text-white"
                >
                  保存
                </button>
                <button onClick={() => setEditingGroupId(null)} className="rounded border border-gray-300 px-3 py-1 text-sm">
                  キャンセル
                </button>
              </li>
            ) : (
              <li
                key={group.id}
                className={`flex items-center justify-between gap-3 rounded-lg border p-3 text-sm ${
                  group.enabled ? 'border-gray-200 bg-white' : 'border-gray-200 bg-gray-100 opacity-60'
                }`}
              >
                <span>{group.words.join(' / ')}</span>
                <div className="flex shrink-0 items-center gap-3">
                  <label className="flex items-center gap-1">
                    <input type="checkbox" checked={group.enabled} onChange={() => handleToggleGroup(group)} />
                    有効
                  </label>
                  <button
                    onClick={() => {
                      setEditingGroupId(group.id)
                      setEditingGroupWords(group.words.join(', '))
                    }}
                    className="text-blue-600 hover:underline"
                  >
                    編集
                  </button>
                  <button onClick={() => handleDeleteGroup(group.id)} className="text-red-600 hover:underline">
                    削除
                  </button>
                </div>
              </li>
            ),
          )}
        </ul>
      </section>
    </div>
  )
}
