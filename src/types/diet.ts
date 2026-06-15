export interface HabitRecord {
  walking: boolean;
  workout: boolean;
  lunch: boolean;
  protein: boolean;
  halfRice: boolean;
}

export interface DayRecord {
  date: string; // YYYY-MM-DD
  habits: HabitRecord;
}

export type HabitKey = keyof HabitRecord;

export const HABITS: { key: HabitKey; label: string; emoji: string; description: string }[] = [
  { key: 'walking', label: '30分ウォーキング', emoji: '🚶', description: '外を歩いてリフレッシュ！' },
  { key: 'workout', label: '筋トレ', emoji: '💪', description: '体を鍛えて代謝アップ！' },
  { key: 'lunch', label: 'ヘルシーランチ', emoji: '🍱', description: '春雨ヌードルかおにぎりに' },
  { key: 'protein', label: '朝プロテイン', emoji: '🥤', description: 'プロテインで筋肉をサポート' },
  { key: 'halfRice', label: '夜ご飯のご飯を半分', emoji: '🍚', description: 'お米を半分に抑える' },
];

export const GOAL = 2;
