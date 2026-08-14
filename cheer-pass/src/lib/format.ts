const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"] as const;

export function weekdayJa(date: Date) {
  return WEEKDAYS[date.getDay()];
}

export function formatDateShort(date: Date) {
  const d = new Date(date);
  return `${d.getMonth() + 1}/${d.getDate()}(${weekdayJa(d)})`;
}

export function formatDateLong(date: Date) {
  const d = new Date(date);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日(${weekdayJa(d)})`;
}

export function formatMonthLabel(year: number, month: number) {
  return `${year}年${month}月`;
}

export function formatLessonWhen(date: Date, startTime: string, endTime: string) {
  return `${formatDateShort(date)} ${startTime}〜${endTime}`;
}

export function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}
