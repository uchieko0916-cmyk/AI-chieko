import { db } from "@/lib/db";
import { Card, FieldLabel, SubmitButton, TextInput } from "@/components/ui";
import { createMemberAction } from "@/lib/actions/admin";

export default async function AdminMembersPage({
  searchParams,
}: {
  searchParams: Promise<{ created?: string; error?: string }>;
}) {
  const { created, error } = await searchParams;
  const members = await db.user.findMany({
    where: { role: "parent" },
    include: { children: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs font-bold tracking-wide text-trust">MEMBERS</p>
        <h1 className="text-xl font-extrabold text-ink">会員管理</h1>
      </div>

      {created && <Notice tone="mint">会員を登録しました。</Notice>}
      {error && <Notice tone="accent">入力内容をご確認ください（メールアドレスの重複にご注意ください）。</Notice>}

      <Card className="!p-0">
        {members.map((m, i) => (
          <div
            key={m.id}
            className={`flex items-center justify-between gap-3 px-5 py-3.5 ${
              i !== members.length - 1 ? "border-b border-line" : ""
            }`}
          >
            <div>
              <p className="text-sm font-bold text-ink">{m.name}</p>
              <p className="mt-0.5 text-xs text-ink-soft">
                {m.email ?? "メール未登録"} ／ {m.phone}
              </p>
            </div>
            <span className="shrink-0 text-xs font-semibold text-ink-soft">
              お子さま {m.children.length}名
            </span>
          </div>
        ))}
        {members.length === 0 && <p className="p-5 text-sm text-ink-soft">会員がまだ登録されていません。</p>}
      </Card>

      <div>
        <p className="mb-2 text-xs font-bold tracking-wide text-ink-soft">新規会員登録</p>
        <Card>
          <form action={createMemberAction} className="flex flex-col gap-3">
            <div>
              <FieldLabel required>保護者氏名</FieldLabel>
              <TextInput name="name" required placeholder="やまだ みほ" />
            </div>
            <div>
              <FieldLabel required>メールアドレス</FieldLabel>
              <TextInput type="email" name="email" required placeholder="example@mail.com" />
            </div>
            <div>
              <FieldLabel required>電話番号</FieldLabel>
              <TextInput name="phone" required placeholder="090-1234-5678" />
            </div>
            <div>
              <FieldLabel required>初期パスワード</FieldLabel>
              <TextInput name="password" required placeholder="保護者に個別に伝えてください" />
            </div>
            <SubmitButton>登録する</SubmitButton>
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
