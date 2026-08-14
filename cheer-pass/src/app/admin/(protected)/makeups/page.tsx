import { db } from "@/lib/db";
import { formatLessonWhen } from "@/lib/format";
import { Card } from "@/components/ui";
import { expireMakeupAction } from "@/lib/actions/admin";

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  available: { label: "振替可能", cls: "bg-sun-soft text-sun" },
  used: { label: "利用済み", cls: "bg-mint-soft text-mint" },
  expired: { label: "期限切れ", cls: "bg-surface-2 text-ink-soft" },
};

export default async function AdminMakeupsPage({
  searchParams,
}: {
  searchParams: Promise<{ updated?: string }>;
}) {
  const { updated } = await searchParams;
  const makeups = await db.makeup.findMany({
    include: { child: true, sourceLesson: { include: { class: true } }, targetLesson: { include: { class: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs font-bold tracking-wide text-trust">MAKEUPS</p>
        <h1 className="text-xl font-extrabold text-ink">振替管理</h1>
      </div>

      {updated && (
        <p className="rounded-xl bg-mint-soft px-4 py-2.5 text-sm font-semibold text-mint">更新しました。</p>
      )}

      <Card className="!p-0">
        {makeups.map((mk, i) => {
          const s = STATUS_LABEL[mk.status];
          return (
            <div
              key={mk.id}
              className={`flex items-center justify-between gap-3 px-5 py-3.5 ${
                i !== makeups.length - 1 ? "border-b border-line" : ""
              }`}
            >
              <div className="min-w-0">
                <p className="text-sm font-bold text-ink">{mk.child.name}</p>
                <p className="mt-0.5 text-xs text-ink-soft">
                  欠席: {formatLessonWhen(mk.sourceLesson.date, mk.sourceLesson.startTime, mk.sourceLesson.endTime)}
                  {mk.sourceLesson.class.name}
                </p>
                {mk.targetLesson && (
                  <p className="mt-0.5 text-xs text-ink-soft">
                    振替先: {formatLessonWhen(mk.targetLesson.date, mk.targetLesson.startTime, mk.targetLesson.endTime)}
                    {mk.targetLesson.class.name}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${s.cls}`}>{s.label}</span>
                {mk.status === "available" && (
                  <form action={expireMakeupAction}>
                    <input type="hidden" name="id" value={mk.id} />
                    <button className="text-xs font-semibold text-ink-soft hover:text-accent">期限切れにする</button>
                  </form>
                )}
              </div>
            </div>
          );
        })}
        {makeups.length === 0 && <p className="p-5 text-sm text-ink-soft">振替はまだありません。</p>}
      </Card>
    </div>
  );
}
