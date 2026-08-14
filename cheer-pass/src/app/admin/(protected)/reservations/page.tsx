import { db } from "@/lib/db";
import { formatLessonWhen } from "@/lib/format";
import { Card } from "@/components/ui";

const TYPE_LABEL: Record<string, string> = { trial: "体験", regular: "通常", makeup: "振替" };

export default async function AdminReservationsPage() {
  const reservations = await db.reservation.findMany({
    include: { child: true, user: true, lesson: { include: { class: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs font-bold tracking-wide text-trust">RESERVATIONS</p>
        <h1 className="text-xl font-extrabold text-ink">予約確認</h1>
      </div>

      <Card className="!p-0">
        {reservations.map((r, i) => (
          <div
            key={r.id}
            className={`flex items-center justify-between gap-3 px-5 py-3.5 ${
              i !== reservations.length - 1 ? "border-b border-line" : ""
            }`}
          >
            <div className="min-w-0">
              <p className="text-sm font-bold text-ink">
                {r.child.name}（保護者: {r.user.name}）
              </p>
              <p className="mt-0.5 text-xs text-ink-soft">
                {formatLessonWhen(r.lesson.date, r.lesson.startTime, r.lesson.endTime)}
                {r.lesson.class.name}
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1">
              <span className="rounded-full bg-trust-soft px-2.5 py-0.5 text-[11px] font-bold text-trust">
                {TYPE_LABEL[r.type]}
              </span>
              {r.status === "cancelled" && (
                <span className="text-[11px] font-semibold text-ink-soft">取消済み</span>
              )}
            </div>
          </div>
        ))}
        {reservations.length === 0 && <p className="p-5 text-sm text-ink-soft">予約がまだありません。</p>}
      </Card>
    </div>
  );
}
