import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getPrimaryChild } from "@/lib/child";
import { getNextReservationForChild } from "@/lib/lesson";
import { db } from "@/lib/db";
import { formatLessonWhen } from "@/lib/format";
import { Card, ImportantBadge, StatusBadge } from "@/components/ui";
import {
  BellIcon,
  CalendarIcon,
  ChevronRightIcon,
  SwapIcon,
  UserIcon,
  XIcon,
} from "@/components/icons";

export default async function HomePage() {
  const user = await getCurrentUser();
  const child = user ? await getPrimaryChild(user.id) : null;
  const nextReservation = child ? await getNextReservationForChild(child.id) : null;
  const notices = await db.notice.findMany({
    orderBy: { publishedAt: "desc" },
    take: 3,
  });

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-xs font-bold tracking-wide text-accent">HOME</p>
        <h1 className="text-xl font-extrabold text-ink">
          {child ? `${child.name}さんのチア教室` : "ようこそ"}
        </h1>
        {child?.class && (
          <p className="mt-1 text-sm text-ink-soft">所属クラス：{child.class.name}</p>
        )}
      </div>

      <Card>
        <p className="mb-3 text-xs font-bold tracking-wide text-ink-soft">次回レッスン</p>
        {nextReservation ? (
          <>
            <p className="text-lg font-extrabold text-ink">
              {formatLessonWhen(
                nextReservation.lesson.date,
                nextReservation.lesson.startTime,
                nextReservation.lesson.endTime
              )}
            </p>
            <p className="mt-1 text-sm text-ink-soft">
              {nextReservation.lesson.class.name} ／ {nextReservation.lesson.class.location}
            </p>
            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs text-ink-soft">出席予定</span>
                <StatusBadge status={nextReservation.attendance?.status ?? "pending"} />
              </div>
              <Link
                href="/attendance"
                className="text-xs font-bold text-trust underline underline-offset-2"
              >
                出欠を変更する
              </Link>
            </div>
          </>
        ) : (
          <p className="text-sm text-ink-soft">現在、予約中のレッスンはありません。</p>
        )}
      </Card>

      <div className="grid grid-cols-3 gap-3">
        <ActionButton href="/lessons" label="予約する" Icon={CalendarIcon} />
        <ActionButton href="/attendance" label="欠席する" Icon={XIcon} />
        <ActionButton href="/makeup" label="振替する" Icon={SwapIcon} />
        <ActionButton href="/mypage" label="マイページ" Icon={UserIcon} />
        <ActionButton href="/notices" label="お知らせ" Icon={BellIcon} />
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-bold tracking-wide text-ink-soft">お知らせ</p>
          <Link href="/notices" className="flex items-center text-xs font-bold text-trust">
            すべて見る
            <ChevronRightIcon className="h-4 w-4" />
          </Link>
        </div>
        <Card className="!p-0">
          {notices.length === 0 && (
            <p className="p-5 text-sm text-ink-soft">お知らせはまだありません。</p>
          )}
          {notices.map((n, i) => (
            <Link
              key={n.id}
              href={`/notices/${n.id}`}
              className={`flex items-center justify-between gap-3 px-5 py-3.5 ${
                i !== notices.length - 1 ? "border-b border-line" : ""
              }`}
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  {n.important && <ImportantBadge />}
                  <p className="truncate text-sm font-semibold text-ink">{n.title}</p>
                </div>
                <p className="mt-0.5 text-xs text-ink-soft">
                  {n.publishedAt.toLocaleDateString("ja-JP")}
                </p>
              </div>
              <ChevronRightIcon className="h-4 w-4 shrink-0 text-ink-soft" />
            </Link>
          ))}
        </Card>
      </div>
    </div>
  );
}

function ActionButton({
  href,
  label,
  Icon,
}: {
  href: string;
  label: string;
  Icon: (props: { className?: string }) => React.JSX.Element;
}) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center gap-1.5 rounded-2xl border border-line bg-paper py-4 text-center active:scale-[0.97]"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-soft text-accent">
        <Icon className="h-5 w-5" />
      </span>
      <span className="text-xs font-bold text-ink">{label}</span>
    </Link>
  );
}
