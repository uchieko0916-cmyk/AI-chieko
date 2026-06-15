import { useState } from 'react';
import { HABITS, HabitKey, GOAL } from '../types/diet';
import { getRecord, saveRecord, countAchieved, formatDate } from '../utils/dietStorage';

export default function DailyTracker() {
  const today = formatDate(new Date());
  const [record, setRecord] = useState(() => getRecord(today));

  const achieved = countAchieved(record.habits);
  const goalMet = achieved >= GOAL;
  const remaining = Math.max(0, GOAL - achieved);

  const todayLabel = new Date().toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  });

  const toggle = (key: HabitKey) => {
    const updated = {
      ...record,
      habits: { ...record.habits, [key]: !record.habits[key] },
    };
    setRecord(updated);
    saveRecord(updated);
  };

  return (
    <div>
      {/* Date & progress */}
      <div className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-rose-50 text-center">
        <p className="text-sm text-rose-400 font-medium mb-3">{todayLabel}</p>

        <div className="flex items-center justify-center gap-2 mb-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-lg transition-all duration-300 ${
                i < achieved ? 'bg-emerald-400 scale-110' : 'bg-gray-100'
              }`}
            >
              {i < achieved ? '✓' : ''}
            </div>
          ))}
        </div>

        <div className="h-2.5 bg-rose-100 rounded-full overflow-hidden mb-3">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              goalMet ? 'bg-emerald-400' : 'bg-rose-400'
            }`}
            style={{ width: `${(achieved / HABITS.length) * 100}%` }}
          />
        </div>

        {goalMet ? (
          <div className="py-2 px-4 bg-emerald-50 rounded-xl border border-emerald-200">
            <p className="text-emerald-600 font-black text-sm">
              {achieved === HABITS.length ? '🏆 全部達成！すごい！' : '🎉 今日の目標達成！'}
            </p>
          </div>
        ) : (
          <p className="text-sm text-gray-400">
            あと{' '}
            <span className="font-black text-rose-500 text-base">{remaining}</span>
            {' '}つで目標達成
          </p>
        )}
      </div>

      {/* Habit cards */}
      <div className="space-y-3">
        {HABITS.map(habit => {
          const checked = record.habits[habit.key];
          return (
            <button
              key={habit.key}
              onClick={() => toggle(habit.key)}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all duration-200 active:scale-98 ${
                checked
                  ? 'bg-emerald-50 border-emerald-300 shadow-sm'
                  : 'bg-white border-gray-100 hover:border-rose-200 shadow-sm'
              }`}
            >
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 transition-all duration-200 ${
                  checked ? 'bg-emerald-400' : 'bg-rose-50'
                }`}
              >
                {checked ? '✓' : habit.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`font-bold text-sm ${checked ? 'text-emerald-700 line-through opacity-70' : 'text-gray-800'}`}>
                  {habit.label}
                </p>
                <p className={`text-xs mt-0.5 ${checked ? 'text-emerald-500' : 'text-gray-400'}`}>
                  {habit.description}
                </p>
              </div>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                checked ? 'bg-emerald-400 border-emerald-400' : 'border-gray-200'
              }`}>
                {checked && <span className="text-white text-xs font-black">✓</span>}
              </div>
            </button>
          );
        })}
      </div>

      <p className="text-center text-xs text-gray-300 mt-6">タップでチェック・解除できます</p>
    </div>
  );
}
