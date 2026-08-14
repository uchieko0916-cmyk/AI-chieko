import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { formatLessonWhen } from "@/lib/format";
import { Card } from "@/components/ui";
import { CheckIcon } from "@/components/icons";

export default async function TrialCompletePage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  if (!id) notFound();

  const reservation = await db.reservation.findUnique({
    where: { id },
    include: { child: true, lesson: { include: { class: true } } },
  });
  if (!reservation) notFound();

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-5 py-10">
      <div className="mb-6 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-mint-soft text-mint">
          <CheckIcon className="h-8 w-8" />
        </div>
        <h1 className="text-xl font-extrabold text-ink">体験レッスンの予約を受け付けました</h1>
        <p className="mt-1.5 text-sm text-ink-soft">
          担当スタッフより確認のご連絡をいたします。当日はお子さまと一緒にお越しください。
        </p>
      </div>

      <Card className="flex flex-col gap-3">
        <Row label="お子さま" value={reservation.child.name} />
        <Row
          label="日時"
          value={formatLessonWhen(reservation.lesson.date, reservation.lesson.startTime, reservation.lesson.endTime)}
        />
        <Row label="クラス" value={reservation.lesson.class.name} />
        <Row label="会場" value={reservation.lesson.class.location} />
      </Card>

      <Link
        href="/login"
        className="mt-8 w-full rounded-full bg-ink px-5 py-3 text-center text-[15px] font-bold text-white"
      >
        トップへ戻る
      </Link>
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-line pb-3 last:border-0 last:pb-0">
      <span className="text-sm text-ink-soft">{label}</span>
      <span className="text-sm font-bold text-ink">{value}</span>
    </div>
  );
}
