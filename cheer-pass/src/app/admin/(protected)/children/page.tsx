import { db } from "@/lib/db";
import { Card, FieldLabel, Select, SubmitButton, TextInput } from "@/components/ui";
import { createChildAction } from "@/lib/actions/admin";

export default async function AdminChildrenPage({
  searchParams,
}: {
  searchParams: Promise<{ created?: string; error?: string }>;
}) {
  const { created, error } = await searchParams;
  const [children, members, classes] = await Promise.all([
    db.child.findMany({
      include: { user: true, class: true },
      orderBy: { createdAt: "desc" },
    }),
    db.user.findMany({ where: { role: "parent" }, orderBy: { name: "asc" } }),
    db.class.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs font-bold tracking-wide text-trust">CHILDREN</p>
        <h1 className="text-xl font-extrabold text-ink">子ども管理</h1>
      </div>

      {created && <Notice tone="mint">子どもを登録しました。</Notice>}
      {error && <Notice tone="accent">入力内容をご確認ください。</Notice>}

      <Card className="!p-0">
        {children.map((c, i) => (
          <div
            key={c.id}
            className={`flex items-center justify-between gap-3 px-5 py-3.5 ${
              i !== children.length - 1 ? "border-b border-line" : ""
            }`}
          >
            <div>
              <p className="text-sm font-bold text-ink">{c.name}</p>
              <p className="mt-0.5 text-xs text-ink-soft">
                保護者: {c.user.name} ／ クラス: {c.class?.name ?? "未所属"}
              </p>
            </div>
          </div>
        ))}
        {children.length === 0 && <p className="p-5 text-sm text-ink-soft">子どもがまだ登録されていません。</p>}
      </Card>

      <div>
        <p className="mb-2 text-xs font-bold tracking-wide text-ink-soft">新規子ども登録</p>
        <Card>
          <form action={createChildAction} className="flex flex-col gap-3">
            <div>
              <FieldLabel required>保護者</FieldLabel>
              <Select name="userId" required defaultValue="">
                <option value="" disabled>
                  選択してください
                </option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <FieldLabel required>お子さまのお名前</FieldLabel>
              <TextInput name="name" required placeholder="やまだ はな" />
            </div>
            <div>
              <FieldLabel required>生年月日</FieldLabel>
              <TextInput type="date" name="birthday" required />
            </div>
            <div>
              <FieldLabel>学年</FieldLabel>
              <TextInput name="grade" placeholder="年中" />
            </div>
            <div>
              <FieldLabel>所属クラス</FieldLabel>
              <Select name="classId" defaultValue="">
                <option value="">未所属</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <FieldLabel>アレルギー・配慮事項</FieldLabel>
              <TextInput name="note" placeholder="例：卵アレルギーがあります" />
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
