import type { StoredRule, VariantGroup } from '../types'
import { DEFAULT_RULES, DEFAULT_VARIANT_GROUPS } from '../rules'

const RULES_KEY = 'text-error-checker:rules:v1'
const GROUPS_KEY = 'text-error-checker:variant-groups:v1'

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function writeJson(key: string, value: unknown): void {
  localStorage.setItem(key, JSON.stringify(value))
}

function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function getRules(): StoredRule[] {
  return readJson(RULES_KEY, DEFAULT_RULES)
}

export function saveRules(rules: StoredRule[]): void {
  writeJson(RULES_KEY, rules)
}

export function addRule(rule: Omit<StoredRule, 'id' | 'isBuiltIn'>): StoredRule {
  const newRule: StoredRule = { ...rule, id: generateId('custom-rule'), isBuiltIn: false }
  saveRules([...getRules(), newRule])
  return newRule
}

export function updateRule(id: string, patch: Partial<StoredRule>): void {
  saveRules(getRules().map((r) => (r.id === id ? { ...r, ...patch, id: r.id, isBuiltIn: r.isBuiltIn } : r)))
}

export function deleteRule(id: string): void {
  saveRules(getRules().filter((r) => r.id !== id))
}

export function resetRulesToDefault(): void {
  saveRules(DEFAULT_RULES)
}

export function getVariantGroups(): VariantGroup[] {
  return readJson(GROUPS_KEY, DEFAULT_VARIANT_GROUPS)
}

export function saveVariantGroups(groups: VariantGroup[]): void {
  writeJson(GROUPS_KEY, groups)
}

export function addVariantGroup(words: string[]): VariantGroup {
  const newGroup: VariantGroup = { id: generateId('custom-group'), words, enabled: true, isBuiltIn: false }
  saveVariantGroups([...getVariantGroups(), newGroup])
  return newGroup
}

export function updateVariantGroup(id: string, words: string[], enabled: boolean): void {
  saveVariantGroups(getVariantGroups().map((g) => (g.id === id ? { ...g, words, enabled } : g)))
}

export function deleteVariantGroup(id: string): void {
  saveVariantGroups(getVariantGroups().filter((g) => g.id !== id))
}

export function resetVariantGroupsToDefault(): void {
  saveVariantGroups(DEFAULT_VARIANT_GROUPS)
}
