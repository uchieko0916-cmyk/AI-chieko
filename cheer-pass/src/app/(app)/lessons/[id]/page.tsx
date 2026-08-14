import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getPrimaryChild } from "@/lib/child";
import { getLessonById } from "@/lib/lesson";
import { formatDateLong } from "@/lib/format";
import { Card, SeatBadge, SubmitButton } from "@/components/ui";
import { cancelReservationAction, reserveLessonAction } from "@/lib/actions/parent";

export default async function LessonDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ reserved?: string; cancelled?: string; error?: string }>;
}) {
  const { id } = await params;
  const { reserved, cancelled, error } = await searchParams;

  const user = await getCurrentUser();
  const child = user ? await getPrimaryChild(user.id) : null;
  const lesson = await getLessonById(id, child?.id);
  if (!lesson) notFound();

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-xs font-bold tracking-wide text-accent">LESSON DETAIL</p>
        <h1 className="text-xl font-extrabold text-ink">{lesson.class.name}</h1>
      </div>

      {reserved && <Banner tone="mint">予約が確定しました。</Banner>}
      {cancelled && <Banner tone="ink">予約をキャンセルしました。</Banner>}
      {error === "full" && <Banner tone="accent">満席のため予約できませんでした。</Banner>}
      {error && error !== "full" && <Banner tone="accent">操作に失敗しました。もう一度お試しください。</Banner>}

      <Card className="flex flex-col gap-3">
        <Row label="日付" value={formatDateLong(lesson.date)} />
        <Row label="時間" value={`${lesson.startTime}〜${lesson.endTime}`} />
        <Row label="会場" value={lesson.class.location} />
        <Row label="定員" value={`${lesson.capacity}名`} />
        <div className="flex items-center justify-between border-b border-line pb-3 last:border-0 last:pb-0">
          <span className="text-sm text-ink-soft">残席</span>
          <SeatBadge remaining={lesson.remaining} />
        </div>
      </Card>

      {!child && (
        <p className="text-sm text-ink-soft">お子さまの登録が見つかりません。教室スタッフにお問い合わせください。</p>
      )}

      {child && !lesson.myReservation && (
        <form action={reserveLessonAction}>
          <input type="hidden" name="lessonId" value={lesson.id} />
          <input type="hidden" name="childId" value={child.id} />
          <SubmitButton>{lesson.remaining > 0 ? "このレッスンを予約する" : "満席です"}</SubmitButton>
        </form>
      )}

      {child && lesson.myReservation && (
        <form action={cancelReservationAction}>
          <input type="hidden" name="reservationId" value={lesson.myReservation.id} />
          <input type="hidden" name="lessonId" value={lesson.id} />
          <SubmitButton variant="ghost">予約をキャンセルする</SubmitButton>
        </form>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-line pb-3 last:border-0 last:pb-0">
      <span className="text-sm text-ink-soft">{label}</span>
      <span className="text-sm font-bold text-ink">{value}</span>
    </div>
  );
}

function Banner({ tone, children }: { tone: "mint" | "accent" | "ink"; children: string }) {
  const cls = {
    mint: "bg-mint-soft text-mint",
    accent: "bg-accent-soft text-accent",
    ink: "bg-surface-2 text-ink",
  }[tone];
  return <p className={`rounded-xl px-4 py-2.5 text-sm font-semibold ${cls}`}>{children}</p>;
}
