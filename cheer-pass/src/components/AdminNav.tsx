"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminLogoutAction } from "@/lib/actions/admin";

const items = [
  { href: "/admin/dashboard", label: "ダッシュボード" },
  { href: "/admin/classes", label: "クラス" },
  { href: "/admin/lessons", label: "レッスン" },
  { href: "/admin/members", label: "会員" },
  { href: "/admin/children", label: "子ども" },
  { href: "/admin/reservations", label: "予約確認" },
  { href: "/admin/attendance", label: "出欠確認" },
  { href: "/admin/makeups", label: "振替管理" },
  { href: "/admin/notices", label: "お知らせ" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-paper/95 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-2.5">
        <div className="text-sm font-extrabold tracking-tight text-trust">チアパス管理画面</div>
        <form action={adminLogoutAction}>
          <button className="text-xs font-semibold text-ink-soft hover:text-ink" type="submit">
            ログアウト
          </button>
        </form>
      </div>
      <nav className="mx-auto max-w-5xl overflow-x-auto px-4 pb-2.5">
        <ul className="flex gap-1.5">
          {items.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <li key={item.href} className="shrink-0">
                <Link
                  href={item.href}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold whitespace-nowrap ${
                    active ? "bg-trust text-white" : "bg-surface text-ink-soft hover:text-ink"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
