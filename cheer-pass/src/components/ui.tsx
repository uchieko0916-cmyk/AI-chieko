"use client";

import { useFormStatus } from "react-dom";
import type { ReactNode } from "react";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-line bg-paper p-5 shadow-sm ${className}`}>
      {children}
    </div>
  );
}

export function ImportantBadge() {
  return (
    <span className="inline-flex items-center rounded-full bg-sun-soft px-2.5 py-0.5 text-[11px] font-bold text-sun">
      重要
    </span>
  );
}

export function SeatBadge({ remaining }: { remaining: number }) {
  if (remaining <= 0) {
    return (
      <span className="inline-flex items-center rounded-full bg-surface-2 px-2.5 py-0.5 text-[11px] font-bold text-ink-soft">
        満席
      </span>
    );
  }
  if (remaining <= 2) {
    return (
      <span className="inline-flex items-center rounded-full bg-sun-soft px-2.5 py-0.5 text-[11px] font-bold text-sun">
        残り{remaining}席
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full bg-mint-soft px-2.5 py-0.5 text-[11px] font-bold text-mint">
      残り{remaining}席
    </span>
  );
}

export function StatusBadge({ status }: { status: "present" | "absent" | "pending" }) {
  const map = {
    present: { label: "出席", cls: "bg-mint-soft text-mint" },
    absent: { label: "欠席", cls: "bg-accent-soft text-accent" },
    pending: { label: "未回答", cls: "bg-surface-2 text-ink-soft" },
  } as const;
  const s = map[status];
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold ${s.cls}`}>
      {s.label}
    </span>
  );
}

export function FieldLabel({ children, required }: { children: ReactNode; required?: boolean }) {
  return (
    <label className="mb-1.5 block text-sm font-semibold text-ink">
      {children}
      {required && <span className="ml-1 text-accent">＊</span>}
    </label>
  );
}

const inputCls =
  "w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-[15px] text-ink outline-none focus:border-trust focus:ring-2 focus:ring-trust-soft";

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${inputCls} ${props.className ?? ""}`} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${inputCls} ${props.className ?? ""}`} />;
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${inputCls} ${props.className ?? ""}`} />;
}

export function ErrorText({ children }: { children?: string }) {
  if (!children) return null;
  return (
    <p className="mt-3 rounded-xl bg-accent-soft px-3.5 py-2.5 text-sm font-medium text-accent">
      {children}
    </p>
  );
}

export function SubmitButton({
  children,
  variant = "primary",
  className = "",
}: {
  children: ReactNode;
  variant?: "primary" | "ghost" | "danger";
  className?: string;
}) {
  const { pending } = useFormStatus();
  const styles = {
    primary: "bg-accent text-white active:scale-[0.98]",
    ghost: "bg-surface text-ink border border-line",
    danger: "bg-ink text-white",
  } as const;
  return (
    <button
      type="submit"
      disabled={pending}
      className={`w-full rounded-full px-5 py-3 text-[15px] font-bold transition disabled:opacity-60 ${styles[variant]} ${className}`}
    >
      {pending ? "処理中…" : children}
    </button>
  );
}
