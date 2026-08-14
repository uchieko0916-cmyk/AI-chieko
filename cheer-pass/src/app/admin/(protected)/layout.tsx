import type { ReactNode } from "react";
import { requireAdmin } from "@/lib/auth";
import { AdminNav } from "@/components/AdminNav";

export default async function AdminProtectedLayout({ children }: { children: ReactNode }) {
  await requireAdmin();
  return (
    <div className="min-h-dvh bg-surface">
      <AdminNav />
      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
    </div>
  );
}
