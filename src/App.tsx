import { useState } from 'react';
import DailyTracker from './components/DailyTracker';
import WeeklyReview from './components/WeeklyReview';

// Kept for backward compatibility with unused dance components
export interface TeacherVideo {
  url: string;
  name: string;
  isDemo: boolean;
}

type Tab = 'today' | 'weekly';

const TABS: { key: Tab; label: string; emoji: string }[] = [
  { key: 'today', label: '今日', emoji: '📅' },
  { key: 'weekly', label: '週間ふりかえり', emoji: '📊' },
];

export default function App() {
  const [tab, setTab] = useState<Tab>('today');

  return (
    <div className="min-h-screen bg-rose-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-rose-100 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <span className="text-2xl">🌸</span>
          <div>
            <h1 className="text-base font-black text-rose-900 leading-none">ちえこのダイエット記録</h1>
            <p className="text-xs text-rose-400 mt-0.5">毎日2つを達成しよう！</p>
          </div>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 pt-4">
        {/* Tab switcher */}
        <div className="flex rounded-2xl overflow-hidden border border-rose-100 bg-white mb-4 shadow-sm">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-1.5 transition-all duration-200 ${
                tab === t.key
                  ? 'bg-rose-500 text-white shadow-inner'
                  : 'text-rose-400 hover:bg-rose-50'
              }`}
            >
              <span>{t.emoji}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main */}
      <main className="max-w-lg mx-auto px-4 pb-10">
        {tab === 'today' ? <DailyTracker /> : <WeeklyReview />}
      </main>

      <footer className="text-center pb-6 text-xs text-rose-300 font-medium">
        <p>🌸 がんばれちえこ！ 🌸</p>
      </footer>
    </div>
  );
}
