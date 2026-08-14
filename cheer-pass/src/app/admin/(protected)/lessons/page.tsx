import { db } from "@/lib/db";
import { formatDateLong } from "@/lib/format";
import { Card, FieldLabel, Select, SubmitButton, TextInput } from "@/components/ui";
import { createLessonAction, updateLessonStatusAction } from "@/lib/actions/admin";

export default async function AdminLessonsPage({
  searchParams,
}: {
  searchParams: Promise<{ created?: string; updated?: string; error?: string }>;
}) {
  const { created, updated, error } = await searchParams;
  const [classes, lessons] = await Promise.all([
    db.class.findMany({ orderBy: { name: "asc" } }),
    db.lesson.findMany({
      where: { date: { gte: new Date(new Date().toDateString()) } },
      include: { class: true, reservations: { where: { status: "confirmed" } } },
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
      take: 60,
    }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs font-bold tracking-wide text-trust">LESSONS</p>
        <h1 className="text-xl font-extrabold text-ink">レッスン管理</h1>
      </div>

      {created && <Notice tone="mint">レッスンを登録しました。</Notice>}
      {updated && <Notice tone="mint">更新しました。</Notice>}
      {error && <Notice tone="accent">入力内容をご確認ください。</Notice>}

      <div>
        <p className="mb-2 text-xs font-bold tracking-wide text-ink-soft">今後のレッスン</p>
        <Card className="!p-0">
          {lessons.map((l, i) => {
            const capacity = l.capacity ?? l.class.capacity;
            return (
              <div
                key={l.id}
                className={`flex items-center justify-between gap-3 px-5 py-3.5 ${
                  i !== lessons.length - 1 ? "border-b border-line" : ""
                }`}
              >
                <div className="min-w-0">
                  <p className="text-sm font-bold text-ink">
                    {formatDateLong(l.date)} {l.startTime}〜{l.endTime}　{l.class.name}
                  </p>
                  <p className="mt-0.5 text-xs text-ink-soft">
                    {l.class.location} ／ 予約 {l.reservations.length}/{capacity}名
                    {l.status === "cancelled" && "（開催中止）"}
                  </p>
                </div>
                <form action={updateLessonStatusAction}>
                  <input type="hidden" name="id" value={l.id} />
                  <input
                    type="hidden"
                    name="status"
                    value={l.status === "scheduled" ? "cancelled" : "scheduled"}
                  />
                  <button className="shrink-0 rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-ink-soft">
                    {l.status === "scheduled" ? "開催中止にする" : "開催に戻す"}
                  </button>
                </form>
              </div>
            );
          })}
          {lessons.length === 0 && (
            <p className="p-5 text-sm text-ink-soft">今後のレッスンが登録されていません。</p>
          )}
        </Card>
      </div>

      <div>
        <p className="mb-2 text-xs font-bold tracking-wide text-ink-soft">新規レッスン登録</p>
        <Card>
          <form action={createLessonAction} className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <FieldLabel required>クラス</FieldLabel>
              <Select name="classId" required defaultValue="">
                <option value="" disabled>
                  選択してください
                </option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="col-span-2">
              <FieldLabel required>開催日</FieldLabel>
              <TextInput type="date" name="date" required />
            </div>
            <div>
              <FieldLabel required>開始時刻</FieldLabel>
              <TextInput type="time" name="startTime" required />
            </div>
            <div>
              <FieldLabel required>終了時刻</FieldLabel>
              <TextInput type="time" name="endTime" required />
            </div>
            <div className="col-span-2">
              <FieldLabel>定員（個別に上書きする場合のみ）</FieldLabel>
              <TextInput type="number" name="capacity" placeholder="未入力の場合はクラスの定員を使用" />
            </div>
            <div className="col-span-2">
              <SubmitButton>登録する</SubmitButton>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}

function Notice({ tone, children }: { tone: "mint" | "accent"; children: string }) {
  const cls = tone === "mint" ? "bg-mint-soft text-mint" : "bg-accent-soft text-accent";
  return <p className={`rounded-xl px-4 py-2.5 text-sm font-semibold ${cls}`}>{children}</p>;
}
