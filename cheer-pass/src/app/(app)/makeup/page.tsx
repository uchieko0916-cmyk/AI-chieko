import { getCurrentUser } from "@/lib/auth";
import { getPrimaryChild } from "@/lib/child";
import { getMakeupCandidateLessons } from "@/lib/lesson";
import { db } from "@/lib/db";
import { formatLessonWhen } from "@/lib/format";
import { Card, SeatBadge } from "@/components/ui";
import { bookMakeupAction } from "@/lib/actions/parent";

export default async function MakeupPage({
  searchParams,
}: {
  searchParams: Promise<{ booked?: string; error?: string }>;
}) {
  const { booked, error } = await searchParams;
  const user = await getCurrentUser();
  const child = user ? await getPrimaryChild(user.id) : null;

  const availableMakeups = child
    ? await db.makeup.findMany({
        where: { childId: child.id, status: "available" },
        orderBy: { createdAt: "asc" },
      })
    : [];
  const count = availableMakeups.length;
  const nextMakeupId = availableMakeups[0]?.id;
  const candidateLessons = count > 0 && child ? await getMakeupCandidateLessons(child.id) : [];

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-xs font-bold tracking-wide text-accent">MAKEUP</p>
        <h1 className="text-xl font-extrabold text-ink">振替予約</h1>
      </div>

      {booked && (
        <p className="rounded-xl bg-mint-soft px-4 py-2.5 text-sm font-semibold text-mint">
          振替予約が確定しました。
        </p>
      )}
      {error === "full" && (
        <p className="rounded-xl bg-accent-soft px-4 py-2.5 text-sm font-semibold text-accent">
          満席のため予約できませんでした。別の日時をお選びください。
        </p>
      )}
      {error && error !== "full" && (
        <p className="rounded-xl bg-accent-soft px-4 py-2.5 text-sm font-semibold text-accent">
          操作に失敗しました。もう一度お試しください。
        </p>
      )}

      <Card className="flex items-center justify-between">
        <span className="text-sm font-semibold text-ink-soft">振替可能</span>
        <span className="text-2xl font-extrabold text-accent">{count}回</span>
      </Card>

      {count === 0 && (
        <p className="text-sm text-ink-soft">
          現在、振替可能な回数はありません。欠席の回答をすると振替が1回発行されます。
        </p>
      )}

      {count > 0 && (
        <div className="flex flex-col gap-2.5">
          <p className="text-xs font-bold text-ink-soft">振替可能なレッスンから選択</p>
          {candidateLessons.length === 0 && (
            <Card>
              <p className="text-sm text-ink-soft">現在、振替できるレッスンの空きがありません。</p>
            </Card>
          )}
          {candidateLessons.map((lesson) => (
            <Card key={lesson.id} className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-extrabold text-ink">
                  {formatLessonWhen(lesson.date, lesson.startTime, lesson.endTime)}
                </p>
                <p className="mt-0.5 text-xs text-ink-soft">
                  {lesson.class.name} ／ {lesson.class.location}
                </p>
                <div className="mt-2">
                  <SeatBadge remaining={lesson.remaining} />
                </div>
              </div>
              <form action={bookMakeupAction}>
                <input type="hidden" name="makeupId" value={nextMakeupId} />
                <input type="hidden" name="targetLessonId" value={lesson.id} />
                <button className="shrink-0 rounded-full bg-accent px-4 py-2.5 text-sm font-bold text-white active:scale-[0.98]">
                  予約する
                </button>
              </form>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
