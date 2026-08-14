import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getPrimaryChild } from "@/lib/child";
import { getLessonsForMonth } from "@/lib/lesson";
import { formatDateLong, formatMonthLabel } from "@/lib/format";
import { Card, SeatBadge } from "@/components/ui";
import { ChevronRightIcon } from "@/components/icons";

function monthParam(y?: string, m?: string) {
  const now = new Date();
  const year = y ? Number.parseInt(y, 10) : now.getFullYear();
  const month = m ? Number.parseInt(m, 10) : now.getMonth() + 1;
  return { year, month };
}

function shiftMonth(year: number, month: number, delta: number) {
  const d = new Date(year, month - 1 + delta, 1);
  return { year: d.getFullYear(), month: d.getMonth() + 1 };
}

export default async function LessonsPage({
  searchParams,
}: {
  searchParams: Promise<{ y?: string; m?: string }>;
}) {
  const { y, m } = await searchParams;
  const { year, month } = monthParam(y, m);

  const user = await getCurrentUser();
  const child = user ? await getPrimaryChild(user.id) : null;
  const lessons = await getLessonsForMonth(year, month, child?.id);

  const grouped = new Map<string, typeof lessons>();
  for (const lesson of lessons) {
    const key = lesson.date.toISOString().slice(0, 10);
    grouped.set(key, [...(grouped.get(key) ?? []), lesson]);
  }

  const prev = shiftMonth(year, month, -1);
  const next = shiftMonth(year, month, 1);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-xs font-bold tracking-wide text-accent">LESSONS</p>
        <h1 className="text-xl font-extrabold text-ink">レッスン一覧</h1>
      </div>

      <div className="flex items-center justify-between">
        <Link
          href={`/lessons?y=${prev.year}&m=${prev.month}`}
          className="rounded-full border border-line px-3 py-1.5 text-sm font-semibold text-ink-soft"
        >
          ＜ 前月
        </Link>
        <p className="text-base font-extrabold text-ink">{formatMonthLabel(year, month)}</p>
        <Link
          href={`/lessons?y=${next.year}&m=${next.month}`}
          className="rounded-full border border-line px-3 py-1.5 text-sm font-semibold text-ink-soft"
        >
          翌月 ＞
        </Link>
      </div>

      {grouped.size === 0 && (
        <Card>
          <p className="text-sm text-ink-soft">この月に開催予定のレッスンはありません。</p>
        </Card>
      )}

      {[...grouped.entries()].map(([dateKey, dayLessons]) => (
        <div key={dateKey}>
          <p className="mb-2 text-xs font-bold text-ink-soft">{formatDateLong(dayLessons[0].date)}</p>
          <div className="flex flex-col gap-2.5">
            {dayLessons.map((lesson) => (
              <Link key={lesson.id} href={`/lessons/${lesson.id}`}>
                <Card className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-extrabold text-ink">
                      {lesson.startTime}〜{lesson.endTime}　{lesson.class.name}
                    </p>
                    <p className="mt-0.5 text-xs text-ink-soft">{lesson.class.location}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <SeatBadge remaining={lesson.remaining} />
                      {lesson.myReservation && (
                        <span className="inline-flex items-center rounded-full bg-trust-soft px-2.5 py-0.5 text-[11px] font-bold text-trust">
                          予約済み
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronRightIcon className="h-5 w-5 shrink-0 text-ink-soft" />
                </Card>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
