import { db } from "@/lib/db";
import { startOfToday } from "@/lib/format";
import { Card } from "@/components/ui";

export default async function AdminDashboardPage() {
  const today = startOfToday();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todaysLessons = await db.lesson.findMany({
    where: { date: { gte: today, lt: tomorrow } },
    include: {
      class: true,
      reservations: {
        where: { status: "confirmed" },
        include: { attendance: true },
      },
    },
    orderBy: { startTime: "asc" },
  });

  const allReservations = todaysLessons.flatMap((l) => l.reservations);
  const reservedCount = allReservations.length;
  const absentCount = allReservations.filter((r) => r.attendance?.status === "absent").length;
  const makeupCount = allReservations.filter((r) => r.type === "makeup").length;
  const trialCount = allReservations.filter((r) => r.type === "trial").length;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs font-bold tracking-wide text-trust">DASHBOARD</p>
        <h1 className="text-xl font-extrabold text-ink">ダッシュボード</h1>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="本日の予約人数" value={reservedCount} color="text-trust" />
        <StatTile label="本日の欠席人数" value={absentCount} color="text-accent" />
        <StatTile label="本日の振替人数" value={makeupCount} color="text-sun" />
        <StatTile label="本日の体験予約数" value={trialCount} color="text-mint" />
      </div>

      <div>
        <p className="mb-2 text-xs font-bold tracking-wide text-ink-soft">今日のレッスン</p>
        {todaysLessons.length === 0 ? (
          <Card>
            <p className="text-sm text-ink-soft">本日開催予定のレッスンはありません。</p>
          </Card>
        ) : (
          <Card className="!p-0">
            {todaysLessons.map((lesson, i) => (
              <div
                key={lesson.id}
                className={`flex items-center justify-between gap-3 px-5 py-3.5 ${
                  i !== todaysLessons.length - 1 ? "border-b border-line" : ""
                }`}
              >
                <div>
                  <p className="text-sm font-bold text-ink">
                    {lesson.startTime}〜{lesson.endTime}　{lesson.class.name}
                  </p>
                  <p className="mt-0.5 text-xs text-ink-soft">{lesson.class.location}</p>
                </div>
                <p className="text-sm font-bold text-ink-soft">
                  {lesson.reservations.length}名予約
                </p>
              </div>
            ))}
          </Card>
        )}
      </div>
    </div>
  );
}

function StatTile({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <Card className="flex flex-col gap-1">
      <span className="text-xs font-semibold text-ink-soft">{label}</span>
      <span className={`text-3xl font-extrabold tabular-nums ${color}`}>{value}</span>
    </Card>
  );
}
