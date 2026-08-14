import { getCurrentUser } from "@/lib/auth";
import { getPrimaryChild } from "@/lib/child";
import { db } from "@/lib/db";
import { formatLessonWhen } from "@/lib/format";
import { Card } from "@/components/ui";

const TYPE_LABEL: Record<string, string> = {
  trial: "体験",
  regular: "通常",
  makeup: "振替",
};

export default async function MyPage() {
  const user = await getCurrentUser();
  const child = user ? await getPrimaryChild(user.id) : null;

  const reservations = child
    ? await db.reservation.findMany({
        where: { childId: child.id },
        include: { lesson: { include: { class: true } }, attendance: true },
        orderBy: { createdAt: "desc" },
      })
    : [];

  const attendanceHistory = reservations.filter((r) => r.attendance?.status === "present");
  const absenceHistory = reservations.filter((r) => r.attendance?.status === "absent");
  const makeupCount = child
    ? await db.makeup.count({ where: { childId: child.id, status: "available" } })
    : 0;

  if (!user) return null;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs font-bold tracking-wide text-accent">MY PAGE</p>
        <h1 className="text-xl font-extrabold text-ink">マイページ</h1>
      </div>

      <Section title="保護者情報">
        <Card className="flex flex-col gap-3">
          <Row label="お名前" value={user.name} />
          <Row label="電話番号" value={user.phone} />
          <Row label="メールアドレス" value={user.email ?? "未登録"} />
        </Card>
      </Section>

      <Section title="お子さま情報">
        {child ? (
          <Card className="flex flex-col gap-3">
            <Row label="お名前" value={child.name} />
            <Row label="学年" value={child.grade ?? "未登録"} />
            <Row label="所属クラス" value={child.class?.name ?? "未所属"} />
          </Card>
        ) : (
          <Card>
            <p className="text-sm text-ink-soft">お子さまの登録が見つかりません。</p>
          </Card>
        )}
      </Section>

      <Section title="振替残数">
        <Card className="flex items-center justify-between">
          <span className="text-sm font-semibold text-ink-soft">利用可能な振替</span>
          <span className="text-2xl font-extrabold text-accent">{makeupCount}回</span>
        </Card>
      </Section>

      <Section title="予約履歴">
        <HistoryList
          items={reservations}
          empty="予約履歴はまだありません。"
          renderRight={(r) => (
            <span className="shrink-0 rounded-full bg-trust-soft px-2.5 py-0.5 text-[11px] font-bold text-trust">
              {TYPE_LABEL[r.type]}
              {r.status === "cancelled" ? "・取消" : ""}
            </span>
          )}
        />
      </Section>

      <Section title="出席履歴">
        <HistoryList items={attendanceHistory} empty="出席履歴はまだありません。" />
      </Section>

      <Section title="欠席履歴">
        <HistoryList
          items={absenceHistory}
          empty="欠席履歴はまだありません。"
          renderRight={(r) =>
            r.attendance?.absenceReason ? (
              <span className="max-w-[9rem] truncate text-xs text-ink-soft">
                {r.attendance.absenceReason}
              </span>
            ) : null
          }
        />
      </Section>

      <Section title="イベント参加履歴">
        <Card>
          <p className="text-sm text-ink-soft">現在、参加履歴はありません。</p>
        </Card>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-xs font-bold tracking-wide text-ink-soft">{title}</p>
      {children}
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

type HistoryItem = {
  id: string;
  lesson: { date: Date; startTime: string; endTime: string; class: { name: string } };
};

function HistoryList<T extends HistoryItem>({
  items,
  empty,
  renderRight,
}: {
  items: T[];
  empty: string;
  renderRight?: (item: T) => React.ReactNode;
}) {
  if (items.length === 0) {
    return (
      <Card>
        <p className="text-sm text-ink-soft">{empty}</p>
      </Card>
    );
  }
  return (
    <Card className="!p-0">
      {items.map((item, i) => (
        <div
          key={item.id}
          className={`flex items-center justify-between gap-3 px-5 py-3.5 ${
            i !== items.length - 1 ? "border-b border-line" : ""
          }`}
        >
          <div className="min-w-0">
            <p className="text-sm font-semibold text-ink">
              {formatLessonWhen(item.lesson.date, item.lesson.startTime, item.lesson.endTime)}
            </p>
            <p className="mt-0.5 text-xs text-ink-soft">{item.lesson.class.name}</p>
          </div>
          {renderRight?.(item)}
        </div>
      ))}
    </Card>
  );
}
