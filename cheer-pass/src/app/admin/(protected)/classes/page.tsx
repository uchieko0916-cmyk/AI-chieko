import { db } from "@/lib/db";
import { Card, FieldLabel, SubmitButton, TextInput } from "@/components/ui";
import { createClassAction, updateClassAction } from "@/lib/actions/admin";

export default async function AdminClassesPage({
  searchParams,
}: {
  searchParams: Promise<{ created?: string; updated?: string; error?: string }>;
}) {
  const { created, updated, error } = await searchParams;
  const classes = await db.class.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs font-bold tracking-wide text-trust">CLASSES</p>
        <h1 className="text-xl font-extrabold text-ink">クラス管理</h1>
      </div>

      {created && <Notice tone="mint">クラスを登録しました。</Notice>}
      {updated && <Notice tone="mint">クラスを更新しました。</Notice>}
      {error && <Notice tone="accent">入力内容をご確認ください。</Notice>}

      <div className="flex flex-col gap-3">
        {classes.map((c) => (
          <details key={c.id} className="group rounded-2xl border border-line bg-paper open:shadow-sm">
            <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4">
              <div>
                <p className="font-bold text-ink">{c.name}</p>
                <p className="mt-0.5 text-xs text-ink-soft">
                  講師: {c.teacher} ／ 会場: {c.location} ／ 定員: {c.capacity}名
                </p>
              </div>
              <span className="text-xs font-semibold text-trust">編集</span>
            </summary>
            <form action={updateClassAction} className="grid grid-cols-2 gap-3 border-t border-line px-5 py-4">
              <input type="hidden" name="id" value={c.id} />
              <Field label="クラス名" name="name" defaultValue={c.name} />
              <Field label="担当講師" name="teacher" defaultValue={c.teacher} />
              <Field label="会場" name="location" defaultValue={c.location} />
              <Field label="定員" name="capacity" defaultValue={String(c.capacity)} type="number" />
              <div className="col-span-2">
                <SubmitButton>更新する</SubmitButton>
              </div>
            </form>
          </details>
        ))}
        {classes.length === 0 && (
          <Card>
            <p className="text-sm text-ink-soft">クラスがまだ登録されていません。</p>
          </Card>
        )}
      </div>

      <div>
        <p className="mb-2 text-xs font-bold tracking-wide text-ink-soft">新規クラス登録</p>
        <Card>
          <form action={createClassAction} className="grid grid-cols-2 gap-3">
            <Field label="クラス名" name="name" placeholder="キッズ" />
            <Field label="担当講師" name="teacher" placeholder="佐藤コーチ" />
            <Field label="会場" name="location" placeholder="第一スタジオ" />
            <Field label="定員" name="capacity" type="number" placeholder="12" />
            <div className="col-span-2">
              <SubmitButton>登録する</SubmitButton>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  defaultValue,
  placeholder,
  type = "text",
}: {
  label: string;
  name: string;
  defaultValue?: string;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div className="col-span-1">
      <FieldLabel required>{label}</FieldLabel>
      <TextInput name={name} defaultValue={defaultValue} placeholder={placeholder} type={type} required />
    </div>
  );
}

function Notice({ tone, children }: { tone: "mint" | "accent"; children: string }) {
  const cls = tone === "mint" ? "bg-mint-soft text-mint" : "bg-accent-soft text-accent";
  return <p className={`rounded-xl px-4 py-2.5 text-sm font-semibold ${cls}`}>{children}</p>;
}
