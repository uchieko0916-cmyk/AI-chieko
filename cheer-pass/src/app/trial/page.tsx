import { db } from "@/lib/db";
import { getUpcomingLessons } from "@/lib/lesson";
import { TrialForm } from "@/components/TrialForm";

export default async function TrialPage() {
  const [classes, lessons] = await Promise.all([
    db.class.findMany({ orderBy: { name: "asc" } }),
    getUpcomingLessons(),
  ]);

  return (
    <main className="mx-auto min-h-dvh w-full max-w-md px-5 py-8">
      <div className="mb-6">
        <p className="mb-2 text-xs font-bold tracking-wide text-accent">TRIAL LESSON</p>
        <h1 className="text-xl font-extrabold text-ink">体験レッスン予約</h1>
        <p className="mt-1.5 text-sm text-ink-soft">
          まずは体験から。ご入力いただいた内容はスタッフが確認のうえご連絡します。
        </p>
      </div>

      <TrialForm
        classes={classes.map((c) => ({ id: c.id, name: c.name, location: c.location }))}
        lessons={lessons.map((l) => ({
          id: l.id,
          classId: l.classId,
          date: l.date.toISOString(),
          startTime: l.startTime,
          endTime: l.endTime,
          remaining: l.remaining,
        }))}
      />
    </main>
  );
}
