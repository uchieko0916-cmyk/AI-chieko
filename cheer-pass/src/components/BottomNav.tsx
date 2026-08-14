"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HomeIcon, CalendarIcon, SwapIcon, UserIcon, MegaphoneIcon } from "./icons";

const items = [
  { href: "/home", label: "ホーム", Icon: HomeIcon },
  { href: "/lessons", label: "レッスン", Icon: CalendarIcon },
  { href: "/makeup", label: "振替", Icon: SwapIcon },
  { href: "/mypage", label: "マイページ", Icon: UserIcon },
  { href: "/notices", label: "お知らせ", Icon: MegaphoneIcon },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="sticky bottom-0 z-20 border-t border-line bg-paper/95 backdrop-blur pb-[env(safe-area-inset-bottom)]">
      <ul className="mx-auto flex max-w-md">
        {items.map(({ href, label, Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={`flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium ${
                  active ? "text-accent" : "text-ink-soft"
                }`}
              >
                <Icon className="h-6 w-6" />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
