import { db } from "@/lib/db";
import { formatDateLong, startOfToday } from "@/lib/format";
import { Card, StatusBadge } from "@/components/ui";
import { adminSetAttendanceAction } from "@/lib/actions/admin";

export default async function AdminAttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ lessonId?: string; updated?: string }>;
}) {
  const { lessonId, updated } = await searchParams;

  const lessons = await db.lesson.findMany({
    where: { date: { gte: new Date(startOfToday().getTime() - 14 * 86400000) } },
    include: { class: true },
    orderBy: [{ date: "asc" }, { startTime: "asc" }],
    take: 60,
  });

  const selectedId = lessonId ?? lessons.find((l) => l.date >= startOfToday())?.id ?? lessons[0]?.id;
  const selectedLesson = selectedId
    ? await db.lesson.findUnique({
        where: { id: selectedId },
        include: {
          class: true,
          reservations: {
            where: { status: "confirmed" },
            include: { child: true, attendance: true },
          },
        },
      })
    : null;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs font-bold tracking-wide text-trust">ATTENDANCE</p>
        <h1 className="text-xl font-extrabold text-ink">出欠確認</h1>
      </div>

      {updated && (
        <p className="rounded-xl bg-mint-soft px-4 py-2.5 text-sm font-semibold text-mint">
          出欠を更新しました。
        </p>
      )}

      <form method="get" className="flex items-end gap-2">
        <div className="flex-1">
          <label className="mb-1.5 block text-sm font-semibold text-ink">対象レッスン</label>
          <select
            name="lessonId"
            defaultValue={selectedId}
            className="w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-[15px] text-ink"
          >
            {lessons.map((l) => (
              <option key={l.id} value={l.id}>
                {formatDateLong(l.date)} {l.startTime} {l.class.name}
              </option>
            ))}
          </select>
        </div>
        <button className="rounded-xl bg-trust px-4 py-2.5 text-sm font-bold text-white">表示</button>
      </form>

      {selectedLesson && (
        <Card className="!p-0">
          {selectedLesson.reservations.map((r, i) => (
            <div
              key={r.id}
              className={`flex items-center justify-between gap-3 px-5 py-3.5 ${
                i !== selectedLesson.reservations.length - 1 ? "border-b border-line" : ""
              }`}
            >
              <div>
                <p className="text-sm font-bold text-ink">{r.child.name}</p>
                <div className="mt-1">
                  <StatusBadge status={r.attendance?.status ?? "pending"} />
                </div>
              </div>
              <div className="flex gap-1.5">
                <AttendanceButton reservationId={r.id} lessonId={selectedLesson.id} status="present" label="出席" />
                <AttendanceButton reservationId={r.id} lessonId={selectedLesson.id} status="absent" label="欠席" />
              </div>
            </div>
          ))}
          {selectedLesson.reservations.length === 0 && (
            <p className="p-5 text-sm text-ink-soft">このレッスンの予約はありません。</p>
          )}
        </Card>
      )}
    </div>
  );
}

function AttendanceButton({
  reservationId,
  lessonId,
  status,
  label,
}: {
  reservationId: string;
  lessonId: string;
  status: "present" | "absent";
  label: string;
}) {
  return (
    <form action={adminSetAttendanceAction}>
      <input type="hidden" name="reservationId" value={reservationId} />
      <input type="hidden" name="status" value={status} />
      <input type="hidden" name="lessonId" value={lessonId} />
      <button
        className={`rounded-full px-3 py-1.5 text-xs font-bold ${
          status === "present" ? "bg-mint-soft text-mint" : "bg-accent-soft text-accent"
        }`}
      >
        {label}
      </button>
    </form>
  );
}
