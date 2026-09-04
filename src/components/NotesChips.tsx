"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { cn } from "@/core/utils";

/** Выбранная нота с крестиком — снимает выбор. */
export function SelectedNoteChip({
  name,
  onRemove,
}: {
  name: string;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex min-h-10 items-center gap-1 rounded-full border border-gold/40 bg-gold/15 pl-4 pr-1 text-sm font-semibold text-gold-2 animate-pop-in">
      {name}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Убрать ноту ${name}`}
        className="flex h-8 w-8 items-center justify-center rounded-full text-gold/80 transition-colors active:bg-gold/20"
      >
        <X className="h-4 w-4" />
      </button>
    </span>
  );
}

/**
 * Интерактивная нота на странице парфюма:
 * ведёт в каталог с применённым фильтром по этой ноте.
 */
export function NotePill({
  noteId,
  name,
  className,
}: {
  noteId: string;
  name: string;
  className?: string;
}) {
  return (
    <Link
      href={`/?notes=${encodeURIComponent(noteId)}`}
      prefetch={false}
      className={cn(
        "inline-flex min-h-10 items-center rounded-full border border-line-2 bg-surface px-4 text-sm font-medium text-ivory transition-colors active:border-gold/50 active:bg-gold/10 active:text-gold-2",
        className,
      )}
    >
      {name}
    </Link>
  );
}

/** Маленький статичный тег ноты для карточки. */
export function NoteTag({ name }: { name: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-line bg-ink/40 px-2.5 py-1 text-[11px] font-medium text-muted">
      {name}
    </span>
  );
}
