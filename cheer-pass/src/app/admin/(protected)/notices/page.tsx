import { db } from "@/lib/db";
import { Card, FieldLabel, ImportantBadge, SubmitButton, TextArea, TextInput } from "@/components/ui";
import { createNoticeAction, deleteNoticeAction } from "@/lib/actions/admin";

export default async function AdminNoticesPage({
  searchParams,
}: {
  searchParams: Promise<{ created?: string; deleted?: string; error?: string }>;
}) {
  const { created, deleted, error } = await searchParams;
  const notices = await db.notice.findMany({ orderBy: { publishedAt: "desc" } });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs font-bold tracking-wide text-trust">NOTICES</p>
        <h1 className="text-xl font-extrabold text-ink">お知らせ投稿</h1>
      </div>

      {created && <Notice tone="mint">お知らせを投稿しました。</Notice>}
      {deleted && <Notice tone="mint">お知らせを削除しました。</Notice>}
      {error && <Notice tone="accent">入力内容をご確認ください。</Notice>}

      <Card className="!p-0">
        {notices.map((n, i) => (
          <div
            key={n.id}
            className={`flex items-center justify-between gap-3 px-5 py-3.5 ${
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
            <form action={deleteNoticeAction}>
              <input type="hidden" name="id" value={n.id} />
              <button className="shrink-0 text-xs font-semibold text-ink-soft hover:text-accent">
                削除
              </button>
            </form>
          </div>
        ))}
        {notices.length === 0 && <p className="p-5 text-sm text-ink-soft">お知らせがまだありません。</p>}
      </Card>

      <div>
        <p className="mb-2 text-xs font-bold tracking-wide text-ink-soft">新規投稿</p>
        <Card>
          <form action={createNoticeAction} className="flex flex-col gap-3">
            <div>
              <FieldLabel required>タイトル</FieldLabel>
              <TextInput name="title" required placeholder="8月29日のレッスンについて" />
            </div>
            <div>
              <FieldLabel required>本文</FieldLabel>
              <TextArea name="body" rows={5} required placeholder="お知らせの内容を入力してください" />
            </div>
            <label className="flex items-center gap-2 text-sm font-semibold text-ink">
              <input type="checkbox" name="important" className="h-4 w-4 accent-accent" />
              重要なお知らせとして表示する
            </label>
            <SubmitButton>投稿する</SubmitButton>
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
