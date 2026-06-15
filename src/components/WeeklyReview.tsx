import { useState } from 'react';
import { HABITS, GOAL } from '../types/diet';
import { getAllRecords, countAchieved, isGoalMet, formatDate, getWeekDates } from '../utils/dietStorage';

const DAY_NAMES = ['月', '火', '水', '木', '金', '土', '日'];

export default function WeeklyReview() {
  const [weekOffset, setWeekOffset] = useState(0);
  const weekDates = getWeekDates(weekOffset);
  const allRecords = getAllRecords();
  const today = formatDate(new Date());

  const weekRecords = weekDates.map((date, i) => {
    const dateStr = formatDate(date);
    const record = allRecords.find(r => r.date === dateStr);
    return {
      date,
      dateStr,
      dayName: DAY_NAMES[i],
      habits: record?.habits ?? null,
      isToday: dateStr === today,
      isFuture: dateStr > today,
    };
  });

  const daysWithGoal = weekRecords.filter(r => r.habits && isGoalMet(r.habits)).length;
  const totalAchieved = weekRecords.reduce(
    (sum, r) => sum + (r.habits ? countAchieved(r.habits) : 0),
    0
  );
  const recordedDays = weekRecords.filter(r => r.habits && !r.isFuture).length;

  const weekLabel = (() => {
    const start = weekDates[0];
    const end = weekDates[6];
    return `${start.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })} 〜 ${end.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}`;
  })();

  return (
    <div>
      {/* Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setWeekOffset(o => o - 1)}
          className="w-10 h-10 rounded-full bg-white border border-rose-100 text-rose-400 hover:bg-rose-50 flex items-center justify-center text-lg font-bold shadow-sm"
        >
          ‹
        </button>
        <div className="text-center">
          <p className="text-sm font-bold text-gray-700">{weekLabel}</p>
          <p className="text-xs text-rose-400 mt-0.5">
            {weekOffset === 0 ? '今週' : weekOffset === -1 ? '先週' : `${Math.abs(weekOffset)}週前`}
          </p>
        </div>
        <button
          onClick={() => setWeekOffset(o => o + 1)}
          disabled={weekOffset >= 0}
          className="w-10 h-10 rounded-full bg-white border border-rose-100 text-rose-400 hover:bg-rose-50 flex items-center justify-center text-lg font-bold shadow-sm disabled:opacity-30 disabled:cursor-not-allowed"
        >
          ›
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-2 mb-5">
        <div className="bg-white rounded-2xl p-3 text-center shadow-sm border border-rose-50">
          <p className="text-2xl font-black text-rose-500">
            {daysWithGoal}
            <span className="text-sm text-gray-300">/7</span>
          </p>
          <p className="text-xs text-gray-400 mt-1">目標達成日</p>
        </div>
        <div className="bg-white rounded-2xl p-3 text-center shadow-sm border border-rose-50">
          <p className="text-2xl font-black text-rose-500">{totalAchieved}</p>
          <p className="text-xs text-gray-400 mt-1">総達成数</p>
        </div>
        <div className="bg-white rounded-2xl p-3 text-center shadow-sm border border-rose-50">
          <p className="text-2xl font-black text-rose-500">{recordedDays}</p>
          <p className="text-xs text-gray-400 mt-1">記録した日</p>
        </div>
      </div>

      {/* Progress bar for goal days */}
      {recordedDays > 0 && (
        <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-rose-50">
          <div className="flex justify-between text-xs text-gray-500 mb-2">
            <span className="font-medium">週間達成率</span>
            <span className="font-bold text-rose-500">
              {recordedDays > 0 ? Math.round((daysWithGoal / Math.min(recordedDays + (weekOffset === 0 ? 0 : 0), 7)) * 100) : 0}%
            </span>
          </div>
          <div className="h-3 bg-rose-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-rose-400 rounded-full transition-all duration-700"
              style={{ width: `${(daysWithGoal / 7) * 100}%` }}
            />
          </div>
          <div className="flex justify-end mt-1">
            <span className="text-xs text-gray-300">{daysWithGoal}/7日達成</span>
          </div>
        </div>
      )}

      {/* Day list */}
      <div className="space-y-2">
        {weekRecords.map(day => {
          const achieved = day.habits ? countAchieved(day.habits) : 0;
          const goalMet = achieved >= GOAL;
          const isWeekend = day.dayName === '土' || day.dayName === '日';

          return (
            <div
              key={day.dateStr}
              className={`rounded-2xl p-3 border-2 transition-all ${
                day.isToday
                  ? 'border-rose-300 bg-rose-50'
                  : day.isFuture
                  ? 'border-gray-100 bg-gray-50/60'
                  : goalMet
                  ? 'border-emerald-200 bg-emerald-50'
                  : day.habits
                  ? 'border-amber-100 bg-amber-50/50'
                  : 'border-gray-100 bg-white'
              }`}
            >
              <div className="flex items-center gap-3">
                {/* Day badge */}
                <div
                  className={`w-10 h-10 rounded-full flex flex-col items-center justify-center shrink-0 ${
                    day.isToday
                      ? 'bg-rose-400 text-white'
                      : goalMet
                      ? 'bg-emerald-400 text-white'
                      : isWeekend
                      ? 'bg-rose-100 text-rose-400 border border-rose-200'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  <span className="text-xs font-black leading-none">{day.dayName}</span>
                  <span className="text-[10px] leading-none mt-0.5 opacity-70">
                    {day.date.getDate()}
                  </span>
                </div>

                {/* Habit emojis */}
                <div className="flex-1">
                  {day.isFuture ? (
                    <span className="text-xs text-gray-300">まだ先です</span>
                  ) : day.habits ? (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {HABITS.map(habit => {
                        const done = day.habits![habit.key];
                        return (
                          <span
                            key={habit.key}
                            className={`text-base transition-all ${done ? 'opacity-100' : 'opacity-15 grayscale'}`}
                            title={habit.label}
                          >
                            {habit.emoji}
                          </span>
                        );
                      })}
                    </div>
                  ) : (
                    <span className="text-xs text-gray-300">記録なし</span>
                  )}
                </div>

                {/* Count */}
                <div className="text-right shrink-0">
                  {!day.isFuture && day.habits && (
                    <div>
                      <span className={`text-sm font-black ${goalMet ? 'text-emerald-500' : 'text-amber-500'}`}>
                        {achieved}/{HABITS.length}
                      </span>
                      {goalMet && (
                        <div className="text-xs text-emerald-500 font-bold">達成</div>
                      )}
                    </div>
                  )}
                  {day.isToday && !day.habits && (
                    <span className="text-xs text-rose-300 font-medium">今日</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Habit legend */}
      <div className="mt-5 bg-white rounded-2xl p-4 shadow-sm border border-rose-50">
        <p className="text-xs font-bold text-gray-500 mb-2">ハビット一覧</p>
        <div className="space-y-1.5">
          {HABITS.map(h => (
            <div key={h.key} className="flex items-center gap-2">
              <span className="text-base">{h.emoji}</span>
              <span className="text-xs text-gray-600">{h.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
