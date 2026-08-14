"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction } from "@/lib/actions/parent";
import { Card, ErrorText, FieldLabel, SubmitButton, TextInput } from "@/components/ui";

export default function LoginPage() {
  const [state, formAction] = useActionState(loginAction, undefined);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-5 py-10">
      <div className="mb-8 text-center">
        <p className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-3 py-1 text-xs font-bold text-accent">
          🤸 チアダンス教室
        </p>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink">チアパス</h1>
        <p className="mt-1.5 text-sm text-ink-soft">
          LINEを開けば、チア教室生活が全部わかる。
        </p>
      </div>

      <Card>
        <form action={formAction} className="flex flex-col gap-4">
          <div>
            <FieldLabel required>メールアドレス</FieldLabel>
            <TextInput type="email" name="email" required placeholder="example@mail.com" autoComplete="email" />
          </div>
          <div>
            <FieldLabel required>パスワード</FieldLabel>
            <TextInput type="password" name="password" required placeholder="••••••••" autoComplete="current-password" />
          </div>
          <ErrorText>{state?.error}</ErrorText>
          <SubmitButton>ログイン</SubmitButton>
        </form>
      </Card>

      <div className="mt-6 text-center text-sm text-ink-soft">
        まだ会員でない方は
        <Link href="/trial" className="ml-1 font-bold text-trust underline underline-offset-2">
          体験レッスンを予約する
        </Link>
      </div>

      <div className="mt-10 text-center">
        <Link href="/admin/login" className="text-xs text-ink-soft underline underline-offset-2">
          教室スタッフの方はこちら
        </Link>
      </div>
    </main>
  );
}
