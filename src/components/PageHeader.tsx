"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import type { ReactNode } from "react";

export function PageHeader({
  title,
  subtitle,
  back = false,
  children,
}: {
  title: string;
  subtitle?: string;
  back?: boolean;
  children?: ReactNode;
}) {
  const router = useRouter();
  return (
    <header className="flex items-start gap-2 pb-5 pt-3 animate-fade-up">
      {back && (
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Назад"
          className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-line bg-surface text-ivory transition-colors active:bg-surface-2"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
      )}
      <div className="min-w-0 flex-1 pt-1.5">
        <h1 className="font-display text-3xl font-semibold leading-tight text-ivory">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
      </div>
      {children && <div className="flex items-center gap-2 pt-1.5">{children}</div>}
    </header>
  );
}
