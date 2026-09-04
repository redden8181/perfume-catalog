"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Plus, Settings, SprayCan } from "lucide-react";
import type { ReactNode } from "react";
import { CatalogProvider, useCatalogMaybe } from "@/core/catalog-store";
import { cn } from "@/core/utils";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <CatalogProvider>
      <ShellInner>{children}</ShellInner>
    </CatalogProvider>
  );
}

function ShellInner({ children }: { children: ReactNode }) {
  const catalog = useCatalogMaybe();
  if (!catalog?.ready) return <Splash />;
  return (
    <>
      <TopNav />
      <main className="mx-auto w-full max-w-6xl px-4 pb-32 sm:px-6 md:pb-16 md:pt-6">
        {children}
      </main>
      <BottomNav />
    </>
  );
}

/** Сплэш на время первичной загрузки каталога. */
function Splash() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.5em] text-gold/80">
        Личная коллекция
      </p>
      <h1 className="font-display text-5xl font-semibold text-ivory">Ароматека</h1>
      <span className="mt-1 h-px w-24 animate-glow bg-gradient-to-r from-transparent via-gold to-transparent" />
    </div>
  );
}

function Wordmark() {
  return (
    <Link href="/" className="flex items-baseline gap-2" aria-label="Ароматека — на главную">
      <span className="font-display text-[26px] font-semibold tracking-wide text-ivory">
        Ароматека
      </span>
      <span className="h-1.5 w-1.5 rounded-full bg-gold" aria-hidden />
    </Link>
  );
}

const LINKS = [
  { href: "/", label: "Каталог" },
  { href: "/favorites", label: "Избранное" },
  { href: "/settings", label: "Настройки" },
] as const;

/** Верхняя навигация — только десктоп. */
function TopNav() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-40 hidden border-b border-line bg-ink/85 backdrop-blur-md md:block">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
        <Wordmark />
        <nav className="flex items-center gap-1">
          {LINKS.map((link) => {
            const active =
              link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                  active ? "text-gold-2" : "text-muted hover:text-ivory",
                )}
              >
                {link.label}
              </Link>
            );
          })}
          <Link
            href="/add"
            className="ml-2 inline-flex h-10 items-center gap-1.5 rounded-full bg-gradient-to-b from-gold-2 to-gold px-5 text-sm font-bold text-[#1c1610] transition-transform active:scale-[0.97]"
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} />
            Добавить
          </Link>
        </nav>
      </div>
    </header>
  );
}

/** Нижняя панель — только мобильные, с кнопкой «добавить» по центру. */
function BottomNav() {
  const pathname = usePathname();
  const item = (href: string, label: string, Icon: typeof Heart) => {
    const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
    return (
      <Link
        href={href}
        aria-label={label}
        className={cn(
          "flex min-h-14 flex-col items-center justify-center gap-1",
          active ? "text-gold-2" : "text-faint active:text-muted",
        )}
      >
        <Icon className="h-[22px] w-[22px]" strokeWidth={active ? 2.4 : 2} />
        <span className="text-[10px] font-semibold leading-none">{label}</span>
      </Link>
    );
  };

  return (
    <nav
      aria-label="Основная навигация"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-ink-2/92 backdrop-blur-lg md:hidden"
    >
      <div className="grid grid-cols-4 items-stretch px-2 safe-bottom">
        {item("/", "Каталог", SprayCan)}
        {item("/favorites", "Избранное", Heart)}
        <div className="flex items-center justify-center">
          <Link
            href="/add"
            aria-label="Добавить парфюм"
            className={cn(
              "flex h-13 w-13 -translate-y-2 items-center justify-center rounded-full",
              "bg-gradient-to-b from-gold-2 to-gold text-[#1c1610]",
              "shadow-[0_10px_28px_-6px_rgb(201_163_101/0.55)] transition-transform active:scale-95",
              pathname.startsWith("/add") && "ring-2 ring-gold-2/60 ring-offset-2 ring-offset-ink-2",
            )}
          >
            <Plus className="h-6 w-6" strokeWidth={2.6} />
          </Link>
        </div>
        {item("/settings", "Ещё", Settings)}
      </div>
    </nav>
  );
}
