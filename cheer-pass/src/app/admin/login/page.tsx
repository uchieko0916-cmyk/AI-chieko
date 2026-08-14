"use client";

import { useActionState } from "react";
import Link from "next/link";
import { adminLoginAction } from "@/lib/actions/admin";
import { Card, ErrorText, FieldLabel, SubmitButton, TextInput } from "@/components/ui";

export default function AdminLoginPage() {
  const [state, formAction] = useActionState(adminLoginAction, undefined);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-sm flex-col justify-center px-5 py-10">
      <div className="mb-8 text-center">
        <h1 className="text-xl font-extrabold tracking-tight text-trust">チアパス管理画面</h1>
        <p className="mt-1.5 text-sm text-ink-soft">教室スタッフ用ログイン</p>
      </div>

      <Card>
        <form action={formAction} className="flex flex-col gap-4">
          <div>
            <FieldLabel required>メールアドレス</FieldLabel>
            <TextInput type="email" name="email" required autoComplete="email" />
          </div>
          <div>
            <FieldLabel required>パスワード</FieldLabel>
            <TextInput type="password" name="password" required autoComplete="current-password" />
          </div>
          <ErrorText>{state?.error}</ErrorText>
          <SubmitButton>ログイン</SubmitButton>
        </form>
      </Card>

      <div className="mt-8 text-center">
        <Link href="/login" className="text-xs text-ink-soft underline underline-offset-2">
          保護者の方はこちら
        </Link>
      </div>
    </main>
  );
}
