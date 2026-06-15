import { DayRecord, HabitRecord } from '../types/diet';

const STORAGE_KEY = 'chieko-diet-records';

export function getEmptyHabits(): HabitRecord {
  return { walking: false, workout: false, lunch: false, protein: false, halfRice: false };
}

export function getAllRecords(): DayRecord[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function getRecord(date: string): DayRecord {
  const records = getAllRecords();
  return records.find(r => r.date === date) ?? { date, habits: getEmptyHabits() };
}

export function saveRecord(record: DayRecord): void {
  const records = getAllRecords();
  const index = records.findIndex(r => r.date === record.date);
  if (index >= 0) {
    records[index] = record;
  } else {
    records.push(record);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export function countAchieved(habits: HabitRecord): number {
  return Object.values(habits).filter(Boolean).length;
}

export function isGoalMet(habits: HabitRecord): boolean {
  return countAchieved(habits) >= 2;
}

export function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getWeekDates(offset = 0): Date[] {
  const today = new Date();
  const day = today.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = new Date(today);
  monday.setDate(today.getDate() + mondayOffset + offset * 7);
  monday.setHours(0, 0, 0, 0);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}
