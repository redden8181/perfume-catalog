"use client";

import { Search, Star, X, type LucideIcon } from "lucide-react";
import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";
import { cn } from "@/core/utils";

/* ---------- Типография и подписи ---------- */

export function Overline({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn("text-[11px] font-semibold uppercase tracking-[0.3em] text-gold/90", className)}>
      {children}
    </p>
  );
}

export function Field({
  label,
  hint,
  error,
  children,
  className,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <span className="block text-[11px] font-semibold uppercase tracking-[0.22em] text-muted">
        {label}
      </span>
      {children}
      {hint && !error && <p className="text-xs text-faint">{hint}</p>}
      {error && <p className="text-xs font-medium text-wine">{error}</p>}
    </div>
  );
}

/* ---------- Поля ввода ---------- */

const inputBase =
  "w-full h-12 rounded-2xl border border-line bg-surface px-4 text-base text-ivory placeholder:text-faint transition-colors focus:border-gold/50 focus:bg-surface-2 focus:outline-none";

export function TextInput({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(inputBase, className)} {...props} />;
}

export function TextArea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(inputBase, "h-auto min-h-28 resize-y py-3 leading-relaxed", className)}
      {...props}
    />
  );
}

export function SearchInput({
  value,
  onChange,
  placeholder,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={cn("relative", className)}>
      <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-faint" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder ?? "Поиск"}
        className={cn(inputBase, "h-13 rounded-full pl-12 pr-11 [&::-webkit-search-cancel-button]:hidden")}
      />
      {value.length > 0 && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Очистить поиск"
          className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-muted transition-colors active:bg-surface-2"
        >
          <X className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}

/* ---------- Рейтинг ---------- */

export function RatingStars({
  value,
  onChange,
  size = 18,
  className,
}: {
  value: number;
  onChange?: (value: number) => void;
  size?: number;
  className?: string;
}) {
  const interactive = typeof onChange === "function";
  return (
    <div className={cn("flex items-center", interactive ? "gap-1" : "gap-0.5", className)}>
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = n <= value;
        const star = (
          <Star
            style={{ width: size, height: size }}
            className={cn(
              filled ? "fill-gold text-gold" : "fill-transparent text-faint/70",
              interactive && "transition-transform active:scale-90",
            )}
          />
        );
        if (!interactive) return <span key={n}>{star}</span>;
        return (
          <button
            key={n}
            type="button"
            aria-label={`Оценка ${n} из 5`}
            onClick={() => onChange(n === value ? 0 : n)}
            className="flex h-8 w-8 items-center justify-center"
          >
            {star}
          </button>
        );
      })}
    </div>
  );
}

/* ---------- Сегментированный контрол ---------- */

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  className,
}: {
  options: Array<{ value: T; label: string }>;
  value: T;
  onChange: (value: T) => void;
  className?: string;
}) {
  return (
    <div className={cn("flex rounded-full border border-line bg-surface p-1", className)}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            "min-h-10 flex-1 rounded-full px-3 text-[13px] font-semibold transition-all",
            value === opt.value
              ? "bg-gold text-ink shadow-sm"
              : "text-muted active:bg-surface-2",
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

/* ---------- Переключатель ---------- */

export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-8 w-14 shrink-0 rounded-full border transition-colors",
        checked ? "border-gold/60 bg-gold/90" : "border-line-2 bg-surface-2",
      )}
    >
      <span
        className={cn(
          "absolute top-1 h-6 w-6 rounded-full bg-ivory shadow transition-all",
          checked ? "left-[30px]" : "left-1",
        )}
      />
    </button>
  );
}

/* ---------- Кнопки ---------- */

export function GoldButton({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={cn(
        "inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-b from-gold-2 to-gold px-6 text-[15px] font-bold text-[#1c1610] shadow-[0_8px_24px_-8px_rgb(201_163_101/0.5)] transition-all active:scale-[0.98] disabled:opacity-40",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function GhostButton({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={cn(
        "inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-line-2 bg-surface px-5 text-[15px] font-semibold text-ivory transition-colors active:bg-surface-2 disabled:opacity-40",
        className,
      )}
    >
      {children}
    </button>
  );
}

/* ---------- Пустое состояние ---------- */

export function EmptyState({
  icon: Icon,
  title,
  text,
  children,
}: {
  icon: LucideIcon;
  title: string;
  text?: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex animate-fade-up flex-col items-center gap-3 px-6 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full border border-line bg-surface">
        <Icon className="h-7 w-7 text-gold/80" />
      </div>
      <h3 className="font-display text-2xl font-semibold text-ivory">{title}</h3>
      {text && <p className="max-w-xs text-sm leading-relaxed text-muted">{text}</p>}
      {children && (
        <div className="mt-3 flex flex-wrap items-center justify-center gap-3">{children}</div>
      )}
    </div>
  );
}
