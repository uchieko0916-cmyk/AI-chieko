import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { Card, ImportantBadge } from "@/components/ui";

export default async function NoticeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const notice = await db.notice.findUnique({ where: { id } });
  if (!notice) notFound();

  return (
    <div className="flex flex-col gap-4">
      <div>
        {notice.important && (
          <div className="mb-2">
            <ImportantBadge />
          </div>
        )}
        <h1 className="text-lg font-extrabold text-ink">{notice.title}</h1>
        <p className="mt-1 text-xs text-ink-soft">
          {notice.publishedAt.toLocaleDateString("ja-JP")}
        </p>
      </div>
      <Card>
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink">{notice.body}</p>
      </Card>
    </div>
  );
}
