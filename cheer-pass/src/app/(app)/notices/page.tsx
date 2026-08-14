import Link from "next/link";
import { db } from "@/lib/db";
import { Card, ImportantBadge } from "@/components/ui";
import { ChevronRightIcon } from "@/components/icons";

export default async function NoticesPage() {
  const notices = await db.notice.findMany({ orderBy: { publishedAt: "desc" } });

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-xs font-bold tracking-wide text-accent">NOTICES</p>
        <h1 className="text-xl font-extrabold text-ink">お知らせ</h1>
      </div>

      {notices.length === 0 && (
        <Card>
          <p className="text-sm text-ink-soft">お知らせはまだありません。</p>
        </Card>
      )}

      <Card className="!p-0">
        {notices.map((n, i) => (
          <Link
            key={n.id}
            href={`/notices/${n.id}`}
            className={`flex items-center justify-between gap-3 px-5 py-4 ${
              i !== notices.length - 1 ? "border-b border-line" : ""
            }`}
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                {n.important && <ImportantBadge />}
                <p className="truncate text-sm font-semibold text-ink">{n.title}</p>
              </div>
              <p className="mt-0.5 text-xs text-ink-soft">{n.publishedAt.toLocaleDateString("ja-JP")}</p>
            </div>
            <ChevronRightIcon className="h-4 w-4 shrink-0 text-ink-soft" />
          </Link>
        ))}
      </Card>
    </div>
  );
}
