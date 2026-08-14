import type { ReactNode } from "react";
import { requireParent } from "@/lib/auth";
import { BottomNav } from "@/components/BottomNav";

export default async function AppLayout({ children }: { children: ReactNode }) {
  await requireParent();
  return (
    <div className="flex min-h-dvh flex-col">
      <div className="mx-auto w-full max-w-md flex-1 px-5 pb-6 pt-6">{children}</div>
      <BottomNav />
    </div>
  );
}
